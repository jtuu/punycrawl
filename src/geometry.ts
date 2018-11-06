export interface Point {
    x: number;
    y: number;
}

export type Vec2 = [number, number];

export const  N: Vec2 = [ 0, -1];
export const NE: Vec2 = [ 1, -1];
export const  E: Vec2 = [ 1,  0];
export const SE: Vec2 = [ 1,  1];
export const  S: Vec2 = [ 0,  1];
export const SW: Vec2 = [-1,  1];
export const  W: Vec2 = [-1,  0];
export const NW: Vec2 = [-1, -1];

export const principalDirections = [
    NW,  N, NE,
     W,      E,
    SW,  S, SE
];

export const cardinalDirections = [
    N, E, S, W
];

export const ordinalDirections = [
    NE, SE, SW, NW
];

enum Direction {
    None,
    N,
    NE,
    E,
    SE,
    S,
    SW,
    W,
    NW
}

export const directionMap = {
    [Direction.None]: [0, 0],
    [Direction.N]: N,
    [Direction.NE]: NE,
    [Direction.E]: E,
    [Direction.SE]: SE,
    [Direction.S]: S,
    [Direction.SW]: SW,
    [Direction.W]: W,
    [Direction.NW]: NW
};

export function vectorDirection(vec: Vec2): Direction {
    const [u, v] = vec;
    if (u === 0 && v === 0) { return Direction.None; }
    if (v < 0) {
        switch (Math.sign(u)) {
        case 0:
            return Direction.N;
        case 1:
            return Direction.NE;
        case -1:
            return Direction.NW;
        }
    } else {
        switch (Math.sign(u)) {
        case 0:
            return Direction.S;
        case 1:
            return Direction.SE;
        case -1:
            return Direction.SW;
        }
    }
    throw new Error("No direction found");
}
