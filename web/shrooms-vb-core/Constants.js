"use strict";
export default {

    // Core
    VB: {

        // System registers
        ADTRE: 25,
        CHCW : 24,
        ECR  :  4,
        EIPC :  0,
        EIPSW:  1,
        FEPC :  2,
        FEPSW:  3,
        PIR  :  6,
        PSW  :  5,
        TKCW :  7,

        // Memory access data types
        S8 : 0,
        U8 : 1,
        S16: 2,
        U16: 3,
        S32: 4,
        F32: 5,

        // Option keys
        PSEUDO_HALT: 0,

        // Controller buttons
        PWR: 0x0001,
        SGN: 0x0002,
        A  : 0x0004,
        B  : 0x0008,
        RT : 0x0010,
        LT : 0x0020,
        RU : 0x0040,
        RR : 0x0080,
        LR : 0x0100,
        LL : 0x0200,
        LD : 0x0400,
        LU : 0x0800,
        STA: 0x1000,
        SEL: 0x2000,
        RL : 0x4000,
        RD : 0x8000
    },

    // Utility
    VBU: {

        // Disassembler options
        "0X"      : 0,
        C         : 1,
        DEST_FIRST: 1,
        DEST_LAST : 0,
        DOLLAR    : 1,
        E         : 0,
        H         : 2,
        INSIDE    : 1,
        JOINED    : 0,
        L         : 0,
        LOWER     : 1,
        NAMES     : 1,
        NONE      : 0,
        NUMBER    : 1,
        NUMBERS   : 0,
        OUTSIDE   : 0,
        SPLIT     : 1,
        UPPER     : 0,
        Z         : 1
    },

    // Web interface
    web: {

        // Break types
        BREAK_FRAME: 1,
        BREAK_POINT: 2,

        // Anaglyph colors
        STEREO_CYAN   : 0x00C6F0,
        STEREO_GREEN  : 0x00B400,
        STEREO_MAGENTA: 0xC800FF,
        STEREO_RED    : 0xFF0000
    }

};
