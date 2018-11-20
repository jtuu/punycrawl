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

export const equipmentSlotNames = [
    "Head",
    "Back",
    "Torso",
    "Hands",
    "Legs",
    "Feet",
    "Main hand",
    "Off-hand",
    "Ring",
    "Ring",
    "Amulet"
];

export class Equipment extends ComponentData {
    public static readonly Component = EquipmentComponent;
    public readonly slots: Map<EquipmentSlot, Entity & typeof Equipable.Component.prototype> = new Map();

    public equip(entity: Entity & typeof Equipable.Component.prototype) {
        this.slots.set(entity.equipable.slot, entity);
    }

    public hasEquipped(entity: Entity & typeof Equipable.Component.prototype): boolean {
        return this.slots.get(entity.equipable.slot) === entity;
    }

    // tslint:disable-next-line
    public dispose() {}
}
