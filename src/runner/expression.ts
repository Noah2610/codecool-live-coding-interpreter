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
import * as node from "../node";

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

function expectOperandType<T extends PrimitiveExpression["type"]>(
    expression: PrimitiveExpression,
    operation: "arithmetic" | "comparison" | "logical",
    expectedType: T,
): PrimitiveExpression & { type: T } {
    if (expression.type !== expectedType) {
        throw new Error(
            `Expected ${operation} operation to get operand of type ${expectedType}, but received type ${expression.type}`,
        );
    }
    return expression as PrimitiveExpression & { type: T };
}

function runArithmeticOperationExpression(
    expression: ArithmeticOperationExpression,
    context: Context,
): PrimitiveExpression {
    // const [left, right] = expectOperandsOfType(expression, "number", "number");

    const left = expectOperandType(
        runExpression(expression.lhs, context),
        "arithmetic",
        "number",
    );
    const right = expectOperandType(
        runExpression(expression.rhs, context),
        "arithmetic",
        "number",
    );

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
    const left = runExpression(expression.lhs, context);
    const right = runExpression(expression.rhs, context);

    switch (expression.op) {
        case "eq": {
            const l = left.type === "null" ? null : left.value;
            const r = left.type === "null" ? null : left.value;
            return node.bool(l === r);
        }
        case "neq": {
            const l = left.type === "null" ? null : left.value;
            const r = left.type === "null" ? null : left.value;
            return node.bool(l !== r);
        }
        case "gt": {
            const leftNum = expectOperandType(left, "comparison", "number");
            const rightNum = expectOperandType(right, "comparison", "number");
            return node.bool(leftNum.value > rightNum.value);
        }
        case "gte": {
            const leftNum = expectOperandType(left, "comparison", "number");
            const rightNum = expectOperandType(right, "comparison", "number");
            return node.bool(leftNum.value >= rightNum.value);
        }
        case "lt": {
            const leftNum = expectOperandType(left, "comparison", "number");
            const rightNum = expectOperandType(right, "comparison", "number");
            return node.bool(leftNum.value < rightNum.value);
        }
        case "lte": {
            const leftNum = expectOperandType(left, "comparison", "number");
            const rightNum = expectOperandType(right, "comparison", "number");
            return node.bool(leftNum.value <= rightNum.value);
        }
    }
}

function runLogicalOperationExpression(
    expression: LogicalOperationExpression,
    context: Context,
): PrimitiveExpression {
    const left = expectOperandType(runExpression(expression.lhs, context), "logical", "boolean");
    const right = expectOperandType(runExpression(expression.rhs, context), "logical", "boolean");

    switch (expression.op) {
        case "and": {
            return node.bool(left.value && right.value);
        }
        case "or": {
            return node.bool(left.value || right.value);
        }
    }
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
