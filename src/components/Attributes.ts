import { Entity } from "../entities/Entity";
import { enumSize, isNotNull } from "../utils";
import { Component, ComponentData } from "./Component";
import { EquipableStats } from "./Equipable";
import { Equipment, EquipmentSlot } from "./Equipment";

class AttributesComponent extends Component {
    public attributes: Attributes;

    constructor(...args: ConstructorParameters<typeof Attributes>) {
        super(...args);
        this.attributes = new Attributes(...args);
    }

    public addToEntity(entity: Entity) {
        this.tagger.call(entity);
        const asComponent = entity as Entity & AttributesComponent;
        asComponent.attributes = this.attributes;
    }

    public static removeFromEntity(entity: Entity) {
        this.untagger.call(entity);
        if (entity.hasComponent(this)) {
            delete entity.attributes;
        }
    }
}

export enum Attribute {
    // intrinsic
    Strength,
    Dexterity,
    Endurance,
    Speed,
    // derived
    AttackDiceNum,
    AttackDiceSize,
    Accuracy,
    Defense,
    Evasion
}

const numAttributes = enumSize(Attribute);

export class Attributes extends ComponentData {
    public static readonly Component = AttributesComponent;
    public readonly values: Int32Array = new Int32Array(numAttributes);

    constructor(
        owner: Entity
    ) {
        super(owner);
    }

    public getTotalAttributes(): Attributes {
        const total = new Attributes(this.owner);
        total.values.set(this.values);
        if (this.owner.hasComponent(Equipment.Component)) {
            let armorSum = 0;
            let encumbranceSum = 0;
            for (const item of this.owner.equipment.slots.values()) {
                if (item.hasComponent(Attributes.Component)) {
                    for (let i = 0; i < total.values.length; i++) {
                        total.values[i] += item.attributes.values[i];
                    }
                }
                armorSum += item.equipable.stats[EquipableStats.ArmorRating];
                encumbranceSum += item.equipable.stats[EquipableStats.Encumbrance];
            }
            total.values[Attribute.Defense] += armorSum * (total.values[Attribute.Endurance] / 5);
            total.values[Attribute.Evasion] += total.values[Attribute.Dexterity] / Math.max(encumbranceSum, 1);
            const weapon = this.owner.equipment.get(EquipmentSlot.MainHand);
            if (isNotNull(weapon)) {
                total.values[Attribute.AttackDiceNum] += weapon.equipable.stats[EquipableStats.MeleeDiceSize];
                total.values[Attribute.AttackDiceSize] += total.values[Attribute.Strength] + weapon.equipable.stats[EquipableStats.MeleeDiceNum];
                total.values[Attribute.Accuracy] += total.values[Attribute.Dexterity] + weapon.equipable.stats[EquipableStats.MeleeAccuracy];
            }
        }
        return total;
    }

    // tslint:disable-next-line
    public dispose() {}
}
