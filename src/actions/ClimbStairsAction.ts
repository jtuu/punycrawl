import { Location } from "../components/Location";
import { DungeonLevel } from "../DungeonLevel";
import { Entity } from "../Entity";
import { Game } from "../Game";
import { ClimbDirection } from "../Terrain";
import { assertNotNull } from "../utils";
import { ActionKind, IAction } from "./Action";

export class ClimbStairsAction implements IAction {
    public readonly kind = ActionKind.ClimbStairs;
    public direction: ClimbDirection = ClimbDirection.None;

    public execute(game: Game, actor: Entity) {
        if (this.direction === ClimbDirection.None) {
            return;
        }
        const {location: {dungeonLevel: curLevel, x, y}} = actor.assertHasComponent(Location.Component);
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
