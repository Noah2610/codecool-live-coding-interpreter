import {
    extractEnclosed,
    extractIdentifierUntil,
    extractList,
    extractNumber,
    extractOperator,
    extractSequence,
    extractToken,
    extractWhitespace1,
} from "./extractors";
import * as node from "../node";

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

export function parseExpression(
    input: string,
    layer: number = 0,
): [Expression | null, string] {
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

    if (layer >= EXPRESSION_PARSE_LAYERS.length) {
        return [null, input];
    }

    const parser = EXPRESSION_PARSE_LAYERS[layer];
    if (parser === undefined) {
        throw new Error(
            `[parseExpression] Invalid layer index: ${layer}, expected between 0 and ${
                EXPRESSION_PARSE_LAYERS.length - 1
            } (inclusive)`,
        );
    }

    const expr = parser(input);
    if (expr[0] !== null) return expr;
    return parseExpression(input, layer + 1);
}

const EXPRESSION_PARSE_LAYERS = [
    parseLogicalExpression,
    parseComparisonExpression,
    parseArithmeticExpression,
    parseFunctionCallExpression,
    parseVariableReferenceExpression,
    parseStringExpression,
    parseNumberExpression,
    parseBooleanExpression,
    parseNullExpression,
] as const;

const EXPRESSION_PARSE_LAYER_NAMES = [
    "logical",
    "comparison",
    "arithmetic",
    "functionCall",
    "variableReference",
    "string",
    "number",
    "boolean",
    "null",
] as const;

function getLayerIndex(
    layerName: (typeof EXPRESSION_PARSE_LAYER_NAMES)[number],
): number {
    return EXPRESSION_PARSE_LAYER_NAMES.indexOf(layerName);
}

function nextLayerIndex(
    layerName: (typeof EXPRESSION_PARSE_LAYER_NAMES)[number],
): number {
    return EXPRESSION_PARSE_LAYER_NAMES.indexOf(layerName) + 1;
}

function parseNumberExpression(
    input: string,
): [NumberExpression | null, string] {
    const numExtractor = extractNumber();
    const commaExtractor = extractToken(",");

    var [num, rest] = numExtractor(input);
    if (num === null) {
        return [null, input];
    }

    var [delimiter, rest] = commaExtractor(rest);
    if (delimiter !== null) {
        var [decimalNum, rest] = numExtractor(rest);
        if (decimalNum === null) {
            return [null, input];
        }

        const floatNum =
            decimalNum / 10 ** (Math.floor(Math.log10(decimalNum)) + 1);
        const finalNum = num + floatNum;

        return [node.num(finalNum), rest];
    }

    return [node.num(num), rest];
}

function parseBooleanExpression(
    input: string,
): [BooleanExpression | null, string] {
    var [trueToken, rest] = extractToken("wahr")(input);
    if (trueToken) {
        return [node.bool(true), rest];
    }
    var [falseToken, rest] = extractToken("falsch")(rest);
    if (falseToken) {
        return [node.bool(false), rest];
    }
    return [null, input];
}

function parseStringExpression(
    input: string,
): [StringExpression | null, string] {
    const [str, rest] = extractEnclosed('"')(input);
    if (str === null) {
        return [null, input];
    }
    return [node.str(str), rest];
}

function parseNullExpression(input: string): [NullExpression | null, string] {
    const [nullToken, rest] = extractToken("nix")(input);
    if (nullToken === null) return [null, input];
    return [node.nullExp(), rest];
}

// TODO
function parseArithmeticExpression(
    input: string,
): [OperationExpression | null, string] {
    // die Summe von 1 und 2
    return extractSequence(
        [
            extractOperator(),
            (s) => parseExpression(s, nextLayerIndex("arithmetic")), // TODO parseReferenceLayer ?
            extractWhitespace1(),
            extractToken("und"),
            extractWhitespace1(),
            parseExpression,
        ] as const,
        ([op, lhs, _ws1, _und, _ws2, rhs]): OperationExpression =>
            node.operation(op, lhs, rhs),
    )(input);
}

function parseComparisonExpression(
    input: string,
): [OperationExpression | null, string] {
    const parseEqualityComparison = extractSequence(
        [
            (s) => parseExpression(s, nextLayerIndex("arithmetic")),
            extractWhitespace1(),
            extractToken("gleich"),
            extractWhitespace1(),
            parseExpression,
        ] as const,
        ([lhs, _ws1, _kw, _ws2, rhs]): OperationExpression =>
            node.operation("eq", lhs, rhs),
    );

    const parseInequalityComparison = extractSequence(
        [
            (s) => parseExpression(s, nextLayerIndex("arithmetic")),
            extractWhitespace1(),
            extractToken("nicht"),
            extractWhitespace1(),
            extractToken("gleich"),
            extractWhitespace1(),
            parseExpression,
        ] as const,
        ([lhs, _ws1, _kw1, _ws2, _kw2, _ws3, rhs]): OperationExpression =>
            node.operation("neq", lhs, rhs),
    );

    const parseGreaterThanComparison = extractSequence(
        [
            (s) => parseExpression(s, nextLayerIndex("arithmetic")),
            extractWhitespace1(),
            extractToken("größer"),
            extractWhitespace1(),
            extractToken("als"),
            extractWhitespace1(),
            parseExpression,
        ] as const,
        ([lhs, _ws1, _kw1, _ws2, _kw2, _ws3, rhs]): OperationExpression =>
            node.operation("gt", lhs, rhs),
    );

    const parseGreaterThanEqualComparison = extractSequence(
        [
            (s) => parseExpression(s, nextLayerIndex("arithmetic")),
            extractWhitespace1(),
            extractToken("größer"),
            extractWhitespace1(),
            extractToken("als"),
            extractWhitespace1(),
            extractToken("oder"),
            extractWhitespace1(),
            extractToken("gleich"),
            extractWhitespace1(),
            parseExpression,
        ] as const,
        ([lhs, _1, _2, _3, _4, _5, _6, _7, _8, _9, rhs]): OperationExpression =>
            node.operation("gte", lhs, rhs),
    );

    const parseLessThanComparison = extractSequence(
        [
            (s) => parseExpression(s, nextLayerIndex("arithmetic")),
            extractWhitespace1(),
            extractToken("kleiner"),
            extractWhitespace1(),
            extractToken("als"),
            extractWhitespace1(),
            parseExpression,
        ] as const,
        ([lhs, _ws1, _kw1, _ws2, _kw2, _ws3, rhs]): OperationExpression =>
            node.operation("lt", lhs, rhs),
    );

    const parseLessThanEqualComparison = extractSequence(
        [
            (s) => parseExpression(s, nextLayerIndex("arithmetic")),
            extractWhitespace1(),
            extractToken("kleiner"),
            extractWhitespace1(),
            extractToken("als"),
            extractWhitespace1(),
            extractToken("oder"),
            extractWhitespace1(),
            extractToken("gleich"),
            extractWhitespace1(),
            parseExpression,
        ] as const,
        ([lhs, _1, _2, _3, _4, _5, _6, _7, _8, _9, rhs]): OperationExpression =>
            node.operation("lte", lhs, rhs),
    );

    // wahr gleich falsch
    const equality = parseEqualityComparison(input);
    if (equality[0] !== null) {
        return equality;
    }

    // wahr nicht gleich falsch
    const inequality = parseInequalityComparison(input);
    if (inequality[0] !== null) {
        return inequality;
    }

    // 10 größer als 5
    const greaterThan = parseGreaterThanComparison(input);
    if (greaterThan[0] !== null) {
        return greaterThan;
    }

    // 10 größer als oder gleich 5
    const greaterThanEqual = parseGreaterThanEqualComparison(input);
    if (greaterThanEqual[0] !== null) {
        return greaterThanEqual;
    }

    // 10 kleiner als 5
    const lessThan = parseLessThanComparison(input);
    if (lessThan[0] !== null) {
        return lessThan;
    }

    // 10 kleiner als oder gleich 5
    const lessThanEqual = parseLessThanEqualComparison(input);
    if (lessThanEqual[0] !== null) {
        return lessThanEqual;
    }

    return [null, input];
}

function parseLogicalExpression(
    input: string,
): [OperationExpression | null, string] {
    const parseAnd = extractSequence(
        [
            (s) => parseExpression(s, nextLayerIndex("logical")),
            extractWhitespace1(),
            extractToken("und"),
            extractWhitespace1(),
            parseExpression,
        ] as const,
        ([lhs, _1, _2, _3, rhs]): OperationExpression =>
            node.operation("and", lhs, rhs),
    );

    const parseOr = extractSequence(
        [
            (s) => parseExpression(s, nextLayerIndex("logical")),
            extractWhitespace1(),
            extractToken("or"),
            extractWhitespace1(),
            parseExpression,
        ] as const,
        ([lhs, _1, _2, _3, rhs]): OperationExpression =>
            node.operation("or", lhs, rhs),
    );

    // wahr und falsch
    const and = parseAnd(input);
    if (and[0] !== null) {
        return and;
    }

    // wahr oder falsch
    const or = parseOr(input);
    if (or[0] !== null) {
        return or;
    }

    return [null, input];
}

function parseVariableReferenceExpression(
    input: string,
): [VariableReferenceExpression | null, string] {
    var [token, rest] = extractToken("/")(input);
    if (token === null) {
        return [null, input];
    }
    var [identifier, rest] = extractIdentifierUntil("/")(rest);
    if (identifier === null) {
        return [null, input];
    }
    return [node.variableRef(identifier), rest];
}

function parseFunctionCallExpression(
    input: string,
): [FunctionCallExpression | null, string] {
    // TODO: proper error handling

    var [token, rest] = extractToken("führe")(input);
    if (token === null) return [null, input];

    const parameters: Expression[] = [];

    var [identifier, rest] = extractIdentifierUntil(" mit ")(rest);

    if (identifier === null) {
        var [identifier, rest] = extractIdentifierUntil(" aus")(rest);
        if (identifier === null) {
            throw new Error(
                "Failed to parse functionCall: expected identifier",
            );
        }
    } else {
        var [params, rest] = extractList(" aus")(rest);
        if (params === null) {
            throw new Error(
                "Failed to parse functionCall: expected parameters",
            );
        }

        for (const param of params) {
            const [expr, exprRest] = parseExpression(param); // TODO: layer?
            if (expr === null || exprRest.trim().length > 0) {
                throw new Error(
                    `Failed to parse functionCall parameter as expression: "${param}"`,
                );
            }

            parameters.push(expr);
        }
    }

    return [node.functionCall(identifier, parameters), rest];
}
