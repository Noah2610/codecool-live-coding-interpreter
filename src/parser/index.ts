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

function extractToken(input: string, token: string): [string | null, string] {
    const slice = input.slice(0, token.length);
    if (slice === token) {
        return [slice, input.slice(slice.length)];
    }
    return [null, input];
}

function extractWhile(
    input: string,
    predicate: (chr: string, i: number) => boolean | "skip",
): [string, string] {
    let result = "";
    let skipCount = 0;

    for (let i = 0; i < input.length; i++) {
        const chr = input[i]!;
        const predicateResult = predicate(chr, i);
        if (predicateResult === false) {
            break;
        }
        if (predicateResult === "skip") {
            skipCount++;
            continue;
        }
        result += chr;
    }

    const rest = input.slice(result.length + skipCount);
    return [result, rest];
}

function extractWhile1(
    input: string,
    predicate: (chr: string, i: number) => boolean | "skip",
): [string | null, string] {
    const first = input[0];
    if (first === undefined || predicate(first, 0) === false) {
        return [null, input];
    }
    return extractWhile(input, predicate);
}
