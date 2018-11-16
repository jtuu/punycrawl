import { Location } from "../components/Location";
import { Storage } from "../components/Storage";
import { Entity } from "../entities/Entity";
import { Game } from "../Game";
import { findById, Id } from "../Id";
import { assertNotNull } from "../utils";
import { ActionKind, IAction } from "./Action";

export class PickupAction implements IAction {
    public readonly kind = ActionKind.Pickup;
    public targetId: Id | null = null;

    public execute(game: Game, actor: Entity) {
        const targetId = assertNotNull(this.targetId);
        const asComponent = actor.assertHasComponents(Location.Component, Storage.Component);
        const {dungeonLevel, x, y} = asComponent.location;
        const target = assertNotNull(findById(dungeonLevel.entitiesAt(x, y), targetId));
        dungeonLevel.removeEntity(target);
        asComponent.storage.add(target);
        game.logger.logLocal(asComponent.location, `The ${actor.name} picks up the ${target.name}.`);
    }
}
