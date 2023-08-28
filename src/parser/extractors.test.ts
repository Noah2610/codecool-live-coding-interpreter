import { extractToken, extractWhile, extractWhile1 } from "./extractors";

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
});
