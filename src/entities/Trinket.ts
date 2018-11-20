import { Equipable } from "../components/Equipable";
import { EquipmentSlot } from "../components/Equipment";
import { Game } from "../Game";
import { Item } from "./Item";

export class Trinket extends Item {
    constructor(game: Game) {
        super(game, "Trinket", "trinket");
        this.addComponent(new Equipable.Component(this, EquipmentSlot.Amulet));
    }
}
