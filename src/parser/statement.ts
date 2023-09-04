import { Expression, parseExpression } from "./expression";
import {
    extractIdentifierUntil,
    extractOneOfToken,
    extractToken,
    extractWhile1,
    extractWhitespace,
    extractWhitespace1,
} from "./extractors";

export type ExpressionStatement = {
    type: "expression";
    value: Expression;
};
export type VariableDefinitionStatement = {
    type: "variableDefinition";
    identifier: string;
    value: Expression;
};

export type Statement = ExpressionStatement | VariableDefinitionStatement;

export function parseStatement(input: string): [Statement | null, string] {
    let statement: Statement | null = null;

    var [_ws, rest] = extractWhitespace(input);

    var [variableDef, rest] = parseVariableDefinitionStatement(rest);
    if (variableDef !== null) {
        statement = variableDef;
    }

    if (!statement) {
        var [exp, rest] = parseExpression(input);
        if (exp !== null) {
            statement = { type: "expression", value: exp };
        }
    }

    var [_ws, rest] = extractWhitespace(rest);
    var [terminator, rest] = extractToken(rest, "!");
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
    var [kw, rest] = extractOneOfToken(input, ["der", "die", "das"]);
    if (kw === null) {
        return [null, rest];
    }
    var [ws, rest] = extractWhitespace1(rest);
    if (ws === null) {
        return [null, rest];
    }

    var [identifier, rest] = extractIdentifierUntil(rest, " ist");
    if (identifier === null) {
        return [null, input];
    }

    var [ws, rest] = extractWhitespace1(rest);
    if (ws === null) {
        return [null, input];
    }

    var [exp, rest] = parseExpression(rest);
    if (exp === null) {
        return [null, input];
    }

    return [
        {
            type: "variableDefinition",
            identifier,
            value: exp,
        },
        rest,
    ];
}
