import { Actor } from "./Actor";
import { White } from "./Color";
import { Game } from "./Game";
import { KeyboardController } from "./KeyboardController";

export class Human extends Actor {
    constructor(game: Game) {
        super(game, "@", White, 100, KeyboardController);
    }
}
