/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    assert,
    assign,
    isUndefined,
    HiddenField,
    createHiddenField,
    getHiddenField,
    setHiddenField,
} from '@lwc/shared';
import { appendChild, insertBefore, removeChild, replaceChild } from './dom';

type NodeReactionCallback = () => void;

const ConnectingSlot = createHiddenField<NodeReactionCallback>('connecting', 'engine');
const DisconnectingSlot = createHiddenField<NodeReactionCallback>('disconnecting', 'engine');

function callNodeSlot(node: Node, slot: HiddenField<NodeReactionCallback>): Node {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(node, `callNodeSlot() should not be called for a non-object`);
    }

    const fn = getHiddenField(node, slot);

    if (!isUndefined(fn)) {
        fn();
    }

    return node;
}

// monkey patching Node methods to be able to detect the insertions and removal of root elements
// created via createElement.
assign(Node.prototype, {
    appendChild(newChild: Node): Node {
        const appendedNode = appendChild.call(this, newChild);
        return callNodeSlot(appendedNode, ConnectingSlot);
    },
    insertBefore(newChild: Node, referenceNode: Node): Node {
        const insertedNode = insertBefore.call(this, newChild, referenceNode);
        return callNodeSlot(insertedNode, ConnectingSlot);
    },
    removeChild(oldChild: Node): Node {
        const removedNode = removeChild.call(this, oldChild);
        return callNodeSlot(removedNode, DisconnectingSlot);
    },
    replaceChild(newChild: Node, oldChild: Node): Node {
        const replacedNode = replaceChild.call(this, newChild, oldChild);
        callNodeSlot(replacedNode, DisconnectingSlot);
        callNodeSlot(newChild, ConnectingSlot);
        return replacedNode;
    },
});

export function nodeConnected(node: Node, callback: NodeReactionCallback): void {
    setHiddenField(node, ConnectingSlot, callback);
}

export function nodeDisconnected(node: Node, callback: NodeReactionCallback): void {
    setHiddenField(node, DisconnectingSlot, callback);
}
