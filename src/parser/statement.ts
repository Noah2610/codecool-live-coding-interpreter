import { Expression, parseExpression } from "./expression";
import {
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

    let identifier = "";
    ws = "";

    while (true) {
        var [word, rest] = extractWhile1(rest, (chr) => chr.trim().length > 0);
        if (word === null) {
            return [null, input];
        }

        if (word === "ist") {
            break;
        }

        if (ws.length > 0) {
            identifier += " ";
        }
        identifier += word;

        var [ws, rest] = extractWhitespace1(rest);
        if (ws === null) {
            return [null, input];
        }
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
