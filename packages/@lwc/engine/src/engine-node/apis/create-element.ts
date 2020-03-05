/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { isNull, isObject, isFunction, toString } from '@lwc/shared';

import { LightningElement } from '../../framework/main';
import { createVM } from '../../framework/vm';

import { renderer, HostElement } from '../renderer';

export function createElement(
    tagName: string,
    options: { is: typeof LightningElement }
): HostElement {
    if (!isObject(options) || isNull(options)) {
        throw new TypeError(
            `"createElement" function expects an object as second parameter but received "${toString(
                options
            )}".`
        );
    }

    const Ctor = options.is;
    if (!isFunction(Ctor)) {
        throw new TypeError(
            `"createElement" function expects a "is" option with a valid component constructor.`
        );
    }

    const elm = renderer.createElement(tagName);

    createVM(elm, Ctor, {
        mode: 'open',
        isRoot: true,
        owner: null,
        renderer,
    });

    return elm;
}
