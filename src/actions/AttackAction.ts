import { Actor } from "../Actor";
import { Game } from "../Game";
import { Action, ActionType } from "./Action";

export class AttackAction implements Action {
    public readonly type: ActionType = ActionType.Attack;

    constructor(
        public readonly dx: number,
        public readonly dy: number
    ) {}

    public execute(game: Game, actor: Actor) {
        
    }
}
