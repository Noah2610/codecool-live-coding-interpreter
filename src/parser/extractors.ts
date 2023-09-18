type Extractor<T> = (input: string) => [T, string];
type Extractors = Readonly<Array<Extractor<any>>>;
type ExtractorReturnTypes<T extends Readonly<Array<(...args: any) => any>>> = {
    [I in keyof T]: NonNullable<ReturnType<T[I]>[0]>;
};

export function extractWhile(
    predicate: (chr: string, i: number, input: string) => boolean | "skip",
): Extractor<string> {
    return (input) => {
        let result = "";
        let skipCount = 0;

        for (let i = 0; i < input.length; i++) {
            const chr = input[i]!;
            const predicateResult = predicate(chr, i, input);
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
    };
}

export function extractWhile1(
    predicate: (chr: string, i: number, input: string) => boolean | "skip",
): Extractor<string | null> {
    const extractor = extractWhile(predicate);
    return (input) => {
        const extracted = extractor(input);
        if (extracted[0].length === 0) {
            return [null, input];
        }
        return extracted;
    };
}

export function extractToken(token: string): Extractor<string | null> {
    return (input) => {
        const slice = input.slice(0, token.length);
        if (slice === token) {
            return [slice, input.slice(slice.length)];
        }
        return [null, input];
    };
}

export function extractOneOfToken(tokens: string[]): Extractor<string | null> {
    const extractors = tokens.map(extractToken);

    return (input) => {
        var rest = input;

        for (const extractor of extractors) {
            var [extracted, rest] = extractor(rest);
            if (extracted !== null) {
                return [extracted, rest];
            }
        }

        return [null, input];
    };
}

export function extractTokens(tokens: string[]): Extractor<string | null> {
    const tokenExtractors = tokens.map(extractToken);
    const wsExtractor = extractWhitespace1();

    return (input) => {
        let extracted = "";
        var rest = input;

        for (const tokenExtractor of tokenExtractors) {
            var [tk, rest] = tokenExtractor(rest);
            if (tk === null) return [null, input];
            extracted += tk;
            var [ws, rest] = wsExtractor(rest);
            if (ws === null) return [null, input];
            extracted += ws;
        }

        return [extracted, rest];
    };
}

export function extractWhitespace(): Extractor<string> {
    return extractWhile((chr) => chr.trim().length === 0);
}

export function extractWhitespace1(): Extractor<string | null> {
    return extractWhile1((chr) => chr.trim().length === 0);
}

export function extractOperator(): Extractor<"+" | "-" | "*" | "/" | null> {
    const plusExtractor = extractTokens(["die", "Summe", "von"]);
    const minusExtractor = extractTokens(["die", "Differenz", "von"]);
    const multExtractor = extractTokens(["das", "Produkt", "aus"]);
    const divExtractor = extractTokens(["der", "Quotient", "von"]);

    return (input) => {
        var [plus, rest] = plusExtractor(input);
        if (plus !== null) {
            return ["+", rest];
        }
        var [minus, rest] = minusExtractor(input);
        if (minus !== null) {
            return ["-", rest];
        }
        var [mult, rest] = multExtractor(input);
        if (mult !== null) {
            return ["*", rest];
        }
        var [div, rest] = divExtractor(input);
        if (div !== null) {
            return ["/", rest];
        }
        return [null, input];
    };
}

export function extractNumber(): Extractor<number | null> {
    const DIGITS = new Set([..."0123456789"]);

    const state = { wasDelimiter: false };
    const numExtractor = extractWhile1((chr, i) => {
        if (chr === ".") {
            if (i === 0 || state.wasDelimiter) {
                return false;
            }

            state.wasDelimiter = true;
            return "skip";
        }
        state.wasDelimiter = false;
        return DIGITS.has(chr);
    });

    return (input) => {
        state.wasDelimiter = false;

        const [numS, rest] = numExtractor(input);

        if (numS === null || state.wasDelimiter) {
            return [null, input];
        }

        return [parseInt(numS), rest];
    };
}

export function extractUntil(
    terminator: string,
    exclude?: string[],
): Extractor<string | null> {
    const wsExtractor = extractWhitespace();
    const untilExtractor = extractWhile1((_chr, i, input) => {
        if (
            exclude &&
            exclude.some((ex) => input.slice(i, i + ex.length) === ex)
        ) {
            return false;
        }
        return input.slice(i, i + terminator.length) !== terminator;
    });
    const terminatorExtractor = extractToken(terminator);

    return (input) => {
        var [_ws, rest] = wsExtractor(input);
        var [extracted, rest] = untilExtractor(rest);
        if (extracted === null) return [null, input];

        var [extractedTerminator, rest] = terminatorExtractor(rest);
        if (extractedTerminator === null) return [null, input];

        return [extracted, rest];
    };
}

export function extractIdentifierUntil(
    terminator: string,
    exclude?: string[],
): Extractor<string | null> {
    const untilExtractor = extractUntil(terminator, exclude);
    return (input) => {
        const [extracted, rest] = untilExtractor(input);
        if (extracted === null) return [null, input];
        return [formatIdentifier(extracted), rest];
    };
}

export function extractEnclosed(boundary: string): Extractor<string | null> {
    const boundExtractor = extractToken(boundary);
    const state = { isEscaped: false };
    const contentExtractor = extractWhile((chr, i, input) => {
        if (!state.isEscaped && chr === "\\") {
            state.isEscaped = true;
            return "skip";
        }

        if (
            !state.isEscaped &&
            input.slice(i, i + boundary.length) === boundary
        ) {
            return false;
        }

        if (state.isEscaped) {
            state.isEscaped = false;
        }

        return true;
    });

    return (input) => {
        var [bound, rest] = boundExtractor(input);
        if (!bound) {
            return [null, input];
        }

        state.isEscaped = false;

        var [extracted, rest] = contentExtractor(rest);

        var [bound, rest] = boundExtractor(rest);
        if (bound === null) {
            return [null, input];
        }

        return [extracted, rest];
    };
}

export function extractDelimitedList(
    delimiter: string,
    terminator: string,
): Extractor<string[] | null> {
    const untilDelimiterExtractor = extractUntil(delimiter);
    const untilTerminatorExtractor = extractUntil(terminator);

    return (input) => {
        const result = [];
        var rest = input;

        while (true) {
            var [extracted, rest] = untilDelimiterExtractor(rest);
            if (extracted === null) {
                var [last, rest] = untilTerminatorExtractor(rest);
                if (last === null) {
                    return [null, input];
                }
                result.push(last);
                break;
            }

            result.push(extracted);
        }

        return [result, rest];
    };
}

/**
 * Extracts list like:
 * "eins"
 * "eins und zwei"
 * "eins, zwei und drei"
 */
export function extractList(terminator: string): Extractor<string[] | null> {
    const delimitedListExtractor = extractDelimitedList(",", " und ");
    const untilTerminatorExtractor = extractUntil(terminator, [","]);
    const untilTerminatorExtractorExcludeUnd = extractUntil(terminator, [
        ",",
        " und",
    ]);
    const untilUndExtractor = extractUntil(" und ", [","]);

    function extractListMultiple(): Extractor<string[] | null> {
        return (input) => {
            var [items, rest] = delimitedListExtractor(input);
            if (items === null || items.length < 2) {
                return [null, input];
            }

            var [lastItem, rest] = untilTerminatorExtractor(rest);
            if (lastItem === null) return [null, input];

            return [[...items, lastItem], rest];
        };
    }

    function extractListTwo(): Extractor<string[] | null> {
        return (input) => {
            var [first, rest] = untilUndExtractor(input);
            if (first === null) return [null, input];

            var [second, rest] = untilTerminatorExtractorExcludeUnd(rest);
            if (second === null) return [null, input];

            return [[first, second], rest];
        };
    }

    function extractListOne(): Extractor<string[] | null> {
        return (input) => {
            var [item, rest] = untilTerminatorExtractorExcludeUnd(input);
            if (item === null) return [null, input];
            return [[item], rest];
        };
    }

    const multipleExtractor = extractListMultiple();
    const twoExtractor = extractListTwo();
    const oneExtractor = extractListOne();

    return (input) => {
        const multiple = multipleExtractor(input);
        if (multiple[0] !== null) return multiple;

        const two = twoExtractor(input);
        if (two[0] !== null) return two;

        const one = oneExtractor(input);
        if (one[0] !== null) return one;

        return [null, input];
    };
}

export function extractSequence<R, T extends Extractors>(
    extractors: T,
    converter: (results: ExtractorReturnTypes<T>) => R,
): Extractor<R | null> {
    return (input) => {
        let rest = input;
        const results: any[] = [];

        for (const extractor of extractors) {
            const [result, newRest] = extractor(rest);
            if (result === null) {
                return [null, input];
            }

            rest = newRest;
            results.push(result);
        }

        return [converter(results as ExtractorReturnTypes<T>), rest];
    };
}

export function formatIdentifier(unformatted: string): string {
    const formatted = [];
    for (let i = 0; i < unformatted.length; i++) {
        const c = unformatted[i]!;
        if (
            (c === " " && formatted.length === 0) ||
            (c === " " &&
                (unformatted[i + 1] === " " ||
                    unformatted[i + 1] === undefined))
        ) {
            continue;
        }
        formatted.push(c);
    }
    return formatted.join("");
}
