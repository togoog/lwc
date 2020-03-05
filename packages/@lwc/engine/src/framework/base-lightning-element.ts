/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
/**
 * This module is responsible for producing the ComponentDef object that is always
 * accessible via `vm.def`. This is lazily created during the creation of the first
 * instance of a component class, and shared across all instances.
 *
 * This structure can be used to synthetically create proxies, and understand the
 * shape of a component. It is also used internally to apply extra optimizations.
 */
import {
    ArrayReduce,
    assert,
    create,
    defineProperties,
    freeze,
    getOwnPropertyNames,
    isFalse,
    isFunction,
    isNull,
    isObject,
    seal,
} from '@lwc/shared';
import { HTMLElementOriginalDescriptors } from './html-properties';
import { patchLightningElementPrototypeWithRestrictions } from './restrictions';
import {
    ComponentInterface,
    getWrappedComponentsListener,
    getTemplateReactiveObserver,
} from './component';
import { EmptyObject } from './utils';
import { vmBeingConstructed, isBeingConstructed, isInvokingRender } from './invoker';
import { associateVM, getAssociatedVM, VM } from './vm';
import { valueObserved, valueMutated } from '../libs/mutation-tracker';
import { patchComponentWithRestrictions, patchShadowRootWithRestrictions } from './restrictions';
import { unlockAttribute, lockAttribute } from './attributes';
import { Template, isUpdatingTemplate, getVMBeingRendered } from './template';
import { logError } from '../shared/logger';
import { getComponentTag } from '../shared/format';

/**
 * This operation is called with a descriptor of an standard html property
 * that a Custom Element can support (including AOM properties), which
 * determines what kind of capabilities the Base Lightning Element should support. When producing the new descriptors
 * for the Base Lightning Element, it also include the reactivity bit, so the standard property is reactive.
 */
function createBridgeToElementDescriptor(
    propName: string,
    descriptor: PropertyDescriptor
): PropertyDescriptor {
    const { get, set, enumerable, configurable } = descriptor;
    if (!isFunction(get)) {
        if (process.env.NODE_ENV !== 'production') {
            assert.fail(
                `Detected invalid public property descriptor for HTMLElement.prototype.${propName} definition. Missing the standard getter.`
            );
        }
        throw new TypeError();
    }
    if (!isFunction(set)) {
        if (process.env.NODE_ENV !== 'production') {
            assert.fail(
                `Detected invalid public property descriptor for HTMLElement.prototype.${propName} definition. Missing the standard setter.`
            );
        }
        throw new TypeError();
    }
    return {
        enumerable,
        configurable,
        get(this: ComponentInterface) {
            const vm = getAssociatedVM(this);
            if (isBeingConstructed(vm)) {
                if (process.env.NODE_ENV !== 'production') {
                    const name = vm.elm.constructor.name;
                    logError(
                        `\`${name}\` constructor can't read the value of property \`${propName}\` because the owner component hasn't set the value yet. Instead, use the \`${name}\` constructor to set a default value for the property.`,
                        vm
                    );
                }
                return;
            }
            valueObserved(this, propName);
            return get.call(vm.elm);
        },
        set(this: ComponentInterface, newValue: any) {
            const vm = getAssociatedVM(this);
            if (process.env.NODE_ENV !== 'production') {
                const vmBeingRendered = getVMBeingRendered();
                assert.invariant(
                    !isInvokingRender,
                    `${vmBeingRendered}.render() method has side effects on the state of ${vm}.${propName}`
                );
                assert.invariant(
                    !isUpdatingTemplate,
                    `When updating the template of ${vmBeingRendered}, one of the accessors used by the template has side effects on the state of ${vm}.${propName}`
                );
                assert.isFalse(
                    isBeingConstructed(vm),
                    `Failed to construct '${getComponentTag(
                        vm
                    )}': The result must not have attributes.`
                );
                assert.invariant(
                    !isObject(newValue) || isNull(newValue),
                    `Invalid value "${newValue}" for "${propName}" of ${vm}. Value cannot be an object, must be a primitive value.`
                );
            }

            if (newValue !== vm.cmpProps[propName]) {
                vm.cmpProps[propName] = newValue;
                if (isFalse(vm.isDirty)) {
                    // perf optimization to skip this step if not in the DOM
                    valueMutated(this, propName);
                }
            }
            return set.call(vm.elm, newValue);
        },
    };
}

interface ComponentHooks {
    callHook: VM['callHook'];
    setHook: VM['setHook'];
    getHook: VM['getHook'];
}

export interface LightningElementConstructor {
    new (): LightningElement;
    readonly prototype: LightningElement;
}

export declare var LightningElement: LightningElementConstructor;

export interface LightningElement {
    // DOM - The good parts
    dispatchEvent(event: Event): boolean;
    addEventListener(
        type: string,
        listener: EventListener,
        options?: boolean | AddEventListenerOptions
    ): void;
    removeEventListener(
        type: string,
        listener: EventListener,
        options?: boolean | AddEventListenerOptions
    ): void;
    setAttributeNS(ns: string | null, attrName: string, _value: string): void;
    removeAttributeNS(ns: string | null, attrName: string): void;
    removeAttribute(attrName: string): void;
    setAttribute(attrName: string, _value: string): void;
    getAttribute(attrName: string): string | null;
    getAttributeNS(ns: string, attrName: string): string | null;
    getBoundingClientRect(): ClientRect;
    querySelector<E extends Element = Element>(selectors: string): E | null;
    querySelectorAll<E extends Element = Element>(selectors: string): NodeListOf<E>;
    getElementsByTagName(tagNameOrWildCard: string): HTMLCollectionOf<Element>;
    getElementsByClassName(names: string): HTMLCollectionOf<Element>;
    classList: DOMTokenList;
    isConnected: boolean;
    toString(): string;

    // LWC specifics
    template: ShadowRoot;
    render(): Template;

    // Callbacks
    connectedCallback?(): void;
    disconnectedCallback?(): void;
    renderedCallback?(): void;
    errorCallback?(error: any, stack: string): void;

    // Default HTML Properties
    dir: string;
    id: string;
    accessKey: string;
    title: string;
    lang: string;
    hidden: boolean;
    draggable: boolean;
    spellcheck: boolean;
    tabIndex: number;

    // Aria Properties
    ariaAutoComplete: string | null;
    ariaChecked: string | null;
    ariaCurrent: string | null;
    ariaDisabled: string | null;
    ariaExpanded: string | null;
    ariaHasPopup: string | null;
    ariaHidden: string | null;
    ariaInvalid: string | null;
    ariaLabel: string | null;
    ariaLevel: string | null;
    ariaMultiLine: string | null;
    ariaMultiSelectable: string | null;
    ariaOrientation: string | null;
    ariaPressed: string | null;
    ariaReadOnly: string | null;
    ariaRequired: string | null;
    ariaSelected: string | null;
    ariaSort: string | null;
    ariaValueMax: string | null;
    ariaValueMin: string | null;
    ariaValueNow: string | null;
    ariaValueText: string | null;
    ariaLive: string | null;
    ariaRelevant: string | null;
    ariaAtomic: string | null;
    ariaBusy: string | null;
    ariaActiveDescendant: string | null;
    ariaControls: string | null;
    ariaDescribedBy: string | null;
    ariaFlowTo: string | null;
    ariaLabelledBy: string | null;
    ariaOwns: string | null;
    ariaPosInSet: string | null;
    ariaSetSize: string | null;
    ariaColCount: string | null;
    ariaColIndex: string | null;
    ariaDetails: string | null;
    ariaErrorMessage: string | null;
    ariaKeyShortcuts: string | null;
    ariaModal: string | null;
    ariaPlaceholder: string | null;
    ariaRoleDescription: string | null;
    ariaRowCount: string | null;
    ariaRowIndex: string | null;
    ariaRowSpan: string | null;
    ariaColSpan: string | null;
    role: string | null;
}

/**
 * This class is the base class for any LWC element.
 * Some elements directly extends this class, others implement it via inheritance.
 **/
function BaseLightningElementConstructor(this: LightningElement) {
    // This should be as performant as possible, while any initialization should be done lazily
    if (isNull(vmBeingConstructed)) {
        throw new ReferenceError('Illegal constructor');
    }
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(
            vmBeingConstructed.elm instanceof HTMLElement,
            `Component creation requires a DOM element to be associated to ${vmBeingConstructed}.`
        );
    }
    const vm = vmBeingConstructed;
    const {
        elm,
        mode,
        def: { ctor },
        renderer: { attachShadow },
    } = vm;
    const component = this;
    vm.component = component;
    vm.tro = getTemplateReactiveObserver(vm as VM);
    vm.oar = create(null);
    // interaction hooks
    // We are intentionally hiding this argument from the formal API of LWCElement because
    // we don't want folks to know about it just yet.
    if (arguments.length === 1) {
        const { callHook, setHook, getHook } = arguments[0] as ComponentHooks;
        vm.callHook = callHook;
        vm.setHook = setHook;
        vm.getHook = getHook;
    }
    // attaching the shadowRoot
    const cmpRoot = attachShadow(elm, {
        mode,
        delegatesFocus: !!ctor.delegatesFocus,
        '$$lwc-synthetic-mode$$': true,
    });
    // linking elm, shadow root and component with the VM
    associateVM(component, vm as VM);
    associateVM(cmpRoot, vm as VM);
    associateVM(elm, vm as VM);
    // VM is now initialized
    (vm as VM).cmpRoot = cmpRoot;
    if (process.env.NODE_ENV !== 'production') {
        patchComponentWithRestrictions(component);
        patchShadowRootWithRestrictions(cmpRoot, EmptyObject);
    }
    return this as LightningElement;
}

// HTML Element - The Good Parts
BaseLightningElementConstructor.prototype = {
    constructor: BaseLightningElementConstructor,

    dispatchEvent(event: Event): boolean {
        const {
            elm,
            renderer: { dispatchEvent },
        } = getAssociatedVM(this);
        return dispatchEvent(elm, event);
    },

    addEventListener(type: string, listener: EventListener) {
        const vm = getAssociatedVM(this);
        const {
            elm,
            renderer: { addEventListener },
        } = vm;

        if (process.env.NODE_ENV !== 'production') {
            const vmBeingRendered = getVMBeingRendered();
            assert.invariant(
                !isInvokingRender,
                `${vmBeingRendered}.render() method has side effects on the state of ${vm} by adding an event listener for "${type}".`
            );
            assert.invariant(
                !isUpdatingTemplate,
                `Updating the template of ${vmBeingRendered} has side effects on the state of ${vm} by adding an event listener for "${type}".`
            );
            assert.invariant(
                isFunction(listener),
                `Invalid second argument for this.addEventListener() in ${vm} for event "${type}". Expected an EventListener but received ${listener}.`
            );
        }

        const wrappedListener = getWrappedComponentsListener(vm, listener);
        addEventListener(elm, type, wrappedListener);
    },

    removeEventListener(type: string, listener: EventListener) {
        const vm = getAssociatedVM(this);
        const {
            elm,
            renderer: { removeEventListener },
        } = vm;

        const wrappedListener = getWrappedComponentsListener(vm, listener);
        removeEventListener(elm, type, wrappedListener);
    },

    setAttributeNS(namespace: string, name: string, value: string) {
        const {
            elm,
            renderer: { setAttribute },
        } = getAssociatedVM(this);

        if (process.env.NODE_ENV !== 'production') {
            const vm = getAssociatedVM(this);
            assert.isFalse(
                isBeingConstructed(vm),
                `Failed to construct '${getComponentTag(vm)}': The result must not have attributes.`
            );
        }

        unlockAttribute(elm, name);
        setAttribute(elm, name, value, namespace);
        lockAttribute(elm, name);
    },

    removeAttributeNS(namespace: string, name: string) {
        const {
            elm,
            renderer: { removeAttribute },
        } = getAssociatedVM(this);

        unlockAttribute(elm, name);
        removeAttribute(elm, name, namespace);
        lockAttribute(elm, name);
    },

    removeAttribute(name: string) {
        const {
            elm,
            renderer: { removeAttribute },
        } = getAssociatedVM(this);

        unlockAttribute(elm, name);
        removeAttribute(elm, name);
        lockAttribute(elm, name);
    },

    setAttribute(name: string, value: string) {
        const {
            elm,
            renderer: { setAttribute },
        } = getAssociatedVM(this);

        if (process.env.NODE_ENV !== 'production') {
            const vm = getAssociatedVM(this);
            assert.isFalse(
                isBeingConstructed(vm),
                `Failed to construct '${getComponentTag(vm)}': The result must not have attributes.`
            );
        }

        unlockAttribute(elm, name);
        setAttribute(elm, name, value);
        lockAttribute(elm, name);
    },

    getAttribute(name: string): string | null {
        const {
            elm,
            renderer: { getAttribute },
        } = getAssociatedVM(this);

        unlockAttribute(elm, name);
        const value = getAttribute(elm, name);
        lockAttribute(elm, name);

        return value;
    },

    getAttributeNS(namespace: string, name: string): string | null {
        const {
            elm,
            renderer: { getAttribute },
        } = getAssociatedVM(this);

        unlockAttribute(elm, name);
        const value = getAttribute(elm, name, namespace);
        lockAttribute(elm, name);

        return value;
    },

    getBoundingClientRect(): ClientRect {
        const {
            elm,
            renderer: { getBoundingClientRect },
        } = getAssociatedVM(this);

        if (process.env.NODE_ENV !== 'production') {
            const vm = getAssociatedVM(this);
            assert.isFalse(
                isBeingConstructed(vm),
                `this.getBoundingClientRect() should not be called during the construction of the custom element for ${getComponentTag(
                    vm
                )} because the element is not yet in the DOM, instead, you can use it in one of the available life-cycle hooks.`
            );
        }

        return getBoundingClientRect(elm);
    },

    querySelector(selectors: string): Element | null {
        const {
            elm,
            renderer: { querySelector },
        } = getAssociatedVM(this);

        if (process.env.NODE_ENV !== 'production') {
            const vm = getAssociatedVM(this);
            assert.isFalse(
                isBeingConstructed(vm),
                `this.querySelector() cannot be called during the construction of the custom element for ${getComponentTag(
                    vm
                )} because no children has been added to this element yet.`
            );
        }

        return querySelector(elm, selectors);
    },

    querySelectorAll(selectors: string): NodeList {
        const {
            elm,
            renderer: { querySelectorAll },
        } = getAssociatedVM(this);

        if (process.env.NODE_ENV !== 'production') {
            const vm = getAssociatedVM(this);
            assert.isFalse(
                isBeingConstructed(vm),
                `this.querySelectorAll() cannot be called during the construction of the custom element for ${getComponentTag(
                    vm
                )} because no children has been added to this element yet.`
            );
        }

        return querySelectorAll(elm, selectors);
    },

    getElementsByTagName(tagNameOrWildCard: string): HTMLCollection {
        const {
            elm,
            renderer: { getElementsByTagName },
        } = getAssociatedVM(this);

        if (process.env.NODE_ENV !== 'production') {
            const vm = getAssociatedVM(this);
            assert.isFalse(
                isBeingConstructed(vm),
                `this.getElementsByTagName() cannot be called during the construction of the custom element for ${getComponentTag(
                    vm
                )} because no children has been added to this element yet.`
            );
        }

        return getElementsByTagName(elm, tagNameOrWildCard);
    },

    getElementsByClassName(names: string): HTMLCollection {
        const {
            elm,
            renderer: { getElementsByClassName },
        } = getAssociatedVM(this);

        if (process.env.NODE_ENV !== 'production') {
            const vm = getAssociatedVM(this);
            assert.isFalse(
                isBeingConstructed(vm),
                `this.getElementsByClassName() cannot be called during the construction of the custom element for ${getComponentTag(
                    vm
                )} because no children has been added to this element yet.`
            );
        }

        return getElementsByClassName(elm, names);
    },

    get isConnected(): boolean {
        const {
            elm,
            renderer: { isConnected },
        } = getAssociatedVM(this);
        return isConnected(elm);
    },

    get classList(): DOMTokenList {
        const {
            elm,
            renderer: { getClassList },
        } = getAssociatedVM(this);

        if (process.env.NODE_ENV !== 'production') {
            const vm = getAssociatedVM(this);
            // TODO [#1290]: this still fails in dev but works in production, eventually, we should just throw in all modes
            assert.isFalse(
                isBeingConstructed(vm),
                `Failed to construct ${vm}: The result must not have attributes. Adding or tampering with classname in constructor is not allowed in a web component, use connectedCallback() instead.`
            );
        }

        return getClassList(elm);
    },

    get template(): ShadowRoot {
        const vm = getAssociatedVM(this);
        return vm.cmpRoot;
    },

    get shadowRoot(): ShadowRoot | null {
        // From within the component instance, the shadowRoot is always
        // reported as "closed". Authors should rely on this.template instead.
        return null;
    },

    render(): Template {
        const vm = getAssociatedVM(this);
        return vm.def.template;
    },

    toString(): string {
        const vm = getAssociatedVM(this);
        return `[object ${vm.def.name}]`;
    },
};

// Typescript is inferring the wrong function type for this particular
// overloaded method: https://github.com/Microsoft/TypeScript/issues/27972
// @ts-ignore type-mismatch
const baseDescriptors: PropertyDescriptorMap = ArrayReduce.call(
    getOwnPropertyNames(HTMLElementOriginalDescriptors),
    (descriptors: PropertyDescriptorMap, propName: string) => {
        descriptors[propName] = createBridgeToElementDescriptor(
            propName,
            HTMLElementOriginalDescriptors[propName]
        );
        return descriptors;
    },
    create(null)
);

defineProperties(BaseLightningElementConstructor.prototype, baseDescriptors);

if (process.env.NODE_ENV !== 'production') {
    patchLightningElementPrototypeWithRestrictions(BaseLightningElementConstructor.prototype);
}

freeze(BaseLightningElementConstructor);
seal(BaseLightningElementConstructor.prototype);

// @ts-ignore
export const BaseLightningElement: LightningElementConstructor = BaseLightningElementConstructor as unknown;
