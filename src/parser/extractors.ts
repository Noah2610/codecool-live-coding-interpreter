export function extractWhile(
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

export function extractWhile1(
    input: string,
    predicate: (chr: string, i: number) => boolean | "skip",
): [string | null, string] {
    const extracted = extractWhile(input, predicate);
    if (extracted[0].length === 0) {
        return [null, input];
    }
    return extracted;
}

export function extractToken(
    input: string,
    token: string,
): [string | null, string] {
    const slice = input.slice(0, token.length);
    if (slice === token) {
        return [slice, input.slice(slice.length)];
    }
    return [null, input];
}

export function extractOneOfToken(
    input: string,
    tokens: string[],
): [string | null, string] {
    var rest = input;

    for (const token of tokens) {
        var [extracted, rest] = extractToken(rest, token);
        if (extracted !== null) {
            return [extracted, rest];
        }
    }

    return [null, input];
}

export function extractTokens(
    input: string,
    tokens: string[],
): [string | null, string] {
    let extracted = "";
    var rest = input;

    for (const token of tokens) {
        var [tk, rest] = extractToken(rest, token);
        if (tk === null) return [null, input];
        extracted += tk;
        var [ws, rest] = extractWhitespace1(rest);
        if (ws === null) return [null, input];
        extracted += ws;
    }

    return [extracted, rest];
}

export function extractWhitespace(input: string): [string, string] {
    return extractWhile(input, (chr) => chr.trim().length === 0);
}

export function extractWhitespace1(input: string): [string | null, string] {
    return extractWhile1(input, (chr) => chr.trim().length === 0);
}

export function extractOperator(
    input: string,
): ["+" | "-" | "*" | "/" | null, string] {
    var [plus, rest] = extractTokens(input, ["die", "Summe", "von"]);
    if (plus !== null) {
        return ["+", rest];
    }
    var [minus, rest] = extractTokens(input, ["die", "Differenz", "von"]);
    if (minus !== null) {
        return ["-", rest];
    }
    var [mult, rest] = extractTokens(input, ["das", "Produkt", "aus"]);
    if (mult !== null) {
        return ["*", rest];
    }
    var [div, rest] = extractTokens(input, ["der", "Quotient", "von"]);
    if (div !== null) {
        return ["/", rest];
    }
    return [null, input];
}

export function extractNumber(input: string): [number | null, string] {
    const DIGITS = new Set([..."0123456789"]);

    let wasDelimiter = false;

    const [numS, rest] = extractWhile1(input, (chr, i) => {
        if (chr === ".") {
            if (i === 0 || wasDelimiter) {
                return false;
            }

            wasDelimiter = true;
            return "skip";
        }
        wasDelimiter = false;
        return DIGITS.has(chr);
    });

    if (numS === null || wasDelimiter) {
        return [null, input];
    }

    return [parseInt(numS), rest];
}

export function extractIdentifierUntil(
    input: string,
    terminator: string,
): [string | null, string] {
    // TODO: alternative approach
    // const terminatorWithWs = " " + terminator;
    // let skipUntil: number | null = null;
    // return extractWhile1(rest, (chr, i) => {
    //     if (skipUntil !== null) {
    //         if (i < skipUntil) {
    //             return "skip";
    //         }
    //         return false;
    //     }
    //     if (rest.slice(i, i + terminatorWithWs.length) === terminatorWithWs) {
    //         skipUntil = i + terminatorWithWs.length;
    //         return "skip";
    //     }
    //     if (chr === " " && (rest[i - 1] === undefined || rest[i - 1] === " ")) {
    //         return "skip";
    //     }
    //     return true;
    // });

    var rest = input;
    let extracted = "";

    var ws: string | null = "";
    var [_ws, rest] = extractWhitespace(rest);

    while (true) {
        var [word, rest] = extractWhile1(rest, (chr) => chr !== " ");
        if (word === null) {
            return [null, input];
        }

        if (word === terminator) {
            break;
        }

        if (ws.length > 0) {
            extracted += " ";
        }
        extracted += word;

        var [ws, rest] = extractWhitespace1(rest);
        if (ws === null) {
            return [null, input];
        }
    }

    return [extracted, rest];
}
