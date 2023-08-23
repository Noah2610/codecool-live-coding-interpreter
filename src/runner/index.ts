import { expectNever } from "ts-expect";
import { Expression } from "../parser";

export function runExpression(expression: Expression) {
    switch (expression.type) {
        case "boolean": {
            return expression.value;
        }
        case "number": {
            return expression.value;
        }
        case "string": {
            return expression.value;
        }
        default: {
            expectNever(expression);
        }
    }
}
