import { expectNever } from "ts-expect";
import {
    Expression,
    FunctionCallExpression,
    OperationExpression,
    PrimitiveExpression,
    VariableReferenceExpression,
} from "../parser/expression";
import { Context } from "./context";
import { runStatement } from "./statement";

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
            return runVariableReferenceExpression(expression, context);
        }
        case "functionCall": {
            return runFunctionCallExpression(expression, context);
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

function runVariableReferenceExpression(
    expression: VariableReferenceExpression,
    context: Context,
): PrimitiveExpression {
    const identifier = expression.identifier;
    const value = context.getVariable(identifier);
    if (value === null) {
        throw new Error(
            `Attempted to reference undefined variable: "${identifier}"`,
        );
    }
    return value;
}

function runFunctionCallExpression(
    expression: FunctionCallExpression,
    context: Context,
): PrimitiveExpression {
    const { identifier, parameters } = expression;
    const func = context.getFunction(identifier);
    if (func === null) {
        throw new Error(
            `Attempted to call undefined function: "${identifier}"`,
        );
    }

    if (parameters.length !== func.parameters.length) {
        throw new Error(
            `Function "${identifier}" expects ${func.parameters.length} parameters, but received ${parameters.length} parameters`,
        );
    }

    // TODO set parameter variables for function call

    for (const statement of func.body) {
        const result = runStatement(statement, context);
        // TODO return value
    }

    return { type: "boolean", value: true };
}
