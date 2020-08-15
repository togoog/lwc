import {parseExpression} from '../index';

describe('parsing', () => {
    it('simple parsing', () => {
        const ast = parseExpression('{hello.foo}');
        expect(ast).not.toBeNull();
    });
});