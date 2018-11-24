import { getActionCost } from "../components/Controlled";
import { Location } from "../components/Location";
import { Entity } from "../entities/Entity";
import { Game } from "../Game";
import { assertNotNull } from "../utils";
import { ActionKind, IAction } from "./Action";

export class MoveAction implements IAction {
    public readonly kind = ActionKind.Move;

    constructor(
        public readonly dx: number,
        public readonly dy: number
    ) {}

    public execute(_game: Game, actor: Entity): number {
        const asComponent = actor.assertHasComponent(Location.Component);
        const {location} = asComponent;
        const level = assertNotNull(location.dungeonLevel);
        const x = assertNotNull(location.x) + this.dx;
        const y = assertNotNull(location.y) + this.dy;
        level.moveEntityWithin(asComponent, x, y);
        return getActionCost(actor, this.kind);
    }
}
