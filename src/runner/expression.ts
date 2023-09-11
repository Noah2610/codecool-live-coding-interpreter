import { expectNever } from "ts-expect";
import {
    Expression,
    OperationExpression,
    PrimitiveExpression,
} from "../parser/expression";
import { Context } from "./context";

export function runExpression(
    expression: Expression,
    context: Context,
): PrimitiveExpression {
    switch (expression.type) {
        case "boolean": {
            return expression;
        }
        case "number": {
            return expression;
        }
        case "string": {
            return expression;
        }
        case "operation": {
            return runOperationExpression(expression, context);
        }
        case "variableReference": {
            const identifier = expression.identifier;
            const value = context.getVariable(identifier);
            if (value === null) {
                throw new Error(`[run variableReference] Variable with name "${identifier}" does not exist`);
            }
            return value;
        }
        default: {
            expectNever(expression);
        }
    }
}

function runOperationExpression(
    expression: OperationExpression,
    context: Context,
): PrimitiveExpression {
    const left = runExpression(expression.lhs, context);
    if (left.type !== "number") {
        throw new Error(
            "[Unimplemented runOperationExpression] Expected operation to get number for lhs and rhs",
        );
    }
    const right = runExpression(expression.rhs, context);
    if (right.type !== "number") {
        throw new Error(
            "[Unimplemented runOperationExpression] Expected operation to get number for lhs and rhs",
        );
    }

    let result: number;

    switch (expression.op) {
        case "+": {
            result = left.value + right.value;
            break;
        }
        case "-": {
            result = left.value - right.value;
            break;
        }
        case "*": {
            result = left.value * right.value;
            break;
        }
        case "/": {
            result = left.value / right.value;
            break;
        }
    }

    return {
        type: "number",
        value: result,
    };
}
