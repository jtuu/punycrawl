import { Action } from "./actions/Action";
import { Actor } from "./Actor";
import { AIController } from "./AIController";
import { Game } from "./Game";
import { KeyboardController } from "./KeyboardController";

export abstract class IController {
    constructor(
        protected readonly game: Game,
        protected readonly actor: Actor
    ) {}

    public abstract async getAction(): Promise<Action>;
}

export type Controller = typeof AIController | typeof KeyboardController;
