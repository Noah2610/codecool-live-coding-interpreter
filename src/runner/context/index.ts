import { PrimitiveExpression } from "../../parser/expression";
import { FunctionDefinitionStatement } from "../../parser/statement";

type FunctionDefinition = FunctionDefinitionStatement & { context: Context };

export class Context {
    private variables: Map<string, PrimitiveExpression>;
    private functions: Map<string, FunctionDefinition>;
    private parentContext?: Context;

    constructor(parentContext?: Context) {
        this.variables = new Map();
        this.functions = new Map();
        this.parentContext = parentContext;
    }

    public getVariable(identifier: string): PrimitiveExpression | null {
        const variable = this.variables.get(identifier) ?? null;
        if (variable !== null) {
            return variable;
        }

        if (this.parentContext) {
            return this.parentContext.getVariable(identifier);
        }

        return null;
    }

    public setVariable(identifier: string, value: PrimitiveExpression) {
        this.variables.set(identifier, value);
    }

    public setFunction(func: FunctionDefinitionStatement) {
        this.functions.set(func.identifier, { ...func, context: this });
    }

    public getFunction(identifier: string): FunctionDefinition | null {
        const func = this.functions.get(identifier) ?? null;
        if (func !== null) {
            return func;
        }

        if (this.parentContext) {
            return this.parentContext.getFunction(identifier);
        }

        return null;
    }
}
