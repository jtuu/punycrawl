import { Color } from "./Color";
import { Controller, IController } from "./Controller";
import { Entity } from "./Entity";
import { Game } from "./Game";

export abstract class Actor extends Entity {
    public readonly controller: IController;

    constructor(
        game: Game,
        glyph: string,
        color: Color,
        maxHealth: number,
        controllerCtor: new (...args: ConstructorParameters<Controller>) => IController
    ) {
        super(game, glyph, color, maxHealth);
        this.controller = new controllerCtor(game, this);
    }
}
