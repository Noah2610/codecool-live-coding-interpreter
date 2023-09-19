import { RunError } from "../langError";
import { Statement } from "../parser/statement";
import { Result } from "../result";
import { Context } from "./context";
import { runStatement } from "./statement";

export function run(
    statements: Statement[],
    context: Context,
): Result<null, RunError> {
    for (const statement of statements) {
        // TODO: error handling
        runStatement(statement, context);
    }

    return Result.ok(null);
}
