// TODO
interface IResultOk<T, E> {
    value: NonNullable<T>;
    error: E;
}

interface IResultErr<T, E> {
    value: T;
    error: NonNullable<E>;
}

export class Result<T, E> {
    private ok: boolean;
    private value: T | null;
    private error: E | null;

    private constructor(value: T | null, error: E | null, ok?: boolean) {
        this.value = value;
        this.error = error;
        this.ok = ok ?? (!!value || !error);
    }

    public static ok<T, E>(value: T): Result<T, E> {
        return new this<T, E>(value, null, true);
    }

    public static err<T, E>(error: E): Result<T, E> {
        return new this<T, E>(null, error, false);
    }

    // public isOk(): this is IResultOk<T, E> {
    public isOk(): boolean {
        return this.ok;
    }

    // public isErr(): this is IResultErr<T, E> {
    public isErr(): boolean {
        return !this.ok;
    }

    public getValue(): T | null {
        return this.value;
    }

    public getError(): E | null {
        return this.error;
    }
}
