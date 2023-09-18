import { Expression, parseExpression } from "./expression";
import {
    extractOneOfToken,
    extractToken,
    extractWhitespace,
    extractWhitespace1,
    extractIdentifierUntil,
    extractList,
    extractSequence,
    extractEither,
    extractMultipleUntil,
} from "./extractors";
import * as node from "../node";

export type ExpressionStatement = {
    type: "expression";
    value: Expression;
};
export type VariableDefinitionStatement = {
    type: "variableDefinition";
    identifier: string;
    value: Expression;
};
export type FunctionDefinitionStatement = {
    type: "functionDefinition";
    identifier: string;
    parameters: string[];
    body: Statement[];
};
export type ReturnStatement = {
    type: "return";
    value: Expression;
};
export type PrintStatement = {
    type: "print";
    values: Expression[];
};
export type ConditionStatement = {
    type: "condition";
    if: Conditional;
    elseIfs: Conditional[];
    else: Statement[] | null;
};

export type Conditional = {
    condition: Expression;
    body: Statement[];
};

export type Statement =
    | ExpressionStatement
    | VariableDefinitionStatement
    | FunctionDefinitionStatement
    | ReturnStatement
    | PrintStatement
    | ConditionStatement;

export function parseStatement(input: string): [Statement | null, string] {
    const wsExtractor = extractWhitespace();

    let statement: Statement | null = null;

    var [_ws, rest] = wsExtractor(input);

    var [exp, rest] = parseExpression(rest);
    if (exp !== null) {
        statement = node.exprStatement(exp);
    }

    if (!statement) {
        var [variableDef, rest] = parseVariableDefinitionStatement(rest);
        if (variableDef !== null) {
            statement = variableDef;
        }
    }

    if (!statement) {
        var [funcDef, rest] = parseFunctionDefinitionStatement(rest);
        if (funcDef !== null) {
            statement = funcDef;
        }
    }

    if (!statement) {
        var [returnStatement, rest] = parseReturnStatement(rest);
        if (returnStatement !== null) {
            statement = returnStatement;
        }
    }

    if (!statement) {
        var [print, rest] = parsePrintStatement(rest);
        if (print !== null) {
            statement = print;
        }
    }

    var [_ws, rest] = wsExtractor(rest);
    var [terminator, rest] = extractToken("!")(rest);
    if (terminator === null) {
        return [null, input];
    }

    if (statement) {
        return [statement, rest];
    }

    return [null, input];
}

function parseVariableDefinitionStatement(
    input: string,
): [VariableDefinitionStatement | null, string] {
    return extractSequence(
        [
            extractOneOfToken(["der", "die", "das"]),
            extractWhitespace1(),
            extractIdentifierUntil(" ist"),
            extractWhitespace1(),
            parseExpression,
        ] as const,
        ([_1, _2, ident, _3, value]): VariableDefinitionStatement =>
            node.variableDef(ident, value),
    )(input);
}

function parseFunctionDefinitionStatement(
    input: string,
): [FunctionDefinitionStatement | null, string] {
    return extractSequence(
        [
            extractToken("die"),
            extractWhitespace1(),
            extractToken("Funktion"),
            extractWhitespace1(),
            extractEither(
                extractSequence(
                    [
                        extractIdentifierUntil(" kriegt "),
                        extractList(" und macht"),
                    ] as const,
                    ([identifier, parameters]) => ({ identifier, parameters }),
                ),
                extractSequence(
                    [extractIdentifierUntil(" macht")] as const,
                    ([identifier]) => ({
                        identifier,
                        parameters: [],
                    }),
                ),
                (x) => x,
            ),
            extractMultipleUntil(
                parseStatement,
                "und endet hier",
                (body) => body,
            ),
        ] as const,
        ([_1, _2, _3, _4, { identifier, parameters }, body]) =>
            node.functionDef(identifier, parameters, body),
    )(input);
}

function parseReturnStatement(input: string): [ReturnStatement | null, string] {
    return extractSequence(
        [
            extractToken("gib"),
            extractWhitespace1(),
            parseExpression,
            extractWhitespace1(),
            extractToken("zurück"),
        ] as const,
        ([_1, _2, value, _3, _4]) => node.returnKeyword(value),
    )(input);
}

function parsePrintStatement(input: string): [PrintStatement | null, string] {
    return extractSequence([
        extractToken("zeig"),
        extractWhitespace1(),
        extractList(" an"),
    ] as const, ([_1, _2, values]) => {
        const expressions: Expression[] = [];
        for (const value of values) {
            const [expr, rest] = parseExpression(value);
            if (expr === null || rest.trim().length > 0) {
                return null;
            }
            expressions.push(expr);
        }
        return node.printKeyword(expressions);
    })(input);
}
