/*jshint esversion: 6 */

function Sample(gl, canvas) {
	this.mGl = gl;
	this.mCanvas = canvas;
	this.mIsRunning = false;
	this.mIsLoading =false;
	this.mHasArgument = false;
	this.mDebugName = "Sample";
	this.mLastUpdateTime = performance.now();
	this.mSkipClear = false;
	this.mSkipResize = false;
	this.mTimeMod = 1.0;
	this.mNear = null;
	this.mFar = null;

	this.mCanGPUSkinUsingTextures = IsExtensionSupported(gl, EXTENSION_TYPE.FLOATTEX);

	let numUniformsNeededToSkin = (43 * 4) + 5 + 4 + 4;
	let uniformsAvailable = gl.getParameter( gl.MAX_VERTEX_UNIFORM_VECTORS );
	this.mCanGPUSkinUsingUniforms = uniformsAvailable >= numUniformsNeededToSkin;

	//let vars = {};
	let sample = this;
	let parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
		//vars[key] = value;
		if (key=="skin") {
			sample.mHasArgument = true;
			if (value == "uniform" || value == "gpu") {
				sample.mCanGPUSkinUsingUniforms = true;
				sample.mCanGPUSkinUsingTextures = false;
			}
			else if (value == "texture" || value == "tex") {
				sample.mCanGPUSkinUsingUniforms = false;
				sample.mCanGPUSkinUsingTextures = true;
			}
			else if (value == "cpu") {
				sample.mCanGPUSkinUsingUniforms = false;
				sample.mCanGPUSkinUsingTextures = false;
			}
		}
		else if (key == "resize") {
			if (value == "no") {
				sample.mSkipResize = true;
			}
		}
		else if (key == "index") {
			if (value == "short") {
				// For documentation only
			}
		}
		else if (key=="time") {
			sample.mTimeMod  = parseFloat(value);
		}
		else if (key == "near" || key == "n") {
			sample.mNear = parseFloat(value);
		}
		else if (key == "far" || key == "f") {
			sample.mFar = parseFloat(value);
		}
	});

	this.mCanGPUSkin = this.mCanGPUSkinUsingUniforms || this.mCanGPUSkinUsingTextures;
	
	console.log("Can uniform skin: " + this.mCanGPUSkinUsingUniforms);
	console.log("Can texture skin: " + this.mCanGPUSkinUsingTextures);
	console.log("Can GPU Skin: " + this.mCanGPUSkin);
	console.log("int index buffer: " + IsExtensionSupported(EXTENSION_TYPE.UINTINDEX));

	//this.mLastDesiredWidth = 0;
	//this.mLastDesiredHeight = 0 ;
	//this.mLastCanvasStyleWidth = 0;
	//this.mLastCanvasStyleHeight = 0;

	this.mNumFramesSinceLastResize = 0;
	this.mLastRequestedDisplayWidth = 0;
	this.mLastDesiredHeight = 0;
}

Sample.prototype.Initialize = function (gl) { }

Sample.prototype.InvokeInitialize = function () {
	if (!this.mIsRunning && !this.mIsLoading) {
		this.Initialize(this.mGl);
		this.mIsRunning = false;
		this.mIsLoading = true;
	}
}

Sample.prototype.Load = function (gl) { return true; }

Sample.prototype.InvokeLoad = function() {
	if (!this.mIsRunning && this.mIsLoading) {
		if (this.Load(this.mGl)) {
			this.mIsRunning = true;
			this.mIsLoading = false;
		}
	}
}

Sample.prototype.Update = function(gl, deltaTime) { }


Sample.prototype.InvokeUpdate = function(deltaTime) {
	if (this.mIsRunning) {
		this.Update(this.mGl, deltaTime * this.mTimeMod);
	}
}

Sample.prototype.Render = function(gl, aspectRatio) { }

Sample.prototype.InvokeRender = function(aspectRatio) {
	if (!this.mSkipClear) {
		this.mGl.clearColor(0.5, 0.6, 0.7, 1.0);
		this.mGl.clear(this.mGl.COLOR_BUFFER_BIT | this.mGl.DEPTH_BUFFER_BIT);
	}
	if (this.mIsRunning) {
		this.Render(this.mGl, aspectRatio);
	}
}

Sample.prototype.Loop = function() {
	let bounds = this.mCanvas.getBoundingClientRect();

	let vVis = bounds.bottom >= 0  && bounds.top <= (window.innerHeight || document.documentElement.clientHeight);
	let hVis = bounds.right >= 0 && bounds.left <= (window.innerWidth || document.documentElement.clientWidth);
	let vis = hVis && vVis;
	this.InvokeInitialize();
	
	if (!vis) {
		return;
	}

	let gl = this.mGl;

	/*let resize = false;
	let desiredCSSWidth = gl.canvas.clientWidth;
	let desiredCSSHeight = gl.canvas.clientHeight;

	if (desiredCSSWidth != this.mLastDesiredWidth || desiredCSSHeight != this.mLastDesiredHeight) {
		resize = true;
	}
	if (this.mLastCanvasStyleWidth != Math.floor(desiredCSSWidth  * devicePixelRatio)) {
		resize = true;
	}
	if (this.mLastCanvasStyleHeight != Math.floor(desiredCSSHeight * devicePixelRatio)) {
		resize = true
	}

	if (resize) {
		let devicePixelRatio = window.devicePixelRatio || 1;

		gl.canvas.width  = Math.floor(desiredCSSWidth  * devicePixelRatio);
		gl.canvas.height = Math.floor(desiredCSSHeight * devicePixelRatio);

		gl.canvas.style.width  = desiredCSSWidth  + "px";
		gl.canvas.style.height = desiredCSSHeight + "px";

		this.mLastCanvasStyleWidth = gl.canvas.width;
		this.mLastCanvasStyleHeight = gl.canvas.height;

		gl.scissor(0, 0, gl.canvas.width, gl.canvas.height);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

		console.log("Resized: " + this.mDebugName);
	}
	this.mLastDesiredWidth = desiredCSSWidth;
	this.mLastDesiredHeight = desiredCSSHeight;*/

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
		if (!this.mSkipResize) {
			gl.canvas.width  = displayWidth;
			gl.canvas.height = displayHeight;
			gl.scissor(0, 0, this.mCanvas.width, this.mCanvas.height);
			gl.viewport(0, 0, this.mCanvas.width, this.mCanvas.height);
			//console.log("Resized: " + this.mDebugName);
		}
	}

	let thisTime = performance.now();
	let lastTime = this.mLastUpdateTime;
	this.mLastUpdateTime = thisTime;

	let deltaTime = (thisTime - lastTime) * 0.001;
	//let aspectRatio = desiredCSSWidth / desiredCSSHeight;
	let aspectRatio = displayWidth / displayHeight;

	if (deltaTime >= 0.0333) {
		deltaTime = 0.0333;
	}

	this.InvokeLoad();
	this.InvokeUpdate(deltaTime);
	this.InvokeRender(aspectRatio);
}