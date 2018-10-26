import { Action } from "./actions/Action";
import { Actor } from "./Actor";
import { Game } from "./Game";

export abstract class Controller {
    constructor(
        protected readonly game: Game,
        protected readonly actor: Actor
    ) {}

    public abstract async getAction(): Promise<Action>;
}
