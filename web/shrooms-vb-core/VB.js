"use strict";
import Constants from /**/"./Constants.js";

// Instantiation guard
const GUARD = Symbol();



///////////////////////////////// DasmConfig //////////////////////////////////

// Disassembler option settings
class DasmConfig {

    // Instance fields
    #bcondNotation;
    #conditionCase;
    #conditionCL;
    #conditionEZ;
    #conditionNotation;
    #hexCase;
    #hexNotation;
    #immediateNotation;
    #memoryNotation;
    #mnemonicCase;
    #operandOrder;
    #programCase;
    #programNotation;
    #setfNotation;
    #systemCase;
    #systemNotation;



    ///////////////////////// Initialization Methods //////////////////////////

    constructor() {
        this.#bcondNotation     = Constants.VBU.JOINED;
        this.#conditionCase     = Constants.VBU.LOWER;
        this.#conditionCL       = Constants.VBU.L;
        this.#conditionEZ       = Constants.VBU.Z;
        this.#conditionNotation = Constants.VBU.NAMES;
        this.#hexCase           = Constants.VBU.UPPER;
        this.#hexNotation       = Constants.VBU["0X"];
        this.#immediateNotation = Constants.VBU.NONE;
        this.#memoryNotation    = Constants.VBU.OUTSIDE;
        this.#mnemonicCase      = Constants.VBU.UPPER;
        this.#operandOrder      = Constants.VBU.DEST_LAST;
        this.#programCase       = Constants.VBU.LOWER;
        this.#programNotation   = Constants.VBU.NAMES;
        this.#setfNotation      = Constants.VBU.SPLIT;
        this.#systemCase        = Constants.VBU.LOWER;
        this.#systemNotation    = Constants.VBU.NAMES;
    }



    /////////////////////////// Property Accessors ////////////////////////////

    get bcondNotation() { return this.#bcondNotation; }
    set bcondNotation(value) {
        switch (value) {
            case Constants.VBU.JOINED:
            case Constants.VBU.SPLIT : break;
            default: return;
        }
        this.#bcondNotation = value;
    }

    get conditionCase() { return this.#conditionCase; }
    set conditionCase(value) {
        switch (value) {
            case Constants.VBU.LOWER:
            case Constants.VBU.UPPER: break;
            default: return;
        }
        this.#conditionCase = value;
    }

    get conditionCL() { return this.#conditionCL; }
    set conditionCL(value) {
        switch (value) {
            case Constants.VBU.C:
            case Constants.VBU.L: break;
            default: return;
        }
        this.#conditionCL = value;
    }

    get conditionEZ() { return this.#conditionEZ; }
    set conditionEZ(value) {
        switch (value) {
            case Constants.VBU.E:
            case Constants.VBU.Z: break;
            default: return;
        }
        this.#conditionEZ = value;
    }

    get conditionNotation() { return this.#conditionNotation; }
    set conditionNotation(value) {
        switch (value) {
            case Constants.VBU.NAMES  :
            case Constants.VBU.NUMBERS: break;
            default: return;
        }
        this.#conditionNotation = value;
    }

    get hexCase() { return this.#hexCase; }
    set hexCase(value) {
        switch (value) {
            case Constants.VBU.LOWER:
            case Constants.VBU.UPPER: break;
            default: return;
        }
        this.#hexCase = value;
    }

    get hexNotation() { return this.#hexNotation; }
    set hexNotation(value) {
        switch (value) {
            case Constants.VBU["0X"] :
            case Constants.VBU.DOLLAR:
            case Constants.VBU.H     : break;
            default: return;
        }
        this.#hexNotation = value;
    }

    get immediateNotation() { return this.#immediateNotation; }
    set immediateNotation(value) {
        switch (value) {
            case Constants.VBU.NONE  :
            case Constants.VBU.NUMBER: break;
            default: return;
        }
        this.#immediateNotation = value;
    }

    get memoryNotation() { return this.#memoryNotation; }
    set memoryNotation(value) {
        switch (value) {
            case Constants.VBU.INSIDE :
            case Constants.VBU.OUTSIDE: break;
            default: return;
        }
        this.#memoryNotation = value;
    }

    get mnemonicCase() { return this.#mnemonicCase; }
    set mnemonicCase(value) {
        switch (value) {
            case Constants.VBU.LOWER:
            case Constants.VBU.UPPER: break;
            default: return;
        }
        this.#mnemonicCase = value;
    }

    get operandOrder() { return this.#operandOrder; }
    set operandOrder(value) {
        switch (value) {
            case Constants.VBU.DEST_FIRST:
            case Constants.VBU.DEST_LAST : break;
            default: return;
        }
        this.#operandOrder = value;
    }

    get programCase() { return this.#programCase; }
    set programCase(value) {
        switch (value) {
            case Constants.VBU.LOWER:
            case Constants.VBU.UPPER: break;
            default: return;
        }
        this.#programCase = value;
    }

    get programNotation() { return this.#programNotation; }
    set programNotation(value) {
        switch (value) {
            case Constants.VBU.NAMES  :
            case Constants.VBU.NUMBERS: break;
            default: return;
        }
        this.#programNotation = value;
    }

    get setfNotation() { return this.#setfNotation; }
    set setfNotation(value) {
        switch (value) {
            case Constants.VBU.JOINED:
            case Constants.VBU.SPLIT : break;
            default: return;
        }
        this.#setfNotation = value;
    }

    get systemCase() { return this.#systemCase; }
    set systemCase(value) {
        switch (value) {
            case Constants.VBU.LOWER:
            case Constants.VBU.UPPER: break;
            default: return;
        }
        this.#systemCase = value;
    }

    get systemNotation() { return this.#systemNotation; }
    set systemNotation(value) {
        switch (value) {
            case Constants.VBU.NAMES  :
            case Constants.VBU.NUMBERS: break;
            default: return;
        }
        this.#systemNotation = value;
    }

}



////////////////////////////////// DasmLine ///////////////////////////////////

// One line of disassembler output
class DasmLine {

    // Instance fields
    #address;
    #addressText;
    #code;
    #codeText;
    #isPC;
    #mnemonicText;
    #operandText;



    ///////////////////////// Initialization Methods //////////////////////////

    constructor() {
        if (arguments[0] != GUARD)
            throw new Error("Cannot be instantiated.");
        let line = arguments[1];
        this.#address      = line.address;
        this.#addressText  = line.text.address;
        this.#code         = line.code;
        this.#codeText     = line.text.code;
        this.#isPC         = line.isPC;
        this.#mnemonicText = line.text.mnemonic;
        this.#operandText  = line.text.operands;
    }



    /////////////////////////// Property Accessors ////////////////////////////

    get address() { return this.#address;      }
    get code   () { return this.#code.slice(); }
    get isPC   () { return this.#isPC;         }
    get text   () {
        return {
            address : this.#addressText,
            code    : this.#codeText.slice(),
            mnemonic: this.#mnemonicText,
            operands: this.#operandText.slice()
        };
    }



    ///////////////////////////// Public Methods //////////////////////////////

    // Express self as a plain object
    toObject() {
        return {
            address: this.address,
            code   : Array.from(this.#code),
            isPC   : this.isPC,
            text   : this.text
        };
    }

}



///////////////////////////////////// Sim /////////////////////////////////////

// Simulation instance
class Sim extends HTMLElement {

    // Instance fields
    #anaglyph;  // Anaglyph color values
    #canvas;    // Canvas element
    #core;      // Core proxy
    #emulating; // Current emulation status
    #keys;      // Controller state
    #panning;   // Audio stereo balance
    #peer;      // Communication peer
    #pointer;   // Pointer in core memory
    #volume;    // Audio output volume



    ///////////////////////// Initialization Methods //////////////////////////

    constructor() {
        if (arguments[0] != GUARD)
            throw new Error("Must be created via VB.create()");
        super();
        this.proxy = {
            construct   : (core, pointer)=>this.#construct(core, pointer),
            isEmulating : ()=>this.#emulating,
            setEmulating: e =>this.#emulating = e,
            setPeer     : p =>this.#peer      = p
        };
    }

    // Asynchronous constructor
    async #construct(core, pointer) {

        // Configure instance fields
        this.#anaglyph  = [ VB.STEREO_RED, VB.STEREO_CYAN ];
        this.#core      = core;
        this.#emulating = false;
        this.#keys      = Constants.VB.SGN;
        this.#panning   = 0.0;
        this.#peer      = null;
        this.#pointer   = pointer;
        this.#volume    = 1.0;
        delete this.proxy;

        // Create a <canvas> for the video image
        let canvas = this.#canvas = document.createElement("canvas");
        Object.assign(canvas, { width: 384, height: 224 });
        canvas.style.imageRendering = "pixelated";

        // Configure elements
        Object.assign(this.style, {
            display : "inline-block",
            height  : "224px",
            position: "relative",
            width   : "384px"
        });
        Object.assign(canvas.style, {
            height        : "100%",
            imageRendering: "pixelated",
            left          : "0",
            position      : "absolute",
            top           : "0",
            width         : "100%"
        });
        this.append(canvas);

        // Send control of the canvas to the core worker
        let offscreen = canvas.transferControlToOffscreen();
        await core.toCore({
            command  : "setCanvas",
            promised : true,
            sim      : pointer,
            canvas   : offscreen,
            transfers: [ offscreen ]
        });

        return this;
    }



    /////////////////////////// Property Accessors ////////////////////////////

    get anaglyph() { return this.#anaglyph.slice(); }
    get core    () { return this.#core.core       ; }
    get keys    () { return this.#keys            ; }
    get panning () { return this.#panning         ; }
    get peer    () { return this.#peer            ; }
    get volume  () { return this.#volume          ; }



    ///////////////////////////// Public Methods //////////////////////////////

    // Delete the sim
    async delete() {
        // Unlink peer
        // Deallocate memory
        // Unlink core
    }

    // Disassemble from a simulation
    async disassemble(address, config, length, line) {

        // Error checking
        if (!Number.isSafeInteger(address) ||
            address < 0 || address > 0xFFFFFFFF)
            throw new RangeError("Address must conform to Uint32.");
        if (config != null && !(config instanceof DasmConfig))
            throw new TypeError("Config must be an instance of DasmConfig.");
        if (!Number.isSafeInteger(address) || length < 0)
            throw new RangeError("Length must be nonnegative.");
        if (!Number.isSafeInteger(line))
            throw new TypeError("Line must be a safe integer.");

        // Request disassembly from the core
        let response = await this.#core.toCore({
            command : "disassemble",
            promised: true,
            sim     : this.#pointer,
            address : address,
            length  : length,
            line    : line,
            config  : config == null ? null : {
                bcondNotation    : config.bcondNotation,
                conditionCase    : config.conditionCase,
                conditionCL      : config.conditionCL,
                conditionEZ      : config.conditionEZ,
                conditionNotation: config.conditionNotation,
                hexCase          : config.hexCase,
                hexNotation      : config.hexNotation,
                immediateNotation: config.immediateNotation,
                memoryNotation   : config.memoryNotation,
                mnemonicCase     : config.mnemonicCase,
                operandOrder     : config.operandOrder,
                programCase      : config.programCase,
                programNotation  : config.programNotation,
                setfNotation     : config.setfNotation,
                systemCase       : config.systemCase,
                systemNotation   : config.systemNotation
            }
        });

        // Process the response
        return !response.success ? null :
            response.lines.map(l=>new DasmLine(GUARD, l));
    }

    // Reset simulation state
    reset() {
        return this.#core.toCore({
            command : "reset",
            promised: true,
            sim     : this.#pointer
        });
    }

    // Specify anaglyph colors
    setAnaglyph(left, right) {

        // Error checking
        if (!Number.isSafeInteger(left ) || left  < 0 || left  > 0xFFFFFF)
            throw new RangeError("Left must conform to Uint24.");
        if (!Number.isSafeInteger(right) || right < 0 || right > 0xFFFFFF)
            throw new RangeError("Right must conform to Uint24.");
        if (
            left & 0xFF0000 && right & 0xFF0000 ||
            left & 0x00FF00 && right & 0x00FF00 ||
            left & 0x0000FF && right & 0x0000FF
        ) throw new RangeError("Left and right overlap RGB channels.");

        // Configure instance fields
        this.#anaglyph[0] = left;
        this.#anaglyph[1] = right;

        // Send the colors to the core
        return this.#core.toCore({
            command : "setAnaglyph",
            promised: true,
            sim     : this.#pointer,
            left    : left,
            right   : right
        });
    }

    // Specify a game pak RAM buffer
    setCartRAM(wram) {
        return this.#setCartMemory("setCartRAM", wram);
    }

    // Specify a game pak ROM buffer
    setCartROM(rom) {
        return this.#setCartMemory("setCartROM", rom);
    }

    // Specify new game pad keys
    setKeys(keys) {

        // Error checking
        if (!Number.isSafeInteger(keys) || keys < 0 || keys > 0xFFFF)
            throw new RangeError("Keys must conform to Uint16.");
        if (keys == this.#keys)
            return;

        // Configure instance fields
        this.#keys = keys;

        // Send the keys to the core
        return this.#core.toCore({
            command : "setKeys",
            promised: true,
            sim     : this.#pointer,
            keys    : keys
        });
    }

    // Specify audio panning
    setPanning(panning) {

        // Error checking
        if (!Number.isFinite(panning) ||panning < -1 || panning > +1) {
            throw new RangeError(
                "Panning must be a number from -1 to +1.");
        }

        // Configure instance fields
        this.#panning = panning;

        // Send the panning to the core
        return this.#core.toCore({
            command : "setPanning",
            promised: true,
            sim     : this.#pointer,
            panning : panning
        });
    }

    // Specify a new communication peer
    async setPeer(peer = null) {

        // Error checking
        if (peer !== null && peer.#core != this.#core)
            throw new RangeError("Peer sim must belong to the same core.");

        // Configure peers on the core
        if (peer != this.#peer)
            await this.#core.setPeer(this, peer);
    }

    // Specify audio volume
    setVolume(volume) {

        // Error checking
        if (!Number.isFinite(volume) ||volume < 0 || volume > 10) {
            throw new RangeError(
                "Volume must be a number from 0\u00d7 to 10\u00d7.");
        }

        // Configure instance fields
        this.#volume = volume;

        // Send the volume to the core
        return this.#core.toCore({
            command : "setVolume",
            promised: true,
            sim     : this.#pointer,
            volume  : volume
        });
    }



    ///////////////////////////// Private Methods /////////////////////////////

    // Specify a game pak memory buffer
    async #setCartMemory(command, mem) {

        // Validation
        if (mem instanceof ArrayBuffer)
            mem = new Uint8Array(mem);
        if (
            !(mem instanceof Uint8Array) &&
            !(mem instanceof Uint8ClampedArray)
        ) mem = Uint8Array.from(mem);

        // Send the memory to the core
        let response = await this.#core.toCore({
            command  : command,
            promised : true,
            sim      : this.#pointer,
            data     : mem.buffer,
            transfers: [ mem.buffer ]
        });
        return response.success;
    }

}
customElements.define("shrooms-vb", Sim);



///////////////////////////////////// VB //////////////////////////////////////

// Emulation core interface
class VB {

    // Static fields
    static get DasmConfig() { return DasmConfig; }
    static get DasmLine  () { return DasmLine;   }
    static get Sim       () { return Sim;        }

    // Instance fields
    #audio;     // Audio worklet
    #automatic; // Current automatic emulation group
    #commands;  // Computed method table
    #core;      // Core worker
    #proxy;     // Self proxy for sim access
    #sims;      // Mapping of Sim|pointer -> proxy
    #state;     // Operations state



    //////////////////////////////// Constants ////////////////////////////////

    // Operations states
    static #SUSPENDED  = Symbol();
    static #RESUMING   = Symbol();
    static #EMULATING  = Symbol();
    static #SUSPENDING = Symbol();

    // System registers
    static get ADTRE() { return Constants.VB.ADTRE; }
    static get CHCW () { return Constants.VB.CHCW ; }
    static get ECR  () { return Constants.VB.ECR  ; }
    static get EIPC () { return Constants.VB.EIPC ; }
    static get EIPSW() { return Constants.VB.EIPSW; }
    static get FEPC () { return Constants.VB.FEPC ; }
    static get FEPSW() { return Constants.VB.FEPSW; }
    static get PIR  () { return Constants.VB.PIR  ; }
    static get PSW  () { return Constants.VB.PSW  ; }
    static get TKCW () { return Constants.VB.TKCW ; }

    // Memory access data types
    static get S8 () { return Constants.VB.S8 ; }
    static get U8 () { return Constants.VB.U8 ; }
    static get S16() { return Constants.VB.S16; }
    static get U16() { return Constants.VB.U16; }
    static get S32() { return Constants.VB.S32; }

    // Option keys
    static get PSEUDO_HALT() { return Constants.VB.PSEUDO_HALT; }

    // Controller buttons
    static get PWR() { return Constants.VB.PWR; }
    static get SGN() { return Constants.VB.SGN; }
    static get A  () { return Constants.VB.A  ; }
    static get B  () { return Constants.VB.B  ; }
    static get RT () { return Constants.VB.RT ; }
    static get LT () { return Constants.VB.LT ; }
    static get RU () { return Constants.VB.RU ; }
    static get RR () { return Constants.VB.RR ; }
    static get LR () { return Constants.VB.LR ; }
    static get LL () { return Constants.VB.LL ; }
    static get LD () { return Constants.VB.LD ; }
    static get LU () { return Constants.VB.LU ; }
    static get STA() { return Constants.VB.STA; }
    static get SEL() { return Constants.VB.SEL; }
    static get RL () { return Constants.VB.RL ; }
    static get RD () { return Constants.VB.RD ; }

    // Disassembler options
    static get ["0X"]    () { return Constants.VBU["0X"]     ; }
    static get ABSOLUTE  () { return Constants.VBU.ABSOLUTE  ; }
    static get C         () { return Constants.VBU.C         ; }
    static get DEST_FIRST() { return Constants.VBU.DEST_FIRST; }
    static get DEST_LAST () { return Constants.VBU.DEST_LAST ; }
    static get DOLLAR    () { return Constants.VBU.DOLLAR    ; }
    static get E         () { return Constants.VBU.E         ; }
    static get H         () { return Constants.VBU.H         ; }
    static get INSIDE    () { return Constants.VBU.INSIDE    ; }
    static get JOINED    () { return Constants.VBU.JOINED    ; }
    static get L         () { return Constants.VBU.L         ; }
    static get LOWER     () { return Constants.VBU.LOWER     ; }
    static get NAMES     () { return Constants.VBU.NAMES     ; }
    static get NONE      () { return Constants.VBU.NONE      ; }
    static get NUMBER    () { return Constants.VBU.NUMBER    ; }
    static get NUMBERS   () { return Constants.VBU.NUMBERS   ; }
    static get OUTSIDE   () { return Constants.VBU.OUTSIDE   ; }
    static get RELATIVE  () { return Constants.VBU.RELATIVE  ; }
    static get SPLIT     () { return Constants.VBU.SPLIT     ; }
    static get UPPER     () { return Constants.VBU.UPPER     ; }
    static get Z         () { return Constants.VBU.Z         ; }

    // Anaglyph colors
    static get STEREO_CYAN   () { return Constants.web.STEREO_CYAN   ; }
    static get STEREO_GREEN  () { return Constants.web.STEREO_GREEN  ; }
    static get STEREO_MAGENTA() { return Constants.web.STEREO_MAGENTA; }
    static get STEREO_RED    () { return Constants.web.STEREO_RED    ; }



    ///////////////////////////// Static Methods //////////////////////////////

    // Create a core instance
    static create(options) {
        return new VB(GUARD).#construct(options);
    }



    ///////////////////////// Initialization Methods //////////////////////////

    constructor() {
        if (arguments[0] != GUARD)
            throw new Error("Must be created via VB.create()");
    }

    // Asynchronous constructor
    async #construct(options) {

        // Configure instance fields
        this.#automatic = null;
        this.#sims      = new Map();
        this.#state     = VB.#SUSPENDED;

        // Ensure default options
        options          ??= {};
        options.audioUrl ??= import.meta.resolve("./Audio.js");
        options.coreUrl  ??= import.meta.resolve("./Core.js");
        options.wasmUrl  ??= import.meta.resolve("./core.wasm");

        // Core<->audio communications
        let channel = new MessageChannel();

        // Audio output context
        let audio = new AudioContext({
            latencyHint: "interactive",
            sampleRate : 41700
        });
        await audio.suspend();

        // Audio node
        await audio.audioWorklet.addModule(options.audioUrl);
        audio = this.#audio = new AudioWorkletNode(audio, "shrooms-vb", {
            numberOfInputs    :  0,
            numberOfOutputs   :  1,
            outputChannelCount: [2]
        });
        audio.connect(audio.context.destination);

        // Send one message channel port to the audio worklet
        await new Promise(resolve=>{
            audio.port.onmessage = resolve;
            audio.port.postMessage({
                core: channel.port1
            }, [channel.port1]);
        });
        audio.port.onmessage = null;//e=>this.#onAudio(e.data);

        // Core worker
        let core = this.#core = new Worker(options.coreUrl, {type: "module"});
        core.promises = [];

        // Send the other message channel port to the core worker
        await new Promise(resolve=>{
            core.onmessage = resolve;
            core.postMessage({
                audio  : channel.port2,
                wasmUrl: options.wasmUrl
            }, [ channel.port2 ]);
        });
        core.onmessage = e=>this.#onCore(e.data);

        // Establish a concealed proxy for sim objects
        this.#proxy = {
            core   : this,
            setPeer: (a,b)=>this.#setPeer(a,b),
            toCore : m=>this.#toCore(m)
        };

        // Configure command table
        this.#commands = {
            // Will be used with subscriptions
        };

        return this;
    }



    /////////////////////////////// Properties ////////////////////////////////

    // Number of managed simulations
    get size() { return this.#sims.size / 2; }

    // Managed simulations
    get sims() { return [... this.#sims.keys()].filter(s=>s instanceof Sim); }



    ///////////////////////////// Public Methods //////////////////////////////

    // Create one or more sims
    async create(count = null) {

        // Error checking
        if (count !== null && (!Number.isSafeInteger(count) || count < 1)) {
            throw new RangeError(
                "Count must be a safe integer and at least 1.");
        }

        // Allocate memory in the core
        let response = await this.#toCore({
            command : "createSims",
            promised: true,
            count   : count ?? 1
        });

        // Produce Sim elements for each instance
        let sims = response.sims;
        for (let x = 0; x < (count ?? 1); x++) {
            let proxy = new Sim(GUARD).proxy;
            proxy.pointer = sims[x];
            proxy.sim     = sims[x] =
                await proxy.construct(this.#proxy, sims[x]);
            this.#sims.set(sims[x], proxy);
            this.#sims.set(proxy.pointer, proxy);
        }
        return count === null ? sims[0] : sims;
    }

    // Begin emulation
    async emulate(sims, clocks) {

        // Error checking
        if (sims instanceof Sim)
            sims = [sims];
        if (
            !Array.isArray(sims) ||
            sims.length == 0     ||
            sims.some(s=>!this.#sims.has(s))
        ) {
            throw new TypeError("Must specify a Sim or array of Sims " +
                "that belong to this core.");
        }
        if (sims.find(s=>this.#sims.get(s).isEmulating()))
            throw new Error("Sims cannot already be part of emulation.");
        if (
            clocks !== true &&
            !(Number.isSafeInteger(clocks) && clocks >= 0)
        ) {
            throw new RangeError(
                "Clocks must be true or a nonnegative safe integer.");
        }

        // Cannot resume automatic emulation
        if (clocks === true && this.#state != VB.#SUSPENDED)
            return false;

        // Manage sims
        let proxies  = sims   .map(s=>this.#sims.get(s));
        let pointers = proxies.map(p=>p.pointer);
        for (let sim of proxies)
            sim.setEmulating(true);

        // Clocked emulation
        if (clocks !== true) {
            let response = await this.#toCore({
                command : "emulateClocked",
                promised: true,
                sims    : pointers,
                clocks  : clocks
            });
            for (let sim of proxies)
                sim.setEmulating(false);
            return {
                broke : response.broke,
                clocks: response.clocks
            };
        }

        // Resume automatic emulation
        this.#automatic = proxies;
        this.#state     = VB.#RESUMING;
        if (this.#audio.context.state == "suspended")
            await this.#audio.context.resume();
        await this.#toCore({
            command : "emulateAutomatic",
            promised: true,
            sims    : pointers
        });
        this.#state = VB.#EMULATING;
        return true;
    }

    // Decode an ISX debugger file to a Virtual Boy ROM
    async fromISX(data) {

        // Validation
        if (data instanceof ArrayBuffer)
            data = new Uint8Array(data);
        if (
            !(data instanceof Uint8Array) &&
            !(data instanceof Uint8ClampedArray)
        ) data = Uint8Array.from(data);

        // Send the memory to the core
        data = data.slice();
        let response = await this.#toCore({
            command  : "fromISX",
            promised : true,
            data     : data.buffer,
            transfers: [ data.buffer ]
        });
        return response.data == null ? null : new Uint8Array(response.data);
    }

    // Suspend automatic emulation
    async suspend() {

        // Error checking
        if (this.#state != VB.#EMULATING)
            return false;

        // Tell the core to stop emulating
        this.#state = VB.#SUSPENDING;
        await this.#toCore({
            command : "suspend",
            promised: true
        });

        // Configure state
        this.#state = VB.#SUSPENDED;
        for (let sim of this.#automatic)
            sim.setEmulating(false);
        return true;
    }



    ///////////////////////////// Private Methods /////////////////////////////

    // Message received from core worker
    #onCore(message) {
        if (message.promised)
            this.#core.promises.shift()(message);
        if ("command" in message)
            this.#commands[message.command](message);
    }

    // Specify a new communication peer
    async #setPeer(sim, peer) {

        // Associate the peers on the core
        let response = await this.#toCore({
            command : "setPeer",
            promised: true,
            sim     : this.#sims.get(sim).pointer,
            peer    : peer == null ? 0 : this.#sims.get(peer).pointer
        });

        // Link sims
        this.#sims.get(sim).setPeer(peer);
        if (peer != null)
            this.#sims.get(peer).setPeer(sim);

        // Unlink orphaned sims
        for (let pointer of response.orphaned)
            this.#sims.get(pointer).setPeer(null);
    }

    // Send a message to the core worker
    async #toCore(message) {
        let transfers = message.transfers;
        if (transfers != null)
            delete message.transfers;
        return await new Promise(resolve=>{
            if (message.promised)
                this.#core.promises.push(resolve);
            this.#core.postMessage(message, transfers ?? []);
        });
    }

}

export default VB;
