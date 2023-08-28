import { NumberExpression, parseExpression } from "./expression";

describe("parse expressions", () => {
    it("parses number expression", () => {
        const parsed = parseExpression("123");
        expect(parsed).toEqual([{ type: "number", value: 123 }, ""]);
    });

    it("parses floating point number expression", () => {
        const [exp, rest] = parseExpression("1,23");
        expect(exp).not.toBeNull();
        expect(exp!.type).toBe("number");
        expect((exp as NumberExpression).value).toBeCloseTo(1.23);
        expect(rest).toBe("");
    });

    it("parses number expression with decorative delimiters", () => {
        const parsed = parseExpression("100.000.000");
        expect(parsed).toEqual([{ type: "number", value: 100_000_000 }, ""]);
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
        expect(parsed).toEqual([
            { type: "string", value: 'Hallo "Welt".' },
            "",
        ]);
    });

    it("parses string with escaped backslash (\\\\)", () => {
        const parsed = parseExpression('"Hallo \\\\Welt."');
        expect(parsed).toEqual([
            { type: "string", value: "Hallo \\Welt." },
            "",
        ]);
    });

    it("parses plus operation", () => {
        const parsed = parseExpression("die Summe von 10 und 20");
        expect(parsed).toEqual([
            {
                type: "operation",
                op: "+",
                lhs: { type: "number", value: 10 },
                rhs: { type: "number", value: 20 },
            },
            "",
        ]);
    });

    it("parses minus operation", () => {
        const parsed = parseExpression("die Differenz von 20 und 10");
        expect(parsed).toEqual([
            {
                type: "operation",
                op: "-",
                lhs: { type: "number", value: 20 },
                rhs: { type: "number", value: 10 },
            },
            "",
        ]);
    });

    it("parses multiplication operation", () => {
        const parsed = parseExpression("das Produkt aus 2 und 3");
        expect(parsed).toEqual([
            {
                type: "operation",
                op: "*",
                lhs: { type: "number", value: 2 },
                rhs: { type: "number", value: 3 },
            },
            "",
        ]);
    });

    it("parses division operation", () => {
        const parsed = parseExpression("der Quotient von 10 und 2");
        expect(parsed).toEqual([
            {
                type: "operation",
                op: "/",
                lhs: { type: "number", value: 10 },
                rhs: { type: "number", value: 2 },
            },
            "",
        ]);
    });
});
