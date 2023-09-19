import { run } from ".";

describe("scripts", () => {
    const origLog = console.log;

    beforeEach(() => {
        console.log = jest.fn();
    })

    afterEach(() => {
        console.log = origLog;
    })

    it("age test", () => {
        const result = run(`
            die Funktion Bier Kaufen kriegt Alter und macht
                das Bier   ist "ein alkoholisches Getränk"!
                der Radler ist "ein weniger alkoholisches Getränk"!
                die Cola   ist "ein Soft-Drink"!

                das Mindestalter für Bier ist 16!
                das Mindestalter für Radler ist 15!
                das Mindestalter für Cola ist 16!

                stimmt, dass /Alter/ größer als oder gleich /Mindestalter für Bier/ ist?
                    gib /Bier/ zurück!
                oder doch, dass /Alter/ größer als oder gleich /Mindestalter für Radler/ ist?
                    gib /Radler/ zurück!
                oder doch, dass /Alter/ größer als oder gleich /Mindestalter für Cola/ ist?
                    gib /Cola/ zurück!
                oder nicht?
                    gib nix zurück!
                oder?!
            und endet hier!

            das Getränk ist führe Bier Kaufen mit 20 aus!
            zeig /Getränk/ an!

            das Getränk ist führe Bier Kaufen mit 15 aus!
            zeig /Getränk/ an!

            das Getränk ist führe Bier Kaufen mit 8 aus!
            zeig /Getränk/ an!
        `);

        expect(result.isOk()).toBe(true);
        expect(console.log).toHaveBeenNthCalledWith(0, "Bier");
        expect(console.log).toHaveBeenNthCalledWith(1, "Radler");
        expect(console.log).toHaveBeenNthCalledWith(2, "Cola");
    });

    it("fibonacci", () => {
        const result = run(`
            die Funktion Fibonacci kriegt Nummer und macht
                stimmt, dass /Nummer/ kleiner als 1 ist?
                    gib 0 zurück!
                oder doch, dass /Nummer/ kleiner als oder gleich 2 ist?
                    gib 1 zurück!
                oder nicht?
                    die Nummer minus 1 ist die Differenz von /Nummer/ und 1!
                    die Nummer minus 2 ist die Differenz von /Nummer/ und 2!
                    das Resultat ist die Summe von
                        führe Fibonacci mit /Nummer minus 1/ aus und
                        führe Fibonacci mit /Nummer minus 2/ aus!
                    gib /Resultat/ zurück!
                oder?!
            und endet hier!

            zeig führe Fibonacci mit 1 aus an!
            zeig führe Fibonacci mit 2 aus an!
            zeig führe Fibonacci mit 3 aus an!
            zeig führe Fibonacci mit 4 aus an!
            zeig führe Fibonacci mit 5 aus an!
            zeig führe Fibonacci mit 6 aus an!
            zeig führe Fibonacci mit 10 aus an!
            zeig führe Fibonacci mit 20 aus an!
        `);

        expect(result.isOk()).toBe(true);
        expect(console.log).toHaveBeenNthCalledWith(0, 1);
        expect(console.log).toHaveBeenNthCalledWith(1, 1);
        expect(console.log).toHaveBeenNthCalledWith(2, 2);
        expect(console.log).toHaveBeenNthCalledWith(3, 3);
        expect(console.log).toHaveBeenNthCalledWith(4, 5);
        expect(console.log).toHaveBeenNthCalledWith(5, 8);
        expect(console.log).toHaveBeenNthCalledWith(6, 55);
        expect(console.log).toHaveBeenNthCalledWith(7, 6765);
    });

    it("prime", () => {});
});
