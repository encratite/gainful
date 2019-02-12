import { Effect } from "./Effect.js";

export class EffectFactory {
    name: string;
    type: () => Effect;

    constructor(name: string, type: () => Effect) {
        this.name = name;
        this.type = type;
    }

    create(): Effect {
        const effect = this.type();
        return effect;
    }
}