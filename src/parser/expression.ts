import {
    extractDelimitedList,
    extractEnclosed,
    extractIdentifierUntil,
    extractNumber,
    extractOperator,
    extractToken,
    extractTokens,
    extractWhitespace1,
} from "./extractors";

export type PrimitiveExpression =
    | NumberExpression
    | BooleanExpression
    | StringExpression;

export type NumberExpression = { type: "number"; value: number };
export type BooleanExpression = { type: "boolean"; value: boolean };
export type StringExpression = { type: "string"; value: string };
export type OperationExpression = {
    type: "operation";
    op: "+" | "-" | "*" | "/";
    lhs: Expression;
    rhs: Expression;
};
export type VariableReferenceExpression = {
    type: "variableReference";
    identifier: string;
};
export type FunctionCallExpression = {
    type: "functionCall";
    identifier: string;
    parameters: Expression[];
};

export type Expression =
    | NumberExpression
    | BooleanExpression
    | StringExpression
    | OperationExpression
    | VariableReferenceExpression
    | FunctionCallExpression;

export function parseExpression(input: string): [Expression | null, string] {
    const operation = parseOperationExpression(input);
    if (operation[0] !== null) {
        return operation;
    }

    const num = parseNumberExpression(input);
    if (num[0] !== null) {
        return num;
    }

    const bool = parseBooleanExpression(input);
    if (bool[0] !== null) {
        return bool;
    }

    const str = parseStringExpression(input);
    if (str[0] !== null) {
        return str;
    }

    const variableRef = parseVariableReferenceExpression(input);
    if (variableRef[0] !== null) {
        return variableRef;
    }

    const functionCall = parseFunctionCallExpression(input);
    if (functionCall[0] !== null) {
        return functionCall;
    }

    return [null, input];
}

function parseNumberExpression(
    input: string,
): [NumberExpression | null, string] {
    var [num, rest] = extractNumber(input);
    if (num === null) {
        return [null, input];
    }

    var [delimiter, rest] = extractToken(rest, ",");
    if (delimiter !== null) {
        var [decimalNum, rest] = extractNumber(rest);
        if (decimalNum === null) {
            return [null, input];
        }

        const floatNum =
            decimalNum / 10 ** (Math.floor(Math.log10(decimalNum)) + 1);
        const finalNum = num + floatNum;

        return [
            {
                type: "number",
                value: finalNum,
            },
            rest,
        ];
    }

    return [{ type: "number", value: num }, rest];
}

function parseBooleanExpression(
    input: string,
): [BooleanExpression | null, string] {
    var [trueToken, rest] = extractToken(input, "wahr");
    if (trueToken) {
        return [{ type: "boolean", value: true }, rest];
    }
    var [falseToken, rest] = extractToken(rest, "falsch");
    if (falseToken) {
        return [{ type: "boolean", value: false }, rest];
    }
    return [null, input];
}

function parseStringExpression(
    input: string,
): [StringExpression | null, string] {
    const [str, rest] = extractEnclosed(input, '"');
    if (str === null) {
        return [null, input];
    }
    return [{ type: "string", value: str }, rest];
}

function parseOperationExpression(
    input: string,
): [OperationExpression | null, string] {
    // TODO: create modular extractor function, which takes extractor functions
    // const { op, lhs, rhs, rest } = extractSequential(input, [
    //     ["op", extractOperator],
    //     ["lhs", parseExpression],
    //     extractWhitespace1,
    //     (s) => extractToken(s, "und"),
    //     extractWhitespace1,
    //     ["rhs", parseExpression],
    // ]);

    var [op, rest] = extractOperator(input);
    if (op === null) return [null, input];

    var [lhs, rest] = parseExpression(rest);
    if (lhs === null) return [null, input];
    var [ws, rest] = extractWhitespace1(rest);
    if (ws === null) return [null, input];

    var [delimiter, rest] = extractTokens(rest, ["und"]);
    if (delimiter === null) return [null, input];

    var [rhs, rest] = parseExpression(rest);
    if (rhs === null) return [null, input];

    const operation: OperationExpression = {
        type: "operation",
        op,
        lhs,
        rhs,
    };

    return [operation, rest];
}

function parseVariableReferenceExpression(
    input: string,
): [VariableReferenceExpression | null, string] {
    var [token, rest] = extractToken(input, "/");
    if (token === null) {
        return [null, input];
    }
    var [identifier, rest] = extractIdentifierUntil(rest, "/");
    if (identifier === null) {
        return [null, input];
    }
    return [{ type: "variableReference", identifier }, rest];
}

function parseFunctionCallExpression(
    input: string,
): [FunctionCallExpression | null, string] {
    // führe Eine Berechnung aus
    // führe Eine Berechnung mit 10, 20 und 30 aus

    var [token, rest] = extractToken(input, "führe");
    if (token === null) return [null, input];

    const parameters: string[] = [];

    var [identifier, rest] = extractIdentifierUntil(rest, " mit ");

    if (identifier === null) {
        var [identifier, rest] = extractIdentifierUntil(rest, " aus");
        if (identifier === null) {
            throw new Error(
                "Failed to parse functionCall: expected identifier",
            );
        }
    } else {
        var [extractedParams, rest] = extractDelimitedList(rest, ",", " und");
        // TODO
        if (extractedParams === null) {
            extractToken(rest, "aus");
        }
        parameters.push(...extractedParams.map(formatIdentifier));

        const hasFinalParam = parameters.length > 1;

        var [_ws, rest] = extractWhitespace(rest);
        var [token, rest] = extractToken(rest, "macht");

        if (token !== null) {
            if (hasFinalParam) {
                return [
                    {
                        error: new Error(
                            'Failed to parse functionDefinition: expected final parameter after "und"',
                        ),
                    },
                    rest,
                ];
            } else {
                return [{ identifier, parameters }, rest];
            }
        }

        var [param, rest] = extractIdentifierUntil(rest, "und macht");
        if (param === null) {
            return [
                {
                    error: new Error(
                        'Failed to parse functionDefinition: expected final parameter before "macht"',
                    ),
                },
                rest,
            ];
        }

        parameters.push(param);
    }

    return [{ identifier, parameters }, rest];
}
