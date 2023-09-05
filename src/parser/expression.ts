import {
    extractIdentifierUntil,
    extractNumber,
    extractOperator,
    extractToken,
    extractTokens,
    extractWhile,
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

export type Expression =
    | NumberExpression
    | BooleanExpression
    | StringExpression
    | OperationExpression
    | VariableReferenceExpression;

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
    var [quote, rest] = extractToken(input, '"');
    if (!quote) {
        return [null, input];
    }

    let isEscaped = false;
    let didCloseString = false;

    var [str, rest] = extractWhile(rest, (chr) => {
        if (!isEscaped && chr === "\\") {
            isEscaped = true;
            return "skip";
        }

        if (!isEscaped && chr === '"') {
            didCloseString = true;
            return false;
        }

        if (isEscaped) {
            isEscaped = false;
        }

        return true;
    });

    if (!didCloseString) {
        return [null, input];
    }

    return [{ type: "string", value: str }, rest.slice(1)];
}

function parseOperationExpression(
    input: string,
): [OperationExpression | null, string] {
    // TODO: create modular extractor function, which takes extractor functions
    // extractExtractors(input, [
    //     (rest) => extractToken(rest, "die"), // "die",
    //     [extractToken, "die"]

    //     extractWhitespace1,
    //     extractOneOfTokens(input, ["Summe", "Differenz"])
    //     extractWhitespace1,
    //     extractToken, // "von",
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
