import { invariant, ParserDiagnostics } from '@lwc/errors';
import { ASTExpression } from './types';
import { IRNode, TemplateIdentifier } from '../../shared/types';
import { isBoundToIterator } from '../../shared/ir';

const ITERATOR_NEXT_KEY = 'next';
const RESERVED_WORDS = [
    'break',
    'case',
    'catch',
    'class',
    'const',
    'continue',
    'debugger',
    'default',
    'delete',
    'do',
    'else',
    'export',
    'extends',
    'finally',
    'for',
    'function',
    'if',
    'import',
    'in',
    'instanceof',
    'new',
    'return',
    'super',
    'switch',
    'this',
    'throw',
    'try',
    'typeof',
    'var',
    'void',
    'while',
    'with',
    'yield',
];

function validateLeadingIdentifier(identifier: string) {
    invariant(identifier !== 'this', ParserDiagnostics.INVALID_NODE, ['ThisExpression']);

    invariant(
        RESERVED_WORDS.indexOf(identifier) === -1,
        ParserDiagnostics.TEMPLATE_EXPRESSION_PARSING_ERROR,
        [`Invalid identifier "${identifier}"`]
    );
}

export function validateParsedExpression(expression: ASTExpression, element: IRNode) {
    let expr = expression;

    while (expr.type === 'MemberExpression') {
        // @todo: isBoundToIterator validation have some room for optimizations, ex: no need to get the iterator name multiple times.
        invariant(
            !isBoundToIterator(expr.object as TemplateIdentifier, element) ||
                expr.property.name !== ITERATOR_NEXT_KEY,
            ParserDiagnostics.MODIFYING_ITERATORS_NOT_ALLOWED
        );

        expr = expr.object;
    }

    validateLeadingIdentifier(expr.name);
}
