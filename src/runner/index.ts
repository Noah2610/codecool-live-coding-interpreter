import { expectNever } from "ts-expect";
import { Expression, OperationExpression, PrimitiveExpression } from "../parser/expression";

export function runExpression(expression: Expression): PrimitiveExpression {
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
            return runOperationExpression(expression);
        }
        default: {
            expectNever(expression);
        }
    }
}

function runOperationExpression(expression: OperationExpression): PrimitiveExpression {
    const left = runExpression(expression.lhs);
    if (left.type !== "number") {
        throw new Error("[Unimplemented runOperationExpression] Expected operation to get number for lhs and rhs");
    }
    const right = runExpression(expression.rhs);
    if (right.type !== "number") {
        throw new Error("[Unimplemented runOperationExpression] Expected operation to get number for lhs and rhs");
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
