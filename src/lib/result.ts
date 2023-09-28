enum ResultType {
	Ok,
	Err
}

export class Result<T, E> {
	private ok: T | null;
	private err: E | null;

	private type: ResultType;

	private constructor(ok: T | null, err: E | null) {
		if (!ok && !err) {
			throw new Error("Cannot make Result from no varient");
		}

		this.ok = ok;
		this.err = err;

		this.type = err === null ? ResultType.Ok : ResultType.Err;
	}

	static Ok<T, E>(x: T): Result<T, E> {
		return new Result<T, E>(x, null);
	}

	static Err<T, E>(x: E): Result<T, E> {
		return new Result<T, E>(null, x);
	}

	// unwrap(): T {
	// 	if (this.type !== ResultType.Ok) {
	// 		throw new Error(`called Result.unwrap on an Err(${this.err})`);
	// 	}

	// 	return this.ok!;
	// }

	match<X>(x: { ok: (x: T) => X; err: (e: E) => X }): X {
		if (this.type === ResultType.Ok) {
			return x.ok(this.ok!);
		} else {
			return x.err(this.err!);
		}
	}

	// if_ok(x: (x: T) => void) {
	// 	if (this.type === ResultType.Ok) {
	// 		x(this.ok!);
	// 	}
	// }

	// if_err(x: (x: E) => void) {
	// 	if (this.type === ResultType.Err) {
	// 		x(this.err!);
	// 	}
	// }

	static auto<T, E>(x: () => T): Result<T, E> {
		try {
			const result = x();
			return Result.Ok<T, E>(result);
		} catch (e: any) {
			return Result.Err<T, E>(e);
		}
	}
}
