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

    it("can't parse number expression with invalid decorative delimiters", () => {
        expect(parseExpression(".100")).toEqual([null, ".100"]);
        expect(parseExpression("100.")).toEqual([null, "100."]);
        expect(parseExpression("1..00")).toEqual([null, "1..00"]);
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

    it("parses variableReference", () => {
        expect(parseExpression("/Meine Variable/")).toEqual([
            { type: "variableReference", identifier: "Meine Variable" },
            "",
        ]);
        expect(parseExpression("/ Toller  Wert   mit    Abständen/")).toEqual([
            {
                type: "variableReference",
                identifier: "Toller Wert mit Abständen",
            },
            "",
        ]);
    });

    it("parses functionCall expression without parameters", () => {
        const parsed = parseExpression("mach Berechnen");
        expect(parsed).toEqual([
            {
                type: "functionCall",
                identifier: "Berechnen",
                parameters: [],
            },
            "",
        ]);
    });

    it("parses functionCall expression with one parameter", () => {
        const parsed = parseExpression("mach Verdoppeln mit 5");
        expect(parsed).toEqual([
            {
                type: "functionCall",
                identifier: "Verdoppeln",
                parameters: [{ type: "number", value: 5 }],
            },
            "",
        ]);
    });

    it("parses functionCall expression with two parameters", () => {
        const parsed = parseExpression("mach Addiere die Zahlen mit 5 und 10");
        expect(parsed).toEqual([
            {
                type: "functionCall",
                identifier: "Addiere die Zahlen",
                parameters: [
                    { type: "number", value: 5 },
                    { type: "number", value: 10 },
                ],
            },
            "",
        ]);
    });

    it("parses functionCall expression with three parameters", () => {
        const parsed = parseExpression("mach Nimm 3 mit 1, 2 und 3");
        expect(parsed).toEqual([
            {
                type: "functionCall",
                identifier: "Nimm 3",
                parameters: [
                    { type: "number", value: 1 },
                    { type: "number", value: 2 },
                    { type: "number", value: 3 },
                ],
            },
            "",
        ]);
    });
});
