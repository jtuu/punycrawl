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
