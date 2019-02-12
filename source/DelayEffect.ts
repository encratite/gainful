import { Effect } from "./Effect.js";

export class DelayEffect extends Effect {
    process(input: Float32Array[]): Float32Array[] {
        return input;
    }
}