import { parseExpression } from "./index";

describe("parser", () => {
    it("parses number expression", () => {
        const parsed = parseExpression("123");
        expect(parsed).toEqual([{ type: "number", value: 123 }, ""]);
    });

    it("can't empty number expression", () => {
        const parsed = parseExpression("");
        expect(parsed).toEqual([null, ""]);
    });

    it("parses boolean expression", () => {
        const parsedTrue = parseExpression("wahr");
        expect(parsedTrue).toEqual([{ type: "boolean", value: true }, ""]);
        const parsedFalse = parseExpression("falsch");
        expect(parsedFalse).toEqual([{ type: "boolean", value: false }, ""]);
    });

    it("parses string expression", () => {
        const parsed = parseExpression('"Hallo Welt."');
        expect(parsed).toEqual([{ type: "string", value: "Hallo Welt." }, ""]);
    });

    it('parses string with escaped quote (\\")', () => {
        const parsed = parseExpression('"Hallo \\"Welt\\"."');
        expect(parsed).toEqual([{ type: "string", value: 'Hallo "Welt".' }, ""]);
    });

    it('parses string with escaped backslash (\\\\)', () => {
        const parsed = parseExpression('"Hallo \\\\Welt."');
        expect(parsed).toEqual([{ type: "string", value: "Hallo \\Welt." }, ""]);
    });
});
