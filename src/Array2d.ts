import { FovModule } from "./fov";

const NULL = 0;
const sizeofInt32 = Int32Array.BYTES_PER_ELEMENT;

export class Array2d {
    private ptr_: IntPtrPtr = NULL;
    private disposed: boolean = false;
    public readonly columns: Array<Int32Array> = [];

    constructor(
        public readonly width: number,
        public readonly height: number
    ) {
        // assumes pointers are 32
        if ((this.ptr_ = FovModule._create_array2d(width, height)) === NULL) {
            throw new Error("Failed to allocate Array2d");
        }
        const offset = this.ptr_ / sizeofInt32;
        const colPtrs = FovModule.HEAP32.subarray(offset, offset + width); 
        for (let x = 0; x < width; x++) {
            const colOffset = colPtrs[x] / sizeofInt32;
            this.columns[x] = FovModule.HEAP32.subarray(colOffset, colOffset + height);
        }
    }

    public get ptr(): IntPtrPtr {
        if (this.disposed) {
            throw new Error("Trying to use disposed Array2d");
        }
        return this.ptr_;
    }

    public dispose() {
        FovModule._free_array2d(this.ptr_, this.width, this.height);
        this.ptr_ = NULL;
        this.disposed = true;
    }
}
