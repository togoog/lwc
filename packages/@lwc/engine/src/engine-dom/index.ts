/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// Polyfills
import './polyfills/proxy-concat/main';
import './polyfills/aria-properties/main';

// APIs from the core engine
export {
    LightningElement,
    register,
    registerTemplate,
    registerComponent,
    registerDecorators,
    sanitizeAttribute,
    readonly,
    getComponentDef,
    isComponentConstructor,
    getComponentConstructor,
    unwrap,
    setFeatureFlag,
    setFeatureFlagForTest,
} from '../framework/main';

// APIs from the DOM engine
export { createElement } from './apis/create-element';
export { buildCustomElementConstructor } from './apis/build-custom-element-constructor';
export { isNodeFromTemplate } from './apis/is-node-from-template';
