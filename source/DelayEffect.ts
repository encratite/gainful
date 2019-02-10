import { Effect } from "./Effect";

export class DelayEffect extends Effect {
    process(input: Float32Array[]): Float32Array[] {
        return input;
    }
}