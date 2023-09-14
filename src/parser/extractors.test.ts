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
} from "./extractors";

describe("extractors", () => {
    it("extracts token 'hello'", () => {
        const extracted = extractToken("hello world", "hello");
        expect(extracted).toEqual(["hello", " world"]);
    });

    it("can't extract missing token", () => {
        const extracted = extractToken("foo bar", "hello");
        expect(extracted).toEqual([null, "foo bar"]);
    });

    it("extracts while letter is lowercase", () => {
        const extracted = extractWhile(
            "helloWorld",
            (c) => c === c.toLowerCase(),
        );
        expect(extracted).toEqual(["hello", "World"]);
    });

    it("can't extract at least one lowercase letter (extractWhile1)", () => {
        const extracted = extractWhile1("Hello", (c) => c === c.toLowerCase());
        expect(extracted).toEqual([null, "Hello"]);
    });

    it("extracts whitespace", () => {
        expect(extractWhitespace("foo")).toEqual(["", "foo"]);
        expect(extractWhitespace("  foo")).toEqual(["  ", "foo"]);
        expect(extractWhitespace("\n\tfoo")).toEqual(["\n\t", "foo"]);
        expect(extractWhitespace("\r\n\tfoo")).toEqual(["\r\n\t", "foo"]);
    });

    it("extracts at least one whitespace (extractWhitespace1)", () => {
        expect(extractWhitespace1("foo")).toEqual([null, "foo"]);
        expect(extractWhitespace1("  foo")).toEqual(["  ", "foo"]);
    });

    it("extracts until terminator (extractUntil)", () => {
        expect(extractUntil("Hallo Welt!", "!")).toEqual(["Hallo Welt", ""]);
        expect(extractUntil("Hallo Welt", "!")).toEqual([null, "Hallo Welt"]);
    });

    it("formats identifier", () => {
        expect(formatIdentifier("Hallo Welt")).toBe("Hallo Welt");
        expect(formatIdentifier("Hallo   Welt")).toBe("Hallo Welt");
        expect(formatIdentifier("  Hallo Welt  ")).toBe("Hallo Welt");
    });

    it("extracts identifier (extractIdentifierUntil)", () => {
        expect(extractIdentifierUntil("Meine Variable ist", " ist")).toEqual([
            "Meine Variable",
            "",
        ]);
        expect(extractIdentifierUntil("Dieser Wert ist 123", " ist")).toEqual([
            "Dieser Wert",
            " 123",
        ]);
        expect(
            extractIdentifierUntil("  Mein   Etwas   ist something", " ist"),
        ).toEqual(["Mein Etwas", " something"]);
    });

    it("doesn't extract identifier with missing terminator (extractIdentifierUntil)", () => {
        expect(extractIdentifierUntil("Meine Variable", "!")).toEqual([
            null,
            "Meine Variable",
        ]);
    });

    it('extracts comma-delimited list (extractDelimitedList with ",")', () => {
        const extracted = extractDelimitedList(
            "hello, world, comma-delimited list END",
            ",",
            " END",
        );
        expect(extracted).toEqual([
            ["hello", "world", "comma-delimited list"],
            "",
        ]);
    });

    it('extracts word-delimited list (extractDelimitedList with "und")', () => {
        const extracted = extractDelimitedList(
            "hallo und welt END",
            " und ",
            " END",
        );
        expect(extracted).toEqual([["hallo", "welt"], ""]);
    });

    it("extracts lists", () => {
        expect(extractList("hallo END", " END")).toEqual([["hallo"], ""]);
        expect(extractList("hallo und Welt END", " END")).toEqual([
            ["hallo", "Welt"],
            "",
        ]);
        expect(extractList("hallo, tolle und Welt END", " END")).toEqual([
            ["hallo", "tolle", "Welt"],
            "",
        ]);
    });

    it("doesn't extract invalid lists", () => {
        expect(extractList("hallo, Welt END", " END")).toEqual([
            null,
            "hallo, Welt END",
        ]);
        expect(extractList("hallo und tolle und Welt END", " END")).toEqual([
            null,
            "hallo und tolle und Welt END",
        ]);
    });

    it('extracts list with terminator including "und"', () => {
        expect(
            extractList("hallo, tolle und Welt und ende", " und ende"),
        ).toEqual([["hallo", "tolle", "Welt"], ""]);
    });
});
