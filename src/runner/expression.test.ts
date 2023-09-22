import { runExpression } from "./expression";
import { Expression } from "../parser/expression";
import { Context } from "./context";
import * as node from "../node";

describe("runner", () => {
    let context: Context;

    beforeEach(() => {
        context = new Context();
    });

    it("runs boolean expression", () => {
        const result = runExpression({ type: "boolean", value: true }, context);
        expect(result).toBeTruthy();
    });

    it("runs number expression", () => {
        const result = runExpression({ type: "number", value: 123 }, context);
        expect(result).toBeTruthy();
    });

    it("runs string expression", () => {
        const result = runExpression(
            { type: "string", value: "Hallo" },
            context,
        );
        expect(result).toBeTruthy();
    });

    it("runs plus operation expression", () => {
        const exp: Expression = {
            type: "operation",
            op: "+",
            lhs: { type: "number", value: 10 },
            rhs: { type: "number", value: 20 },
        };
        const result = runExpression(exp, context);
        expect(result).toEqual({ type: "number", value: 30 });
    });

    it("runs minus operation expression", () => {
        const exp: Expression = {
            type: "operation",
            op: "-",
            lhs: { type: "number", value: 20 },
            rhs: { type: "number", value: 10 },
        };
        const result = runExpression(exp, context);
        expect(result).toEqual({ type: "number", value: 10 });
    });

    it("runs multiplication operation expression", () => {
        const exp: Expression = {
            type: "operation",
            op: "*",
            lhs: { type: "number", value: 3 },
            rhs: { type: "number", value: 5 },
        };
        const result = runExpression(exp, context);
        expect(result).toEqual({ type: "number", value: 15 });
    });

    it("runs division operation expression", () => {
        const exp: Expression = {
            type: "operation",
            op: "/",
            lhs: { type: "number", value: 12 },
            rhs: { type: "number", value: 3 },
        };
        const result = runExpression(exp, context);
        expect(result).toEqual({ type: "number", value: 4 });
    });

    it("runs variableReference expression", () => {
        context.setVariable("Meine Variable", { type: "boolean", value: true });

        const exp: Expression = {
            type: "variableReference",
            identifier: "Meine Variable",
        };
        const result = runExpression(exp, context);
        expect(result).toEqual({ type: "boolean", value: true });
    });

    it("runs functionCall expression without parameters", () => {
        context.setFunction({
            type: "functionDefinition",
            identifier: "Ausführen",
            parameters: [],
            body: [
                {
                    type: "expression",
                    value: { type: "boolean", value: true },
                },
            ],
        });

        const exp: Expression = {
            type: "functionCall",
            identifier: "Ausführen",
            parameters: [],
        };

        const result = runExpression(exp, context);
        expect(result).toBeTruthy();
    });

    it("runs functionCall expression with parameters", () => {
        context.setFunction({
            type: "functionDefinition",
            identifier: "Addiere",
            parameters: ["eins", "zwei"],
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
            ],
        });

        const exp: Expression = {
            type: "functionCall",
            identifier: "Addiere",
            parameters: [
                { type: "number", value: 1 },
                { type: "number", value: 2 },
            ],
        };

        const result = runExpression(exp, context);
        expect(result).toBeTruthy();
    });

    it("doesn't run functionCall expression with missing parameters", () => {
        context.setFunction({
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
        });

        const exp: Expression = {
            type: "functionCall",
            identifier: "Verdoppeln",
            parameters: [],
        };

        expect(() => runExpression(exp, context)).toThrow();
    });

    it("runs functionCall with return value", () => {
        context.setFunction({
            identifier: "Gib Hallo",
            type: "functionDefinition",
            parameters: [],
            body: [
                {
                    type: "return",
                    value: {
                        type: "string",
                        value: "Hallo Welt",
                    },
                },
            ],
        });

        const result = runExpression(
            {
                type: "functionCall",
                identifier: "Gib Hallo",
                parameters: [],
            },
            context,
        );

        expect(result).toEqual({ type: "string", value: "Hallo Welt" });
    });

    it("runs equality comparison operation expression", () => {
        expect(
            runExpression(
                node.operation("eq", node.num(1), node.num(1)),
                context,
            ),
        ).toEqual(node.bool(true));
        expect(
            runExpression(
                node.operation("eq", node.num(1), node.num(2)),
                context,
            ),
        ).toEqual(node.bool(false));
    });

    it("runs inequality comparison operation expression", () => {
        expect(
            runExpression(
                node.operation("neq", node.num(1), node.num(1)),
                context,
            ),
        ).toEqual(node.bool(false));
        expect(
            runExpression(
                node.operation("neq", node.num(1), node.num(2)),
                context,
            ),
        ).toEqual(node.bool(true));
    });

    it("runs greater than comparison operation expression", () => {
        expect(
            runExpression(
                node.operation("gt", node.num(2), node.num(1)),
                context,
            ),
        ).toEqual(node.bool(true));
        expect(
            runExpression(
                node.operation("gt", node.num(1), node.num(2)),
                context,
            ),
        ).toEqual(node.bool(false));
        expect(
            runExpression(
                node.operation("gt", node.num(1), node.num(1)),
                context,
            ),
        ).toEqual(node.bool(false));
    });

    it("runs greater than or equals comparison operation expression", () => {
        expect(
            runExpression(
                node.operation("gte", node.num(2), node.num(1)),
                context,
            ),
        ).toEqual(node.bool(true));
        expect(
            runExpression(
                node.operation("gte", node.num(1), node.num(2)),
                context,
            ),
        ).toEqual(node.bool(false));
        expect(
            runExpression(
                node.operation("gte", node.num(1), node.num(1)),
                context,
            ),
        ).toEqual(node.bool(true));
    });

    it("runs less than comparison operation expression", () => {
        expect(
            runExpression(
                node.operation("lt", node.num(1), node.num(2)),
                context,
            ),
        ).toEqual(node.bool(true));
        expect(
            runExpression(
                node.operation("lt", node.num(2), node.num(1)),
                context,
            ),
        ).toEqual(node.bool(false));
        expect(
            runExpression(
                node.operation("lt", node.num(1), node.num(1)),
                context,
            ),
        ).toEqual(node.bool(false));
    });

    it("runs less than or equals comparison operation expression", () => {
        expect(
            runExpression(
                node.operation("lte", node.num(1), node.num(2)),
                context,
            ),
        ).toEqual(node.bool(true));
        expect(
            runExpression(
                node.operation("lte", node.num(2), node.num(1)),
                context,
            ),
        ).toEqual(node.bool(false));
        expect(
            runExpression(
                node.operation("lte", node.num(1), node.num(1)),
                context,
            ),
        ).toEqual(node.bool(true));
    });

    it("runs logical and operation expression", () => {
        expect(
            runExpression(
                node.operation("and", node.bool(true), node.bool(true)),
                context,
            ),
        ).toEqual(node.bool(true));
        expect(
            runExpression(
                node.operation("and", node.bool(true), node.bool(false)),
                context,
            ),
        ).toEqual(node.bool(false));
        expect(
            runExpression(
                node.operation("and", node.bool(false), node.bool(false)),
                context,
            ),
        ).toEqual(node.bool(false));
    });

    it("runs logical or operation expression", () => {
        expect(
            runExpression(
                node.operation("or", node.bool(true), node.bool(true)),
                context,
            ),
        ).toEqual(node.bool(true));
        expect(
            runExpression(
                node.operation("or", node.bool(true), node.bool(false)),
                context,
            ),
        ).toEqual(node.bool(true));
        expect(
            runExpression(
                node.operation("or", node.bool(false), node.bool(false)),
                context,
            ),
        ).toEqual(node.bool(false));
    });
});
