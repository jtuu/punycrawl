import { Action, ActionFactory } from "./Action";
import { Actor } from "./Actor";
import { Game } from "./Game";

export abstract class Controller {
    protected readonly actionFactory: ActionFactory;

    constructor(
        protected readonly game: Game,
        protected readonly actor: Actor
    ) {
        this.actionFactory = new ActionFactory();
        this.actionFactory.bind(game, actor);
    }

    public abstract async getAction(): Promise<Action>;
}
