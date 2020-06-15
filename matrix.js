/*jshint esversion: 6 */
const MAT4_EPSILON = 0.000001;

function m4_identity() {
	return [
		1.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		0.0, 0.0, 0.0, 1.0
	];
}

function m4_zero() {
	return [
		0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0
	];
}

function m4_copy(m) {
	return [
		m[0], m[1], m[2], m[3],
		m[4], m[5], m[6], m[7],
		m[8], m[9], m[10], m[11],
		m[12], m[13], m[14], m[15]
	];
}

function m4_zero() {
	return [
		0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0
	];
}

function m4_eq(a, b) {
	for (let i = 0; i < 16; ++i) {
		if (Math.abs(a[i] - b[i]) > MAT4_EPSILON) {
			return false;
		}
	}
	return true;
}

function m4_add(a, b) {
	return [
		a[0] + b[0], a[1] + b[1], a[2] + b[2], a[3] + b[3],
		a[4] + b[4], a[5] + b[5], a[6] + b[6], a[7] + b[7],
		a[8] + b[8], a[9] + b[9], a[10] + b[10], a[11] + b[11],
		a[12] + b[12], a[13] + b[13], a[14] + b[14], a[15] + b[15]
	];
}

function m4_scale(m, f) {
	return [
		m[0] * f, m[1] * f, m[2] * f, m[3] * f,
		m[4] * f, m[5] * f, m[6] * f, m[7] * f,
		m[8] * f, m[9] * f, m[10] * f, m[11] * f,
		m[12] * f, m[13] * f, m[14] * f, m[15] * f
	];
}

function M4_MUL_DOT(a, b, aRow, bCol) {
    return a[0 * 4 + aRow] * b[bCol * 4 + 0] + a[1 * 4 + aRow] * b[bCol * 4 + 1] + a[2 * 4 + aRow] * b[bCol * 4 + 2] + a[3 * 4 + aRow] * b[bCol * 4 + 3];
}

function m4_mul(a, b) {
	return [
		M4_MUL_DOT(a, b, 0, 0), M4_MUL_DOT(a, b, 1, 0), M4_MUL_DOT(a, b, 2, 0), M4_MUL_DOT(a, b, 3, 0), // Column 0
		M4_MUL_DOT(a, b, 0, 1), M4_MUL_DOT(a, b, 1, 1), M4_MUL_DOT(a, b, 2, 1), M4_MUL_DOT(a, b, 3, 1), // Column 1
		M4_MUL_DOT(a, b, 0, 2), M4_MUL_DOT(a, b, 1, 2), M4_MUL_DOT(a, b, 2, 2), M4_MUL_DOT(a, b, 3, 2), // Column 2
		M4_MUL_DOT(a, b, 0, 3), M4_MUL_DOT(a, b, 1, 3), M4_MUL_DOT(a, b, 2, 3), M4_MUL_DOT(a, b, 3, 3)  // Column 3
	];
}

function M4_VEC4_DOT(m, mRow, x, y, z, w) {
	return x * m[0 * 4 + mRow] + y * m[1 * 4 + mRow] + z * m[2 * 4 + mRow] + w * m[3 * 4 + mRow];
}

function m4_transform(m, v) {
	return [
		M4_VEC4_DOT(m, 0, v[0], v[1], v[2], v[3]),
		M4_VEC4_DOT(m, 1, v[0], v[1], v[2], v[3]),
		M4_VEC4_DOT(m, 2, v[0], v[1], v[2], v[3]),
		M4_VEC4_DOT(m, 3, v[0], v[1], v[2], v[3])
	];
}

function m4_transformVector(m, v) {
	return [
		M4_VEC4_DOT(m, 0, v[0], v[1], v[2], 0.0),
		M4_VEC4_DOT(m, 1, v[0], v[1], v[2], 0.0),
		M4_VEC4_DOT(m, 2, v[0], v[1], v[2], 0.0)
	];
}

function m4_transformPoint(m, v) {
	return [
		M4_VEC4_DOT(m, 0, v[0], v[1], v[2], 1.0),
		M4_VEC4_DOT(m, 1, v[0], v[1], v[2], 1.0),
		M4_VEC4_DOT(m, 2, v[0], v[1], v[2], 1.0)
	];
}

function M4_SWAP(m, x, y) {
	let t = m[x]; 
	m[x] = m[y]; 
	m[y] = t; 
}

function m4_transpose(m) {
	M4_SWAP(m, 4 , 1);
	M4_SWAP(m, 8 , 2);
	M4_SWAP(m, 12, 3);
	M4_SWAP(m, 9 , 6);
	M4_SWAP(m, 13, 7);
	M4_SWAP(m, 14, 11);
}

function m4_transposed(m) {
	return [
		m[0], m[4], m[8], m[12],
		m[1], m[5], m[9], m[13],
		m[2], m[6], m[10], m[14],
		m[3], m[7], m[11], m[15]
	];
}

function M4_3X3MINOR(m, c0, c1, c2, r0, r1, r2) {
    return m[c0 * 4 + r0] * (m[c1 * 4 + r1] * m[c2 * 4 + r2] - m[c1 * 4 + r2] * m[c2 * 4 + r1]) - 
     m[c1 * 4 + r0] * (m[c0 * 4 + r1] * m[c2 * 4 + r2] - m[c0 * 4 + r2] * m[c2 * 4 + r1]) + 
     m[c2 * 4 + r0] * (m[c0 * 4 + r1] * m[c1 * 4 + r2] - m[c0 * 4 + r2] * m[c1 * 4 + r1]);
}

function m4_determinant(m) {
	return  m[0] * M4_3X3MINOR(m, 1, 2, 3, 1, 2, 3) - m[4] * M4_3X3MINOR(m, 0, 2, 3, 1, 2, 3) + m[8] * M4_3X3MINOR(m, 0, 1, 3, 1, 2, 3) - m[12] * M4_3X3MINOR(m, 0, 1, 2, 1, 2, 3);
}

function m4_adjugate(m) {
	// Cofactor(M[i, j]) = Minor(M[i, j]] * pow(-1, i + j)
	let cofactor = m4_identity();

	cofactor[0] =   M4_3X3MINOR(m, 1, 2, 3, 1, 2, 3);
	cofactor[1] =  -M4_3X3MINOR(m, 1, 2, 3, 0, 2, 3);
	cofactor[2] =   M4_3X3MINOR(m, 1, 2, 3, 0, 1, 3);
	cofactor[3] =  -M4_3X3MINOR(m, 1, 2, 3, 0, 1, 2);

	cofactor[4] =  -M4_3X3MINOR(m, 0, 2, 3, 1, 2, 3);
	cofactor[5] =   M4_3X3MINOR(m, 0, 2, 3, 0, 2, 3);
	cofactor[6] =  -M4_3X3MINOR(m, 0, 2, 3, 0, 1, 3);
	cofactor[7] =   M4_3X3MINOR(m, 0, 2, 3, 0, 1, 2);

	cofactor[8] =   M4_3X3MINOR(m, 0, 1, 3, 1, 2, 3);
	cofactor[9] =  -M4_3X3MINOR(m, 0, 1, 3, 0, 2, 3);
	cofactor[10] =  M4_3X3MINOR(m, 0, 1, 3, 0, 1, 3);
	cofactor[11] = -M4_3X3MINOR(m, 0, 1, 3, 0, 1, 2);

	cofactor[12] = -M4_3X3MINOR(m, 0, 1, 2, 1, 2, 3);
	cofactor[13] =  M4_3X3MINOR(m, 0, 1, 2, 0, 2, 3);
	cofactor[14] = -M4_3X3MINOR(m, 0, 1, 2, 0, 1, 3);
	cofactor[15] =  M4_3X3MINOR(m, 0, 1, 2, 0, 1, 2);

	m4_transpose(cofactor);
	return cofactor;
}

function m4_inverse(m) {
	let det = m4_determinant(m);

	if (det == 0.0) {
		console.error("WARNING: Trying to invert a matrix with a zero determinant\n");
		return m4_identity();
	}
	let adj = m4_adjugate(m);

	return m4_scale(adj, 1.0 / det);
}

function m4_invert(m) {
	let det = m4_determinant(m);

	if (det == 0.0) {
		console.error("WARNING: Trying to invert a matrix with a zero determinant\n");
		m[1]  = m[2]  = m[3]  = 0.0;
		m[4]  = m[6]  = m[7]  = 0.0;
		m[8]  = m[9]  = m[11] = 0.0;
		m[12] = m[13] = m[14] = 0.0;
		m[0]  = m[5]  = m[10] = m[15] = 1.0;
		return;
	}

	let adj = m4_adjugate(m);
	let inv = m4_scale(adj, 1.0 / det);

	m[0]  = inv[0]; m[1]   = inv[1]; m[2]   = inv[2]; m[3]   = inv[3];
	m[4]  = inv[4]; m[5]   = inv[5]; m[6]   = inv[6]; m[7]   = inv[7];
	m[8]  = inv[8]; m[9]   = inv[9]; m[10]  = inv[10]; m[11] = inv[11];
	m[12] = inv[12]; m[13] = inv[13]; m[14] = inv[14]; m[15] = inv[15];
}

function m4_frustum(l, r, b, t, n, f) {
	if (l == r || t == b || n == f) {
		console.error("WARNING: Trying to create invalid frustum\n");
		return m4_identity();
	}
	return [
		(2.0 * n) / (r - l), 0.0                , 0.0                   ,  0.0,
		0.0                , (2.0 * n) / (t - b), 0.0                   ,  0.0,
		(r + l) / (r - l)  , (t + b) / (t - b)  , (-(f + n)) / (f - n)  , -1.0,
		0.0                , 0.0                , (-2 * f * n) / (f - n),  0.0
	];
}

function m4_perspective(fov, aspect, znear, zfar) {
	let ymax = znear * Math.tan(fov * 3.14159265359 / 360.0);
	let xmax = ymax * aspect;

	return m4_frustum(-xmax, xmax, -ymax, ymax, znear, zfar);
}

function m4_ortho(l, r, b, t, n, f) {
	if (l == r || t == b || n == f) {
		return m4_identity();
	}
	return [
		2.0 / (r - l)       , 0.0                 , 0.0                 , 0.0,
		0.0                 , 2.0 / (t - b)       , 0.0                 , 0.0,
		0.0                 , 0.0                 , -2.0 / (f - n)      , 0.0,
		-((r + l) / (r - l)), -((t + b) / (t - b)), -((f + n) / (f - n)), 1.0
	];
}

function m4_lookAt(position, target, up) {
	let f = v3_scale(v3_normalized(v3_sub(target, position)), -1.0);
	let r = v3_cross(up, f);
	if (v3_eq(r, v3_zero())) {
		return m4_identity();
	}
	v3_normalize(r);
	let u = v3_normalized(v3_cross(f, r));

	let t = [
		-v3_dot(r, position),
		-v3_dot(u, position),
		-v3_dot(f, position)
	];

	return [ 
		r[0], u[0], f[0], 0.0,
		r[1], u[1], f[1], 0.0,
		r[2], u[2], f[2], 0.0,
		t[0], t[1], t[2], 1.0
	];
}