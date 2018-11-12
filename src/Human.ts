import { Actor } from "./Actor";
import { Game } from "./Game";
import { KeyboardController } from "./KeyboardController";

export class Human extends Actor {
    constructor(game: Game) {
        super(game, "Human", "human_male2", 100, KeyboardController);
    }
}
