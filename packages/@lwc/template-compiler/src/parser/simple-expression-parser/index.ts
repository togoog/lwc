import { ASTExpression, ASTIdentifier } from './types';

const WHITESPACE = new Set([' ', "\t", "\r", "\n"]);

interface ExpressionParser {
    position: number;
    peek(): string;
    match(expected: string): boolean;
    eat(expected?: string): string;
}

function isValidIdentifierStart(char: string): boolean {
    return (
        (char >= 'A' && char <= 'Z') || (char >= 'a' && char <= 'z') || char === '$' || char === '_'
    );
}

function isValidIdentifier(char: string): boolean {
    return isValidIdentifierStart(char) || (char >= '0' && char <= '9');
}

function createParser(str: string, offset: number = 0): ExpressionParser {
    return {
        position: offset,
        peek() {
            if (this.position > str.length) {
                throw new Error('Unexpected end of expression');
            }

            return str.charAt(this.position);
        },
        match(expected: string) {
            return this.peek() === expected;
        },
        eat(expected?: string): string {
            const actual = this.peek();
            if (expected && actual !== expected) {
                throw new Error(`Expected "${expected}" but found "${actual}"`);
            }

            this.position++;
            return actual;
        },
    };
}

function processIdentifier(parser: ExpressionParser): ASTIdentifier {
    let buffer = '';

    if (WHITESPACE.has(parser.peek())) {
        processWhiteSpaces(parser);
    }

    while (isValidIdentifier(parser.peek())) {
        buffer += parser.eat();
    }

    return {
        type: 'Identifier',
        name: buffer,
    };
}

function processWhiteSpaces(parser: ExpressionParser) {
    while (WHITESPACE.has(parser.peek())) {
        parser.eat();
    }
}

function processLeadingParenthesis(parser: ExpressionParser): number {
    let lookAhead;
    let processing = true;
    let numberOfOpenParenthesis = 0;

    do {
        lookAhead = parser.peek();

        if (WHITESPACE.has(lookAhead)) {
            processWhiteSpaces(parser);
        } else if (lookAhead === '(') {
            parser.eat();
            numberOfOpenParenthesis++;
        } else if (lookAhead === ')') {
            throw new Error(`Unexpected "${lookAhead}" character found at position ${parser.position}.`);
        } else {
            processing = false;
        }
    } while (processing);

    return numberOfOpenParenthesis;
}

function processExpression(parser: ExpressionParser): ASTExpression {
    let processing = true;
    let leadingParenthesisInExpression;

    parser.eat('{');

    leadingParenthesisInExpression = processLeadingParenthesis(parser);

    let expression: ASTExpression = processIdentifier(parser);

    while (processing) {
        const lookAhead = parser.peek();

        if (lookAhead === '.') {
            parser.eat();
            expression = {
                type: 'MemberExpression',
                object: expression,
                property: processIdentifier(parser),
            };
        } else if (WHITESPACE.has(lookAhead)) {
            processWhiteSpaces(parser);
        } else if (lookAhead === ')' && leadingParenthesisInExpression > 0) {
            parser.eat();
            leadingParenthesisInExpression--;
        } else if (lookAhead === ';') {
            // @todo
            // this is an special case... if there's no other expression, to the right of ";" this is correct
            // otherwise we are in presence of multiple expressions, which is invalid.
            throw new Error(`Unexpected "${lookAhead}" character found at position ${parser.position}.`);
        } else if (lookAhead === '}') {
            parser.eat('}');
            processing = false;
        } else {
            throw new Error(`Unexpected "${lookAhead}" character found at position ${parser.position}.`);
        }
    }

    return expression;
}

export function parseExpression(str: string): ASTExpression {
    const parser = createParser(str);
    const expression = processExpression(parser);

    if (parser.position !== str.length) {
        throw new Error('Unexpected end of expression');
    }

    return expression;
}

export function parseExpressionAt(
    str: string,
    offset: number
): { expression: ASTExpression; offset: number } {
    const parser = createParser(str, offset);
    const expression = processExpression(parser);

    return {
        expression,
        offset: parser.position,
    };
}

export function parseIdentifer(str: string): ASTIdentifier {
    const parser = createParser(str);
    const identifier = processIdentifier(parser);

    if (parser.position !== str.length) {
        throw new Error('Unexpected identifier');
    }

    return identifier;
}
