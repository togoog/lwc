import { parseExpression } from '../index';

const validExpressions = [
    '{foo}',
    '{(foo)}',
    '{foo.bar}',
    '{(foo).bar}',
    '{((foo)).bar}',
    '{((foo).bar)}',
    '{   (  ( foo). bar)}',
    `{   (  ( foo).
    bar)}`,
    '{foo.this.class}',
    '{foo;}',
    '{( foo ) ;    }',
];

const invalidExpressions = ['{this}', '{for}', '{switch}', '{foo()}'];

describe('parsing', () => {
    validExpressions.forEach((expr) => {
        it('valid expressions', () => {
            const ast = parseExpression(expr, undefined as any);
            expect(ast).not.toBeNull();
        });
    });

    invalidExpressions.forEach((expr) => {
        it('invalid expressions', () => {
            expect(() => {
                parseExpression(expr, undefined as any);
            }).toThrow();
        });
    });
});
