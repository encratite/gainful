import { EffectParameter } from "./EffectParameter.js";
import { Dom } from "./Dom.js";

export abstract class Effect {
    audioContext: AudioContext;

    abstract getParameters(): EffectParameter[];
    abstract onParameterChange(): void;
    abstract process(input: Float32Array): Float32Array;

    render(container: HTMLElement) {
        const table = Dom.createElement<HTMLTableElement>("table", container);
        const parameters = this.getParameters();
        for (let parameter of parameters) {
            const row = Dom.createElement<HTMLTableRowElement>("tr", table);
            parameter.render(row);
        };
    }

    setAudioContext(audioContext: AudioContext) {
        this.audioContext = audioContext;
    }

    getRatio(dB: number) {
        return Math.pow(10, dB / 10);
    }

    limit(spl: number) {
        return Math.max(Math.min(spl, 1), -1);
    }
}