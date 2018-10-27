import { Action } from "./Action";
import { Color } from "./Color";
import { Controller } from "./Controller";
import { Entity } from "./Entity";

export abstract class Actor extends Entity {
    constructor(
        glyph: string,
        color: Color,
        public readonly controller: Controller
    ) {
        super(glyph, color);
    }

    public abstract async act(): Promise<Action>;
}
