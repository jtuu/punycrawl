import { Actor } from "../Actor";
import { Game } from "../Game";
import { assertNotNull } from "../utils";
import { ActionKind, IAction } from "./Action";

export interface ClimbStairsAction extends IAction {
    kind: ActionKind.ClimbStairs;
}

export const ClimbStairsAction: ClimbStairsAction = {
    kind: ActionKind.ClimbStairs,
    execute(_game: Game, actor: Actor) {
        const level = assertNotNull(actor.dungeonLevel);
        const x = assertNotNull(actor.x);
        const y = assertNotNull(actor.y);
        const terrain = level.terrainAt(x, y);
        if (terrain.climbable) {
            // unimplemented
            level.removeEntity(actor);
        }
    }
};
