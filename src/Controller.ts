import { Action } from "./actions/Action";
import { AIController } from "./AIController";
import { Entity } from "./Entity";
import { Game } from "./Game";
import { KeyboardController } from "./KeyboardController";

export enum ControllerKind {
    Keyboard,
    AI
}

export abstract class IController {
    public abstract readonly kind: ControllerKind;

    constructor(
        protected readonly game: Game,
        protected readonly actor: Entity
    ) {}

    public abstract async getAction(): Promise<Action>;
    public abstract dispose(): void;
}

export type Controller = typeof AIController | typeof KeyboardController;
