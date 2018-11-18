import { Entity } from "../entities/Entity";
import { Component, ComponentData } from "./Component";
import { Equipable } from "./Equipable";

class EquipmentComponent extends Component {
    public equipment: Equipment;

    constructor(...args: ConstructorParameters<typeof Equipment>) {
        super(...args);
        this.equipment = new Equipment(...args);
    }

    public addToEntity(entity: Entity) {
        this.tagger.call(entity);
        const asComponent = entity as Entity & EquipmentComponent;
        asComponent.equipment = this.equipment;
    }

    public static removeFromEntity(entity: Entity) {
        this.untagger.call(entity);
        if (entity.hasComponent(this)) {
            delete entity.equipment;
        }
    }
}

export enum EquipmentSlot {
    Head,
    Back,
    Torso,
    Hands,
    Legs,
    Feet,
    MainHand,
    OffHand,
    Ring1,
    Ring2,
    Amulet
}

export class Equipment extends ComponentData {
    public static readonly Component = EquipmentComponent;
    public readonly slots: Map<EquipmentSlot, Entity & typeof Equipable.Component.prototype> = new Map();

    // tslint:disable-next-line
    public dispose() {}
}
