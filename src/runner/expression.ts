import { expectNever } from "ts-expect";
import {
    ArithmeticOperationExpression,
    ComparisonOperationExpression,
    Expression,
    FunctionCallExpression,
    isArithmeticOperationExpression,
    isComparisonOperationExpression,
    isLogicalOperationExpression,
    LogicalOperationExpression,
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
        case "boolean":
        case "number":
        case "string":
        case "null": {
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
    if (isArithmeticOperationExpression(expression)) {
        return runArithmeticOperationExpression(expression, context);
    }
    if (isComparisonOperationExpression(expression)) {
        return runComparisonOperationExpression(expression, context);
    }
    if (isLogicalOperationExpression(expression)) {
        return runLogicalOperationExpression(expression, context);
    }

    throw new Error(
        `[Unreachable] Unexpected operation: ${JSON.stringify(
            expression,
            null,
            2,
        )}`,
    );
}

function runArithmeticOperationExpression(
    expression: ArithmeticOperationExpression,
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
        default: {
            throw new Error("unimplemented");
        }
    }

    return {
        type: "number",
        value: result,
    };
}

function runComparisonOperationExpression(
    expression: ComparisonOperationExpression,
    context: Context,
): PrimitiveExpression {
    throw new Error("Unimplemented");
}

function runLogicalOperationExpression(
    expression: LogicalOperationExpression,
    context: Context,
): PrimitiveExpression {
    throw new Error("Unimplemented");
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
        if (result && "isReturn" in result) {
            return result.value;
        }
    }

    return { type: "null" };
}
