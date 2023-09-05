import { PrimitiveExpression } from "../parser/expression";

export class Context {
    private variables: Map<string, PrimitiveExpression>;

    constructor() {
        this.variables = new Map();
    }

    public getVariable(identifier: string): PrimitiveExpression | null {
        return this.variables.get(identifier) ?? null;
    }

    public setVariable(identifier: string, value: PrimitiveExpression) {
        this.variables.set(identifier, value);
    }
}
