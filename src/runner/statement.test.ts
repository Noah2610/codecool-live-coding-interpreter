import { Context } from "./context";
import { runStatement } from "./statement";

describe("run statements", () => {
    let context: Context;

    beforeEach(() => {
        context = new Context();
    });

    it("runs an expression statement", () => {
        const result = runStatement(
            {
                type: "expression",
                value: { type: "boolean", value: true },
            },
            context,
        );
        expect(result).toEqual({ type: "boolean", value: true });
    });

    it("runs a variableDefinition statement", () => {
        const result = runStatement(
            {
                type: "variableDefinition",
                identifier: "Meine Variable",
                value: { type: "boolean", value: true },
            },
            context,
        );
        expect(result).toBeNull();
        expect(context.getVariable("Meine Variable")).toEqual({
            type: "boolean",
            value: true,
        });
    });
});
