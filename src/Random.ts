import { MersenneTwister } from "./MersenneTwister";

export class Random extends MersenneTwister {
    private _seed: number;

    constructor(seed: number = Date.now()) {
        super(seed);
        this._seed = seed;
    }

    public get seed(): number {
        return this._seed;
    }

    public coinflip(): boolean {
        return this.genrand_int32() % 2 === 0;
    }

    public random2(max: number) {
        if (max <= 1) {
            return 0;
        }
        return this.genrand_int32() % max;
    }

    public randomRange(low: number, hi: number): number {
        const range = Math.floor(Math.abs(hi - low) + 1);
        return low + this.random2(range);
    }

    public diceRoll(num: number, size: number): number {
        let result = 0;
        if (num > 0 && size > 0) {
            for (let i = 0; i < num; i++) {
                result += this.random2(size);
            }
        }
        return result;
    }

    public chance(num: number, den: number): boolean {
        if (num <= 0) {
            return false;
        } else if (num >= den) {
            return true;
        }
        return this.random2(den) < num;
    }
}
