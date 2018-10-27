import { Color } from "./Color";
import { DungeonLevel } from "./DungeonLevel";
import { Id } from "./Id";

export class Entity {
    private static idCounter: number = 0;
    public readonly id: Id;
    public dungeonLevel: DungeonLevel | null = null;
    public x: number | null = null;
    public y: number | null = null;
    
    constructor(
        public glyph: string,
        public color: Color
    ) {
        this.id = Entity.idCounter++;
    }
}
