import { getActionCost } from "../components/Controlled";
import { Location } from "../components/Location";
import { Storage } from "../components/Storage";
import { Entity } from "../entities/Entity";
import { Game } from "../Game";
import { Id } from "../Id";
import { assertNotNull } from "../utils";
import { ActionKind, IAction } from "./Action";

export class DropAction implements IAction {
    public readonly kind = ActionKind.Drop;

    constructor(public targetId: Id) {}

    public execute(game: Game, actor: Entity): number {
        const targetId = assertNotNull(this.targetId);
        const asComponent = actor.assertHasComponents(Location.Component, Storage.Component);
        const {dungeonLevel, x, y} = asComponent.location;
        const target = assertNotNull(asComponent.storage.take(targetId));
        dungeonLevel.putEntity(target, x, y);
        game.logger.logLocal(asComponent.location, `The ${actor.name} drops the ${target.name}.`);
        return getActionCost(actor, this.kind);
    }
}
