import { Actor } from "../Actor";
import { Game } from "../Game";
import { assertNotNull } from "../utils";
import { Action, ActionType } from "./Action";

export class MoveAction implements Action {
    public readonly type: ActionType = ActionType.Move;

    constructor(
        public readonly dx: number,
        public readonly dy: number
    ) {}

    public execute(_game: Game, actor: Actor) {
        const level = assertNotNull(actor.dungeonLevel);
        const x = assertNotNull(actor.x) + this.dx;
        const y = assertNotNull(actor.y) + this.dx;
        level.moveEntityWithin(actor, x, y);
    }
}
