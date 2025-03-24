"use strict";

// Dedicated audio output processor
class Audio extends AudioWorkletProcessor {

    // Instance fields
    buffers; // Input sample buffer queue
    core;    // Communications with core thread
    dom;     // Communications with DOM thread
    offset;  // Offset into oldest buffer



    ///////////////////////// Initialization Methods //////////////////////////

    constructor() {
        super();
        this.port.onmessage = async e=>{
            await this.#construct(e.data.core);
            this.port.postMessage(0);
        };
    }

    // Asynchronous constructor
    async #construct(core) {

        // Configure instance fields
        this.buffers = [];
        this.core    = core;
        this.dom     = this.port;
        this.offset  = 0;

        // Configure communications
        this.core.onmessage = e=>this.#onCore(e.data);
        this.dom .onmessage = e=>this.#onDOM (e.data);
    }



    ///////////////////////////// Public Methods //////////////////////////////

    // Produce output samples (called by the user agent)
    process(inputs, outputs, parameters) {
        let output = outputs[0];
        let length = output [0].length;
        let empty  = null;

        // Process all samples
        for (let x = 0; x < length;) {

            // No bufferfed samples are available
            if (this.buffers.length == 0) {
                for (; x < length; x++)
                    output[0][x] = output[1][x] = 0;
                break;
            }

            // Transfer samples from the oldest buffer
            let buffer = this.buffers[0];
            let y      = this.offset;
            for (; x < length && y < buffer.length; x++, y+=2) {
                output[0][x] = buffer[y    ];
                output[1][x] = buffer[y + 1];
            }

            // Advance to the next buffer
            if (y == buffer.length) {
                if (empty == null)
                    empty = [];
                empty.push(this.buffers.shift().buffer);
                this.offset = 0;
            }

            // Buffer is not empty
            else this.offset = y;
        }

        // Return emptied sample buffers to the core thread
        if (empty != null)
            this.core.postMessage(empty, empty);

        return true;
    }



    ///////////////////////////// Event Handlers //////////////////////////////

    // Message received from core thread
    #onCore(e) {
        this.buffers.push(new Float32Array(e));
    }

    // Message received from DOM thread
    #onDOM(e) {
    }

}
registerProcessor("shrooms-vb", Audio);
