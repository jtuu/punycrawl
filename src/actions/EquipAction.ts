import { Equipable } from "../components/Equipable";
import { Equipment } from "../components/Equipment";
import { Location } from "../components/Location";
import { Storage } from "../components/Storage";
import { Entity } from "../entities/Entity";
import { Game } from "../Game";
import { Id } from "../Id";
import { assertNotNull } from "../utils";
import { ActionKind, IAction } from "./Action";

export class EquipAction implements IAction {
    public readonly kind = ActionKind.Equip;
    
    constructor(public targetId: Id) {}

    public execute(game: Game, actor: Entity) {
        const targetId = assertNotNull(this.targetId);
        const asComponent = actor.assertHasComponents(Equipment.Component, Storage.Component);
        const target = assertNotNull(asComponent.storage.take(targetId)).assertHasComponent(Equipable.Component);
        asComponent.equipment.equip(target);
        if (actor.hasComponent(Location.Component)) {
            game.logger.logLocal(actor.location, `The ${actor.name} equips a ${target.name}.`);
        }
    }
}
