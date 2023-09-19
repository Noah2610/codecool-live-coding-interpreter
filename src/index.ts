import { LangError, ParseError, RunError } from "./langError";
import { parse } from "./parser";
import { Result } from "./result";
import { run as runStatements } from "./runner";
import { Context } from "./runner/context";

export function run(code: string, context?: Context): Result<null, LangError> {
    if (!context) {
        context = new Context();
    }

    const result = parse(code);
    if (result.isErr()) {
        return Result.err(result.getError()!);
    }

    const [parsed, rest] = result.getValue()!;
    if (rest.trim().length > 0) {
        return Result.err(
            new ParseError("Couldn't parse full input", code, rest),
        );
    }

    // TODO proper error handling
    try {
        runStatements(parsed, context);
    } catch (e) {
        if (e instanceof Error) {
            return Result.err(new RunError(e.message));
        }
        return Result.err(new RunError("Failed to run statements"));
    }

    return Result.ok(null);
}
