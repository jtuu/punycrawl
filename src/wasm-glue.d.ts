declare type IntPtrPtr = number;

declare interface EmscriptenModule {
    onRuntimeInitialized(): void;
    calledRun: boolean;
    wasmMemory: WebAssembly.Memory;
    HEAP8: Int8Array;
    HEAP16: Int16Array;
    HEAP32: Int32Array;
    HEAPU8:  Uint8Array;
    HEAPU16: Uint16Array;
    HEAPU32: Uint32Array;
    HEAPF32: Float32Array;
    HEAPF64: Float64Array;
}

declare const Module: EmscriptenModule;
