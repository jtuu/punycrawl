import { Entity } from "../entities/Entity";
import { isDefined } from "../utils";
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

type EquipableEntity = Entity & typeof Equipable.Component.prototype;

export class Equipment extends ComponentData {
    public static readonly Component = EquipmentComponent;
    public readonly defaults: Map<EquipmentSlot, EquipableEntity> = new Map();
    public readonly slots: Map<EquipmentSlot, EquipableEntity> = new Map();

    public get(slot: EquipmentSlot): EquipableEntity | null {
        const item = this.slots.get(slot);
        if (isDefined(item)) {
            return item;
        }
        const dflt = this.defaults.get(slot);
        if (isDefined(dflt)) {
            return dflt;
        }
        return null;
    }

    public equip(entity: EquipableEntity) {
        this.slots.set(entity.equipable.slot, entity);
    }

    public unequip(entity: EquipableEntity) {
        this.slots.delete(entity.equipable.slot);
    }

    public hasEquipped(entity: EquipableEntity): boolean {
        return this.slots.get(entity.equipable.slot) === entity;
    }

    // tslint:disable-next-line
    public dispose() {}
}
