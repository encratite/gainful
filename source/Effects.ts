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

    static create(name: string): Effect {
        const tuple = this.effects.find(tuple => tuple[0] === name);
        if (tuple == null) {
            throw new Error("Unable to find effect.");
        }
        const effectConstructor = tuple[1];
        const effect = effectConstructor();
        return effect;
    }
}

Effects.register("Delay", () => new DelayEffect());