import { Controlled } from "./components/Controlled";
import { Damageable } from "./components/Damageable";
import { Renderable } from "./components/Renderable";
import { Vision } from "./components/Vision";
import { Entity } from "./Entity";
import { Game } from "./Game";
import { KeyboardController } from "./KeyboardController";

export class Human extends Entity {
    constructor(game: Game) {
        super(game, "Human");
        this.addComponent(new Controlled.Component(this, KeyboardController));
        this.addComponent(new Damageable.Component(this, 100));
        this.addComponent(new Renderable.Component(this, "human_male2"));
        this.addComponent(new Vision.Component(this));
    }
}
