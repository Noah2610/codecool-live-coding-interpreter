import {
    extractIdentifierUntil,
    extractToken,
    extractWhile,
    extractWhile1,
    extractWhitespace,
    extractWhitespace1,
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

    it("extracts identifier (extractIdentifierUntil)", () => {
        expect(extractIdentifierUntil("Meine Variable ist", " ist")).toEqual([
            "Meine Variable",
            "",
        ]);
        expect(extractIdentifierUntil("Dieser Wert ist 123", " ist")).toEqual([
            "Dieser Wert",
            " 123",
        ]);
        expect(extractIdentifierUntil("  Mein   Etwas   ist something", " ist")).toEqual([
            "Mein Etwas",
            " something",
        ]);
    });
});
