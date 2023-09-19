import { Context } from "./context";
import { runStatement } from "./statement";
import * as node from "../node";

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

    it("runs print statement", () => {
        const origLog = console.log;
        console.log = jest.fn();

        runStatement(
            {
                type: "print",
                values: [
                    { type: "string", value: "Zeichenkette" },
                    { type: "boolean", value: true },
                    { type: "number", value: 123 },
                    { type: "null" },
                    { type: "boolean", value: false },
                ],
            },
            context,
        );

        expect(console.log).toHaveBeenNthCalledWith(1, "Zeichenkette");
        expect(console.log).toHaveBeenNthCalledWith(2, true);
        expect(console.log).toHaveBeenNthCalledWith(3, 123);
        expect(console.log).toHaveBeenNthCalledWith(4, null);
        expect(console.log).toHaveBeenNthCalledWith(5, false);

        console.log = origLog;
    });

    it("runs condition statement", () => {
        const origLog = console.log;

        const condTrue = node.condition(
            node.conditional(node.bool(true), [
                node.printKeyword([node.str("True")]),
            ]),
            null,
            null,
        );

        console.log = jest.fn();
        runStatement(condTrue, context);
        expect(console.log).toHaveBeenCalledWith("True");

        const condFalse = node.condition(
            node.conditional(node.bool(false), [
                node.printKeyword([node.str("True")]),
            ]),
            null,
            null,
        );

        console.log = jest.fn();
        runStatement(condFalse, context);
        expect(console.log).not.toHaveBeenCalledWith("True");

        console.log = origLog;
    });

    it("runs condition statement with else", () => {
        const origLog = console.log;

        const condTrue = node.condition(
            node.conditional(node.bool(true), [
                node.printKeyword([node.str("True")]),
            ]),
            null,
            [node.printKeyword([node.str("Else")])],
        );

        console.log = jest.fn();
        runStatement(condTrue, context);
        expect(console.log).not.toHaveBeenCalledWith("Else");

        const condFalse = node.condition(
            node.conditional(node.bool(false), [
                node.printKeyword([node.str("True")]),
            ]),
            null,
            [node.printKeyword([node.str("Else")])],
        );

        console.log = jest.fn();
        runStatement(condFalse, context);
        expect(console.log).toHaveBeenCalledWith("Else");

        console.log = origLog;
    });

    it("runs condition statement with else-ifs and else", () => {
        const origLog = console.log;

        const condTrue = node.condition(
            node.conditional(node.bool(true), [
                node.printKeyword([node.str("True")]),
            ]),
            [
                node.conditional(node.bool(true), [
                    node.printKeyword([node.str("ElseIf1")]),
                ]),
                node.conditional(node.bool(true), [
                    node.printKeyword([node.str("ElseIf2")]),
                ]),
            ],
            [node.printKeyword([node.str("Else")])],
        );

        console.log = jest.fn();
        runStatement(condTrue, context);
        expect(console.log).toHaveBeenCalledWith("True");
        expect(console.log).not.toHaveBeenCalledWith("ElseIf1");
        expect(console.log).not.toHaveBeenCalledWith("ElseIf2");
        expect(console.log).not.toHaveBeenCalledWith("Else");

        const condElseIf1 = node.condition(
            node.conditional(node.bool(false), [
                node.printKeyword([node.str("True")]),
            ]),
            [
                node.conditional(node.bool(true), [
                    node.printKeyword([node.str("ElseIf1")]),
                ]),
                node.conditional(node.bool(true), [
                    node.printKeyword([node.str("ElseIf2")]),
                ]),
            ],
            [node.printKeyword([node.str("Else")])],
        );

        console.log = jest.fn();
        runStatement(condElseIf1, context);
        expect(console.log).not.toHaveBeenCalledWith("True");
        expect(console.log).toHaveBeenCalledWith("ElseIf1");
        expect(console.log).not.toHaveBeenCalledWith("ElseIf2");
        expect(console.log).not.toHaveBeenCalledWith("Else");

        const condElseIf2 = node.condition(
            node.conditional(node.bool(false), [
                node.printKeyword([node.str("True")]),
            ]),
            [
                node.conditional(node.bool(false), [
                    node.printKeyword([node.str("ElseIf1")]),
                ]),
                node.conditional(node.bool(true), [
                    node.printKeyword([node.str("ElseIf2")]),
                ]),
            ],
            [node.printKeyword([node.str("Else")])],
        );

        console.log = jest.fn();
        runStatement(condElseIf2, context);
        expect(console.log).not.toHaveBeenCalledWith("True");
        expect(console.log).not.toHaveBeenCalledWith("ElseIf1");
        expect(console.log).toHaveBeenCalledWith("ElseIf2");
        expect(console.log).not.toHaveBeenCalledWith("Else");

        const condElse = node.condition(
            node.conditional(node.bool(false), [
                node.printKeyword([node.str("True")]),
            ]),
            [
                node.conditional(node.bool(false), [
                    node.printKeyword([node.str("ElseIf1")]),
                ]),
                node.conditional(node.bool(false), [
                    node.printKeyword([node.str("ElseIf2")]),
                ]),
            ],
            [node.printKeyword([node.str("Else")])],
        );

        console.log = jest.fn();
        runStatement(condElse, context);
        expect(console.log).not.toHaveBeenCalledWith("True");
        expect(console.log).not.toHaveBeenCalledWith("ElseIf1");
        expect(console.log).not.toHaveBeenCalledWith("ElseIf2");
        expect(console.log).toHaveBeenCalledWith("Else");

        console.log = origLog;
    });
});
