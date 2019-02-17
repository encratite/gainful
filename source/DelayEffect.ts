import { Effect } from "./Effect.js";
import { EffectParameter } from "./EffectParameter.js";

export class DelayEffect extends Effect {
    dryVolume: EffectParameter = new EffectParameter("Dry volume (dB)", -3, -12, 0, 0.1);
    wetVolume: EffectParameter = new EffectParameter("Wet volume (dB)", -6, -12, 0, 0.1);
    delay: EffectParameter = new EffectParameter("Delay (ms)", 250, 0, 2000, 10);

    delayBuffer: Float32Array;

    getParameters(): EffectParameter[] {
        const parameters = [
            this.dryVolume,
            this.wetVolume,
            this.delay
        ];
        return parameters;
    }

    onParameterChange(): void {
        const samples = Math.round(this.delay.value / 1000 * this.audioContext.sampleRate);
        this.delayBuffer = new Float32Array(samples);
        for (let i = 0; i < samples; i++) {
            this.delayBuffer[i] = 0;
        }
    }

    process(input: Float32Array): Float32Array {
        const output = new Float32Array(input.length);
        for (let i = 0; i < input.length; i++) {
            const dry = this.getRatio(this.dryVolume.value) * input[i];
            const wet = this.getRatio(this.wetVolume.value) * this.delayBuffer[i];
            output[i] = this.limit(dry + wet);
        }
        if (input.length < this.delayBuffer.length) {
            this.delayBuffer.copyWithin(0, input.length);
        }
        const offset = Math.max(this.delayBuffer.length - input.length, 0);
        this.delayBuffer.set(input, offset);
        return output;
    }
}