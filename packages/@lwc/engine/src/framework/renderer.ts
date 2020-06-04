/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

export type Opaque<T extends string> = {
    readonly __opaque__: T;
};

export interface RendererInterface {
    Node: Opaque<'Node'>;
    Element: Opaque<'Element'>;
    HTMLElement: Opaque<'HTMLElement'>;
    ShadowRoot: Opaque<'ShadowRoot'>;

    Event: Opaque<'Event'>;
    AddEventListenerOptions: Opaque<'AddEventListenerOptions'>;

    DOMTokenList: Opaque<'DOMTokenList'>;
    NodeList: Opaque<'NodeList'>;
    HTMLCollection: Opaque<'HTMLCollection'>;

    ClientRect: Opaque<'ClientRect'>;
    CSSStyleDeclaration: Opaque<'CSSStyleDeclaration'>;
}

export interface Renderer<I extends RendererInterface> {
    syntheticShadow: boolean;
    insert(node: I['Node'], parent: I['Node'], anchor: I['Node'] | null): void;
    remove(node: I['Node'], parent: I['Node']): void;
    createElement(tagName: string, namespace?: string): I['Element'];
    createText(content: string): I['Node'];
    nextSibling(node: I['Node']): I['Node'] | null;
    attachShadow(
        element: I['Element'],
        options: { mode: 'open' | 'closed'; delegatesFocus?: boolean; [key: string]: any }
    ): I['Node'];
    setText(node: I['Node'], content: string): void;
    getAttribute(element: I['Element'], name: string, namespace?: string | null): string | null;
    setAttribute(
        element: I['Element'],
        name: string,
        value: string,
        namespace?: string | null
    ): void;
    removeAttribute(element: I['Element'], name: string, namespace?: string | null): void;
    addEventListener(
        target: I['Element'],
        type: string,
        callback: (event: I['Element']) => any,
        options?: I['AddEventListenerOptions'] | boolean
    ): void;
    removeEventListener(
        target: I['Element'],
        type: string,
        callback: (event: I['Event']) => any,
        options?: I['AddEventListenerOptions'] | boolean
    ): void;
    dispatchEvent(target: I['Node'], event: I['Event']): boolean;
    getClassList(element: I['Element']): I['DOMTokenList'];
    getStyleDeclaration(element: I['Element']): I['CSSStyleDeclaration'];
    getBoundingClientRect(element: I['Element']): I['ClientRect'];
    querySelector(element: I['Element'], selectors: string): I['Element'] | null;
    querySelectorAll(element: I['Element'], selectors: string): I['NodeList'];
    getElementsByTagName(element: I['Element'], tagNameOrWildCard: string): I['HTMLCollection'];
    getElementsByClassName(element: I['Element'], names: string): I['HTMLCollection'];
    isConnected(node: I['Node']): boolean;
    tagName(element: I['Element']): string;
}
