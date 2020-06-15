/*jshint esversion: 6 */

function SampleCanvas(canvas) {
	this.mCanvas = canvas;
	this.mContext = canvas.getContext('2d');
	this.mIsRunning = false;
	this.mIsLoading =false;
	this.mDebugName = "SampleCanvas";
	this.mLastUpdateTime = performance.now();
	this.mNumFramesSinceLastResize = 0;
	this.mLastRequestedDisplayWidth = 0;
	this.mLastDesiredHeight = 0;
}

SampleCanvas.prototype.Initialize = function (ctx) { }

SampleCanvas.prototype.InvokeInitialize = function () {
	if (!this.mIsRunning && !this.mIsLoading) {
		this.Initialize(this.mContext);
		this.mIsRunning = false;
		this.mIsLoading = true;
	}
}

SampleCanvas.prototype.Load = function (ctx) { return true; }

SampleCanvas.prototype.InvokeLoad = function() {
	if (!this.mIsRunning && this.mIsLoading) {
		if (this.Load(this.mContext)) {
			this.mIsRunning = true;
			this.mIsLoading = false;
		}
	}
}

SampleCanvas.prototype.Update = function(ctx, deltaTime) { }


SampleCanvas.prototype.InvokeUpdate = function(deltaTime) {
	if (this.mIsRunning) {
		this.Update(this.mContext, deltaTime);
	}
}

SampleCanvas.prototype.Render = function(ctx, aspectRatio) { }

SampleCanvas.prototype.InvokeRender = function(aspectRatio) {
	this.mContext.clearRect(0, 0, this.mCanvas.width, this.mCanvas.height);
	if (this.mIsRunning) {
		this.Render(this.mContext, aspectRatio);
	}
}

SampleCanvas.prototype.Loop = function() {
	let bounds = this.mCanvas.getBoundingClientRect();

	let vVis = bounds.bottom >= 0  && bounds.top <= (window.innerHeight || document.documentElement.clientHeight);
	let hVis = bounds.right >= 0 && bounds.left <= (window.innerWidth || document.documentElement.clientWidth);
	let vis = hVis && vVis;
	this.InvokeInitialize();
	
	if (!vis) {
		return;
	}

	var realToCSSPixels = window.devicePixelRatio;
	var displayWidth  = Math.floor(this.mCanvas.clientWidth  * realToCSSPixels);
	var displayHeight = Math.floor(this.mCanvas.clientHeight * realToCSSPixels);

	if (this.mLastRequestedDisplayWidth !== displayWidth || this.mLastDesiredHeight !== displayHeight) {
		this.mNumFramesSinceLastResize += 1;
		if (this.mNumFramesSinceLastResize > 30) {
			this.mNumFramesSinceLastResize = 30;
		}
	}
	else {
		this.mNumFramesSinceLastResize -= 1;
		if (this.mNumFramesSinceLastResize < 0) {
			this.mNumFramesSinceLastResize = 0;
		}
	}

	this.mLastRequestedDisplayWidth = displayWidth;
	this.mLastDesiredHeight = displayHeight;

	if (this.mNumFramesSinceLastResize == 0 && (this.mCanvas.width  !== displayWidth || this.mCanvas.height !== displayHeight)) {
		this.mCanvas.width  = displayWidth;
		this.mCanvas.height = displayHeight;
		console.log("resizing canvas to: " + displayWidth + ", " + displayHeight);
	}

	let thisTime = performance.now();
	let lastTime = this.mLastUpdateTime;
	this.mLastUpdateTime = thisTime;

	let deltaTime = (thisTime - lastTime) * 0.001;
	let aspectRatio = displayWidth / displayHeight;
	if (deltaTime >= 0.0333) {
		deltaTime = 0.0333;
	}

	this.InvokeLoad();
	this.InvokeUpdate(deltaTime);
	this.InvokeRender(aspectRatio);
}