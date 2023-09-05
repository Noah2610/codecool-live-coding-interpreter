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
});
