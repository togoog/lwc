/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
/**
 @license
 Copyright (c) 2015 Simon Friis Vindum.
 This code may only be used under the MIT License found at
 https://github.com/snabbdom/snabbdom/blob/master/LICENSE
 Code distributed by Snabbdom as part of the Snabbdom project at
 https://github.com/snabbdom/snabbdom/
 */

import { VM } from '../../framework/vm';
import { RendererInterface } from '../../framework/renderer';

export type VNodeStyle = Record<string, string>;
export interface On {
    [event: string]: EventListener;
}
export type Attrs = Record<string, string | number | boolean>;
export type Classes = Record<string, boolean>;
export type Props = Record<string, any>;

export type Key = string | number;

export type VNodes<I extends RendererInterface> = Array<VNode<I> | null>;

export interface VNode<I extends RendererInterface> {
    sel: string | undefined;
    data: VNodeData;
    children: VNodes<I> | undefined;
    elm: I['Node'] | undefined;
    parentElm?: I['Element'];
    text: string | undefined;
    key: Key | undefined;
    hook: Hooks<I>;
    owner: VM<I>;
}

export interface VElement<I extends RendererInterface> extends VNode<I> {
    sel: string;
    children: VNodes<I>;
    elm: I['Element'] | undefined;
    text: undefined;
    key: Key;
    // TODO [#1364]: support the ability to provision a cloned StyleElement
    // for native shadow as a perf optimization
    clonedElement?: HTMLStyleElement;
}

export interface VCustomElement<I extends RendererInterface> extends VElement<I> {
    mode: 'closed' | 'open';
    ctor: any;
    clonedElement?: I['Element'];
    // copy of the last allocated children.
    aChildren?: VNodes<I>;
}

export interface VText<I extends RendererInterface> extends VNode<I> {
    sel: undefined;
    children: undefined;
    elm: I['Node'] | undefined;
    text: string;
    key: undefined;
}

export type CustomElementContext = Record<string, Record<string, any>>;

export interface VNodeData {
    props?: Props;
    attrs?: Attrs;
    className?: any;
    style?: any;
    classMap?: Classes;
    styleMap?: VNodeStyle;
    context?: CustomElementContext;
    on?: On;
    ns?: string; // for SVGs
}

export interface Hooks<I extends RendererInterface> {
    create: (vNode: VNode<I>) => void;
    insert: (vNode: VNode<I>, parentNode: I['Node'], referenceNode: I['Node'] | null) => void;
    move: (vNode: VNode<I>, parentNode: I['Node'], referenceNode: I['Node'] | null) => void;
    update: (oldVNode: VNode<I>, vNode: VNode<I>) => void;
    remove: (vNode: VNode<I>, parentNode: I['Node']) => void;
}

export interface Module<I extends RendererInterface> {
    create?: (vNode: VNode<I>) => void;
    update?: (oldVNode: VNode<I>, vNode: VNode<I>) => void;
}
