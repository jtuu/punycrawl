import { Array2d } from "./Array2d";

interface DigitalFovModule extends EmscriptenModule {
    _create_array2d(width: number, height: number): IntPtrPtr;
    _free_array2d(arr: IntPtrPtr, width: number, height: number): void;
    _digital_los(map: IntPtrPtr, width: number, height: number, fromx: number, fromy: number, tox: number, toy: number): number;
    _digital_fov(map: IntPtrPtr, width: number, height: number, fov: IntPtrPtr, cx: number, cy: number, r: number): number;
}

declare const Module: DigitalFovModule;
export const FovModule = Module;

export enum Visibility {
    NotVisible = 0,
    Visible = 1
}

export function lineOfSight(map: Array2d, fromx: number, fromy: number, tox: number, toy: number): boolean {
    return Module._digital_los(map.ptr, map.width, map.height, fromx, fromy, tox, toy) > 0;
}

export function getFieldOfView(map: Array2d, cx: number, cy: number, r: number): Array2d {
    const d = 2 * r + 1;
    const fov = new Array2d(d, d);
    const err = Module._digital_fov(map.ptr, map.width, map.height, fov.ptr, cx, cy, r);
    if (err) {
        throw new Error("Failed to calculate FOV");
    }
    return fov;
}

export function updateFieldOfView(map: Array2d, fov: Array2d, cx: number, cy: number, r: number) {
    const err = Module._digital_fov(map.ptr, map.width, map.height, fov.ptr, cx, cy, r);
    if (err) {
        throw new Error("Failed to calculate FOV");
    }
}
