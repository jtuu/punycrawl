import { Location } from "./components/Location";
import { Vision } from "./components/Vision";
import { Game } from "./Game";
import { assertNotNull, CssValue, isNotNull, parseCssValue } from "./utils";
import { v, VirtualNode } from "./vdom";

export class MessageLog {
    private static readonly containerClassName: string = "message-log";
    private static readonly messageClassName: string = "message";
    public readonly container: HTMLElement;
    private readonly messages: Array<string> = [];
    private readonly lineHeight: CssValue;
    private numLines_: number;

    constructor(private readonly game: Game, parent: HTMLElement, numLines: number) {
        this.container = v("div", {class: MessageLog.containerClassName}).appendTo(parent);
        const containerLineHeight = parseCssValue(this.container.style.lineHeight);
        if (containerLineHeight) {
            this.lineHeight = containerLineHeight;
        } else {
            this.lineHeight = assertNotNull(parseCssValue(getComputedStyle(parent).lineHeight));
        }
        this.numLines_ = numLines;
        this.updateHeight();
    }

    private static createMessage(text: string): VirtualNode<"div"> {
        return v("div", {class: MessageLog.messageClassName}, text);
    }

    private getCurrentMessages(): Array<string> {
        return this.messages.slice(-this.numLines_);
    }

    private log(text: string) {
        this.messages.push(text);
        const msg = MessageLog.createMessage(text);
        const first = this.container.firstChild;
        if (this.messages.length > this.numLines_ && isNotNull(first)) {
            this.container.removeChild(first);
        }
        msg.appendTo(this.container);
    }

    public logGlobal(text: string) {
        this.log(text);
    }

    public logLocal(eventLoc: Location, text: string) {
        if (
            isNotNull(this.game.trackedEntity) &&
            (eventLoc.owner === this.game.trackedEntity || (
                this.game.trackedEntity.hasComponent(Location.Component) &&
                this.game.trackedEntity.location.dungeonLevel === eventLoc.dungeonLevel &&
                this.game.trackedEntity.hasComponent(Vision.Component) &&
                this.game.trackedEntity.vision.canSee(eventLoc.x, eventLoc.y)
            ))
        ) { 
            this.log(text);
        }
    }

    private updateHeight() {
        this.container.style.height = `${this.lineHeight.value * this.numLines_}${this.lineHeight.unit}`;
    }

    private redraw() {
        this.updateHeight();
        const range = document.createRange();
        const first = this.container.firstChild;
        const last = this.container.lastChild;
        if (isNotNull(first) && isNotNull(last)) {
            range.setStartBefore(first);
            range.setEndAfter(last);
            range.deleteContents();
        }
        const newContents = document.createDocumentFragment();
        for (const text of this.getCurrentMessages()) {
            const msg = MessageLog.createMessage(text);
            msg.appendTo(newContents);
        }
        this.container.appendChild(newContents);
    }

    public get numLines(): number {
        return this.numLines_;
    }
    
    public set numLines(value: number) {
        if (value !== this.numLines_) {
            this.numLines_ = value;
            this.redraw();
        }
    }
}
