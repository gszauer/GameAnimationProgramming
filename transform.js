/*jshint esversion: 6 */
const XFORM_EPSILON = 0.000001;

function t_identity() {
	let result = {};
	result.position = [0, 0, 0];
	result.rotation = [0, 0, 0, 1];
	result.scale = [1, 1, 1];
	return result;
}

function t_copy(t) {
	let result = {};
	result.position = [t.position[0], t.position[1], t.position[2]];
	result.rotation = [t.rotation[0], t.rotation[1], t.rotation[2], t.rotation[3]];
	result.scale = [t.scale[0], t.scale[1], t.scale[2]];
	return result;
}

function t_new(pos, rot, scl) {
	let result = {};
	result.position = [pos[0], pos[1], pos[2]];
	result.rotation = [rot[0], rot[1], rot[2], rot[3]];
	result.scale = [scl[0], scl[1], scl[2]];
	return result;
}

function t_combine(a, b) {
	let result = t_identity();

	result.scale = v3_mul(a.scale, b.scale);
	result.rotation = q_mul(b.rotation, a.rotation);

	result.position = q_transformVector(a.rotation, v3_mul(a.scale, b.position));
	result.position = v3_add(a.position, result.position);

	return result;
}

function t_inverse(t) {
	let inv = t_identity();

	inv.rotation = q_inverse(t.rotation);

	inv.scale[0] = Math.abs(t.scale[0]) < XFORM_EPSILON ? 0.0 : 1.0 / t.scale[0];
	inv.scale[1] = Math.abs(t.scale[1]) < XFORM_EPSILON ? 0.0 : 1.0 / t.scale[1];
	inv.scale[2] = Math.abs(t.scale[2]) < XFORM_EPSILON ? 0.0 : 1.0 / t.scale[2];

	let invTranslation = v3_scale(t.position, -1.0);
	inv.position = q_transformVector(inv.rotation, v3_mul(inv.scale, invTranslation));

	return inv;
}

function t_mix(a, b, t) {
	let bRot = [b.rotation[0], b.rotation[1], b.rotation[2], b.rotation[3]];
	if (q_dot(a.rotation, bRot) < 0.0) {
		q_invert(bRot);
	}
	return t_new(
		v3_lerp(a.position, b.position, t),
		q_nlerp(a.rotation, bRot, t),
		v3_lerp(a.scale, b.scale, t)
	);
}

function t_toMat4(t) {
	let x = q_transformVector(t.rotation, [1, 0, 0]);
	let y = q_transformVector(t.rotation, [0, 1, 0]);
	let z = q_transformVector(t.rotation, [0, 0, 1]);

	x = v3_scale(x, t.scale[0]);
	y = v3_scale(y, t.scale[1]);
	z = v3_scale(z, t.scale[2]);

	let p = t.position;

	return [
		x[0], x[1], x[2], 0,
		y[0], y[1], y[2], 0,
		z[0], z[1], z[2], 0,
		p[0], p[1], p[2], 1
	];
}

function m4_toTransform(m) {
	let out = t_identity();

	out.position = [m.v[12], m.v[13], m.v[14]];
	out.rotation = m4_toQuat(m);

	let rotScaleMat = [
		m.v[0], m.v[1], m.v[2], 0,
		m.v[4], m.v[5], m.v[6], 0,
		m.v[8], m.v[9], m.v[10], 0,
		0, 0, 0, 1
	];
	let invRotMat = q_toMat4(q_inverse(out.rotation));
	let scaleSkewMat = m4_mul(rotScaleMat, invRotMat);

	out.scale = [
		scaleSkewMat[0],
		scaleSkewMat[5],
		scaleSkewMat[10]
	];

	return out;
}

function t_transformPoint(a, b) {
	let out = [0, 0, 0];

	out = q_transformVector(a.rotation * v3_scale(a.scale, b));
	out = v3_add(a.position, out);

	return out;
}

function t_transformVector(a, b) {
	return q_transformVector(a.rotation, v3_scale(a.scale, b));
}

function t_eq(a, b) {
	return v3_eq(a.position == b.position) &&
		q_eq(a.rotation == b.rotation) &&
		v3_eq(a.scale == b.scale);
}