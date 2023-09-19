import { ParseError } from "../langError";
import { Result } from "../result";
import { parseStatement, Statement } from "./statement";

export function parse(
    input: string,
): Result<[Statement[], string], ParseError> {
    var rest = input;

    const statements: Statement[] = [];

    while (rest.trim().length > 0) {
        var [parsed, rest] = parseStatement(rest);
        if (parsed === null) {
            return Result.err(
                new ParseError("Failed to parse statement", input, rest),
            );
        }
        statements.push(parsed);
    }

    return Result.ok([statements, rest]);
}
