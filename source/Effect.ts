import { EffectParameter } from "./EffectParameter";
import { Dom } from "./Dom";

export abstract class Effect {
    parameters: EffectParameter[] = [];

    abstract process(input: Float32Array[]): Float32Array[];

    render(container: HTMLElement) {
        const table = Dom.createElement<HTMLTableElement>("table", container);
        for (let parameter of this.parameters) {
            const row = Dom.createElement<HTMLTableRowElement>("tr", table);
            parameter.render(row);
        };
    }
}