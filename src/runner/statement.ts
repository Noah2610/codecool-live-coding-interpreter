import { expectNever } from "ts-expect";
import { Expression, PrimitiveExpression } from "../parser/expression";
import { ConditionStatement, Statement } from "../parser/statement";
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
            return runConditionStatement(statement, context);
        }
        default: {
            expectNever(statement);
        }
    }
}

function runConditionStatement(
    statement: ConditionStatement,
    context: Context,
): null | StatementReturn {
    if (isTruthy(statement.if.condition, context)) {
        for (const stmnt of statement.if.body) {
            const result = runStatement(stmnt, context);
            if (result && "isReturn" in result) {
                return { isReturn: true, value: result.value };
            }
        }
    } else if (statement.elseIfs) {
        let didHitElseIf = false;

        for (const elseIf of statement.elseIfs) {
            if (isTruthy(elseIf.condition, context)) {
                didHitElseIf = true;
                for (const stmnt of elseIf.body) {
                    const result = runStatement(stmnt, context);
                    if (result && "isReturn" in result) {
                        return { isReturn: true, value: result.value };
                    }
                }
                break;
            }
        }

        if (didHitElseIf === false && statement.else) {
            for (const stmnt of statement.else) {
                const result = runStatement(stmnt, context);
                if (result && "isReturn" in result) {
                    return { isReturn: true, value: result.value };
                }
            }
        }
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
