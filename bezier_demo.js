/*jshint esversion: 6 */


function BezierDemo(canvas) {
	SampleCanvas.call(this, canvas);
	this.mDebugName = "BezierDemo";
	this.mAnimationTime = 0.0;

	this.mCurve = new BezierCurve(function interp(start, end, time) {
		let len = start.length;
		if (len != end.length) {
			console.error("can't interpolate");
		}
		let result = [];
		for (let i = 0; i < len; ++i) {
			result.push(
				start[i] + ((end[i] - start[i]) * time)
			);
		}
		return result;
	});
}

BezierDemo.prototype = Object.create(SampleCanvas.prototype);
BezierDemo.prototype.constructor = BezierDemo;


BezierDemo.prototype.lerp = function(start, end, time) {
		let len = start.length;
		if (len != end.length) {
			console.error("can't interpolate");
		}
		let result = [];
		for (let i = 0; i < len; ++i) {
			result.push(
				start[i] + ((end[i] - start[i]) * time)
			);
		}
		return result;
	}

BezierDemo.prototype.Initialize = function (ctx) {
	this.mCurve.P1 = [1, 6];
	this.mCurve.P2 = [9, 6];
	this.mCurve.C1 = [2.5, 0.5];
	this.mCurve.C2 = [10, 0.5];
};

BezierDemo.prototype.Load = function(ctx) {
	return true;
};

BezierDemo.prototype.Update = function(ctx, deltaTime) {
	this.mAnimationTime  += deltaTime * 0.1; 
	while (this.mAnimationTime > 1.0) {
		this.mAnimationTime -= 1.0;
	}
};

BezierDemo.prototype.Render = function(ctx, aspectRatio) {
	let x = 0;
	let y = 0;
	let width = this.mCanvas.width;
	let height = this.mCanvas.height;
	let radius = Math.floor(window.devicePixelRatio * 5.0);

	let inv_range = 1.0 / 6.5;
	let ratio = this.mCanvas.height / this.mCanvas.width;

	let P1 = [(this.mCurve.P1[0] * inv_range * width + x) * ratio, (this.mCurve.P1[1] * height * inv_range + y)];
	let P2 = [(this.mCurve.P2[0] * inv_range * width + x) * ratio, (this.mCurve.P2[1] * height * inv_range + y)];
	let C1 = [(this.mCurve.C1[0] * inv_range * width + x) * ratio, (this.mCurve.C1[1] * height * inv_range + y)];
	let C2 = [(this.mCurve.C2[0] * inv_range * width + x) * ratio, (this.mCurve.C2[1] * height * inv_range + y)];

	let A = this.lerp(P1, C1, this.mAnimationTime);
	let B = this.lerp(C2, P2, this.mAnimationTime);
	let C = this.lerp(C1, C2, this.mAnimationTime);
	let E = this.lerp(A, C, this.mAnimationTime);
	let F = this.lerp(C, B, this.mAnimationTime);
	let R = this.lerp(E, F, this.mAnimationTime);

	let numSteps = 100;
	let t_step = 1.0 / numSteps
	let t = 0.0;

	ctx.fillStyle = "rgb(56, 63, 71)";
	ctx.fillRect(0, 0, width, height);

	// Static bezier path
	ctx.beginPath();
	ctx.moveTo(P1[0], P1[1]);
	ctx.bezierCurveTo(C1[0], C1[1], C2[0], C2[1], P2[0], P2[1]);
	ctx.strokeStyle = "rgba(179, 188, 216, 0.3)"
	ctx.stroke(); 

	// Aniamted bezier path
	ctx.beginPath();
	ctx.moveTo(P1[0], P1[1]);
	let P = null;
	for (let i = 0; i < numSteps; ++i) {
		t += t_step;
		let P = this.mCurve.Interpolate(t);
		ctx.lineTo((P[0] * inv_range * width + x) * ratio, (P[1] * height * inv_range + y));
		if (t > this.mAnimationTime) {
			break;
		}
	}
	ctx.strokeStyle = "rgb(179, 188, 216)"
	let oldWidth = ctx.lineWidth;
	ctx.lineWidth = 4;
	ctx.stroke();
	ctx.lineWidth = oldWidth;

	// Dashed lines
	ctx.beginPath();
	ctx.moveTo(P1[0], P1[1]);
	ctx.lineTo(C1[0], C1[1]);
	ctx.moveTo(P2[0], P2[1]);
	ctx.lineTo(C2[0], C2[1]);
	ctx.moveTo(C1[0], C2[1]);
	ctx.lineTo(C2[0], C2[1]);
	ctx.moveTo(E[0], E[1]);
	ctx.lineTo(F[0], F[1]);
	ctx.moveTo(A[0], A[1]);
	ctx.lineTo(C[0], C[1]);
	ctx.moveTo(C[0], C[1]);
	ctx.lineTo(B[0], B[1]);
	ctx.strokeStyle = "rgb(179, 188, 216)"
	ctx.setLineDash([window.devicePixelRatio * 10, window.devicePixelRatio * 10]);
	ctx.stroke();
	ctx.setLineDash([]);

	// Red dots
	ctx.beginPath();
	ctx.moveTo(A[0], A[1]);
	ctx.arc(A[0], A[1], radius, 0, 2 * Math.PI, false);
	ctx.moveTo(C[0], C[1]);
	ctx.arc(C[0], C[1], radius, 0, 2 * Math.PI, false);
	ctx.moveTo(B[0], B[1]);
	ctx.arc(B[0], B[1], radius, 0, 2 * Math.PI, false);
	ctx.fillStyle = "rgb(179, 188, 216)"
	ctx.fill();

	// Red dot
	ctx.beginPath();
	ctx.moveTo(R[0], R[1]);
	ctx.arc(R[0], R[1], radius, 0, 2 * Math.PI, false);
	ctx.fillStyle = '#C20E0E';
	ctx.fill();

	// Points
	ctx.beginPath();
	ctx.moveTo(P1[0], P1[1]);
	ctx.arc(P1[0], P1[1], radius, 0, 2 * Math.PI, false);
	ctx.fillStyle = '#0061D9';
	ctx.fill();

	ctx.beginPath();
	ctx.arc(P2[0], P2[1], radius, 0, 2 * Math.PI, false);
	ctx.fillStyle = '#00950E';
	ctx.fill();

	ctx.beginPath();
	ctx.arc(C1[0], C1[1], radius, 0, 2 * Math.PI, false);
	ctx.fillStyle = '#B100A2';
	ctx.fill();

	ctx.beginPath();
	ctx.arc(C2[0], C2[1], radius, 0, 2 * Math.PI, false);
	ctx.fillStyle = '#B35C00';
	ctx.fill();
};