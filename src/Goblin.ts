import { Actor } from "./Actor";
import { AIController } from "./AIController";
import { Game } from "./Game";

export class Goblin extends Actor {
    constructor(game: Game) {
        super(game, "Goblin", "goblin", 10, AIController);
    }
}
