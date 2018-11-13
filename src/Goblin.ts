import { AIController } from "./AIController";
import { Controlled } from "./components/Controlled";
import { Damageable } from "./components/Damageable";
import { Renderable } from "./components/Renderable";
import { Vision } from "./components/Vision";
import { Entity } from "./Entity";
import { Game } from "./Game";

export class Goblin extends Entity {
    constructor(game: Game) {
        super(game, "Goblin");
        this.addComponent(new Controlled.Component(this, AIController));
        this.addComponent(new Damageable.Component(this, 10));
        this.addComponent(new Renderable.Component(this, "goblin"));
        this.addComponent(new Vision.Component(this));
    }
}
