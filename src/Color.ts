export type Color = string;

export function rgb(r: number, g: number, b: number): Color {
    return `rgb(${r},${g},${b})`;
}

export const Black = rgb(  0,   0,   0);
export const White = rgb(255, 255, 255);
export const Red   = rgb(255,   0,   0);
export const Green = rgb(  0, 255,   0);
export const Blue  = rgb(  0,   0, 255);
