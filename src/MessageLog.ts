import { assertNotNull, CssValue, isNotNull, parseCssValue } from "./utils";

export class MessageLog {
    private static readonly containerClassName: string = "message-log";
    private static readonly messageClassName: string = "message";
    public readonly container: HTMLElement = document.createElement("div");
    private readonly messages: Array<string> = [];
    private readonly lineHeight: CssValue;
    private numLines_: number;

    constructor(parent: HTMLElement, numLines: number) {
        this.container.className = MessageLog.containerClassName;
        parent.appendChild(this.container);
        const containerLineHeight = parseCssValue(this.container.style.lineHeight);
        if (containerLineHeight) {
            this.lineHeight = containerLineHeight;
        } else {
            this.lineHeight = assertNotNull(parseCssValue(getComputedStyle(parent).lineHeight));
        }
        this.numLines_ = numLines;
        this.updateHeight();
    }

    private static createMessage(text: string): HTMLDivElement {
        const el = document.createElement("div");
        el.className = MessageLog.messageClassName;
        el.textContent = text;
        return el;
    }

    private getCurrentMessages(): Array<string> {
        return this.messages.slice(-this.numLines_);
    }

    public log(text: string) {
        this.messages.push(text);
        const msg = MessageLog.createMessage(text);
        const first = this.container.firstChild;
        if (this.messages.length > this.numLines_ && isNotNull(first)) {
            this.container.removeChild(first);
        }
        this.container.appendChild(msg);
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
            newContents.appendChild(msg);
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
