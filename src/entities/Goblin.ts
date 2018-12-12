import { AIController } from "../AIController";
import { Attribute, Attributes } from "../components/Attributes";
import { Controlled } from "../components/Controlled";
import { Damageable } from "../components/Damageable";
import { Equipable, EquipableStats } from "../components/Equipable";
import { Equipment, EquipmentSlot } from "../components/Equipment";
import { Physical } from "../components/Physical";
import { Renderable } from "../components/Renderable";
import { Vision } from "../components/Vision";
import { Game } from "../Game";
import { Entity } from "./Entity";

class Fist extends Entity {
    constructor(game: Game) {
        super(game, "Fist");
        if (this.addComponent(new Equipable.Component(this, EquipmentSlot.MainHand))) {
            const {stats} = this.equipable;
            stats[EquipableStats.MeleeDiceNum] = 1;
            stats[EquipableStats.MeleeDiceSize] = 1;
            stats[EquipableStats.MeleeAccuracy] = 1;
            stats[EquipableStats.MeleeDelay] = 10;
        }
    }
}

export class Goblin extends Entity {
    constructor(game: Game) {
        super(game, "Goblin");
        if (this.addComponent(new Attributes.Component(this))) {
            this.attributes.values[Attribute.Strength] = 3;
            this.attributes.values[Attribute.Dexterity] = 8;
            this.attributes.values[Attribute.Endurance] = 5;
        }
        this.addComponent(new Controlled.Component(this, AIController));
        this.addComponent(new Damageable.Component(this, 10));
        const defaultWeapon = new Fist(game);
        if (this.addComponent(new Equipment.Component(this)) && defaultWeapon.hasComponent(Equipable.Component)) {
            this.equipment.equip(defaultWeapon);
        }
        this.addComponent(new Renderable.Component(this, "goblin"));
        this.addComponent(new Physical.Component(this, true));
        this.addComponent(new Vision.Component(this));
    }
}
