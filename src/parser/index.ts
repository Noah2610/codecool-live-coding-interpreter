export type Expression =
    | { type: "number"; value: number }
    | { type: "boolean"; value: boolean }
    | { type: "string"; value: string };

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

    let numS = "";

    for (const chr of input) {
        if (DIGITS.has(chr)) {
            numS += chr;
        } else {
            break;
        }
    }

    if (numS.length === 0) {
        return [null, input];
    }

    const rest = input.slice(numS.length);
    return [parseInt(numS), rest];
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
    const [quote, rest] = extractToken(input, '"');
    if (!quote) {
        return [null, input];
    }


    let str = "";
    let isEscaped = false;
    let didCloseString = false;
    let backslashesCount = 0;

    for (const chr of rest) {
        if (!isEscaped && chr === "\\") {
            backslashesCount++;
            isEscaped = true;
            continue;
        }

        if (!isEscaped && chr === '"') {
            didCloseString = true;
            break;
        }
        str += chr;

        if (isEscaped) {
            isEscaped = false;
        }
    }

    if (!didCloseString) {
        return [null, input];
    }

    return [str, input.slice(str.length + 2 + backslashesCount)];
}

function extractToken(input: string, token: string): [string | null, string] {
    const slice = input.slice(0, token.length);
    if (slice === token) {
        return [slice, input.slice(slice.length)];
    }
    return [null, input];
}
