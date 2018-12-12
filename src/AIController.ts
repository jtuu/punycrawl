import { Action } from "./actions/Action";
import { ActionFactory } from "./actions/ActionFactory";
import { Location } from "./components/Location";
import { Vision } from "./components/Vision";
import { ControllerKind, IController } from "./Controller";
import { Bind } from "./decorators";
import { Entity } from "./entities/Entity";
import { Human } from "./entities/Human";
import { Visibility } from "./fov";
import { Game, GameEventTopic } from "./Game";
import { distance, Vec2 } from "./geometry";
import { blindPath, drunkWalk } from "./pathfinding";
import { isNotNull } from "./utils";

export class AIController extends IController {
    public readonly kind = ControllerKind.AI;

    private attackTarget: Entity | null = null;
    private wanderTarget: Vec2 | null = null;
    private wanderPath: IterableIterator<Vec2> | null = null;
    private wanderCounter: number = 0;

    constructor(game: Game, actor: Entity) {
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
        if (!this.actor.hasComponents(Location.Component, Vision.Component)) {
            return null;
        }
        const {dungeonLevel: level, x, y} = this.actor.location;
        const {fov, fovRadius: r} = this.actor.vision;
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
        return null;
    }

    private chaseEnemy(): Action | null {
        if (this.attackTarget === null) {
            this.attackTarget = this.findNewAttackTarget();
        }
        const target = this.attackTarget;
        if (target === null) { return null; }
        if (!target.hasComponent(Location.Component)) {
            return null;
        }
        if (!this.actor.hasComponents(Location.Component, Vision.Component)) {
            return null;
        }
        const {dungeonLevel: level, x, y} = this.actor.location;
        const {pathmap} = target.location;
        const dir = pathmap.getNextDirection(x, y);
        if (dir === null) { return null; }
        const [dx, dy] = dir;
        const nx = x + dx;
        const ny = y + dy;
        // standing next to target
        if (distance(x, y, nx, ny) < 2 && level.entitiesAt(nx, ny).includes(target)) {
            return ActionFactory.createAttackAction(dx, dy);
        }
        if (pathmap.reachesTarget) {
            // lose target if it's too far
            const dist = pathmap.distanceAt(nx, ny);
            if (dist > this.actor.vision.fovRadius * 1.5) {
                this.attackTarget = null;
                return null;
            }
            // move towards
            return ActionFactory.createMoveAction(dx, dy);
        } else {
            // can sense target but can't find path
            // drunkWalk slowly
            let drunkDir: Vec2 | null;
            if (++this.wanderCounter > 1 || (drunkDir = drunkWalk(this.game.rng, level, x, y)) === null) {
                this.wanderCounter = 0;
                return ActionFactory.createRestAction();
            } else {
                return ActionFactory.createMoveAction(drunkDir[0], drunkDir[1]);
            }
        }
    }

    private findNewWanderTarget(): Vec2 | null {
        if (!this.actor.hasComponent(Location.Component)) {
            return null;
        }
        const level = this.actor.location.dungeonLevel;
        let x;
        let y;
        do {
            x = this.game.rng.random2(level.width);
            y = this.game.rng.random2(level.height);
        } while (level.terrainAt(x, y).blocksMovement || level.entitiesAt(x, y).length > 0);
        return [x, y];
    }

    private wander(): Action | null {
        if (!this.actor.hasComponent(Location.Component)) {
            return null;
        }
        const {dungeonLevel: level, x, y} = this.actor.location;
        if (this.wanderPath === null) {
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
