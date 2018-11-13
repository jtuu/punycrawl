import { Entity } from "../Entity";
import { Game } from "../Game";
import { ActionKind, IAction } from "./Action";

export interface RestAction extends IAction {
    kind: ActionKind.Rest;
}

export const RestAction: RestAction = {
    kind: ActionKind.Rest,
    execute(_game: Game, _actor: Entity) {

    }
};
