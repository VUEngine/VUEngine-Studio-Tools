"use strict";
import Constants from /***/"./Constants.js";



//////////////////////////////////// Core /////////////////////////////////////

// Emulation processor
new class Core {

    // Instance fields
    audio;       // Audio communication
    automatic;   // Automatic emulation state
    clocked;     // Clocked emulation state
    dom;         // DOM communication
    mallocs;     // Memory allocations by pointer
    pointerType; // TypedArray for WebAssembly pointers
    sims;        // Simulations by pointer



    ///////////////////////// Initialization Methods //////////////////////////

    constructor() {
        onmessage = async e=>{
            await this.#construct(e.data.audio, e.data.wasmUrl);
            this.dom.postMessage(0);
        };
    }

    // Asynchronous constructor
    async #construct(audio, wasmUrl) {

        // Configure instance fields
        this.mallocs = new Map();
        this.sims    = new Map();

        // DOM thread communication
        this.dom = globalThis;
        this.dom.onmessage = e=>this[e.data.command](e.data);

        // Instantiate the WebAssembly module
        this.wasm = (await WebAssembly.instantiateStreaming(
            fetch(wasmUrl), {
            env: {
                emscripten_notify_memory_growth: ()=>this.#onGrowth()
            }
        }));
        Object.assign(this, this.wasm.instance.exports);
        this.pointerType = this.PointerSize() == 8 ?
            BigUint64Array : Uint32Array;

        // Configure audio state
        this.audio = audio;
        audio.buffers = [0,0,0].map(v=>new Float32Array(41700 / 50 * 2));
        audio.samples =
            this.#malloc(41700 / 50 * 2, audio, "samples", Float32Array);
        audio.onmessage = e=>this.#onAudio(e.data);

        // Configure emulation states
        this.automatic = { emulating: false };
        this.clocked   = {};
        for (let s of [ this.automatic, this.clocked ]) {
            s.clocks   = this.#malloc(1, s, "clocks"  , Uint32Array);
            s.pointers = this.#malloc(1, s, "pointers", this.pointerType);
            s.sims     = [];
        }

    }



    ////////////////////////////// Core Commands //////////////////////////////

    // Instantiate sims
    createSims(message) {
        let sims = new Array(message.count);
        let size = this.vbSizeOf();

        // Process all sims
        for (let x = 0; x < message.count; x++) {
            let sim = {
                canvas  : null,
                keys    : Constants.VB.SGN,
                pointer : sims[x] = this.CreateSim()
            };
            this.sims.set(sim.pointer, sim);

            // Video
            sim.pixels = this.#getPixels(sim);
            sim.image  = new ImageData(sim.pixels, 384, 224);

            // Audio
            sim.samples = this.#noalloc(
                this.GetExtSamples(sim.pointer),
                41700 / 50 * 2, sim, "samples", Float32Array
            );

        }

        this.dom.postMessage({
            sims    : sims,
            promised: true
        });
    }

    // Produce disassembly from a sim
    disassemble(message) {

        // Disassemble from the simulation
        let dasm = message.config == null ?
            this.vbuDisassemble(
                message.sim,
                message.address,
                0,
                message.length,
                message.line
            )
        :
            this.Disassemble(
                message.config.bcondNotation,
                message.config.conditionCase,
                message.config.conditionCL,
                message.config.conditionEZ,
                message.config.conditionNotation,
                message.config.hexCase,
                message.config.hexNotation,
                message.config.immediateNotation,
                message.config.memoryNotation,
                message.config.mnemonicCase,
                message.config.operandOrder,
                message.config.programCase,
                message.config.programNotation,
                message.config.setfNotation,
                message.config.systemCase,
                message.config.systemNotation,
                message.sim,
                message.address,
                message.length,
                message.line
            )
        ;

        // A memory error occurred
        if (dasm == 0) {
            this.dom.postMessage({
                promised: message.promised,
                success : false
            });
            return;
        }

        // Retrieve all disassembly data into a working buffer
        let pointer = this.Realloc(0, message.length * 17 * 4);
        let buffer  = new Uint32Array(
            this.memory.buffer, pointer, message.length * 17);
        this.GetDasm(pointer, dasm, message.length);

        // Consume output lines
        let lines = new Array(message.length);
        for (let x = 0, z = 0; x < lines.length; x++) {
            let line = lines[x] = { text: {} };
            line.address      = buffer[z++];
            line.code         = new Array(buffer[z++]);
            for (let y = 0; y < line.code.length; y++)
                line.code[y]  = buffer[z++];
            z += 4 - line.code.length;
            line.isPC         = buffer[z++] != 0;
            line.text.address = this.#string(dasm + buffer[z++], true);
            line.text.code    = new Array(line.code.length);
            for (let y = 0; y < line.code.length; y++)
                line.text.code[y] = this.#string(dasm + buffer[z++], true);
            z += 4 - line.code.length;
            line.text.mnemonic = this.#string(dasm + buffer[z++], true);
            line.text.operands = new Array(buffer[z++]);
            for (let y = 0; y < line.text.operands.length; y++)
                line.text.operands[y] = this.#string(dasm + buffer[z++], true);
            z += 3 - line.text.operands.length;
        }

        // Memory cleanup
        this.Realloc(pointer, 0);
        this.Realloc(dasm   , 0);

        // Send response
        this.dom.postMessage({
            success : true,
            lines   : lines,
            promised: message.promised
        });
    }

    // Emulate automatically
    emulateAutomatic(message) {

        // Configure sims
        this.automatic.pointers = this.#realloc(
            this.automatic.pointers, message.sims.length);
        for (let x = 0; x < message.sims.length; x++) {
            this.automatic.pointers[x] = message.sims[x];
            this.automatic.sims    [x] = this.sims.get(message.sims[x]);
        }

        // Notify the DOM thread
        this.dom.postMessage({ promised: true });

        // Begin automatic emulation
        this.automatic.emulating = true;
        this.#autoEmulate();
    }

    // Emulate for a given number of clocks
    emulateClocked(message) {

        // Configure sims
        this.clocked.pointers = this.#realloc(
            this.clocked.pointers, message.sims.length);
        for (let x = 0; x < message.sims.length; x++) {
            this.clocked.pointers[x] = message.sims[x];
            this.clocked.sims    [x] = this.sims.get(message.sims[x]);
        }

        // Process simulations
        let broke = false;
        this.clocked.clocks[0] = message.clocks;
        while (!broke && this.clocked.clocks[0] != 0) {

            // Process simulations until a suspension
            this.Emulate(
                this.clocked.pointers.pointer,
                message.sims.length,
                this.clocked.clocks.pointer
            );

            // Monitor break conditions
            for (let x = 0; x < message.sims.length; x++) {
                let sim    = this.clocked.sims[x];
                sim.breaks = this.GetBreaks(sim.pointer);
                if (breaks & Constants.web.BREAK_POINT)
                    broke = true;
            }

        }

        // Update images
        for (let sim of this.clocked.sims) {
            if (!(sim.breaks & Constants.web.BREAK_FRAME))
                continue;
            this.GetPixels(sim.pointer);
            sim.context.putImageData(sim.image, 0, 0);
        }

        // Notify DOM thread
        this.dom.postMessage({
            promised: true,
            broke   : broke,
            clocks  : this.clocked.clocks[0]
        });
    }

    // Attempt to produce a ROM from an ISX debugger file
    fromISX(message) {

        // Transfer the input data into WebAssembly memory
        let input = new Uint8Array(message.data);
        let inPtr = this.Realloc(0, input.length);
        let inMem = new Uint8Array(this.memory.buffer, inPtr, input.length);
        for (let x = 0; x < input.length; x++)
            inMem[x] = input[x];

        // Attempt to decode the ISX file as a ROM
        let outPtr = this.FromISX(inPtr, input.length);
        this.Realloc(inPtr, 0);

        // The data is not an ISX file
        if (outPtr == 0) {
            this.dom.postMessage({ promised: true, data: null });
            return;
        }

        // Transfer the decoded ROM from WebAssembly memory
        let output = new Uint8Array(this.GetISXLength(outPtr));
        let outMem = new Uint8Array(this.memory.buffer,
            this.GetISXROM(outPtr), output.length);
        for (let x = 0; x < output.length; x++)
            output[x] = outMem[x];
        this.Realloc(outPtr, 0);

        // Notify DOM thread
        this.dom.postMessage({
            promised: true,
            data    : output.buffer
        }, [ output.buffer ]);
    }

    // Reset simulation state
    reset(message) {
        this.vbReset(message.sim);
        this.dom.postMessage({ promised: true });
    }

    // Specify anaglyph colors
    setAnaglyph(message) {
        this.SetAnaglyph(message.sim, message.left, message.right);
        this.dom.postMessage({ promised: true });
    }

    // Specify the OffscreenCanvas that goes with a sim
    setCanvas(message) {
        let sim = this.sims.get(message.sim);
        sim.canvas  = message.canvas;
        sim.context = sim.canvas.getContext("2d");
        sim.context.putImageData(sim.image, 0, 0);
        this.dom.postMessage({ promised: true });
    }

    // Specify a game pak RAM buffer
    setCartRAM(message) {
        this.#setCartMemory(message.sim, message.data,
            this.vbGetCartRAM, this.vbSetCartRAM);
    }

    // Specify a game pak ROM buffer
    setCartROM(message) {
        this.#setCartMemory(message.sim, message.data,
            this.vbGetCartROM, this.vbSetCartROM);
    }

    // Specify new game pad keys
    setKeys(message) {
        this.vbSetKeys(message.sim, message.keys);
        this.dom.postMessage({ promised: true });
    }

    // Specify audio panning
    setPanning(message) {
        this.SetPanning(message.sim, message.panning);
        this.dom.postMessage({ promised: true });
    }

    // Specify a new communication peer
    setPeer(message) {
        let orphaned = [];
        let prev     = this.vbGetPeer(message.sim);
        if (prev != message.peer) {
            if (prev != 0) // Sim's previous peer has been orphaned
                orphaned.push(prev);
            if (message.peer != 0) {
                prev = this.vbGetPeer(message.peer);
                if (prev != null) // Peer's previous peer has been orphaned
                    orphaned.push(prev);
            }
            this.vbSetPeer(message.sim, message.peer);
        }
        this.dom.postMessage({
            orphaned: orphaned,
            promised: true
        });
    }

    // Specify audio volume
    setVolume(message) {
        this.SetVolume(message.sim, message.volume);
        this.dom.postMessage({ promised: true });
    }

    // Suspend automatic emulation
    suspend(message) {
        this.automatic.emulating = false;
        this.dom.postMessage({ promised: true });
    }



    ///////////////////////////// Event Handlers //////////////////////////////

    // Message from audio thread
    #onAudio(e) {

        // Output staged images
        if (this.automatic.emulating && this.audio.buffers.length == 0) {
            for (let sim of this.automatic.sims)
                sim.context.putImageData(sim.image, 0, 0);
        }

        // Acquire the emptied buffers and resume emulation
        this.audio.buffers.push(... e.map(b=>new Float32Array(b)));
        this.#autoEmulate();
    }

    // WebAssembly memory has grown
    #onGrowth() {
        for (let prev of this.mallocs.values()) {
            let buffer = new prev.constructor(
                this.memory.buffer, prev.pointer, prev.size);
            Object.assign(buffer, {
                assign : prev.assign,
                pointer: prev.pointer,
                size   : prev.size,
                target : prev.target
            });
            this.mallocs.set(buffer.pointer, buffer);
            this.#updateTarget(buffer);
        }
        for (let sim of this.sims.values()) {
            sim.pixels = this.#getPixels(sim);
            sim.image  = new ImageData(sim.pixels, 384, 224);
        }
    }



    ///////////////////////////// Private Methods /////////////////////////////

    // Automatic emulation processing
    #autoEmulate() {

        // Error checking
        if (!this.automatic.emulating)
            return;

        // Process all remaining audio buffers
        while (this.audio.buffers.length != 0) {

            // Reset sample output
            for (let sim of this.automatic.sims) {
                this.vbSetSamples(sim.pointer, sim.samples.pointer,
                    Constants.VB.F32, 41700 / 50);
            }

            // Process all clocks
            this.automatic.clocks[0] = 400000; // 0.02s
            while (this.automatic.clocks[0] != 0) {
                this.Emulate(
                    this.automatic.pointers.pointer,
                    this.automatic.sims.length,
                    this.automatic.clocks.pointer
                );

                // Too many buffers left to output video
                if (this.audio.buffers.length > 2)
                    continue;

                // Stage the next video image
                for (let sim of this.automatic.sims) {
                    let breaks = this.GetBreaks(sim.pointer);
                    if (breaks & Constants.web.BREAK_FRAME)
                        this.GetPixels(sim.pointer);
                }

            }

            // Mix and output audio samples
            let buffer = this.audio.buffers.shift();
            this.Mix(
                this.audio.samples.pointer,
                this.automatic.pointers.pointer,
                this.automatic.sims.length
            );
            for (let x = 0; x < buffer.length; x++)
                buffer[x] = this.audio.samples[x];
            this.audio.postMessage(buffer.buffer, [ buffer.buffer ]);

            // Output staged images if there's one audio buffer to go
            if (this.audio.buffers.length != 1)
                continue;
            for (let sim of this.automatic.sims)
                sim.context.putImageData(sim.image, 0, 0);
        }

    }

    // Delete an allocated buffer in WebAssembly memory
    #free(buffer) {
        this.mallocs.delete(buffer.pointer);
        this.Realloc(buffer.pointer, 0);
    }

    // Register a sim's pixel buffer
    #getPixels(sim) {
        return this.#noalloc(
            this.GetExtPixels(sim.pointer),
            384*224*4, sim, "pixels", Uint8ClampedArray
        );
    }

    // Allocate memory in WebAssembly and register the buffer
    #malloc(count, target = null, assign = null, type = Uint8ClampedArray) {
        return this.#noalloc(
            this.Realloc(0, count * type.BYTES_PER_ELEMENT),
            count, target, assign, type
        );
    }

    // Register a buffer in WebAssembly memory without allocating it
    #noalloc(pointer, count, target=null, assign=null, type=Uint8ClampedArray){
        let buffer = new type(this.memory.buffer, pointer, count);
        Object.assign(buffer, {
            assign : assign?.split("."),
            count  : count,
            pointer: pointer,
            target : target
        });
        this.mallocs.set(pointer, buffer);
        return buffer;
    }

    // Resize a previously allocated buffer in WebAssembly memory
    #realloc(prev, count) {
        this.mallocs.delete(prev.pointer);
        let pointer = this.Realloc(prev.pointer,
            count * prev.constructor.prototype.BYTES_PER_ELEMENT);
        let buffer  = new prev.constructor(this.memory.buffer, pointer, count);
        Object.assign(buffer, {
            assign : prev.assign,
            count  : count,
            pointer: pointer,
            target : prev.target
        });
        this.mallocs.set(pointer, buffer);
        this.#updateTarget(buffer);
        return buffer;
    }

    // Compute anaglyph color values
    #setAnaglyph(sim, left, right) {

        // Split out the RGB channels
        let color  = left | right;
        let stereo = [
            color >> 16 & 0xFF,
            color >>  8 & 0xFF,
            color       & 0xFF
        ];

        // Compute scaled RGB values by output level
        sim.anaglyph = new Array(256);
        for (let x = 0; x < 256; x++) {
            let level = sim.anaglyph[x] = new Array(3);
            for (let y = 0; y < 3; y++)
                level[y] = Math.round(x * stereo[y] / 255.0);
        }

        // Determine which channels are in each eye
        sim.anaglyph.left  = [];
        sim.anaglyph.right = [];
        for (let x = 0, y = 16; x < 3; x++, y -= 8) {
            if (left  >> y & 0xFF)
                sim.anaglyph.left .push(x);
            if (right >> y & 0xFF)
                sim.anaglyph.right.push(x);
        }

    }

    // Specify a game pak memory buffer
    #setCartMemory(sim, mem, getter, setter) {

        // Working variables
        let cart = new Uint8Array(mem);
        let prev = getter(sim);
        let cur  = this.Realloc(0, cart.length);
            mem  = new Uint8Array(this.memory.buffer, cur, cart.length);

        // Transfer the data into core memory
        for (let x = 0; x < mem.length; x++)
            mem[x] = cart[x];

        // Assign the ROM to the simulation
        let success = setter(sim, cur, mem.length) == 0;
        if (success) {
            if (prev != 0)
                this.Realloc(prev, 0);
        } else this.Realloc(cur, 0);

        // Reply to the DOM thread
        this.dom.postMessage({
            success : success,
            promised: true
        });
    }

    // Read a C string from WebAssembly memory
    #string(address, indirect = false) {
        if (address == 0)
            return null;

        if (indirect) {
            let next = new this.pointerType(this.memory.buffer, address, 1)[0];
            address = next;
        }

        let length = 0;
        let memory = new Uint8Array(this.memory.buffer);
        for (let addr = address; memory[addr++] != 0; length++);
        return (Array.from(memory.slice(address, address + length))
            .map(b=>String.fromCodePoint(b)).join(""));
    }

    // Update an allocated buffer's assignment in its monitor object
    #updateTarget(buffer) {
        if (buffer.target == null)
            return;
        let obj    = buffer.target;
        let assign = buffer.assign.slice();
        while (assign.length > 1)
            obj = obj[assign.shift()];
        obj[assign[0]] = buffer;
    }

}();
