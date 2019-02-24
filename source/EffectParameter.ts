import { Dom } from "./Dom.js";

export class EffectParameter {
    name: string;
    defaultValue: number;
    min: number;
    max: number;
    step: number;

    value: number;

    constructor(name: string, defaultValue: number, min: number, max: number, step: number) {
        this.name = name;
        this.defaultValue = defaultValue;
        this.min = min;
        this.max = max;
        this.step = step;
        this.value = defaultValue;
    }

    render(row: HTMLTableRowElement) {
        const range = Dom.element<HTMLInputElement>("input", row);
        range.type = "range";
        range.min = this.min.toString();
        range.max = this.max.toString();
        range.step = this.step.toString();
        range.value = this.value.toString();
    }
}