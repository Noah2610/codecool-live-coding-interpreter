import { Expression, parseExpression } from "./expression";
import {
    extractUntil,
    extractOneOfToken,
    extractToken,
    extractWhile1,
    extractWhitespace,
    extractWhitespace1,
    extractDelimitedList,
    formatIdentifier,
    extractIdentifierUntil,
    extractList,
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
export type FunctionDefinitionStatement = {
    type: "functionDefinition";
    identifier: string;
    parameters: string[];
    body: Statement[];
};

export type Statement =
    | ExpressionStatement
    | VariableDefinitionStatement
    | FunctionDefinitionStatement;

export function parseStatement(input: string): [Statement | null, string] {
    let statement: Statement | null = null;

    var [_ws, rest] = extractWhitespace(input);

    var [variableDef, rest] = parseVariableDefinitionStatement(rest);
    if (variableDef !== null) {
        statement = variableDef;
    }

    if (!statement) {
        var [exp, rest] = parseExpression(rest);
        if (exp !== null) {
            statement = { type: "expression", value: exp };
        }
    }

    if (!statement) {
        var [funcDef, rest] = parseFunctionDefinition(rest);
        if (funcDef !== null) {
            statement = funcDef;
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

function parseFunctionDefinition(
    input: string,
): [FunctionDefinitionStatement | null, string] {
    var [result, rest] = parseFunctionDefinitionHeader(input);
    if (result === null) {
        return [null, input];
    }
    // TODO proper error handling
    if ("error" in result) {
        throw result.error;
    }
    const { identifier, parameters } = result;

    var [body, rest] = parseFunctionDefinitionBody(rest);
    // TODO proper error handling
    if (body === null) {
        throw new Error("Failed to parse functionDefinition body");
    }

    const s: Statement = {
        type: "functionDefinition",
        identifier,
        parameters,
        body,
    };
    return [s, rest];
}

function parseFunctionDefinitionHeader(
    input: string,
): [
    { identifier: string; parameters: string[] } | { error: Error } | null,
    string,
] {
    var [token, rest] = extractToken(input, "die Funktion");
    if (token === null) return [null, input];

    const parameters: string[] = [];

    var [identifier, rest] = extractIdentifierUntil(rest, " kriegt ");

    if (identifier === null) {
        var [identifier, rest] = extractIdentifierUntil(rest, " macht");
        if (identifier === null) {
            return [
                {
                    error: new Error(
                        "Failed to parse functionDefinition: expected identifier",
                    ),
                },
                input,
            ];
        }
    } else {
        var [params, rest] = extractList(rest, " und macht");
        if (params === null) {
            return [
                {
                    error: new Error("Failed to parse functionDefinition parameters"),
                },
                input,
            ];
        }
        parameters.push(...params.map(formatIdentifier));
    }

    return [{ identifier, parameters }, rest];
}

function parseFunctionDefinitionBody(
    input: string,
): [Statement[] | null, string] {
    var rest = input;
    const body = [];

    while (true) {
        var [statement, rest] = parseStatement(rest);

        if (statement === null) {
            var [_ws, rest] = extractWhitespace(rest);
            var [terminator, rest] = extractToken(rest, "und endet hier");
            if (terminator === null) {
                return [null, input];
            }
            break;
        }

        body.push(statement);
    }

    return [body, rest];
}
