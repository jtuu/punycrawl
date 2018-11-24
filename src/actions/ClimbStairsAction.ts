import { getActionCost } from "../components/Controlled";
import { Location } from "../components/Location";
import { DungeonLevel } from "../DungeonLevel";
import { Entity } from "../entities/Entity";
import { Game } from "../Game";
import { ClimbDirection } from "../Terrain";
import { assertNotNull } from "../utils";
import { ActionKind, IAction } from "./Action";

export class ClimbStairsAction implements IAction {
    public readonly kind = ActionKind.ClimbStairs;
    public direction: ClimbDirection = ClimbDirection.None;

    public execute(game: Game, actor: Entity): number {
        if (this.direction === ClimbDirection.None) {
            throw new Error("ClimbStairsAction must have direction.");
        }
        const {location} = actor.assertHasComponent(Location.Component);
        const {dungeonLevel: curLevel, x, y} = location;
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
        game.logger.logLocal(location, `The ${actor.name} goes ${directionWord} the ${terrain.name}.`);
        return getActionCost(actor, this.kind);
    }
}
