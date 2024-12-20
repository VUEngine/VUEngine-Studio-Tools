const MAX_OUTPUT_VALUE = 21888;

const SAMPLE_RATE = 41667;
const DURATION_CLOCK_PERIOD = 160;
const ENVELOPE_CLOCK_PERIOD = 640;
const SWEEP_MOD_SMALL_PERIOD = 40;
const SWEEP_MOD_LARGE_PERIOD = 320;
const FREQUENCY_CLOCK_INCREASE = 120;
const NOISE_CLOCK_INCREASE = 12;

const NUM_WAVEFORM_DATA_WORDS = 32;
const NUM_WAVEFORM_DATA_TABLES = 5;
const TOTAL_WAVEFORM_DATA_SIZE = NUM_WAVEFORM_DATA_WORDS * NUM_WAVEFORM_DATA_TABLES;
const NUM_MOD_DATA_WORDS = 32;

class IntReg {
    constructor() {
        this.outputEnabled = false;
        this.intervalEnabled = false;
        this.intervalCounterSettingValue = 0;
        this.intervalCounter = 0;
    }

    setIntervalEnabled(enabled) {
        this.intervalEnabled = enabled;
        this.outputEnabled = true;

        if (enabled) {
            this.intervalCounter = 0;
        }
    }

    setIntervalCounterSettingValue(value) {
        this.intervalCounterSettingValue = value & 0x1f;
    }
    
    intervalClock() {
        if (this.outputEnabled && this.intervalEnabled) {
            this.intervalCounter++;
            if (this.intervalCounter > this.intervalCounterSettingValue) {
                this.outputEnabled = false;
            }
        }
    }
}

class LrvReg {
    constructor() {
        this.left = 15;
        this.right = 15;
    }
}

class Envelope {
    constructor() {
        this.regDataReload = 0;
        this.regDataDirection = false;
        this.regDataStepInterval = 0;
        this.regControlRepeat = false;
        this.regControlEnabled = false;
        this.level = 0;
        this.envelopeCounter = 0;
    }

    setDataReload(value) {
        this.regDataReload = value;
        this.level = value;
    }

    setControlEnabled(enabled) {
        this.regControlEnabled = enabled;
        this.level = this.regDataReload;
    }

    envelopeClock() {
        if (this.regControlEnabled) {
            this.envelopeCounter++;
            if (this.envelopeCounter > this.regDataStepInterval) {
                this.envelopeCounter = 0;

                if (this.regDataDirection && this.level < 15) {
                    this.level++;
                } else if (!this.regDataDirection && this.level > 0) {
                    this.level--;
                } else if (this.regControlRepeat) {
                    this.level = this.regDataReload;
                }
            }
        }
    }
}

class SoundChannel {
    constructor() {
        this.regInt = new IntReg();
        this.regLrv = new LrvReg();
        this.envelope = new Envelope();
    }
}

class StandardChannel extends SoundChannel {
    constructor() {
        super();
        this.frequency = 0;
        this.frequencyCounter = 0;
        this.waveform = 0;
        this.phase = 0;
    }

    setEnabled(enabled) {
        this.regInt.outputEnabled = enabled;

        if (enabled) {
            this.envelope.envelopeCounter = 0;
            this.frequencyCounter = 0;
            this.phase = 0;
        }
    }

    frequencyClock() {
        this.frequencyCounter += FREQUENCY_CLOCK_INCREASE;
        if (this.frequencyCounter >= 2048 - this.frequency) {
            this.frequencyCounter = 0;
            this.phase = (this.phase + 1) & (NUM_WAVEFORM_DATA_WORDS - 1);
        }
    }

    output(waveformData) {
        if (this.waveform > 4) {
            return 0;
        }
        return waveformData[this.waveform][this.phase];
    }
}

class SweepModChannel extends SoundChannel {
    constructor() {
        super();

        this.frequency = 0;

        this.regSweepModEnabled = false;
        this.regModRepeat = false;
        this.regFunction = false;
        this.modFrequency = 0;
        this.nextModFrequency = 0;
        this.regSweepModBaseInterval = false;
        this.regSweepModInterval = 0;
        this.regSweepDirection = false;
        this.regSweepShiftAmount = 0;

        this.waveform = 0;

        this.frequencyCounter = 0;
        this.phase = 0;

        this.sweepModCounter = 0;
        this.modPhase = 0;
    }

    setEnabled(enabled) {
        this.regInt.outputEnabled = enabled;

        if (enabled) {
            this.envelope.envelopeCounter = 0;
            this.frequencyCounter = 0;
            this.phase = 0;
            this.sweepModCounter = 0;
            this.modPhase = 0;
        }
    }

    setModFrequency(frequency) {
        this.modFrequency = frequency;
        this.nextModFrequency = frequency;
    }

    frequencyClock() {
        this.frequencyCounter += FREQUENCY_CLOCK_INCREASE;
        if (this.frequencyCounter >= 2048 - this.modFrequency) {
            this.frequencyCounter = 0;

            this.phase = (this.phase + 1) & (NUM_WAVEFORM_DATA_WORDS - 1);
        }
    }

    sweepModClock(modData) {
        this.sweepModCounter++;
        if (this.sweepModCounter >= this.regSweepModInterval) {
            this.sweepModCounter = 0;

            this.modFrequency = this.nextModFrequency;

            let freq = this.modFrequency;

            if (freq >= 2048) {
                this.regInt.outputEnabled = false;
            }

            if (!this.regInt.outputEnabled || !this.regSweepModEnabled || this.regSweepModInterval === 0) {
                return;
            }

            if (!this.regFunction) {
                // Sweep
                const sweep_value = freq >> this.regSweepShiftAmount;
                freq = this.regSweepDirection ? freq + sweep_value : freq - sweep_value;
                freq = freq & 0xFFFF; // Simulate 16-bit unsigned integer wrapping
            } else {
                // Modulation
                const regFreq = this.frequency;
                freq = (regFreq + modData[this.modPhase]) & 0x07ff;

                const MAX_MOD_PHASE = NUM_MOD_DATA_WORDS - 1;
                this.modPhase = !this.regModRepeat && this.modPhase === MAX_MOD_PHASE
                    ? MAX_MOD_PHASE
                    : (this.modPhase + 1) & MAX_MOD_PHASE;
            }

            this.nextModFrequency = freq;
        }
    }

    output(waveformData) {
        if (this.waveform > 4) {
            return 0;
        }

        return waveformData[this.waveform][this.phase];
    }
}

class NoiseChannel extends SoundChannel {
    constructor() {
        super();
        this.frequency = 0;
        this.regNoiseControl = 0;
        this.frequencyCounter = 0;
        this.shift = 0;
        this.output = 0;
    }

    setEnabled(enabled) {
        this.regInt.outputEnabled = enabled;

        if (enabled) {
            this.envelope.envelopeCounter = 0;
            this.frequencyCounter = 0;
            this.shift = 0x7fff;
        }
    }

    noiseClock() {
        this.frequencyCounter += NOISE_CLOCK_INCREASE;
        if (this.frequencyCounter >= 2048 - this.frequency) {
            this.frequencyCounter = 0;

            const lhs = this.shift >> 7;

            let rhsBitIndex;
            switch (this.regNoiseControl) {
                case 0: rhsBitIndex = 14; break;
                case 1: rhsBitIndex = 10; break;
                case 2: rhsBitIndex = 13; break;
                case 3: rhsBitIndex = 4; break;
                case 4: rhsBitIndex = 8; break;
                case 5: rhsBitIndex = 6; break;
                case 6: rhsBitIndex = 9; break;
                default: rhsBitIndex = 11;
            }
            const rhs = this.shift >> rhsBitIndex;

            const xorBit = (lhs ^ rhs) & 0x01;

            this.shift = ((this.shift << 1) | xorBit) & 0x7fff;

            const outputBit = (~xorBit) & 0x01;
            this.output = outputBit === 0 ? 0 : 0x3f;
        }
    }
}

class Vsu {
    constructor() {
        this.waveforms = [
            new Uint8Array(NUM_WAVEFORM_DATA_WORDS),
            new Uint8Array(NUM_WAVEFORM_DATA_WORDS),
            new Uint8Array(NUM_WAVEFORM_DATA_WORDS),
            new Uint8Array(NUM_WAVEFORM_DATA_WORDS),
            new Uint8Array(NUM_WAVEFORM_DATA_WORDS),
        ];
        this.modulation = new Int8Array(NUM_MOD_DATA_WORDS);

        this.channel1 = new StandardChannel();
        this.channel2 = new StandardChannel();
        this.channel3 = new StandardChannel();
        this.channel4 = new StandardChannel();
        this.channel5 = new SweepModChannel();
        this.channel6 = new NoiseChannel();

        this.intervalClockCounter = 0;
        this.envelopeClockCounter = 0;
        this.sweepModClockCounter = 0;
    }

    setWaveform(index, data) {
        [...Array(NUM_WAVEFORM_DATA_WORDS)].map((v, i) => {
            this.waveforms[index][i] = (data[i] ? data[i] - 1 : 0);
        });
    }

    setModulation(data) {
        [...Array(NUM_MOD_DATA_WORDS)].map((v, i) => {
            this.modulation = data[i] = (data[i] ? data[i] - 1 : 0);
        });
    }

    cycles(numCycles, audioFrames) {
        for (let cycle = 0; cycle < numCycles; cycle++) {
            this.intervalClockCounter++;
            if (this.intervalClockCounter >= DURATION_CLOCK_PERIOD) {
                this.intervalClockCounter = 0;

                this.channel1.regInt.intervalClock();
                this.channel2.regInt.intervalClock();
                this.channel3.regInt.intervalClock();
                this.channel4.regInt.intervalClock();
                this.channel5.regInt.intervalClock();
                this.channel6.regInt.intervalClock();
            }

            this.envelopeClockCounter++;
            if (this.envelopeClockCounter >= ENVELOPE_CLOCK_PERIOD) {
                this.envelopeClockCounter = 0;

                this.channel1.envelope.envelopeClock();
                this.channel2.envelope.envelopeClock();
                this.channel3.envelope.envelopeClock();
                this.channel4.envelope.envelopeClock();
                this.channel5.envelope.envelopeClock();
                this.channel6.envelope.envelopeClock();
            }

            this.channel1.frequencyClock();
            this.channel2.frequencyClock();
            this.channel3.frequencyClock();
            this.channel4.frequencyClock();
            this.channel5.frequencyClock();

            this.sweepModClockCounter++;
            const sweepModClockPeriod = this.channel5.regSweepModBaseInterval ? SWEEP_MOD_LARGE_PERIOD : SWEEP_MOD_SMALL_PERIOD;
            if (this.sweepModClockCounter >= sweepModClockPeriod) {
                this.sweepModClockCounter = 0;

                this.channel5.sweepModClock(this.modulation);
            }

            this.channel6.noiseClock();

            this.sampleClock(audioFrames, cycle);
        }
    }

    sampleClock(audioFrames, cycle) {
        let left = 0;
        let right = 0;

        const mixSample = (sound, soundOutput) => {
            if (sound.regInt.outputEnabled) {
                const envelopeLevel = sound.envelope.level;
                const volumeLeft = sound.regLrv.left;
                const volumeRight = sound.regLrv.right;

                const leftLevel = (volumeLeft === 0 || envelopeLevel === 0) 
                    ? 0 
                    : ((volumeLeft * envelopeLevel) >> 3) + 1;
                const rightLevel = (volumeRight === 0 || envelopeLevel === 0) 
                    ? 0 
                    : ((volumeRight * envelopeLevel) >> 3) + 1;

                const outputLeft = (soundOutput * leftLevel) >> 1;
                const outputRight = (soundOutput * rightLevel) >> 1;

                left += outputLeft;
                right += outputRight;
            }
        };

        mixSample(this.channel1, this.channel1.output(this.waveforms));
        mixSample(this.channel2, this.channel2.output(this.waveforms));
        mixSample(this.channel3, this.channel3.output(this.waveforms));
        mixSample(this.channel4, this.channel4.output(this.waveforms));
        mixSample(this.channel5, this.channel5.output(this.waveforms));
        mixSample(this.channel6, this.channel6.output);

        const outputLeft = ((left & 0xfff8) << 2) | 0;
        const outputRight = ((right & 0xfff8) << 2) | 0;

        audioFrames[0][cycle] = outputLeft / MAX_OUTPUT_VALUE;
        audioFrames[1][cycle] = outputRight / MAX_OUTPUT_VALUE;
    }
}

class VsuEmulator extends AudioWorkletProcessor {
    constructor(options) {
        super();
        this.vsu = new Vsu();
        this.port.onmessage = this.onmessage.bind(this);
    }

    onmessage(e) {
        switch(e.data.field) {
            case 'ch1EnvDirection': this.vsu.channel1.envelope.regDataDirection = !!e.data.data; break;
            case 'ch2EnvDirection': this.vsu.channel2.envelope.regDataDirection = !!e.data.data; break;
            case 'ch3EnvDirection': this.vsu.channel3.envelope.regDataDirection = !!e.data.data; break;
            case 'ch4EnvDirection': this.vsu.channel4.envelope.regDataDirection = !!e.data.data; break;
            case 'ch5EnvDirection': this.vsu.channel5.envelope.regDataDirection = !!e.data.data; break;
            case 'ch6EnvDirection': this.vsu.channel6.envelope.regDataDirection = !!e.data.data; break;
            case 'ch1EnvEnabled': this.vsu.channel1.envelope.setControlEnabled(!!e.data.data); break;
            case 'ch2EnvEnabled': this.vsu.channel2.envelope.setControlEnabled(!!e.data.data); break;
            case 'ch3EnvEnabled': this.vsu.channel3.envelope.setControlEnabled(!!e.data.data); break;
            case 'ch4EnvEnabled': this.vsu.channel4.envelope.setControlEnabled(!!e.data.data); break;
            case 'ch5EnvEnabled': this.vsu.channel5.envelope.setControlEnabled(!!e.data.data); break;
            case 'ch6EnvEnabled': this.vsu.channel6.envelope.setControlEnabled(!!e.data.data); break;
            case 'ch1EnvLevel': this.vsu.channel1.envelope.setDataReload(e.data.data); break;
            case 'ch2EnvLevel': this.vsu.channel2.envelope.setDataReload(e.data.data); break;
            case 'ch3EnvLevel': this.vsu.channel3.envelope.setDataReload(e.data.data); break;
            case 'ch4EnvLevel': this.vsu.channel4.envelope.setDataReload(e.data.data); break;
            case 'ch5EnvLevel': this.vsu.channel5.envelope.setDataReload(e.data.data); break;
            case 'ch6EnvLevel': this.vsu.channel6.envelope.setDataReload(e.data.data); break;
            case 'ch1EnvRepeat': this.vsu.channel1.envelope.regControlRepeat = !!e.data.data; break;
            case 'ch2EnvRepeat': this.vsu.channel2.envelope.regControlRepeat = !!e.data.data; break;
            case 'ch3EnvRepeat': this.vsu.channel3.envelope.regControlRepeat = !!e.data.data; break;
            case 'ch4EnvRepeat': this.vsu.channel4.envelope.regControlRepeat = !!e.data.data; break;
            case 'ch5EnvRepeat': this.vsu.channel5.envelope.regControlRepeat = !!e.data.data; break;
            case 'ch6EnvRepeat': this.vsu.channel6.envelope.regControlRepeat = !!e.data.data; break;
            case 'ch1EnvStep': this.vsu.channel1.envelope.regDataStepInterval = e.data.data; break;
            case 'ch2EnvStep': this.vsu.channel2.envelope.regDataStepInterval = e.data.data; break;
            case 'ch3EnvStep': this.vsu.channel3.envelope.regDataStepInterval = e.data.data; break;
            case 'ch4EnvStep': this.vsu.channel4.envelope.regDataStepInterval = e.data.data; break;
            case 'ch5EnvStep': this.vsu.channel5.envelope.regDataStepInterval = e.data.data; break;
            case 'ch6EnvStep': this.vsu.channel6.envelope.regDataStepInterval = e.data.data; break;
            case 'ch1Frequency': this.vsu.channel1.frequency = e.data.data; break;
            case 'ch2Frequency': this.vsu.channel2.frequency = e.data.data; break;
            case 'ch3Frequency': this.vsu.channel3.frequency = e.data.data; break;
            case 'ch4Frequency': this.vsu.channel4.frequency = e.data.data; break;
            case 'ch5Frequency': this.vsu.channel5.frequency = e.data.data; break;
            case 'ch6Frequency': this.vsu.channel6.frequency = e.data.data; break;
            case 'ch1IntervalEnabled': this.vsu.channel1.regInt.setIntervalEnabled(!!e.data.data); break;
            case 'ch2IntervalEnabled': this.vsu.channel2.regInt.setIntervalEnabled(!!e.data.data); break;
            case 'ch3IntervalEnabled': this.vsu.channel3.regInt.setIntervalEnabled(!!e.data.data); break;
            case 'ch4IntervalEnabled': this.vsu.channel4.regInt.setIntervalEnabled(!!e.data.data); break;
            case 'ch5IntervalEnabled': this.vsu.channel5.regInt.setIntervalEnabled(!!e.data.data); break;
            case 'ch6IntervalEnabled': this.vsu.channel6.regInt.setIntervalEnabled(!!e.data.data); break;
            case 'ch1IntervalValue': this.vsu.channel1.regInt.setIntervalCounterSettingValue(e.data.data); break;
            case 'ch2IntervalValue': this.vsu.channel2.regInt.setIntervalCounterSettingValue(e.data.data); break;
            case 'ch3IntervalValue': this.vsu.channel3.regInt.setIntervalCounterSettingValue(e.data.data); break;
            case 'ch4IntervalValue': this.vsu.channel4.regInt.setIntervalCounterSettingValue(e.data.data); break;
            case 'ch5IntervalValue': this.vsu.channel5.regInt.setIntervalCounterSettingValue(e.data.data); break;
            case 'ch6IntervalValue': this.vsu.channel6.regInt.setIntervalCounterSettingValue(e.data.data); break;
            case 'ch1StereoLevels': this.vsu.channel1.regLrv.left = e.data.data.left; this.vsu.channel1.regLrv.right = e.data.data.right; break;
            case 'ch2StereoLevels': this.vsu.channel2.regLrv.left = e.data.data.left; this.vsu.channel2.regLrv.right = e.data.data.right; break;
            case 'ch3StereoLevels': this.vsu.channel3.regLrv.left = e.data.data.left; this.vsu.channel3.regLrv.right = e.data.data.right; break;
            case 'ch4StereoLevels': this.vsu.channel4.regLrv.left = e.data.data.left; this.vsu.channel4.regLrv.right = e.data.data.right; break;
            case 'ch5StereoLevels': this.vsu.channel5.regLrv.left = e.data.data.left; this.vsu.channel5.regLrv.right = e.data.data.right; break;
            case 'ch6StereoLevels': this.vsu.channel6.regLrv.left = e.data.data.left; this.vsu.channel6.regLrv.right = e.data.data.right; break;
            case 'ch5SweepDirection': this.vsu.channel5.regSweepDirection = !!e.data.data; break;
            case 'ch5SweepModEnabled': this.vsu.channel5.regSweepModEnabled = !!e.data.data; break;
            case 'ch5SweepModFunction': this.vsu.channel5.regFunction = !!e.data.data; break;
            case 'regSweepModInterval': this.vsu.channel5.regSweepModInterval = e.data.data; break;
            case 'ch5ModFrequency': this.vsu.channel5.setModFrequency(e.data.data); break;
            case 'ch5ModRepeat': this.vsu.channel5.regModRepeat = !!e.data.data; break;
            case 'ch5SweepShift': this.vsu.channel5.regSweepShiftAmount = e.data.data; break;
            case 'ch6Tap': this.vsu.channel6.regNoiseControl = e.data.data; break;
            case 'ch1Waveform': this.vsu.channel1.waveform = e.data.data; break;
            case 'ch2Waveform': this.vsu.channel2.waveform = e.data.data; break;
            case 'ch3Waveform': this.vsu.channel3.waveform = e.data.data; break;
            case 'ch4Waveform': this.vsu.channel4.waveform = e.data.data; break;
            case 'ch5Waveform': this.vsu.channel5.waveform = e.data.data; break;
            case 'ch6Waveform': this.vsu.channel6.waveform = e.data.data; break;
            case 'modulation': this.vsu.setModulation(e.data.data); break;
            case 'waveform1': this.vsu.setWaveform(0, e.data.data); break;
            case 'waveform2': this.vsu.setWaveform(1, e.data.data); break;
            case 'waveform3': this.vsu.setWaveform(2, e.data.data); break;
            case 'waveform4': this.vsu.setWaveform(3, e.data.data); break;
            case 'waveform5': this.vsu.setWaveform(4, e.data.data); break;
            case 'ch1Enabled': this.vsu.channel1.setEnabled(!!e.data.data); break;
            case 'ch2Enabled': this.vsu.channel2.setEnabled(!!e.data.data); break;
            case 'ch3Enabled': this.vsu.channel3.setEnabled(!!e.data.data); break;
            case 'ch4Enabled': this.vsu.channel4.setEnabled(!!e.data.data); break;
            case 'ch5Enabled': this.vsu.channel5.setEnabled(!!e.data.data); break;
            case 'ch6Enabled': this.vsu.channel6.setEnabled(!!e.data.data); break;
        }
    }

    // TODO: move actual emulation into a Worker and just request values from double buffer here
    process(inputs, outputs) {
        const output = outputs[0];
        const leftChannel = output[0];

        this.vsu.cycles(leftChannel.length, output);

        return true;
    }
};

registerProcessor('vsu-emulator', VsuEmulator);
