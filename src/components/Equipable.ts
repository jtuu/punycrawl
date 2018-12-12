import { Entity } from "../entities/Entity";
import { enumSize } from "../utils";
import { Component, ComponentData } from "./Component";
import { EquipmentSlot } from "./Equipment";

class EquipableComponent extends Component {
    public equipable: Equipable;

    constructor(...args: ConstructorParameters<typeof Equipable>) {
        super(...args);
        this.equipable = new Equipable(...args);
    }

    public addToEntity(entity: Entity) {
        this.tagger.call(entity);
        const asComponent = entity as Entity & EquipableComponent;
        asComponent.equipable = this.equipable;
    }

    public static removeFromEntity(entity: Entity) {
        this.untagger.call(entity);
        if (entity.hasComponent(this)) {
            delete entity.equipable;
        }
    }
}

export enum EquipableStats {
    MeleeDiceNum,
    MeleeDiceSize,
    MeleeAccuracy,
    MeleeDelay,
    ArmorRating,
    Encumbrance
}

const numEquipableStats = enumSize(EquipableStats);

export class Equipable extends ComponentData {
    public static readonly Component = EquipableComponent;
    public readonly stats: Int32Array = new Int32Array(numEquipableStats);

    constructor(
        owner: Entity,
        public readonly slot: EquipmentSlot
    ) {
        super(owner);
    }

    // tslint:disable-next-line
    public dispose() {}
}
