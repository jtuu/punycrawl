import { Actor } from "../Actor";
import { Game } from "../Game";
import { Action, ActionType } from "./Action";

export class RestAction implements Action {
    public readonly type: ActionType = ActionType.Rest;

    public execute(game: Game, actor: Actor) {
        
    }
}
