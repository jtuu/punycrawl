import { DungeonLevel } from "./DungeonLevel";
import { Game, GameEventTopic } from "./Game";
import { Id } from "./Id";
import { Pathmap } from "./pathfinding";
import { isNotNull } from "./utils";

export abstract class Entity {
    private static idCounter: number = 0;
    public readonly id: Id;
    public dungeonLevel: DungeonLevel | null = null;
    public x: number | null = null;
    public y: number | null = null;
    private health_: number;
    private pathmap_: Pathmap | null = null;
    private pathmapIsFresh: boolean = false;
    
    constructor(
        public game: Game,
        public sprite: keyof Spritesheet,
        public readonly maxHealth: number
    ) {
        this.id = Entity.idCounter++;
        this.health_ = maxHealth;
    }

    public get health(): number {
        return this.health_;
    }

    public takeDamage(dmg: number) {
        this.health_ -= Math.abs(dmg);
        if (this.health_ <= 0) {
            this.die();
        }
    }

    public get alive(): boolean {
        return this.health_ > 0;
    }

    protected die() {
        this.health_ = 0;
        this.game.emit(GameEventTopic.Death, this);
        const level = this.dungeonLevel;
        if (isNotNull(level)) {
            level.removeEntity(this);
        }
    }

    public invalidatePathmapCache() {
        this.pathmapIsFresh = false;
    }

    public get pathmap(): Pathmap {
        if (this.dungeonLevel === null) {
            throw new Error("Can't get pathmap for entity that has no location");
        }
        if (this.pathmap_ === null) {
            this.pathmap_ = new Pathmap(this.dungeonLevel.width, this.dungeonLevel.height, this);
        }
        if (!this.pathmapIsFresh) {
            this.pathmap_.update();
            this.pathmapIsFresh = true;
        }
        return this.pathmap_;
    }
}
