let wasm;
export function __wbg_set_wasm(val) {
	wasm = val;
}

const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) {
	return heap[idx];
}

let heap_next = heap.length;

function dropObject(idx) {
	if (idx < 132) return;
	heap[idx] = heap_next;
	heap_next = idx;
}

function takeObject(idx) {
	const ret = getObject(idx);
	dropObject(idx);
	return ret;
}

const lTextDecoder =
	typeof TextDecoder === "undefined"
		? (0, module.require)("util").TextDecoder
		: TextDecoder;

let cachedTextDecoder = new lTextDecoder("utf-8", {
	ignoreBOM: true,
	fatal: true
});

cachedTextDecoder.decode();

let cachedUint8Memory0 = null;

function getUint8Memory0() {
	if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
		cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
	}
	return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
	ptr = ptr >>> 0;
	return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function addHeapObject(obj) {
	if (heap_next === heap.length) heap.push(heap.length + 1);
	const idx = heap_next;
	heap_next = heap[idx];

	heap[idx] = obj;
	return idx;
}

let WASM_VECTOR_LEN = 0;

function passArray8ToWasm0(arg, malloc) {
	const ptr = malloc(arg.length * 1, 1) >>> 0;
	getUint8Memory0().set(arg, ptr / 1);
	WASM_VECTOR_LEN = arg.length;
	return ptr;
}
/**
 * @param {Uint8Array} facelets
 * @returns {Uint8ClampedArray}
 */
export function solve(facelets) {
	const ptr0 = passArray8ToWasm0(facelets, wasm.__wbindgen_malloc);
	const len0 = WASM_VECTOR_LEN;
	const ret = wasm.solve(ptr0, len0);
	return takeObject(ret);
}

const lTextEncoder =
	typeof TextEncoder === "undefined"
		? (0, module.require)("util").TextEncoder
		: TextEncoder;

let cachedTextEncoder = new lTextEncoder("utf-8");

const encodeString =
	typeof cachedTextEncoder.encodeInto === "function"
		? function (arg, view) {
				return cachedTextEncoder.encodeInto(arg, view);
		  }
		: function (arg, view) {
				const buf = cachedTextEncoder.encode(arg);
				view.set(buf);
				return {
					read: arg.length,
					written: buf.length
				};
		  };

function passStringToWasm0(arg, malloc, realloc) {
	if (realloc === undefined) {
		const buf = cachedTextEncoder.encode(arg);
		const ptr = malloc(buf.length, 1) >>> 0;
		getUint8Memory0()
			.subarray(ptr, ptr + buf.length)
			.set(buf);
		WASM_VECTOR_LEN = buf.length;
		return ptr;
	}

	let len = arg.length;
	let ptr = malloc(len, 1) >>> 0;

	const mem = getUint8Memory0();

	let offset = 0;

	for (; offset < len; offset++) {
		const code = arg.charCodeAt(offset);
		if (code > 0x7f) break;
		mem[ptr + offset] = code;
	}

	if (offset !== len) {
		if (offset !== 0) {
			arg = arg.slice(offset);
		}
		ptr = realloc(ptr, len, (len = offset + arg.length * 3), 1) >>> 0;
		const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
		const ret = encodeString(arg, view);

		offset += ret.written;
	}

	WASM_VECTOR_LEN = offset;
	return ptr;
}

let cachedInt32Memory0 = null;

function getInt32Memory0() {
	if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
		cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
	}
	return cachedInt32Memory0;
}

export function __wbg_new_abda76e883ba8a5f() {
	const ret = new Error();
	return addHeapObject(ret);
}

export function __wbg_stack_658279fe44541cf6(arg0, arg1) {
	const ret = getObject(arg1).stack;
	const ptr1 = passStringToWasm0(
		ret,
		wasm.__wbindgen_malloc,
		wasm.__wbindgen_realloc
	);
	const len1 = WASM_VECTOR_LEN;
	getInt32Memory0()[arg0 / 4 + 1] = len1;
	getInt32Memory0()[arg0 / 4 + 0] = ptr1;
}

export function __wbg_error_f851667af71bcfc6(arg0, arg1) {
	let deferred0_0;
	let deferred0_1;
	try {
		deferred0_0 = arg0;
		deferred0_1 = arg1;
		console.error(getStringFromWasm0(arg0, arg1));
	} finally {
		wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
	}
}

export function __wbindgen_object_drop_ref(arg0) {
	takeObject(arg0);
}

export function __wbg_buffer_085ec1f694018c4f(arg0) {
	const ret = getObject(arg0).buffer;
	return addHeapObject(ret);
}

export function __wbg_newwithbyteoffsetandlength_a624c98280289b0f(
	arg0,
	arg1,
	arg2
) {
	const ret = new Uint8ClampedArray(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
	return addHeapObject(ret);
}

export function __wbindgen_throw(arg0, arg1) {
	throw new Error(getStringFromWasm0(arg0, arg1));
}

export function __wbindgen_memory() {
	const ret = wasm.memory;
	return addHeapObject(ret);
}
