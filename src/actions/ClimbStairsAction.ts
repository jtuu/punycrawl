import { Actor } from "../Actor";
import { DungeonLevel } from "../DungeonLevel";
import { Game } from "../Game";
import { ClimbDirection } from "../Terrain";
import { assertNotNull } from "../utils";
import { ActionKind, IAction } from "./Action";

export class ClimbStairsAction implements IAction {
    public readonly kind = ActionKind.ClimbStairs;
    public direction: ClimbDirection = ClimbDirection.None;

    public execute(game: Game, actor: Actor) {
        if (this.direction === ClimbDirection.None) {
            return;
        }
        const x = assertNotNull(actor.x);
        const y = assertNotNull(actor.y);
        const curLevel = assertNotNull(actor.dungeonLevel);
        const terrain = curLevel.terrainAt(x, y);
        let targetLevel: DungeonLevel;
        let directionWord: string;
        if (this.direction === ClimbDirection.Up) {
            targetLevel = assertNotNull(curLevel.previousLevel);
            directionWord = "up";
        } else {
            targetLevel = assertNotNull(curLevel.nextLevel);
            directionWord = "down";
        }
        curLevel.removeEntity(actor);
        targetLevel.putEntity(actor, x, y);
        game.logger.log(`The ${actor.name} goes ${directionWord} the ${terrain.name}.`);
    }
}
