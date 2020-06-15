/*jshint esversion: 6 */
const VEC3_EPSILON = 0.000001;

function v2_zero() {
	return [0, 0];
}

function v2_one() {
	return [1, 1];
}

function v3_zero() {
	return [0, 0, 0];
}

function v3_one() {
	return [1, 1, 1];
}

function v3_right() {
	return [1, 0, 0];
}

function v3_up() {
	return [0, 1, 0];
}

function v3_forward() {
	return [0, 0, 1];
}

function v4_zero() {
	return [0, 0, 0, 0];
}

function v4_one() {
	return [1, 1, 1, 1];
}

function v3_add(l, r) {
	return [l[0] + r[0], l[1] + r[1], l[2] + r[2]];
}

function v3_sub(l, r) {
	return [l[0] - r[0], l[1] - r[1], l[2] - r[2]];
}

function v3_scale(v, f) {
	let result = [v[0] * f, v[1] * f, v[2] * f];
	return result;
}

function v3_mul(l, r) {
	return [l[0] * r[0], l[1] * r[1], l[2] * r[2]];
}

function v3_dot(l, r) {
	return l[0] * r[0] + l[1] * r[1] + l[2] * r[2];
}

function v3_lenSq(v) {
	return v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
}

function v3_len(v) {
	let lenSq = v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
	if (lenSq < VEC3_EPSILON) {
		return 0.0;
	}
	return Math.sqrt(lenSq);
}

function v3_normalize(v) {
	let lenSq = v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
	if (lenSq < VEC3_EPSILON) {
		return;
	}
	let invLen = 1.0 / Math.sqrt(lenSq);

	v[0] *= invLen;
	v[1] *= invLen;
	v[2] *= invLen;
}

function v3_normalized(v) {
	let lenSq = v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
	if (lenSq < VEC3_EPSILON) {
		return [v[0], v[1], v[2]];
	}
	let invLen = 1.0 / Math.sqrt(lenSq);

	return [
		v[0] * invLen,
		v[1] * invLen,
		v[2] * invLen
	];
}

function v3_angle(l, r) {
	let sqMagL = l[0] * l[1] + l[2] * l[3] + l[4] * l[5];
	let sqMagR = r[0] * r[1] + r[2] * r[3] + r[4] * r[5];

	if (sqMagL < VEC3_EPSILON || sqMagR < VEC3_EPSILON) {
		return 0.0;
	}

	let dot = l[0] * r[0] + l[1] * r[1] + l[2] * r[2];
	let len = Math.sqrt(sqMagL) * Math.sqrt(sqMagR);
	return Math.acos(dot / len);
}

function v3_project(a, b) {
	let magBSq = v3_len(b);
	if (magBSq < VEC3_EPSILON) {
		return [0, 0, 0];
	}
	let scale = v3_dot(a, b) / magBSq;
	return [
		b[0] * scale,
		b[1] * scale,
		b[2] * scale
	];
}

function v3_reject(a, b) {
	let projection = v3_project(a, b);
	return v3_sub(a, projection);
}

function v3_reflect(a, b) {
	let magBSq = v3_len(b);
	if (magBSq < VEC3_EPSILON) {
		return [0, 0, 0];
	}
	let scale = v3_dot(a, b) / magBSq;
	let proj2 = v3_scale(b, scale * 2.0);
	return v3_sub(a, proj2);
}

function v3_negate(v) {
	return [
		-v[0],
		-v[1],
		-v[2]
	];
}

function v3_cross(l, r) {
	return [
		l[1] * r[2] - l[2] * r[1],
		l[2] * r[0] - l[0] * r[2],
		l[0] * r[1] - l[1] * r[0]
	];
}

function v3_lerp(s, e, t) {
	return [
		s[0] + (e[0] - s[0]) * t,
		s[1] + (e[1] - s[1]) * t,
		s[2] + (e[2] - s[2]) * t
	];
}

function v3_nlerp(s, e, t) {
	let lin = [
		s[0] + (e[0] - s[0]) * t,
		s[1] + (e[1] - s[1]) * t,
		s[2] + (e[2] - s[2]) * t
	];
	v3_normalize(lin);
	return lin;
}

function v3_slerp(s, e, t) {
	if (t < 0.01) {
		return v3_nlerp(s, e, t);
	}

	let from = v3_normalized(s);
	let to = v3_normalized(e);

	let theta = v3_angle(from, to);
	let sin_theta = Math.sin(theta);

	let a = Math.sin((1.0 - t) * theta) / sin_theta;
	let b = Math.sin(t * theta) / sin_theta;

	return v3_add(v3_scale(from, a), v3_scale(to, b));
}

function v3_eq(l, r) {
	let diff = v3_sub(l, r);
	return v3_lenSq(diff) < VEC3_EPSILON;
}