import {
    BooleanExpression,
    Expression,
    FunctionCallExpression,
    NullExpression,
    NumberExpression,
    OperationExpression,
    StringExpression,
    VariableReferenceExpression,
} from "./parser/expression";
import {
    Conditional,
    ConditionStatement,
    ExpressionStatement,
    FunctionDefinitionStatement,
    PrintStatement,
    ReturnStatement,
    Statement,
    VariableDefinitionStatement,
} from "./parser/statement";

export const num = (value: number): NumberExpression => ({
    type: "number",
    value,
});

export const bool = (value: boolean): BooleanExpression => ({
    type: "boolean",
    value,
});

export const str = (value: string): StringExpression => ({
    type: "string",
    value,
});

export const nullExp = (): NullExpression => ({ type: "null" });

export const operation = (
    op: OperationExpression["op"],
    lhs: Expression,
    rhs: Expression,
): OperationExpression => ({
    type: "operation",
    op,
    lhs,
    rhs,
});

export const variableRef = (
    identifier: string,
): VariableReferenceExpression => ({
    type: "variableReference",
    identifier,
});

export const functionCall = (
    identifier: string,
    parameters: Expression[],
): FunctionCallExpression => ({
    type: "functionCall",
    identifier,
    parameters,
});

export const exprStatement = (value: Expression): ExpressionStatement => ({
    type: "expression",
    value,
});

export const variableDef = (
    identifier: string,
    value: Expression,
): VariableDefinitionStatement => ({
    type: "variableDefinition",
    identifier,
    value,
});

export const functionDef = (
    identifier: string,
    parameters: string[],
    body: Statement[],
): FunctionDefinitionStatement => ({
    type: "functionDefinition",
    identifier,
    parameters,
    body,
});

export const returnKeyword = (value: Expression): ReturnStatement => ({
    type: "return",
    value,
});

export const printKeyword = (values: Expression[]): PrintStatement => ({
    type: "print",
    values,
});

export const condition = (
    ifCond: Conditional,
    elseIfs: Conditional[],
    elseBody: Statement[] | null,
): ConditionStatement => ({
    type: "condition",
    if: ifCond,
    elseIfs,
    else: elseBody,
});

export const conditional = (
    condition: Expression,
    body: Statement[],
): Conditional => ({
    condition,
    body,
});
