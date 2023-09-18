import {
    extractDelimitedList,
    extractUntil,
    extractToken,
    extractWhile,
    extractWhile1,
    extractWhitespace,
    extractWhitespace1,
    formatIdentifier,
    extractIdentifierUntil,
    extractList,
    extractSequence,
    extractNumber,
} from "./extractors";

describe("extractors", () => {
    it("extracts token 'hello'", () => {
        const extracted = extractToken("hello")("hello world");
        expect(extracted).toEqual(["hello", " world"]);
    });

    it("can't extract missing token", () => {
        const extracted = extractToken("hello")("foo bar");
        expect(extracted).toEqual([null, "foo bar"]);
    });

    it("extracts while letter is lowercase", () => {
        const extracted = extractWhile((c) => c === c.toLowerCase())(
            "helloWorld",
        );
        expect(extracted).toEqual(["hello", "World"]);
    });

    it("can't extract at least one lowercase letter (extractWhile1)", () => {
        const extracted = extractWhile1((c) => c === c.toLowerCase())("Hello");
        expect(extracted).toEqual([null, "Hello"]);
    });

    it("extracts whitespace", () => {
        const ws = extractWhitespace();
        expect(ws("foo")).toEqual(["", "foo"]);
        expect(ws("  foo")).toEqual(["  ", "foo"]);
        expect(ws("\n\tfoo")).toEqual(["\n\t", "foo"]);
        expect(ws("\r\n\tfoo")).toEqual(["\r\n\t", "foo"]);
    });

    it("extracts at least one whitespace (extractWhitespace1)", () => {
        const ws1 = extractWhitespace1();
        expect(ws1("foo")).toEqual([null, "foo"]);
        expect(ws1("  foo")).toEqual(["  ", "foo"]);
    });

    it("extracts until terminator (extractUntil)", () => {
        const until = extractUntil("!");
        expect(until("Hallo Welt!")).toEqual(["Hallo Welt", ""]);
        expect(until("Hallo Welt")).toEqual([null, "Hallo Welt"]);
    });

    it("formats identifier", () => {
        expect(formatIdentifier("Hallo Welt")).toBe("Hallo Welt");
        expect(formatIdentifier("Hallo   Welt")).toBe("Hallo Welt");
        expect(formatIdentifier("  Hallo Welt  ")).toBe("Hallo Welt");
    });

    it("extracts identifier (extractIdentifierUntil)", () => {
        const extractor = extractIdentifierUntil(" ist");
        expect(extractor("Meine Variable ist")).toEqual(["Meine Variable", ""]);
        expect(extractor("Dieser Wert ist 123")).toEqual([
            "Dieser Wert",
            " 123",
        ]);
        expect(extractor("  Mein   Etwas   ist something")).toEqual([
            "Mein Etwas",
            " something",
        ]);
    });

    it("doesn't extract identifier with missing terminator (extractIdentifierUntil)", () => {
        const extractor = extractIdentifierUntil("!");
        expect(extractor("Meine Variable")).toEqual([null, "Meine Variable"]);
    });

    it('extracts comma-delimited list (extractDelimitedList with ",")', () => {
        const extractor = extractDelimitedList(",", " END");
        const extracted = extractor("hello, world, comma-delimited list END");
        expect(extracted).toEqual([
            ["hello", "world", "comma-delimited list"],
            "",
        ]);
    });

    it('extracts word-delimited list (extractDelimitedList with "und")', () => {
        const extractor = extractDelimitedList(" und ", " END");
        const extracted = extractor("hallo und welt END");
        expect(extracted).toEqual([["hallo", "welt"], ""]);
    });

    it("extracts lists", () => {
        const extractor = extractList(" END");
        expect(extractor("hallo END")).toEqual([["hallo"], ""]);
        expect(extractor("hallo und Welt END")).toEqual([
            ["hallo", "Welt"],
            "",
        ]);
        expect(extractor("hallo, tolle und Welt END")).toEqual([
            ["hallo", "tolle", "Welt"],
            "",
        ]);
    });

    it("doesn't extract invalid lists", () => {
        const extractor = extractList(" END");
        expect(extractor("hallo, Welt END")).toEqual([null, "hallo, Welt END"]);
        expect(extractor("hallo und tolle und Welt END")).toEqual([
            null,
            "hallo und tolle und Welt END",
        ]);
    });

    it('extracts list with terminator including "und"', () => {
        const extractor = extractList(" und ende");
        expect(extractor("hallo, tolle und Welt und ende")).toEqual([
            ["hallo", "tolle", "Welt"],
            "",
        ]);
    });

    it("extracts sequence (extractSequence)", () => {
        const extractor = extractSequence(
            [extractNumber(), extractWhitespace1(), extractNumber()] as const,
            ([a, _, b]) => [a, b],
        );
        const [extracted, rest] = extractor("5 10 a");
        expect(extracted).toEqual([5, 10]);
        expect(rest).toBe(" a");
    });

    it("can't extract sequence (extractSequence)", () => {
        const extractor = extractSequence(
            [extractNumber()] as const,
            (_) => true,
        );
        const [extracted, rest] = extractor("NaN");
        expect(extracted).toBeNull();
        expect(rest).toBe("NaN");
    });

    it("can't extract sequence, failing at second extractor (extractSequence)", () => {
        const extractor = extractSequence(
            [extractToken("hello"), extractToken("world")] as const,
            (_) => true,
        );
        const [extracted, rest] = extractor("hello world");
        expect(extracted).toBeNull();
        expect(rest).toBe("hello world");
    });
});
