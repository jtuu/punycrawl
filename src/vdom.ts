interface BaseVirtualNodeAttributes {
    id: string;
    className: string;
    style: CSSStyleDeclaration;
}

type TagName = keyof HTMLElementTagNameMap;
type VirtualNodeAttributes = Partial<BaseVirtualNodeAttributes>;
type VirtualNodeChildren = string | Array<VirtualNode<any>>;
type VirtualNodeOptionalArg = VirtualNodeAttributes | VirtualNodeChildren;

class VirtualNode<T extends TagName> {
    public readonly tagName: T;
    public readonly attrs: Partial<VirtualNodeAttributes>;
    public text: string | null = null;
    public readonly children: Array<VirtualNode<any>>;

    constructor(
        tagName: T,
        attrsOrChildren?: VirtualNodeOptionalArg,
        children?: VirtualNodeChildren
    ) {
        this.tagName = tagName;
        if (typeof attrsOrChildren === "string") {
            if (Array.isArray(children)) {
                throw new TypeError("Can't mix vnodes and text.");
            }
            this.attrs = {};
            this.text = attrsOrChildren;
            this.children = [];
        } else if (Array.isArray(attrsOrChildren)) {
            this.attrs = {};
            this.children = attrsOrChildren;
        } else if (typeof attrsOrChildren === "object") {
            this.attrs = attrsOrChildren;
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
            this.attrs = {};
            this.children = [];
        }
    }

    private setAttrs(el: HTMLElement) {
        if (this.text !== null) {
            el.textContent = this.text;
        }
        for (const [attr, val] of Object.entries(this.attrs)) {
            el.setAttribute(attr, String(val));
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

    public prependTo(parent: Node) {
        parent.insertBefore(this.toDOM(), parent.firstChild);
    }

    public insertAfter(sibling: Node) {
        const parent = VirtualNode.getParent(sibling);
        parent.insertBefore(this.toDOM(), sibling.nextSibling);
    }

    public insertBefore(sibling: Node) {
        const parent = VirtualNode.getParent(sibling);
        parent.insertBefore(this.toDOM(), sibling.nextSibling);
    }
}

export function v<T extends TagName>(
    tagName: T,
    attrsOrChildren?: VirtualNodeOptionalArg,
    children?: VirtualNodeChildren
): VirtualNode<T> {
    return new VirtualNode(tagName, attrsOrChildren, children);
}
