/*jshint esversion: 6 */
const QUAT_EPSILON = 0.000001;
const QUAT_DEG2RAD = 0.0174533;
const QUAT_RAD2DEG = 57.2958;

function q_identity() {
	return [0, 0, 0, 1];
}

function q_angleAxis(angle, axis) {
	let norm = v3_normalized(axis);
	let s = Math.sin(angle * 0.5);

	return [
		norm[0] * s,
		norm[1] * s,
		norm[2] * s,
		Math.cos(angle * 0.5)
	];
}

function q_fromTo(from, to) {
	let f = v3_normalized(from);
	let t = v3_normalized(to);

	if (f == t) {
		return q_identity();
	}
	else if (f == v3_scale(t * -1.0)) {
		let ortho = [1, 0, 0];
		if (Math.fabs(f[1]) < Math.fabs(f[0])) {
			ortho = [0, 1, 0];
		}
		if (Math.fabs(f[2]) < Math.fabs(f[1]) && Math.fabs(f[2]) < Math.fabs(f[0])) {
			ortho = [0, 0, 1];
		}

		let axis = v3_normalized(v3_cross(f, ortho));
		return [axis[0], axis[1], axis[2], 0];
	}

	let half = v3_normalized(f + t);
	let axis = v3_cross(f, half);

	return [
		axis[0],
		axis[1],
		axis[2],
		v3_dot(f, half)
	];
}

function q_getAxis(quat) {
	return v3_normalized([quat[0], quat[1], quat[2]]);
}

function q_getAngle(quat) {
	return 2.0 * Math.acos(quat[3]);
}

function q_add(a, b) {
	return [
		a[0] + b[0],
		a[1] + b[1],
		a[2] + b[2],
		a[3] + b[3]
	];
}

function q_sub(a, b) {
	return [
		a[0] - b[0],
		a[1] - b[1],
		a[2] - b[2],
		a[3] - b[3]
	];
}

function q_scale(a, b) {
	return [
		a[0] * b,
		a[1] * b,
		a[2] * b,
		a[3] * b
	];
}

function q_negate(q) {
	return [
		-q[0],
		-q[1],
		-q[2],
		-q[3]
	];
}

function q_eq(left, right) {
	return (Math.fabs(left[0] - right[0]) <= QUAT_EPSILON && 
		    Math.fabs(left[1] - right[1]) <= QUAT_EPSILON && 
		    Math.fabs(left[2] - right[2]) <= QUAT_EPSILON && 
		    Math.fabs(left[3] - right[3]) <= QUAT_EPSILON);
}

function q_dot(a, b) {
	return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
}

function q_lenSq(q) {
	return q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3];
}

function q_len(q) {
	let lenSq = q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3];
	if (lenSq < QUAT_EPSILON) {
		return 0.0;
	}
	return Math.sqrt(lenSq);
}

function q_normalize(q) {
	let lenSq = q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3];
	if (lenSq < QUAT_EPSILON) {
		return;
	}
	let i_len = 1.0 / Math.sqrt(lenSq);

	q[0] *= i_len;
	q[1] *= i_len;
	q[2] *= i_len;
	q[3] *= i_len;
}

function q_normalized(q) {
	let lenSq = q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3];
	if (lenSq < QUAT_EPSILON) {
		return q_identity();
	}
	let i_len = 1.0 / Math.sqrt(lenSq);

	return [
		q[0] * i_len,
		q[1] * i_len,
		q[2] * i_len,
		q[3] * i_len
	];
}

function q_conjugate(q) {
	return [
		-q[0],
		-q[1],
		-q[2],
		q[3]
	];
}

function q_inverse(q) {
	let lenSq = q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3];
	if (lenSq < QUAT_EPSILON) {
		return q_identity();
	}
	let recip = 1.0 / lenSq;

	return [
		-q[0] * recip,
		-q[1] * recip,
		-q[2] * recip,
		 q[3] * recip
	];
}

function q_invert(q) {
	let lenSq = q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3];
	if (lenSq < QUAT_EPSILON) {
		return q_identity();
	}
	let recip = 1.0 / lenSq;

	
	q[0] = -q[0] * recip,
	q[1] = -q[1] * recip,
	q[2] = -q[2] * recip,
	q[3] =  q[3] * recip
}

function q_mul(Q1, Q2) {
	return [
	  	 Q2[0] * Q1[3] + Q2[1] * Q1[2] - Q2[2] * Q1[1] + Q2[3] * Q1[0],
		-Q2[0] * Q1[2] + Q2[1] * Q1[3] + Q2[2] * Q1[0] + Q2[3] * Q1[1],
		 Q2[0] * Q1[1] - Q2[1] * Q1[0] + Q2[2] * Q1[3] + Q2[3] * Q1[2],
		-Q2[0] * Q1[0] - Q2[1] * Q1[1] - Q2[2] * Q1[2] + Q2[3] * Q1[3]
	];
}

function q_transformVector(q, v) {
	let q_vector = [q[0], q[1], q[2]];
	let q_scalar = q[3];

	return v3_add(v3_add(
		v3_scale(v3_scale(q_vector, 2.0), v3_dot(q_vector, v)),
		v3_scale(v, q_scalar * q_scalar - v3_dot(q_vector, q_vector))),
		v3_scale(v3_scale(v3_cross(q_vector, v), 2.0), q_scalar));
}

function q_mix(from, to, t) {
	return q_add(q_scale(from, (1.0 - t)), q_scale(to, t));
}

function q_nlerp(from, to, t) {
	return q_normalized(q_add(from, q_scale(q_sub(to, from),  t)));
}

function q_pow(q, f) {
	let angle = 2.0 * Math.acos(q[3]);
	let axis = v3_normalized([q[0], q[1], q[2]]);

	let halfCos = Math.cos(f * angle * 0.5);
	let halfSin = Math.sin(f * angle * 0.5);

	return [
		axis[0] * halfSin,
		axis[1] * halfSin,
		axis[2] * halfSin,
		halfCos
	];
}

function q_slerp(start, end, t) {
	if (Math.fabs(v3_dot(start, end)) > 1.0 - QUAT_EPSILON) {
		return q_nlerp(start, end, t);
	}

	return q_normalized(q_mul(q_pow(q_mul(q_inverse(start), end), t), start));
}

function q_lookRotation(direcion, up) {
	let f = v3_normalized(direcion);
	let u = v3_normalized(up);
	let r = v3_cross(u, f);
	u = v3_cross(f, r);

	// From world forward to object forward
	let f2d = q_fromTo([0, 0, 1], f);

	// what direction is the new object up?
	let objectUp = q_transformVector(f2d, [0, 1, 0]);
	// From object up to desired up
	let u2u = q_fromTo(objectUp, u);

	// Rotate to forward direction first, then twist to correct up
	let result = q_mul(f2d, u2u);
	// Dont forget to normalize the result
	return q_normalized(result);
}

function q_toMat4(q) {
	let r = q_transformVector(q, [1, 0, 0]);
	let u = q_transformVector(q, [0, 1, 0]);
	let f = q_transformVector(q, [0, 0, 1]);

	return [
		r[0], r[1], r[2], 0,
		u[0], u[1], u[2], 0,
		f[0], f[1], f[2], 0,
		0, 0, 0, 1
	];
}

function m4_toQuat(m) {
	let up = v3_normalized([m[4], m[5], m[6]]);
	let forward = v3_normalized([m[8], m[9], m[10]]);
	let right = v3_cross(up, forward);
	up = v3_cross(forward, right);

	return q_lookRotation(forward, up);
}