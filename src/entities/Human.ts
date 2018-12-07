import { Attribute, Attributes } from "../components/Attributes";
import { Controlled } from "../components/Controlled";
import { Damageable } from "../components/Damageable";
import { Equipable, EquipableStats } from "../components/Equipable";
import { Equipment, EquipmentSlot } from "../components/Equipment";
import { Physical } from "../components/Physical";
import { Renderable } from "../components/Renderable";
import { Storage } from "../components/Storage";
import { Vision } from "../components/Vision";
import { Game } from "../Game";
import { KeyboardController } from "../KeyboardController";
import { Entity } from "./Entity";

class Fist extends Entity {
    constructor(game: Game) {
        super(game, "Fist");
        if (this.addComponent(new Equipable.Component(this, EquipmentSlot.MainHand))) {
            const {stats} = this.equipable;
            stats[EquipableStats.MeleeDice1] = 1;
            stats[EquipableStats.MeleeDice2] = 1;
            stats[EquipableStats.MeleeAccuracy] = -3;
            stats[EquipableStats.MeleeDelay] = 10;
        }
    }
}

export class Human extends Entity {
    constructor(game: Game) {
        super(game, "Human");
        if (this.addComponent(new Attributes.Component(this))) {
            this.attributes.values[Attribute.Strength] = 8;
            this.attributes.values[Attribute.Dexterity] = 8;
            this.attributes.values[Attribute.Endurance] = 8;
        }
        this.addComponent(new Controlled.Component(this, KeyboardController));
        this.addComponent(new Damageable.Component(this, 100));
        const defaultWeapon = new Fist(game);
        if (this.addComponent(new Equipment.Component(this)) && defaultWeapon.hasComponent(Equipable.Component)) {
            this.equipment.equip(defaultWeapon);
        }
        this.addComponent(new Renderable.Component(this, "human_male2"));
        this.addComponent(new Physical.Component(this, true));
        this.addComponent(new Storage.Component(this, 30));
        this.addComponent(new Vision.Component(this));
    }
}
