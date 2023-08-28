import { extractToken, extractWhile, extractWhile1 } from "./extractors";

export type NumberExpression = { type: "number"; value: number };
export type BooleanExpression = { type: "boolean"; value: boolean };
export type StringExpression = { type: "string"; value: string };

export type Expression =
    | NumberExpression
    | BooleanExpression
    | StringExpression;

export function parseExpression(input: string): [Expression | null, string] {
    const num = parseNumberExpression(input);
    if (num[0] !== null) {
        return [{ type: "number", value: num[0] }, num[1]];
    }

    const bool = parseBooleanExpression(input);
    if (bool[0] !== null) {
        return [{ type: "boolean", value: bool[0] }, bool[1]];
    }

    const str = parseStringExpression(input);
    if (str[0] !== null) {
        return [{ type: "string", value: str[0] }, str[1]];
    }

    return [null, input];
}

function parseNumberExpression(input: string): [number | null, string] {
    const DIGITS = new Set([..."0123456789"]);
    const [numS, rest] = extractWhile1(input, (chr) => DIGITS.has(chr));
    return [numS === null ? null : parseInt(numS), rest];
}

function parseBooleanExpression(input: string): [boolean | null, string] {
    var [trueToken, rest] = extractToken(input, "wahr");
    if (trueToken) {
        return [true, rest];
    }
    var [falseToken, rest] = extractToken(rest, "falsch");
    if (falseToken) {
        return [false, rest];
    }
    return [null, input];
}

function parseStringExpression(input: string): [string | null, string] {
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

    return [str, rest.slice(1)];
}
