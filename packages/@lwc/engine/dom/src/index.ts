/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// Re-exporting all the @lwc/engine-core APIs until the module decoupling is done.
export {
    createContextProvider,
    register,
    api,
    track,
    wire,
    readonly,
    unwrap,
    buildCustomElementConstructor,
    setFeatureFlag,
    setFeatureFlagForTest,
    registerTemplate,
    registerComponent,
    registerDecorators,
    sanitizeAttribute,
    getComponentDef,
    isComponentConstructor,
} from '../../src';

// Polyfills ---------------------------------------------------------------------------------------
import './polyfills/proxy-concat/main';
import './polyfills/aria-properties/main';

// Public APIs -------------------------------------------------------------------------------------
export { createElement } from './apis/create-element';
export { getComponentConstructor } from './apis/get-component-constructor';
export { isNodeFromTemplate } from './apis/is-node-from-template';
export { BaseLightningElement as LightningElement } from './apis/lightning-element';