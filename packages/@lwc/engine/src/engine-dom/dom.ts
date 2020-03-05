/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { appendChild, insertBefore, replaceChild, removeChild } = Node.prototype;
const { createElement, createTextNode } = document;

export {
    // Node.prototype
    appendChild,
    insertBefore,
    replaceChild,
    removeChild,
    // document
    createElement,
    createTextNode,
};
