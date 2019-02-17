import { Effect } from "./Effect.js";

import { DelayEffect } from "./DelayEffect.js";

export class Effects {
    static effects: [string, () => Effect][] = [];

    static register(name: string, constructor: () => Effect) {
        this.effects.push([name, constructor]);
    }

    static forEach(callback: (name: string, constructor: () => Effect) => void) {
        this.effects.forEach(tuple => callback(tuple[0], tuple[1]));
    }
}

Effects.register("Delay", () => new DelayEffect());