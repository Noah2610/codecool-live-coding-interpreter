import { expectNever } from "ts-expect";
import { PrimitiveExpression } from "../parser/expression";
import { Statement } from "../parser/statement";
import { Context } from "./context";
import { runExpression } from "./expression";

type StatementReturn = {
    isReturn: true;
    value: PrimitiveExpression;
};

export function runStatement(
    statement: Statement,
    context: Context,
): PrimitiveExpression | StatementReturn | null {
    switch (statement.type) {
        case "expression": {
            return runExpression(statement.value, context);
        }
        case "variableDefinition": {
            const identifier = statement.identifier;
            const expression = statement.value;
            context.setVariable(identifier, runExpression(expression, context));
            return null;
        }
        case "functionDefinition": {
            context.setFunction(statement);
            return null;
        }
        case "return": {
            return {
                isReturn: true,
                value: runExpression(statement.value, context),
            };
        }
        case "print": {
            for (const expr of statement.values) {
                const value = runExpression(expr, context);
                console.log(value.type === "null" ? null : value.value);
            }
            return null;
        }
        case "condition": {
            throw new Error("unimplemented condition");
        }
        default: {
            expectNever(statement);
        }
    }
}
