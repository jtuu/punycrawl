import { Action } from "./actions/Action";
import { Array2d } from "./Array2d";
import { Controller, IController } from "./Controller";
import { Entity } from "./Entity";
import { Game } from "./Game";
import { assertNotNull } from "./utils";

export abstract class Actor extends Entity {
    private static readonly defaultFovRadius = 10;
    public readonly controller: IController;
    protected fovRadius_: number = Actor.defaultFovRadius;
    private fov_: Array2d | null = null;
    private fovIsFresh: boolean = false;

    constructor(
        game: Game,
        sprite: keyof Spritesheet,
        maxHealth: number,
        controllerCtor: new (...args: ConstructorParameters<Controller>) => IController
    ) {
        super(game, sprite, maxHealth);
        this.controller = new controllerCtor(game, this);
    }

    public get fovRadius(): number {
        return this.fovRadius_;
    }

    public invalidateFovCache() {
        this.fovIsFresh = false;
    }

    public get fov(): Array2d {
        const level = this.dungeonLevel;
        if (level === null) {
            throw new Error("Can't get FOV for actor that has no location");
        }
        const x = assertNotNull(this.x);
        const y = assertNotNull(this.y);
        if (this.fov_ === null) {
            this.fov_ = level.getFieldOfViewAt(x, y, this.fovRadius_);
        }
        if (!this.fovIsFresh) {
            level.updateFieldOfViewAt(this.fov_, x, y, this.fovRadius_);
            this.fovIsFresh = true;
        }
        return this.fov_;
    }

    public async act(): Promise<Action> {
        const action = await this.controller.getAction();
        action.execute(this.game, this);
        return action;
    }
}
