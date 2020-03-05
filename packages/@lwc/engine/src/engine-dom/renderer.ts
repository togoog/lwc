import { insertBefore, removeChild, createElement, createTextNode } from './dom';

import { Renderer } from '../framework/vm';

const doc = document;

export const renderer: Renderer<Node, HTMLElement> = {
    insert(node: Node, parent: Node, anchor: Node | null): void {
        insertBefore.call(parent, node, anchor);
    },
    remove(node: Node, parent: Node): void {
        removeChild.call(parent, node);
    },
    createElement(tagName: string): HTMLElement {
        return createElement.call(doc, tagName);
    },
    createText(content: string): Text {
        return createTextNode.call(doc, content);
    },
};
