function BezierCurve(interpolateFunctions) {
	this.P1 = null;
	this.C1 = null;
	this.P2 = null;
	this.C2 = null;
	this._Interpolate = interpolateFunctions;
};

BezierCurve.prototype.Interpolate = function(t) {
	if (t < 0.0) { t = 0.0; }
	if (t > 1.0) { t = 1.0; }
    let A = this._Interpolate(this.P1, this.C1, t);
    let B = this._Interpolate(this.C2, this.P2, t);
    let C = this._Interpolate(this.C1, this.C2, t);

    let D = this._Interpolate(A, C, t);
    let E = this._Interpolate(C, B, t);

    let R = this._Interpolate(D, E, t);

    return R;
}