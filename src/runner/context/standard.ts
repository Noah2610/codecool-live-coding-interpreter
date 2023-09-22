import { Context } from "./index";
import * as node from "../../node";
import mkPrompt from "prompt-sync";

const prompt = mkPrompt({ sigint: true });

export class StandardContext extends Context {
    private isStd: true;

    constructor() {
        super();

        this.isStd = true;

        this.setFunction(
            node.functionDef(
                "Eingabe Einlesen",
                [],
                [node.exprStatement(node.builtin(() => node.str(prompt(""))))],
            ),
        );
    }
}
