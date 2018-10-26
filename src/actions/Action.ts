import { Actor } from "../Actor";
import { Game } from "../Game";

export enum ActionType {
    Attack,
    ClimbStairs,
    Move,
    Rest
}

export interface Action {
    readonly type: ActionType;
    execute(game: Game, actor: Actor): void;
}
