import { Actor } from "./Actor";
import { AIController } from "./AIController";
import { Red } from "./Color";
import { Game } from "./Game";

export class Goblin extends Actor {
    constructor(game: Game) {
        super(game, "g", Red, 10, AIController);
    }
}
