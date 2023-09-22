import { expectNever } from "ts-expect";
import { Expression, PrimitiveExpression } from "../parser/expression";
import {
    Conditional,
    ConditionStatement,
    Statement,
} from "../parser/statement";
import { Context } from "./context";
import { runExpression } from "./expression";

type StatementResult = PrimitiveExpression | StatementReturn | null;

type StatementReturn = {
    isReturn: true;
    value: PrimitiveExpression;
};

export function runStatement(
    statement: Statement,
    context: Context,
): StatementResult {
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
            return runConditionStatement(statement, context);
        }
        default: {
            expectNever(statement);
        }
    }
}

function runBody(body: Statement[], context: Context): StatementResult {
    for (const stmnt of body) {
        const result = runStatement(stmnt, context);
        if (result && "isReturn" in result) {
            return { isReturn: true, value: result.value };
        }
    }
    return null;
}

function runConditionStatement(
    statement: ConditionStatement,
    context: Context,
): StatementResult {
    let elseIf: Conditional | undefined = undefined;

    if (isTruthy(statement.if.condition, context)) {
        return runBody(statement.if.body, context);
    } else if (
        (elseIf = statement.elseIfs?.find((elseIf) =>
            isTruthy(elseIf.condition, context),
        ))
    ) {
        return runBody(elseIf.body, context);
    } else if (statement.else) {
        return runBody(statement.else, context);
    }

    return null;
}

function isTruthy(expression: Expression, context: Context): boolean {
    const primitive = runExpression(expression, context);
    if (primitive.type === "boolean") {
        return primitive.value;
    }
    if (primitive.type === "null") {
        return false;
    }
    return true;
}
