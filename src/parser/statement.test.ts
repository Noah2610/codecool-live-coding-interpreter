import { parseStatement } from "./statement";

describe("parse statements", () => {
    it("parses expression statement", () => {
        const parsed = parseStatement("wahr!");
        expect(parsed).toEqual([
            {
                type: "expression",
                value: { type: "boolean", value: true },
            },
            "",
        ]);
    });

    it("can't parse expression statement without terminator (!)", () => {
        const parsed = parseStatement("wahr");
        expect(parsed).toEqual([null, "wahr"]);
    });

    it("parses variableDefinition statement", () => {
        const parsed = parseStatement("die Sprache ist wahr!");
        expect(parsed).toEqual([
            {
                type: "variableDefinition",
                identifier: "Sprache",
                value: { type: "boolean", value: true },
            },
            "",
        ]);
    });

    it("parses variableDefinition statement with multiple words", () => {
        const parsed = parseStatement("die tolle, grüne Wiese ist wahr!");
        expect(parsed).toEqual([
            {
                type: "variableDefinition",
                identifier: "tolle, grüne Wiese",
                value: { type: "boolean", value: true },
            },
            "",
        ]);
    });

    it("parses variableDefinition statement with multiple, sequential spaces", () => {
        const parsed = parseStatement("die tolle   Wiese ist wahr!");
        expect(parsed).toEqual([
            {
                type: "variableDefinition",
                identifier: "tolle Wiese",
                value: { type: "boolean", value: true },
            },
            "",
        ]);
    });

    it("parses variableReference expression statement", () => {
        const parsed = parseStatement("/Meine Variable/!");
        expect(parsed).toEqual([
            {
                type: "expression",
                value: {
                    type: "variableReference",
                    identifier: "Meine Variable",
                },
            },
            "",
        ]);
    });

    it("parses functionDefinition statement without parameters", () => {
        const parsed = parseStatement(`
            die Funktion Ausführen macht
                wahr!
            und endet hier!`);
        const expected = {
            type: "functionDefinition",
            identifier: "Ausführen",
            parameters: [],
            body: [
                {
                    type: "expression",
                    value: { type: "boolean", value: true },
                },
            ],
        };
        expect(parsed).toEqual([expected, ""]);
    });

    it("parses functionDefinition statement with one parameter", () => {
        const parsed = parseStatement(`
            die Funktion Verdoppeln kriegt Zahl und macht
                das Produkt aus /Zahl/ und 2!
            und endet hier!`);
        const expected = {
            type: "functionDefinition",
            identifier: "Verdoppeln",
            parameters: ["Zahl"],
            body: [
                {
                    type: "expression",
                    value: {
                        type: "operation",
                        op: "*",
                        lhs: { type: "variableReference", identifier: "Zahl" },
                        rhs: { type: "number", value: 2 },
                    },
                },
            ],
        };
        expect(parsed).toEqual([expected, ""]);
    });

    it("parses functionDefinition statement with two parameters", () => {
        const parsed = parseStatement(`
            die Funktion Addiere die Zahlen kriegt Erste und Zweite und macht
                die Summe von /Erste/ und /Zweite/!
            und endet hier!`);
        const expected = {
            type: "functionDefinition",
            identifier: "Addiere die Zahlen",
            parameters: ["Erste", "Zweite"],
            body: [
                {
                    type: "expression",
                    value: {
                        type: "operation",
                        op: "+",
                        lhs: { type: "variableReference", identifier: "Erste" },
                        rhs: {
                            type: "variableReference",
                            identifier: "Zweite",
                        },
                    },
                },
            ],
        };
        expect(parsed).toEqual([expected, ""]);
    });

    it("parses functionDefinition statement with three parameters", () => {
        const parsed = parseStatement(`
            die Funktion Nimm 3 kriegt eins, zwei und drei und macht
                die Summe von /eins/ und /zwei/!
                die Summe von /eins/ und /drei/!
            und endet hier!`);
        const expected = {
            type: "functionDefinition",
            identifier: "Nimm 3",
            parameters: ["eins", "zwei", "drei"],
            body: [
                {
                    type: "expression",
                    value: {
                        type: "operation",
                        op: "+",
                        lhs: { type: "variableReference", identifier: "eins" },
                        rhs: { type: "variableReference", identifier: "zwei" },
                    },
                },
                {
                    type: "expression",
                    value: {
                        type: "operation",
                        op: "+",
                        lhs: { type: "variableReference", identifier: "eins" },
                        rhs: { type: "variableReference", identifier: "drei" },
                    },
                },
            ],
        };
        expect(parsed).toEqual([expected, ""]);
    });
});
