import { runExpression } from "./expression";
import { Expression } from "../parser/expression";
import { Context } from "./context";

describe("runner", () => {
    it("runs boolean expression", () => {
        const result = runExpression({ type: "boolean", value: true });
        expect(result).toBeTruthy();
    });

    it("runs number expression", () => {
        const result = runExpression({ type: "number", value: 123 });
        expect(result).toBeTruthy();
    });

    it("runs string expression", () => {
        const result = runExpression({ type: "string", value: "Hallo" });
        expect(result).toBeTruthy();
    });

    it("runs plus operation expression", () => {
        const exp: Expression = {
            type: "operation",
            op: "+",
            lhs: { type: "number", value: 10 },
            rhs: { type: "number", value: 20 },
        };
        const result = runExpression(exp);
        expect(result).toEqual({ type: "number", value: 30 });
    });

    it("runs minus operation expression", () => {
        const exp: Expression = {
            type: "operation",
            op: "-",
            lhs: { type: "number", value: 20 },
            rhs: { type: "number", value: 10 },
        };
        const result = runExpression(exp);
        expect(result).toEqual({ type: "number", value: 10 });
    });

    it("runs multiplication operation expression", () => {
        const exp: Expression = {
            type: "operation",
            op: "*",
            lhs: { type: "number", value: 3 },
            rhs: { type: "number", value: 5 },
        };
        const result = runExpression(exp);
        expect(result).toEqual({ type: "number", value: 15 });
    });

    it("runs division operation expression", () => {
        const exp: Expression = {
            type: "operation",
            op: "/",
            lhs: { type: "number", value: 12 },
            rhs: { type: "number", value: 3 },
        };
        const result = runExpression(exp);
        expect(result).toEqual({ type: "number", value: 4 });
    });

    it("runs variableReference", () => {
        const context = new Context();
        context.setVariable("Meine Variable", { type: "boolean", value: true });

        const exp: Expression = {
            type: "variableReference",
            identifier: "Meine Variable",
        };
        const result = runExpression(exp, context);
        expect(result).toEqual({ type: "boolean", value: true });
    });
});
