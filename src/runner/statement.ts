import { expectNever } from "ts-expect";
import { PrimitiveExpression } from "../parser/expression";
import { Statement } from "../parser/statement";
import { Context } from "./context";
import { runExpression } from "./expression";

export function runStatement(
    statement: Statement,
    context: Context,
): PrimitiveExpression | null {
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
        default: {
            expectNever(statement);
        }
    }
}
