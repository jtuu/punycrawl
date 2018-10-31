import { Actor } from "../Actor";
import { Game } from "../Game";
import { ClimbDirection } from "../Terrain";
import { assertNotNull } from "../utils";
import { ActionKind, IAction } from "./Action";

export class ClimbStairsAction implements IAction {
    public readonly kind = ActionKind.ClimbStairs;
    public direction: ClimbDirection = ClimbDirection.None;

    public execute(_game: Game, actor: Actor) {
        if (this.direction === ClimbDirection.None) {
            return;
        }
        const x = assertNotNull(actor.x);
        const y = assertNotNull(actor.y);
        const curLevel = assertNotNull(actor.dungeonLevel);
        const targetLevel = this.direction === ClimbDirection.Up ? 
            assertNotNull(curLevel.previousLevel) :
            assertNotNull(curLevel.nextLevel);
        curLevel.removeEntity(actor);
        targetLevel.putEntity(actor, x, y);
    }
}
