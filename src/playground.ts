function fn<T extends Array<() => any>>(args: T): ReturnTypesOf<T> {
    return null as unknown as any;
}

// const a: [number, string, number] = [0, "", 1.1];
const a: [() => boolean, () => string, () => number] = [() => true, () => "hello", () => 123];
const ret = fn(a);

const A = ret[0]

type ReturnTypesOf<T extends Array<() => any>> = {
    [I in keyof T]: ReturnType<T[I]>;
};
