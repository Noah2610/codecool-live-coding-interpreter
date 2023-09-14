import { PrimitiveExpression } from "../parser/expression";
import { FunctionDefinitionStatement } from "../parser/statement";

type FunctionDefinition = FunctionDefinitionStatement & { context: Context };

export class Context {
    private variables: Map<string, PrimitiveExpression>;
    private functions: Map<string, FunctionDefinition>;

    constructor() {
        this.variables = new Map();
        this.functions = new Map();
    }

    public getVariable(identifier: string): PrimitiveExpression | null {
        return this.variables.get(identifier) ?? null;
    }

    public setVariable(identifier: string, value: PrimitiveExpression) {
        this.variables.set(identifier, value);
    }

    public setFunction(func: FunctionDefinitionStatement) {
        this.functions.set(func.identifier, { ...func, context: this });
    }

    public getFunction(identifier: string): FunctionDefinition | null {
        return this.functions.get(identifier) ?? null;
    }
}
