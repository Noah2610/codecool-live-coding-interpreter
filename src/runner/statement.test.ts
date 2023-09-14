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

    it("runs a functionDefinition statement", () => {
        runStatement(
            {
                type: "functionDefinition",
                identifier: "Ausführen",
                parameters: [],
                body: [
                    {
                        type: "expression",
                        value: { type: "boolean", value: true },
                    },
                ],
            },
            context,
        );

        const func = context.getFunction("Ausführen")!;
        expect(func).toBeTruthy();
        expect(func.identifier).toBe("Ausführen");
        expect(func.parameters).toEqual([]);
        expect(func.body).toEqual([
            { type: "expression", value: { type: "boolean", value: true } },
        ]);
    });
});
