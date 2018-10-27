import { Actor } from "./Actor";
import { Game } from "./Game";
import { assertDefined, assertNotNull } from "./utils";

export enum ActionType {
    Rest,
    Move,
    Attack,
    ClimbStairs
}

export interface Action {
    readonly type: ActionType;
    execute(game: Game, actor: Actor): void;
}

export class MoveAction implements Action {
    public readonly type: ActionType = ActionType.Move;

    constructor(
        protected readonly game: Game,
        protected readonly actor: Actor,
        public readonly dx: number,
        public readonly dy: number
    ) {}

    public execute(_game: Game, actor: Actor) {
        const level = assertNotNull(actor.dungeonLevel);
        const x = assertNotNull(actor.x) + this.dx;
        const y = assertNotNull(actor.y) + this.dx;
        level.moveEntityWithin(actor, x, y);
    }
}

export class AttackAction implements Action {
    public readonly type: ActionType = ActionType.Attack;

    constructor(
        protected readonly game: Game,
        protected readonly actor: Actor,
        public readonly dx: number,
        public readonly dy: number
    ) {}

    public execute(game: Game, actor: Actor) {
        
    }
}

export class RestAction implements Action {
    public readonly type: ActionType = ActionType.Rest;

    constructor(
        protected readonly game: Game,
        protected readonly actor: Actor
    ) {}

    public execute(game: Game, actor: Actor) {
        
    }
}

export class ClimbStairsAction implements Action {
    public readonly type: ActionType = ActionType.ClimbStairs;

    constructor(
        protected readonly game: Game,
        protected readonly actor: Actor
    ) {}

    public execute(game: Game, actor: Actor) {
        
    }
}

export class ActionFactory {
    private bound: boolean = false;
    private game_?: Game;
    private actor_?: Actor;
    private restAction_?: RestAction;

    protected get game(): Game {
        return assertDefined(this.game_);
    }

    protected get actor(): Actor {
        return assertDefined(this.actor_);
    }

    protected get restAction(): RestAction {
        return assertDefined(this.restAction_);
    }

    public bind(game: Game, actor: Actor): this {
        if (this.bound) {
            throw new Error("Can only be bound once");
        }
        this.bound = true;
        this.game_ = game;
        this.actor_ = actor;
        // cache stateless actions
        this.restAction_ = new RestAction(game, actor);
        return this;
    }

    public createMoveAction(dx: number, dy: number): MoveAction {
        return new MoveAction(this.game, this.actor, dx, dy);
    }

    public createAttackAction(dx: number, dy: number): AttackAction {
        return new AttackAction(this.game, this.actor, dx, dy);
    }

    public createRestAction(): RestAction {
        return this.restAction;
    }

    public createClimbStairsAction(): ClimbStairsAction {
        return new ClimbStairsAction(this.game, this.actor);
    }
}
