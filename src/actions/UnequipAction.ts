import { getActionCost } from "../components/Controlled";
import { Equipable } from "../components/Equipable";
import { Equipment } from "../components/Equipment";
import { Location } from "../components/Location";
import { Storage } from "../components/Storage";
import { Entity } from "../entities/Entity";
import { Game } from "../Game";
import { Id } from "../Id";
import { assertNotNull } from "../utils";
import { ActionKind, IAction } from "./Action";

export class UnequipAction implements IAction {
    public readonly kind = ActionKind.Unequip;
    
    constructor(public targetId: Id) {}

    public execute(game: Game, actor: Entity): number {
        const targetId = assertNotNull(this.targetId);
        const asComponent = actor.assertHasComponents(Equipment.Component, Storage.Component);
        const target = assertNotNull(asComponent.storage.find(targetId)).assertHasComponent(Equipable.Component);
        asComponent.equipment.unequip(target);
        if (actor.hasComponent(Location.Component)) {
            game.logger.logLocal(actor.location, `The ${actor.name} takes off its ${target.name}.`);
        }
        return getActionCost(actor, this.kind);
    }
}
