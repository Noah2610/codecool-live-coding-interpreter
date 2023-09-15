import {
    extractDelimitedList,
    extractEnclosed,
    extractIdentifierUntil,
    extractList,
    extractNumber,
    extractOperator,
    extractSequence,
    extractToken,
    extractTokens,
    extractWhitespace1,
} from "./extractors";

export type NumberExpression = { type: "number"; value: number };
export type BooleanExpression = { type: "boolean"; value: boolean };
export type StringExpression = { type: "string"; value: string };
export type NullExpression = { type: "null" };

type ArithmeticOp = "+" | "-" | "*" | "/";
type ComparisonOp = "eq" | "neq" | "gt" | "gte" | "lt" | "lte";
type LogicalOp = "and" | "or";
export type OperationExpression = {
    type: "operation";
    op: ArithmeticOp | ComparisonOp | LogicalOp;
    lhs: Expression;
    rhs: Expression;
};

export type ComparisonExpression = {
    type: "comparison";
    op: "eq" | "neq" | "gt" | "gte" | "lt" | "lte";
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

export type PrimitiveExpression =
    | NumberExpression
    | BooleanExpression
    | StringExpression
    | NullExpression;

export type Expression =
    | PrimitiveExpression
    | OperationExpression
    | VariableReferenceExpression
    | FunctionCallExpression;

export function parseExpression(input: string): [Expression | null, string] {
    /*
        null
        boolean
        number
        string

        variableReference
        funcionCall

        arithmetic
        comparison
        logical
     */

    // wahr gleich wahr
    // (wahr gleich wahr) und (wahr gleich wahr)
    // ((die Summe von 1 und 2) gleich (die Summe von 2 und 1)) und ()

    // const logical = parseLogicalOperationExpression(input);
    const logical = parseLogicalLayer(input);
    if (logical[0] !== null) {
        return logical;
    }

    return [null, input];
    // --- TODO

    // const operation = parseOperationExpression(input);
    // if (operation[0] !== null) {
    //     return operation;
    // }

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

    const nullExpr = parseNullExpression(input);
    if (nullExpr[0] !== null) {
        return nullExpr;
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

function parseLogicalLayer(input: string): [Expression | null, string] {
    const logical = parseLogicalOperationExpression(input);
    if (logical[0] !== null) return logical;
    return parseComparisonLayer(input);
}

function parseComparisonLayer(input: string): [Expression | null, string] {
    const comparison = parseComparisonExpression(input);
    if (comparison[0] !== null) return comparison;
    return parseArithmeticLayer(input);
}

function parseArithmeticLayer(input: string): [Expression | null, string] {
    const arithmetic = parseArithmeticOperationExpression(input);
    if (arithmetic[0] !== null) return arithmetic;
    return parseReferenceLayer(input);
}

function parseReferenceLayer(input: string): [Expression | null, string] {
    const funcCall = parseFunctionCallExpression(input);
    if (funcCall[0] !== null) return funcCall;
    const variableRef = parseVariableReferenceExpression(input);
    if (variableRef[0] !== null) return variableRef;
    return parsePrimitiveLayer(input);
}

function parsePrimitiveLayer(input: string): [Expression | null, string] {
    const primitive = parsePrimitiveExpression(input);
    if (primitive[0] !== null) return primitive;
    return [null, input];
}

function parsePrimitiveExpression(input: string): [Expression | null, string] {
    const str = parseStringExpression(input);
    if (str[0] !== null) return str;
    const num = parseNumberExpression(input);
    if (num[0] !== null) return num;
    const bool = parseBooleanExpression(input);
    if (bool[0] !== null) return bool;
    const nullExpr = parseNullExpression(input);
    if (nullExpr[0] !== null) return nullExpr;
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

function parseNullExpression(input: string): [NullExpression | null, string] {
    const [nullToken, rest] = extractToken(input, "nix");
    if (nullToken === null) return [null, input];
    return [{ type: "null" }, rest];
}

// TODO
function parseArithmeticOperationExpression(
    input: string,
): [OperationExpression | null, string] {
    // die Summe von 1 und 2
    return extractSequence(
        input,
        [
            extractOperator,
            parseArithmeticLayer, // TODO parseReferenceLayer ?
            extractWhitespace1,
            (s) => extractToken(s, "und"),
            extractWhitespace1,
            parseExpression,
        ] as const,
        ([op, lhs, _ws1, _und, _ws2, rhs]) => ({
            type: "operation",
            op,
            lhs,
            rhs,
        }),
    );
}

function parseComparisonExpression(
    input: string,
): [OperationExpression | null, string] {
    const parseEqualityComparison = (): [OperationExpression | null, string] =>
        extractSequence(
            input,
            [
                parseArithmeticLayer,
                extractWhitespace1,
                (s) => extractToken(s, "gleich"),
                extractWhitespace1,
                parseExpression,
            ] as const,
            ([lhs, _ws1, _kw, _ws2, rhs]) => ({
                type: "operation",
                op: "eq",
                lhs,
                rhs,
            }),
        );

    const parseInequalityComparison = (): [
        OperationExpression | null,
        string,
    ] =>
        extractSequence(
            input,
            [
                parseArithmeticLayer,
                extractWhitespace1,
                (s) => extractToken(s, "nicht"),
                extractWhitespace1,
                (s) => extractToken(s, "gleich"),
                extractWhitespace1,
                parseExpression,
            ] as const,
            ([lhs, _ws1, _kw1, _ws2, _kw2, _ws3, rhs]) => ({
                type: "operation",
                op: "neq",
                lhs,
                rhs,
            }),
        );

    const parseGreaterThanComparison = (): [
        OperationExpression | null,
        string,
    ] =>
        extractSequence(
            input,
            [
                parseArithmeticLayer,
                extractWhitespace1,
                (s) => extractToken(s, "größer"),
                extractWhitespace1,
                (s) => extractToken(s, "als"),
                extractWhitespace1,
                parseExpression,
            ] as const,
            ([lhs, _ws1, _kw1, _ws2, _kw2, _ws3, rhs]) => ({
                type: "operation",
                op: "gt",
                lhs,
                rhs,
            }),
        );

    const parseGreaterThanEqualComparison = (): [
        OperationExpression | null,
        string,
    ] =>
        extractSequence(
            input,
            [
                parseArithmeticLayer,
                extractWhitespace1,
                (s) => extractToken(s, "größer"),
                extractWhitespace1,
                (s) => extractToken(s, "als"),
                extractWhitespace1,
                (s) => extractToken(s, "oder"),
                extractWhitespace1,
                (s) => extractToken(s, "gleich"),
                extractWhitespace1,
                parseExpression,
            ] as const,
            ([lhs, _1, _2, _3, _4, _5, _6, _7, _8, _9, rhs]) => ({
                type: "operation",
                op: "gte",
                lhs,
                rhs,
            }),
        );

    const parseLessThanComparison = (): [OperationExpression | null, string] =>
        extractSequence(
            input,
            [
                parseArithmeticLayer,
                extractWhitespace1,
                (s) => extractToken(s, "kleiner"),
                extractWhitespace1,
                (s) => extractToken(s, "als"),
                extractWhitespace1,
                parseExpression,
            ] as const,
            ([lhs, _ws1, _kw1, _ws2, _kw2, _ws3, rhs]) => ({
                type: "operation",
                op: "lt",
                lhs,
                rhs,
            }),
        );

    const parseLessThanEqualComparison = (): [
        OperationExpression | null,
        string,
    ] =>
        extractSequence(
            input,
            [
                parseArithmeticLayer,
                extractWhitespace1,
                (s) => extractToken(s, "kleiner"),
                extractWhitespace1,
                (s) => extractToken(s, "als"),
                extractWhitespace1,
                (s) => extractToken(s, "oder"),
                extractWhitespace1,
                (s) => extractToken(s, "gleich"),
                extractWhitespace1,
                parseExpression,
            ] as const,
            ([lhs, _1, _2, _3, _4, _5, _6, _7, _8, _9, rhs]) => ({
                type: "operation",
                op: "lte",
                lhs,
                rhs,
            }),
        );

    // wahr gleich falsch
    const equality = parseEqualityComparison();
    if (equality[0] !== null) {
        return equality;
    }

    // wahr nicht gleich falsch
    const inequality = parseInequalityComparison();
    if (inequality[0] !== null) {
        return inequality;
    }

    // 10 größer als 5
    const greaterThan = parseGreaterThanComparison();
    if (greaterThan[0] !== null) {
        return greaterThan;
    }

    // 10 größer als oder gleich 5
    const greaterThanEqual = parseGreaterThanEqualComparison();
    if (greaterThanEqual[0] !== null) {
        return greaterThanEqual;
    }

    // 10 kleiner als 5
    const lessThan = parseLessThanComparison();
    if (lessThan[0] !== null) {
        return lessThan;
    }

    // 10 kleiner als oder gleich 5
    const lessThanEqual = parseLessThanEqualComparison();
    if (lessThanEqual[0] !== null) {
        return lessThanEqual;
    }

    return [null, input];
}

function parseLogicalOperationExpression(
    input: string,
): [OperationExpression | null, string] {
    const parseAnd = (): [OperationExpression | null, string] =>
        extractSequence(
            input,
            [
                parseComparisonLayer,
                extractWhitespace1,
                (s) => extractToken(s, "und"),
                extractWhitespace1,
                parseExpression,
            ] as const,
            ([lhs, _1, _2, _3, rhs]) => ({
                type: "operation",
                op: "and",
                lhs,
                rhs,
            }),
        );

    const parseOr = (): [OperationExpression | null, string] =>
        extractSequence(
            input,
            [
                parseComparisonLayer,
                extractWhitespace1,
                (s) => extractToken(s, "or"),
                extractWhitespace1,
                parseExpression,
            ] as const,
            ([lhs, _1, _2, _3, rhs]) => ({
                type: "operation",
                op: "or",
                lhs,
                rhs,
            }),
        );

    // wahr und falsch
    const and = parseAnd();
    if (and[0] !== null) {
        return and;
    }

    // wahr oder falsch
    const or = parseOr();
    if (or[0] !== null) {
        return or;
    }

    return [null, input];
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
    // TODO: proper error handling

    var [token, rest] = extractToken(input, "führe");
    if (token === null) return [null, input];

    const parameters: Expression[] = [];

    var [identifier, rest] = extractIdentifierUntil(rest, " mit ");

    if (identifier === null) {
        var [identifier, rest] = extractIdentifierUntil(rest, " aus");
        if (identifier === null) {
            throw new Error(
                "Failed to parse functionCall: expected identifier",
            );
        }
    } else {
        var [params, rest] = extractList(rest, " aus");
        if (params === null) {
            throw new Error(
                "Failed to parse functionCall: expected parameters",
            );
        }

        for (const param of params) {
            const [expr, exprRest] = parseExpression(param);
            if (expr === null || exprRest.trim().length > 0) {
                throw new Error(
                    `Failed to parse functionCall parameter as expression: "${param}"`,
                );
            }

            parameters.push(expr);
        }
    }

    return [
        {
            type: "functionCall",
            identifier,
            parameters,
        },
        rest,
    ];
}
