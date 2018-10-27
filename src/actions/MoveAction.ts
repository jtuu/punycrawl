import { Actor } from "../Actor";
import { Game } from "../Game";
import { assertNotNull } from "../utils";
import { ActionKind, IAction } from "./Action";

export class MoveAction implements IAction {
    public readonly kind = ActionKind.Move;

    constructor(
        public readonly dx: number,
        public readonly dy: number
    ) {}

    public execute(_game: Game, actor: Actor) {
        const level = assertNotNull(actor.dungeonLevel);
        const x = assertNotNull(actor.x) + this.dx;
        const y = assertNotNull(actor.y) + this.dy;
        level.moveEntityWithin(actor, x, y);
    }
}
