export type SourceLocation = { line: number; column: number };

export class LangError {
    protected type: string;
    protected message: string;
    protected location: SourceLocation | null;

    constructor(message: string, location?: SourceLocation) {
        this.type = "langError";
        this.message = message;
        this.location = location ?? null;
    }

    public display(): string {
        return [
            `type: ${this.type}`,
            `message: ${this.message}`,
            this.location &&
                `location: ${JSON.stringify(this.location, null, 2)}`,
        ]
            .filter((x) => !!x)
            .join("\n");
    }
}

export class ParseError extends LangError {
    constructor(message: string, input: string, rest: string) {
        super(message, getSourceLocation(input, rest));
        this.type = "parseError";
    }
}

export class RunError extends LangError {
    // private statement: Statement;

    constructor(message: string /*, statement: Statement*/) {
        super(message);
        this.type = "runError";
        // this.statement = statement;
    }

    // TODO
    // public display(): string {
    //     return (
    //         super.display() +
    //         "\n" +
    //         `statement: ${JSON.stringify(this.statement, null, 2)}`
    //     );
    // }
}

export function isError(obj: any): obj is LangError {
    return obj !== null && typeof obj === "object" && obj instanceof LangError;
}

export function getSourceLocation(input: string, rest: string): SourceLocation {
    const index = input.length - rest.length;

    const before = [...input.slice(0, index)];

    const line =
        before.reduce((count, chr) => count + (chr === "\n" ? 1 : 0), 0) + 1;

    let column = before.reverse().findIndex((chr) => chr === "\n") + 1;
    if (column === 0) {
        column = before.length;
    }

    return { line, column };
}
