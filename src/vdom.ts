class VirtualNodeClassList extends Array<string> implements DOMTokenList {
    private clear() {
        this.length = 0;
    }

    public get value(): string {
        return this.join(" ");
    }

    public set value(val: string) {
        this.clear();
        this.add(...val.split(" "));
    }

    private addOne(className: string): boolean {
        const idx = this.indexOf(className);
        if (idx > -1) {
            this.push(className);
            return true;
        }
        return false;
    }

    public add(...classNames: Array<string>) {
        const numToFind = classNames.length;
        if (numToFind === 1) {
            this.addOne(classNames[0]);
        } else {
            let dupesFound = 0;
            for (const cls of classNames) {
                let isDupe = false;
                for (let i = 0; i < this.length; i++) {
                    if (this[i] === cls) {
                        isDupe = true;
                        // all are duplicates?
                        if (++dupesFound >= numToFind) {
                            return;
                        }
                        break;
                    }
                }
                if (!isDupe) {
                    this.push(cls);
                }
            }
        }
    }

    private removeOne(className: string): boolean {
        const idx = this.indexOf(className);
        if (idx > -1) {
            this.splice(idx, 1);
            return true;
        }
        return false;
    }

    public remove(...classNames: Array<string>) {
        const numToFind = classNames.length;
        if (numToFind === 1) {
            this.removeOne(classNames[0]);
        } else {
            const indices = [];
            for (const cls of classNames) {
                for (let i = 0; i < this.length; i++) {
                    if (this[i] === cls) {
                        // all found?
                        if (indices.push(i) >= numToFind) {
                            break;
                        }
                    }
                }
            }
            for (const idx of indices) {
                this.splice(idx, 1);
            }
        }
    }

    public item(idx: number): string | null {
        if (idx < 0 || idx > this.length) {
            return null;
        }
        return this[idx];
    }

    public toggle(className: string, force?: boolean): boolean {
        if (typeof force === "undefined") {
            if (this.removeOne(className)) {
                return false;
            } else {
                this.push(className);
                return true;
            }
        } else {
            if (force) {
                this.addOne(className);
            } else {
                this.removeOne(className);
            }
            return force;
        }
    }

    public contains(className: string): boolean {
        return this.includes(className);
    }

    public replace(oldClassName: string, newClassName: string) {
        const idx = this.indexOf(oldClassName);
        if (idx > -1) {
            this.splice(idx, 1, newClassName);
        }
    }

    public forEach(callbackfn: (value: string, key: number, parent: any) => void, thisArg?: any) {
        super.forEach(callbackfn, thisArg);
    }

    // wtf is this
    // tslint:disable-next-line
    public supports(_token: string): boolean {
        return false;
    }
}

interface VirtualNodeAttributesBase {
    readonly classList: DOMTokenList;
}

interface VirtualNodeAttributesArg {
    id: string;
    readonly class: string;
    style: CSSStyleDeclaration;
}

type TagName = keyof HTMLElementTagNameMap;
type VirtualNodeAttributes = VirtualNodeAttributesBase & Partial<VirtualNodeAttributesArg>;
type VirtualNodeChildren = string | Array<VirtualNode<any>>;
type VirtualNodeOptionalArg = Partial<VirtualNodeAttributesArg> | VirtualNodeChildren;

export interface VirtualNode<T extends TagName> {
    readonly tagName: T;
    readonly attrs: Partial<VirtualNodeAttributes>;
    text: string | null;
    readonly children: Array<VirtualNode<any>>;
    toDOM(): HTMLElementTagNameMap[T];
    appendTo(parent: Node): HTMLElementTagNameMap[T];
    prependTo(parent: Node): HTMLElementTagNameMap[T];
    insertAfter(sibling: Node): HTMLElementTagNameMap[T];
    insertBefore(sibling: Node): HTMLElementTagNameMap[T];
}

class VirtualNodeImpl<T extends TagName> implements VirtualNode<T> {
    public readonly tagName: T;
    public readonly attrs: VirtualNodeAttributes;
    public text: string | null = null;
    public readonly children: Array<VirtualNode<any>>;

    constructor(
        tagName: T,
        attrsOrChildren?: VirtualNodeOptionalArg,
        children?: VirtualNodeChildren
    ) {
        this.tagName = tagName;
        const baseAttrs = VirtualNodeImpl.getBaseAttrs();
        if (typeof attrsOrChildren === "string") {
            if (Array.isArray(children)) {
                throw new TypeError("Can't mix vnodes and text.");
            }
            this.attrs = baseAttrs;
            this.text = attrsOrChildren;
            this.children = [];
        } else if (Array.isArray(attrsOrChildren)) {
            this.attrs = baseAttrs;
            this.children = attrsOrChildren;
        } else if (typeof attrsOrChildren === "object") {
            this.attrs = Object.assign(baseAttrs, attrsOrChildren);
            if (typeof this.attrs.class === "string") {
                this.attrs.classList.add(...this.attrs.class.split(" "));
            }
            if (typeof children === "string") {
                this.text = children;
                this.children = [];
            } else if (Array.isArray(children)) {
                this.children = children;
            } else {
                this.children = [];
            }
        } else {
            if (children !== undefined) {
                throw new TypeError("Wrong argument order.");
            }
            this.attrs = baseAttrs;
            this.children = [];
        }
    }

    private static setElementStyle(el: HTMLElement, style: CSSStyleDeclaration) {
        for (const key in style) {
            if (style.hasOwnProperty(key)) {
                el.style[key] = style[key];
            }
        }
    }

    private static getBaseAttrs(): VirtualNodeAttributesBase {
        return {
            classList: new VirtualNodeClassList()
        };
    }

    private setAttrs(el: HTMLElement) {
        if (this.text !== null) {
            el.textContent = this.text;
        }
        if (this.attrs.id !== undefined) {
            el.id = this.attrs.id;
        }
        el.className = this.attrs.classList.value;
        if (this.attrs.style !== undefined) {
            VirtualNodeImpl.setElementStyle(el, this.attrs.style);
        }
    }

    private static getParent(node: Node): HTMLElement {
        const parent = node.parentElement;
        if (parent === null) {
            throw new Error("Cannot get parent of Node which does not exist in DOM.");
        }
        return parent;
    }

    public toDOM(): HTMLElementTagNameMap[T] {
        const self = document.createElement(this.tagName);
        this.setAttrs(self);
        for (const child of this.children) {
            self.appendChild(child.toDOM());
        }
        return self;
    }

    public appendTo(parent: Node): HTMLElementTagNameMap[T] {
        const self = this.toDOM();
        parent.appendChild(self);
        return self;
    }

    public prependTo(parent: Node): HTMLElementTagNameMap[T] {
        const self = this.toDOM();
        parent.insertBefore(self, parent.firstChild);
        return self;
    }

    public insertAfter(sibling: Node): HTMLElementTagNameMap[T] {
        const self = this.toDOM();
        const parent = VirtualNodeImpl.getParent(sibling);
        parent.insertBefore(self, sibling.nextSibling);
        return self;
    }

    public insertBefore(sibling: Node): HTMLElementTagNameMap[T] {
        const self = this.toDOM();
        const parent = VirtualNodeImpl.getParent(sibling);
        parent.insertBefore(self, sibling.nextSibling);
        return self;
    }
}

export function v<T extends TagName>(
    tagName: T,
    attrsOrChildren?: VirtualNodeOptionalArg,
    children?: VirtualNodeChildren
): VirtualNode<T> {
    return new VirtualNodeImpl(tagName, attrsOrChildren, children);
}
