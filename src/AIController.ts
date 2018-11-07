import { Action } from "./actions/Action";
import { ActionFactory } from "./actions/ActionFactory";
import { ControllerKind, IController } from "./Controller";
import { Entity } from "./Entity";
import { Visibility } from "./fov";
import { Vec2 } from "./geometry";
import { Human } from "./Human";
import { blindPath } from "./pathfinding";
import { assertNotNull, isNotNull, unused } from "./utils";

export class AIController extends IController {
    public readonly kind = ControllerKind.AI;

    private attackTarget: Entity | null = null;
    private wanderTarget: Vec2 | null = null;
    private wanderPath: IterableIterator<Vec2> | null = null;

    private findNewAttackTarget(): Entity | null {
        const level = this.actor.dungeonLevel;
        const fov = this.actor.fov;
        if (isNotNull(level) && isNotNull(fov)) {
            const x = assertNotNull(this.actor.x);
            const y = assertNotNull(this.actor.y);
            const r = this.actor.fovRadius;
            for (let fx = 0; fx < fov.width; fx++) {
                const col = fov.columns[fx];
                for (let fy = 0; fy < fov.height; fy++) {
                    const vis = col[fy] as Visibility;
                    if (vis === Visibility.Visible) {
                        const dx = x + fx - r;
                        const dy = y + fy - r;
                        const entities = level.entitiesAt(dx, dy);
                        for (const entity of entities) {
                            if (entity instanceof Human) {
                                return entity;
                            }
                        }
                    }
                }
            }
        }
        return null;
    }

    private chaseEnemy(): Action | null {
        const level = this.actor.dungeonLevel;
        if (level === null) { return null; }
        if (this.attackTarget === null) {
            this.attackTarget = this.findNewAttackTarget();
        }
        const target = this.attackTarget;
        if (target === null) { return null; }
        if (target.pathmap.reachesTarget) {
            const x = assertNotNull(this.actor.x);
            const y = assertNotNull(this.actor.y);
            const dist = target.pathmap.distanceAt(x, y);
            if (dist > this.actor.fovRadius * 1.5) {
                this.attackTarget = null;
                return null;
            }
            const dir = target.pathmap.getNextDirection(x, y);
            if (dir === null) { return null; }
            const [dx, dy] = dir;
            if (dx === 0 && dy === 0) {
                return null;
            } else if (level.entitiesAt(x + dx, y + dy).includes(target)) {
                this.wanderPath = null;
                this.wanderTarget = null;
                return ActionFactory.createAttackAction(dx, dy);
            } else {
                return ActionFactory.createMoveAction(dx, dy);
            }
        }
        return null;
    }

    private findNewWanderTarget(): Vec2 | null {
        const level = this.actor.dungeonLevel;
        if (level === null) { return null; }
        let x;
        let y;
        do {
            x = Math.floor(Math.random() * level.width);
            y = Math.floor(Math.random() * level.height);
        } while (level.terrainAt(x, y).blocksMovement || level.entitiesAt(x, y).length > 0);
        return [x, y];
    }

    private wanderCounter: number = 0;

    private wander(): Action | null {
        const x = this.actor.x;
        const y = this.actor.y;
        if (x === null || y === null) { return null; }
        if (this.wanderPath === null) {
            const level = this.actor.dungeonLevel;
            if (level === null) { return null; }
            if (this.wanderTarget === null) {
                this.wanderTarget = this.findNewWanderTarget();
            }
            const target = this.wanderTarget;
            if (target === null) { return null; }
            
            this.wanderPath = blindPath(level, x, y, target[0], target[1]);
        }
        const path = this.wanderPath;
        if (++this.wanderCounter > 1) {
            this.wanderCounter = 0;
            return ActionFactory.createRestAction();
        }
        const next = path.next();
        if (next.done) {
            this.wanderPath = null;
            this.wanderTarget = null;
            return this.wander();
        }
        const [nx, ny] = next.value;
        const dx = nx - x;
        const dy = ny - y;
        return ActionFactory.createMoveAction(dx, dy);
    }

    public async getAction(): Promise<Action> {
        const chase = this.chaseEnemy();
        if (isNotNull(chase)) {
            this.wanderPath = null;
            this.wanderTarget = null;
            return chase;
        }
        unused(this.wander);
        return ActionFactory.createRestAction();
    }
}
