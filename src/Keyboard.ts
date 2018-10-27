import { AsyncStream } from "./AsyncStream";
import { Bind } from "./decorators";

export class Keyboard {
    public readonly keyPresses: AsyncStream<KeyboardEvent> = new AsyncStream(false);

    constructor(private source: GlobalEventHandlers = window) {
        this.source.addEventListener("keyup", this.onKeyUp);
    }

    @Bind
    private onKeyUp(e: KeyboardEvent) {
        this.keyPresses.add(e);
    }

    public dispose() {
        this.source.removeEventListener("keyup", this.onKeyUp);
    }
}
