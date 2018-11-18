import { Physical } from "../components/Physical";
import { Renderable } from "../components/Renderable";
import { Game } from "../Game";
import { Entity } from "./Entity";

export abstract class Item extends Entity {
    constructor(game: Game, name: string, sprite: keyof Spritesheet) {
        super(game, name);
        this.addComponent(new Renderable.Component(this, sprite));
        this.addComponent(new Physical.Component(this, false));
    }
}
