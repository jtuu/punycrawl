import { Action } from "./actions/Action";
import { ActionFactory } from "./actions/ActionFactory";
import { Actor } from "./Actor";
import { ControllerKind, IController } from "./Controller";
import { Bind } from "./decorators";
import { Entity } from "./Entity";
import { Visibility } from "./fov";
import { Game, GameEventTopic } from "./Game";
import { distance, Vec2 } from "./geometry";
import { Human } from "./Human";
import { blindPath, drunkWalk } from "./pathfinding";
import { assertNotNull, isNotNull } from "./utils";

export class AIController extends IController {
    public readonly kind = ControllerKind.AI;

    private attackTarget: Entity | null = null;
    private wanderTarget: Vec2 | null = null;
    private wanderPath: IterableIterator<Vec2> | null = null;
    private wanderCounter: number = 0;

    constructor(game: Game, actor: Actor) {
        super(game, actor);
        this.game.addEventListener(GameEventTopic.Death, this.onEntityDeath);
    }

    @Bind
    private onEntityDeath(entity: Entity) {
        if (entity === this.attackTarget) {
            this.attackTarget = null;
        }
    }

    private findNewAttackTarget(): Entity | null {
        const level = this.actor.dungeonLevel;
        const fov = this.actor.fov;
        if (isNotNull(level)) {
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
        const x = assertNotNull(this.actor.x);
        const y = assertNotNull(this.actor.y);
        const dir = target.pathmap.getNextDirection(x, y);
        if (dir === null) { return null; }
        const [dx, dy] = dir;
        const nx = x + dx;
        const ny = y + dy;
        // standing next to target
        if (distance(x, y, nx, ny) < 2 && level.entitiesAt(nx, ny).includes(target)) {
            return ActionFactory.createAttackAction(dx, dy);
        }
        if (target.pathmap.reachesTarget) {
            // lose target if it's too far
            const dist = target.pathmap.distanceAt(nx, ny);
            if (dist > this.actor.fovRadius * 1.5) {
                this.attackTarget = null;
                return null;
            }
            // move towards
            return ActionFactory.createMoveAction(dx, dy);
        } else {
            // can sense target but can't find path
            // drunkWalk slowly
            let drunkDir: Vec2 | null;
            if (++this.wanderCounter > 1 || (drunkDir = drunkWalk(level, x, y)) === null) {
                this.wanderCounter = 0;
                return ActionFactory.createRestAction();
            } else {
                return ActionFactory.createMoveAction(drunkDir[0], drunkDir[1]);
            }
        }
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
        // move slowly
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
        return this.wander() || ActionFactory.createRestAction();
    }

    public dispose() {
        this.game.removeEventListener(GameEventTopic.Death, this.onEntityDeath);
    }
}
