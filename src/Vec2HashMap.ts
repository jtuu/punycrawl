type Vec2 = [number, number];

export class Vec2HashMap<V> {
    private static readonly MIN_VALUE = 0;
    private static readonly MAX_VALUE = 65535;
    private readonly store: Map<number, V> = new Map();
    private hash: (vec: Vec2) => number = Vec2HashMap.hash;

    // cantor pairing
    // unique up to u16
    private static hash(vec: Vec2): number {
        const [u, v] = vec;
        if (!Vec2HashMap.validateKey(vec)) {
            throw new Error("Invalid key");
        }
        return (u + v) * (u + v + 1) / 2 + u;
    }

    private static unsafeHash(vec: Vec2): number {
        const [u, v] = vec;
        return (u + v) * (u + v + 1) / 2 + u;
    }

    public static validateKey(vec: Vec2): boolean {
        return !(vec[0] < Vec2HashMap.MIN_VALUE ||
                 vec[1] < Vec2HashMap.MIN_VALUE ||
                 vec[0] > Vec2HashMap.MAX_VALUE ||
                 vec[1] > Vec2HashMap.MAX_VALUE);
    }

    public unsafe() {
        this.hash = Vec2HashMap.unsafeHash;
    }

    public set(key: Vec2, value: V) {
        this.store.set(this.hash(key), value);
    }

    public get(key: Vec2): V | undefined {
        return this.store.get(this.hash(key));
    }

    public has(key: Vec2): boolean {
        return this.store.has(this.hash(key));
    }
}
