import { Dom } from "./Dom";

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
        const nameCell = Dom.createElement<HTMLTableCellElement>("td", row, {
            textContent: this.name
        });
        const rangeCell = Dom.createElement<HTMLTableCellElement>("td", row);
        const range = Dom.createElement<HTMLInputElement>("input", rangeCell, {
            type: "range",
            min: this.min,
            max: this.max,
            step: this.step,
            value: this.value
        });
        const inputCell = Dom.createElement<HTMLTableCellElement>("td", row);
        const input = Dom.createElement<HTMLInputElement>("input", row, {
            value: this.value
        });
    }
}