import { parseExpression } from "./index";

describe("parser", () => {
    it("parses number expression", () => {
        const parsed = parseExpression("123");
        expect(parsed).toEqual([{ type: "number", value: 123 }, ""]);
    });

    it("parses boolean expression", () => {
        const parsedTrue = parseExpression("true");
        expect(parsedTrue).toEqual([{ type: "boolean", value: true }, ""]);
        const parsedFalse = parseExpression("false");
        expect(parsedFalse).toEqual([{ type: "boolean", value: false }, ""]);
    });
});
