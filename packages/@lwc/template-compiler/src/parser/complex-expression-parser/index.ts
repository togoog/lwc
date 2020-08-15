import traverse from '@babel/traverse';
import * as types from '@babel/types';
import * as babylon from '@babel/parser';
import State from '../../state';
import { isBoundToIterator } from '../../shared/ir';
import { ParserDiagnostics, invariant } from '@lwc/errors';
import { TemplateExpression, TemplateIdentifier, IRNode } from '../../shared/types';

const ITERATOR_NEXT_KEY = 'next';

// FIXME: Avoid throwing errors and return it properly
export function parseComplexExpression(source: string, element: IRNode, state: State): TemplateExpression {
    try {
        const parsed = babylon.parse(source);

        let expression: any;

        traverse(parsed, {
            enter(path) {
                const isValidNode =
                    path.isProgram() ||
                    path.isBlockStatement() ||
                    path.isExpressionStatement() ||
                    path.isIdentifier() ||
                    path.isMemberExpression();
                invariant(isValidNode, ParserDiagnostics.INVALID_NODE, [path.type]);

                // Ensure expression doesn't contain multiple expressions: {foo;bar}
                const hasMultipleExpressions =
                    path.isBlock() && (path.get('body') as any).length !== 1;
                invariant(!hasMultipleExpressions, ParserDiagnostics.MULTIPLE_EXPRESSIONS);

                // Retrieve the first expression and set it as return value
                if (path.isExpressionStatement() && !expression) {
                    expression = (path.node as types.ExpressionStatement).expression;
                }
            },

            MemberExpression: {
                exit(path) {
                    const shouldReportComputed =
                        !state.config.experimentalComputedMemberExpression &&
                        (path.node as types.MemberExpression).computed;
                    invariant(
                        !shouldReportComputed,
                        ParserDiagnostics.COMPUTED_PROPERTY_ACCESS_NOT_ALLOWED
                    );

                    const memberExpression = path.node as types.MemberExpression;
                    const propertyIdentifier = memberExpression.property as TemplateIdentifier;
                    const objectIdentifier = memberExpression.object as TemplateIdentifier;
                    invariant(
                        !isBoundToIterator(objectIdentifier, element) ||
                        propertyIdentifier.name !== ITERATOR_NEXT_KEY,
                        ParserDiagnostics.MODIFYING_ITERATORS_NOT_ALLOWED
                    );
                },
            },
        });

        return expression;
    } catch (err) {
        err.message = `Invalid expression ${source} - ${err.message}`;
        throw err;
    }
}