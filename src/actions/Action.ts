import { Entity } from "../entities/Entity";
import { Game } from "../Game";
import { AttackAction } from "./AttackAction";
import { ClimbStairsAction } from "./ClimbStairsAction";
import { DropAction } from "./DropAction";
import { MoveAction } from "./MoveAction";
import { PickupAction } from "./PickupAction";
import { RestAction } from "./RestAction";

export enum ActionKind {
    Attack,
    ClimbStairs,
    Move,
    Rest,
    Pickup,
    Drop
}

export interface IAction {
    readonly kind: ActionKind;
    execute(game: Game, actor: Entity): void;
}

export type Action = AttackAction | ClimbStairsAction | MoveAction | RestAction | PickupAction | DropAction;
