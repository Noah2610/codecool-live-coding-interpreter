import { runExpression } from ".";

describe("runner", () => {
    it("runs boolean expression", () => {
        const result = runExpression({ type: "boolean", value: true });
        expect(result).toBeTruthy();
    });

    it("runs number expression", () => {
        const result = runExpression({ type: "number", value: 123 });
        expect(result).toBeTruthy();
    });

    it("runs string expression", () => {
        const result = runExpression({ type: "string", value: "Hallo" });
        expect(result).toBeTruthy();
    });
});
