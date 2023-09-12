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
    // die Funktion Berechnen macht
    //     das Resultat ist die Summe von 10 und 20!
    // und endet hier!

    // token: die Funktion
    var [token, rest] = extractToken(input, "die Funktion");
    if (token === null) return [null, input];

    // ohne parameter: (
    //     token: macht
    // ) || mit parameter: (
    //     token: kriegt
    //     identifier (parameter): Name
    //     token: und macht
    // )

    const parameters: string[] = [];

    // identifier: Grüßen
    var [identifier, rest] = extractIdentifierUntil(rest, " kriegt ");

    // TODO refactor into smaller extractors (extractCommaList: "a, b, c", extractAUndB: "a und b")

    if (identifier === null) {
        var [identifier, rest] = extractIdentifierUntil(rest, " macht");
    } else {
        // Parse PARAMETERS

        //eins, zwei und drei und macht

        while (true) {
            var [_ws, rest] = extractWhitespace(rest);

            // var [param, rest] = extractIdentifierUntil(rest, " und ");

            // TODO
            let isLast = false;
            let hitComma = false;

            var [param, rest] = extractWhile1(rest, (chr, i) => {
                if (hitComma) {
                    return false;
                }

                if (chr === ",") {
                    hitComma = true;
                    return "skip";
                }

                if (rest.slice(i, i + " und".length) === " und") {
                    isLast = true;
                    return false;
                }

                return true;
            });

            if (param === null) {
                // TODO
                break;
            }

            parameters.push(param);
            if (isLast) {
                // TODO
                var [_, rest] = extractToken(rest, " und");
                break;
            }
        }

        // var [param, rest] = extractIdentifierUntil(rest, " und ");
        // if (param === null) throw new Error("Failed to parse functionDefinition parameter");
        // parameters.push(param);

        var [token, rest] = extractToken(rest, " macht");
        if (token === null) {
            var [param, rest] = extractIdentifierUntil(rest, " und macht");
            if (param === null) {
                throw new Error("Failed to parse last functionDefinition parameter")
            }

            parameters.push(param);
        }
    }

    if (identifier === null) return [null, input];

    const body = [];

    while (true) {
        var [statement, rest] = parseStatement(rest);

        if (statement === null) {
            var [_ws, rest] = extractWhitespace(rest);
            var [terminator, rest] = extractToken(rest, "und endet hier");
            if (terminator === null) {
                throw new Error("Failed parsing functionDefinition body as statement");
            }
            break;
        }

        body.push(statement);
    }

    const s: Statement = {
        type: "functionDefinition",
        identifier,
        parameters,
        body,
    };
    return [s, rest];
}
