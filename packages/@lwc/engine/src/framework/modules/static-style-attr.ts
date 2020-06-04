/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined } from '@lwc/shared';

import { VNode, Module } from '../../3rdparty/snabbdom/types';
import { RendererInterface } from '../renderer';

// The HTML style property becomes the vnode.data.styleMap object when defined as a string in the template.
// The compiler takes care of transforming the inline style into an object. It's faster to set the
// different style properties individually instead of via a string.
function createStyleAttributeModule<I extends RendererInterface>(vnode: VNode<I>) {
    const {
        elm,
        data: { styleMap },
        owner: { renderer },
    } = vnode;

    if (isUndefined(styleMap)) {
        return;
    }

    const style = renderer.getStyleDeclaration(elm);
    for (const name in styleMap) {
        (style as any)[name] = styleMap[name];
    }
}

const styleModule: Module<unknown> = {
    create: createStyleAttributeModule,
};

export default styleModule;
