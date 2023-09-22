import * as node from "../node";
import { NumberExpression, parseExpression } from "./expression";

describe("parse expressions", () => {
    it("parses number expression", () => {
        const parsed = parseExpression("123");
        expect(parsed).toEqual([{ type: "number", value: 123 }, ""]);
    });

    // TODO: parsing floating-point numbers has issues with parsing lists
    //       ex.: "1, 1,23, 2 und 3"
    //       possible solution: make list parsing delimiter ", "
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

    it("parses null expression", () => {
        const parsed = parseExpression("nix");
        expect(parsed).toEqual([{ type: "null" }, ""]);
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
        const parsed = parseExpression("führe Berechnen aus");
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
        const parsed = parseExpression("führe Verdoppeln mit 5 aus");
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
        const parsed = parseExpression(
            "führe Addiere die Zahlen mit 5 und 10 aus",
        );
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
        const parsed = parseExpression("führe Nimm 3 mit 1, 2 und 3 aus");
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

    it("parses equality comparison operation expression", () => {
        const parsed = parseExpression("wahr gleich falsch");
        expect(parsed).toEqual([
            {
                type: "operation",
                op: "eq",
                lhs: { type: "boolean", value: true },
                rhs: { type: "boolean", value: false },
            },
            "",
        ]);
    });

    it("parses inequality comparison operation expression", () => {
        const parsed = parseExpression("wahr nicht gleich falsch");
        expect(parsed).toEqual([
            {
                type: "operation",
                op: "neq",
                lhs: { type: "boolean", value: true },
                rhs: { type: "boolean", value: false },
            },
            "",
        ]);
    });

    it("parses greater than comparison operation expression", () => {
        const parsed = parseExpression("10 größer als 5");
        expect(parsed).toEqual([
            {
                type: "operation",
                op: "gt",
                lhs: { type: "number", value: 10 },
                rhs: { type: "number", value: 5 },
            },
            "",
        ]);
    });

    it("parses greater than equal comparison operation expression", () => {
        const parsed = parseExpression("10 größer als oder gleich 5");
        expect(parsed).toEqual([
            {
                type: "operation",
                op: "gte",
                lhs: { type: "number", value: 10 },
                rhs: { type: "number", value: 5 },
            },
            "",
        ]);
    });

    it("parses less than comparison operation expression", () => {
        const parsed = parseExpression("5 kleiner als 10");
        expect(parsed).toEqual([
            {
                type: "operation",
                op: "lt",
                lhs: { type: "number", value: 5 },
                rhs: { type: "number", value: 10 },
            },
            "",
        ]);
    });

    it("parses less than equal comparison operation expression", () => {
        const parsed = parseExpression("5 kleiner als oder gleich 10");
        expect(parsed).toEqual([
            {
                type: "operation",
                op: "lte",
                lhs: { type: "number", value: 5 },
                rhs: { type: "number", value: 10 },
            },
            "",
        ]);
    });

    it("parses logical and operation expression", () => {
        const parsed = parseExpression("wahr und falsch");
        expect(parsed).toEqual([
            {
                type: "operation",
                op: "and",
                lhs: { type: "boolean", value: true },
                rhs: { type: "boolean", value: false },
            },
            "",
        ]);
    });

    it("parses logical or operation expression", () => {
        const parsed = parseExpression("wahr oder falsch");
        expect(parsed).toEqual([
            {
                type: "operation",
                op: "or",
                lhs: { type: "boolean", value: true },
                rhs: { type: "boolean", value: false },
            },
            "",
        ]);
    });

    it("parses concat string operation expression", () => {
        const parsed = parseExpression(
            'die Verknüpfung zwischen "Hallo" und " Welt"',
        );
        expect(parsed).toEqual([
            node.operation("concat", node.str("Hallo"), node.str(" Welt")),
            "",
        ]);
    });
});
