import { DungeonLevel } from "./DungeonLevel";
import { Game } from "./Game";
import { Id } from "./Id";

export class Entity {
    private static idCounter: number = 0;
    public readonly id: Id;
    public dungeonLevel: DungeonLevel | null = null;
    public x: number | null = null;
    public y: number | null = null;
    private health: number;
    
    constructor(
        public game: Game,
        public sprite: keyof Spritesheet,
        public readonly maxHealth: number
    ) {
        this.id = Entity.idCounter++;
        this.health = maxHealth;
    }

    public takeDamage(dmg: number) {
        this.health -= Math.abs(dmg);
    }

    public get alive(): boolean {
        return this.health > 0;
    }
}
