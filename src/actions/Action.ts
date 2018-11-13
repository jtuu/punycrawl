import { Entity } from "../Entity";
import { Game } from "../Game";
import { AttackAction } from "./AttackAction";
import { ClimbStairsAction } from "./ClimbStairsAction";
import { MoveAction } from "./MoveAction";
import { RestAction } from "./RestAction";

export enum ActionKind {
    Attack,
    ClimbStairs,
    Move,
    Rest
}

export interface IAction {
    readonly kind: ActionKind;
    execute(game: Game, actor: Entity): void;
}

export type Action = AttackAction | ClimbStairsAction | MoveAction | RestAction;
