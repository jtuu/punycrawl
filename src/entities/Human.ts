import { Controlled } from "../components/Controlled";
import { Damageable } from "../components/Damageable";
import { Physical } from "../components/Physical";
import { Renderable } from "../components/Renderable";
import { Storage } from "../components/Storage";
import { Vision } from "../components/Vision";
import { Game } from "../Game";
import { KeyboardController } from "../KeyboardController";
import { Entity } from "./Entity";

export class Human extends Entity {
    constructor(game: Game) {
        super(game, "Human");
        this.addComponent(new Controlled.Component(this, KeyboardController));
        this.addComponent(new Damageable.Component(this, 100));
        this.addComponent(new Renderable.Component(this, "human_male2"));
        this.addComponent(new Physical.Component(this, true));
        this.addComponent(new Storage.Component(this, 30));
        this.addComponent(new Vision.Component(this));
    }
}
