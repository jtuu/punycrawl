import { assertNotNull } from "./utils";

interface SpritesheetMetadata {
    [key: string]: Sprite;
}

export class SpriteManager<T extends SpritesheetMetadata> {
    private loaded_: boolean = false;
    private metadata: T | null = null;
    private readonly canvas: HTMLCanvasElement;

    constructor(
        private readonly sheetPath: string,
        private readonly metaPath: string
    ) {
        this.canvas = document.createElement("canvas");
    }

    public get loaded(): boolean {
        return this.loaded_;
    }

    public load(): Promise<any> {
        const metaLoad = fetch(this.metaPath)
            .then(res => res.json())
            .then(meta => {
                this.metadata = meta as T;
            });
        const sheetLoad = new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.canvas.width = img.naturalWidth;
                this.canvas.height = img.naturalHeight;
                assertNotNull(this.canvas.getContext("2d")).drawImage(img, 0, 0);
                resolve();
            };
            img.onerror = (_msg, _src, _ln, _col, err) => {
                reject(err);
            };
            img.src = this.sheetPath;
        });
        return Promise.all([metaLoad, sheetLoad]).then(() => {
            this.loaded_ = true;
        });
    }

    public draw<S extends keyof T>(ctx: CanvasRenderingContext2D, spriteName: S, targetX: number, targetY: number) {
        if (this.metadata === null) {
            if (this.loaded) {
                throw new Error("Sprite metadata was null even after it was loaded");
            } else {
                console.warn("Drawing sprite before it has loaded");
            }
            return;
        }
        const sprite = this.metadata[spriteName];
        const {x, y, w, h} = sprite;
        ctx.drawImage(this.canvas, x, y, w, h, targetX, targetY, w, h);
    }
}
