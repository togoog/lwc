/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import * as types from '@babel/types';
import * as esutils from 'esutils';
import { ParserDiagnostics, generateCompilerError } from '@lwc/errors';
import { TemplateExpression, TemplateIdentifier, IRNode, IRElement } from '../shared/types';
import { parseComplexExpression } from './complex-expression-parser';
import { parseExpression as parseSimpleExpression } from './simple-expression-parser';
import State from "../state";

export const EXPRESSION_SYMBOL_START = '{';
export const EXPRESSION_SYMBOL_END = '}';

const VALID_EXPRESSION_RE = /^{.+}$/;
const POTENTIAL_EXPRESSION_RE = /^.?{.+}.*$/;

export function isExpression(source: string): boolean {
    return !!source.match(VALID_EXPRESSION_RE);
}

export function isPotentialExpression(source: string): boolean {
    return !!source.match(POTENTIAL_EXPRESSION_RE);
}

export function parseExpression(source: string, element: IRNode, state: State): TemplateExpression {
    if (!state.config.experimentalComputedMemberExpression) {
        try {
            const expr = parseSimpleExpression(source) as TemplateExpression;
            return expr;
        } catch (e) {
            // The error may be hard to read, lets swallow this exception and use the complex parser for better errors
            // @todo: Improve some errors from the simple expression parser
            e.message = 'ahahhaa';
            throw e;
        }
    }

    return parseComplexExpression(source, element, state);
}

export function parseIdentifier(source: string): TemplateIdentifier | never {
    if (esutils.keyword.isIdentifierES6(source)) {
        return types.identifier(source);
    } else {
        throw generateCompilerError(ParserDiagnostics.INVALID_IDENTIFIER, {
            messageArgs: [source],
        });
    }
}

// Returns the immediate iterator parent if it exists.
// Traverses up until it finds an element with forOf, or
// a non-template element without a forOf.
export function getForOfParent(element: IRElement): IRElement | null {
    const parent = element.parent;
    if (!parent) {
        return null;
    }

    if (parent.forOf) {
        return parent;
    } else if (parent.tag.toLowerCase() === 'template') {
        return getForOfParent(parent);
    }
    return null;
}

export function getForEachParent(element: IRElement): IRElement | null {
    if (element.forEach) {
        return element;
    }

    const parent = element.parent;
    if (parent && parent.tag.toLowerCase() === 'template') {
        return getForEachParent(parent);
    }

    return null;
}

export function isIteratorElement(element: IRElement): boolean {
    return !!(getForOfParent(element) || getForEachParent(element));
}
