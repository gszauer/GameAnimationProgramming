/*jshint esversion: 6 */
// Sample 02 shows that we can display a static mesh. 
//CPU skinning might be added later....
function FullPageAnimated(gl, canvas) {
	Sample.call(this, gl, canvas);

	this.mWomanMesh = null;
	this.mWomanTexture = null;

	this.mWomanRestPose = null;
	this.mWomanBindPose = null;
	this.mWomanSkeleton = null;

	this.mWalkingClip = null;
	this.mWomanAnimatedPose = null;
	this.mWomanPlaybackTime = 0.0;

	this.mPosePalette = null;
	this.mInvBindPalette = null;
	this.mCombinedPalette = null;

	this.mShaders = null;
	
	this.mAttribPos = null;
	this.mAttribNorm = null;
	this.mAttribUV = null;
	this.mAttribWeights = null;
	this.mAttribIndices = null;
	this.mUniformModel = null;
	this.mUniformMVP = null;
	this.mUniformTex = null;
	this.mUniformPoseTex = null;
	this.mUniformNumBones = null;
	
	//this.mPoseUniforms = null;
	//this.mInvUniforms = null;
	this.mPaletteUniforms = null;

	this.mBoneMatrixtexture = null;
	this.mBoneArray = null;

	this.mDebugName = "FullPageAnimated";
	this.mSkipClear = true;
}

FullPageAnimated.prototype = Object.create(Sample.prototype);
FullPageAnimated.prototype.constructor = FullPageAnimated;

FullPageAnimated.prototype.Initialize = function (gl) {
	this.mSkipClear = true;
	this.mShaders = [];
	// TODO: OR NULL!
	this.mShaders.push(this.mCanGPUSkinUsingUniforms? LoadShaderFromFile(gl, "skinned.vert", "lit.frag") : null);
	this.mShaders.push(this.mCanGPUSkinUsingTextures? LoadShaderFromFile(gl, "tex_skinned.vert", "lit.frag") : null);
	this.mShaders.push(LoadShaderFromFile(gl, "static.vert", "lit.frag"));

	this.mDisplayTexture = LoadTextureFromFile(gl, "Woman.png");
	this.mWomanMesh = new Mesh(gl, "Woman.mesh");
	this.mWomanSkeleton = new Skeleton();
	this.mWomanSkeleton.LoadFromFile("Woman.skel");
	this.mWalkingClip = new Clip();
	this.mWalkingClip.LoadFromFile("Walking.anim");

	this.mBoneMatrixtexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, this.mBoneMatrixtexture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.bindTexture(gl.TEXTURE_2D, null);
};

FullPageAnimated.prototype.Load = function(gl) {
	if (ShaderIsDoneLoading(gl, this.mShaders[0]) && ShaderIsDoneLoading(gl, this.mShaders[1]) && ShaderIsDoneLoading(gl, this.mShaders[2])  && TextureIsDoneLoading(gl, this.mDisplayTexture) && this.mWomanMesh.IsLoaded() && this.mWomanSkeleton.IsLoaded() && this.mWalkingClip.IsLoaded()) {
		this.mWalkingClip.RecalculateDuration();
		this.mWomanMesh.UpdateOpenGLBuffers();

		this.mWomanRestPose = new Pose();
		this.mWomanRestPose.Copy(this.mWomanSkeleton.mRestPose);
		this.mWomanBindPose = new Pose();
		this.mWomanBindPose.Copy(this.mWomanSkeleton.mBindPose);
		this.mWomanAnimatedPose = new Pose();
		this.mWomanAnimatedPose.Copy(this.mWomanSkeleton.mRestPose);
		
		this.mWomanPlaybackTime = this.mWalkingClip.GetStartTime();
		this.mPosePalette = [];
		this.mCombinedPalette = [];
		this.mInvBindPalette = [];
		this.mWomanAnimatedPose.GetMatrixPalette(this.mPosePalette);
		this.mInvBindPalette = this.mWomanSkeleton.GetInvBindPose();
		for (let i = 0; i < this.mPosePalette.length; ++i) {
			this.mCombinedPalette.push(m4_identity());
		}

		this.mAttribPos = [];
		this.mAttribNorm= [];
		this.mAttribUV= [];
		this.mAttribWeights = [];
		this.mAttribIndices = [];
		this.mUniformModel = [];
		this.mUniformMVP = [];
		this.mUniformTex = [];
		this.mUniformPoseTex = [];
		this.mUniformNumBones = [];

		for (let i = 0; i < 3; ++i) {
			this.mAttribPos.push(this.mShaders[i] == null? null : ShaderGetAttribute(gl, this.mShaders[i], "position"));
			this.mAttribNorm.push(this.mShaders[i] == null? null : ShaderGetAttribute(gl, this.mShaders[i], "normal"));
			this.mAttribUV.push(this.mShaders[i] == null? null : ShaderGetAttribute(gl, this.mShaders[i], "texCoord"));
			this.mAttribWeights.push(this.mShaders[i] == null? null : ShaderGetAttribute(gl, this.mShaders[i], "weights"));
			this.mAttribIndices.push(this.mShaders[i] == null? null : ShaderGetAttribute(gl, this.mShaders[i], "joints"));
			this.mUniformModel.push(this.mShaders[i] == null? null : ShaderGetUniform(gl, this.mShaders[i], "model"));
			this.mUniformMVP.push(this.mShaders[i] == null? null : ShaderGetUniform(gl, this.mShaders[i], "mvp"));
			this.mUniformTex.push(this.mShaders[i] == null? null : ShaderGetUniform(gl, this.mShaders[i], "tex0"));
			this.mUniformPoseTex.push(this.mShaders[i] == null? null : ShaderGetUniform(gl, this.mShaders[i], "boneMatrixTexture"));
			this.mUniformNumBones.push(this.mShaders[i] == null? null : ShaderGetUniform(gl, this.mShaders[i], "numBones"));
		}
		let len = this.mPosePalette.length;
		//this.mPoseUniforms = [];
		//this.mInvUniforms = [];
		this.mPaletteUniforms = [];
		for (let i = 0; i < len; ++i) {
			//this.mPoseUniforms.push(this.mShaders[0] == null? null : ShaderGetUniform(gl, this.mShaders[0], "pose[" + i + "]"));
			//this.mInvUniforms.push(this.mShaders[0] == null? null : ShaderGetUniform(gl, this.mShaders[0], "invBindPose[" + i + "]"));
			this.mPaletteUniforms.push(this.mShaders[0] == null? null : ShaderGetUniform(gl, this.mShaders[0], "palette[" + i + "]"));
		}

		if (this.mPosePalette.length != this.mInvBindPalette.length || this.mPosePalette.length != this.mCombinedPalette.length) {
			console.error("bad pose lengths");
		}
		this.mBoneArray = new Float32Array(this.mPosePalette.length * 16);
		
		this.mVertexPositions = MakeAttribute(gl);
		this.mVertexNormals = MakeAttribute(gl);
		this.mVertexTexCoords = MakeAttribute(gl);
		this.mIndexBuffer = MakeIndexBuffer(gl);

		return true;
	}
	return false;
};

FullPageAnimated.prototype.Update = function(gl, deltaTime) {
	this.mWomanPlaybackTime = this.mWalkingClip.Sample(this.mWomanAnimatedPose, this.mWomanPlaybackTime + deltaTime);

	// TODO: Potentially fix vertices if needed!

	if (this.mCanGPUSkinUsingUniforms) {
		this.mWomanAnimatedPose.GetMatrixPalette(this.mPosePalette);
		let len = this.mPosePalette.length;
		for (let i = 0; i < len; ++i) {
			this.mCombinedPalette[i] = m4_mul(this.mPosePalette[i], this.mInvBindPalette[i]);
		}
	}
	else if (this.mCanGPUSkinUsingTextures) {
		this.mWomanAnimatedPose.GetMatrixPalette(this.mPosePalette);
		let numBones = this.mPosePalette.length;
		let bai = 0; // bone array index
		for (let i = 0; i < numBones; ++i) {
			let combined = m4_mul(this.mPosePalette[i], this.mInvBindPalette[i]);

			let mai = 0; // matrix array index
			this.mBoneArray[bai++] = combined[mai++]; // 1
			this.mBoneArray[bai++] = combined[mai++]; // 2
			this.mBoneArray[bai++] = combined[mai++]; // 3
			this.mBoneArray[bai++] = combined[mai++]; // 4
			this.mBoneArray[bai++] = combined[mai++]; // 5
			this.mBoneArray[bai++] = combined[mai++]; // 6
			this.mBoneArray[bai++] = combined[mai++]; // 7
			this.mBoneArray[bai++] = combined[mai++]; // 8
			this.mBoneArray[bai++] = combined[mai++]; // 9
			this.mBoneArray[bai++] = combined[mai++]; // 10
			this.mBoneArray[bai++] = combined[mai++]; // 11
			this.mBoneArray[bai++] = combined[mai++]; // 12
			this.mBoneArray[bai++] = combined[mai++]; // 13
			this.mBoneArray[bai++] = combined[mai++]; // 14
			this.mBoneArray[bai++] = combined[mai++]; // 15
			this.mBoneArray[bai++] = combined[mai++]; // 16
		}

		gl.bindTexture(gl.TEXTURE_2D, this.mBoneMatrixtexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 4, numBones, 0, gl.RGBA, gl.FLOAT, this.mBoneArray);
	}
	else {
		this.mWomanMesh.CPUSkin(this.mWomanSkeleton, this.mWomanAnimatedPose);
	}
};

FullPageAnimated.prototype.Render = function(gl, aspectRatio) {
	if (this.mCanGPUSkinUsingUniforms) {
		gl.clearColor(0.5, 0.6, 0.7, 1.0);
	}
	else if (this.mCanGPUSkinUsingTextures) {
		gl.clearColor(0.5, 0.7, 0.6, 1.0);
	}
	else {
		gl.clearColor(0.7, 0.5, 0.6, 1.0);
	}
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	let near = this.mNear? this.mNear : 3.0;
	let far = this.mFar? this.mFar : 100.0;

	let projection = m4_perspective(60.0, aspectRatio, near, far);
	let view = m4_lookAt([0, 5, 7], [0, 3, 0], [0, 1, 0]);
	let model = m4_identity();
	let mvp = m4_mul(m4_mul(projection, view), model);


	if (this.mCanGPUSkinUsingUniforms) {
		let r = 0;
		ShaderBind(gl, this.mShaders[r]);

		UniformMat4(gl, this.mUniformModel[r], model);
		UniformMat4(gl, this.mUniformMVP[r], mvp);

		let size = this.mPosePalette.length;
		for (let i = 0; i < size; ++i) {
			UniformMat4(gl, this.mPaletteUniforms[i], this.mCombinedPalette[i]);
			//UniformMat4(gl, this.mPoseUniforms[i], this.mPosePalette[i]);
			//UniformMat4(gl, this.mInvUniforms[i], this.mInvBindPalette[i]);
		}
		
		TextureBind(gl, this.mDisplayTexture, this.mUniformTex[r], 0);

		this.mWomanMesh.Bind(this.mAttribPos[r], this.mAttribNorm[r], this.mAttribUV[r], this.mAttribWeights[r], this.mAttribIndices[r]);
		this.mWomanMesh.Draw();
		this.mWomanMesh.UnBind(this.mAttribPos[r], this.mAttribNorm[r], this.mAttribUV[r], this.mAttribWeights[r], this.mAttribIndices[r]);

		TextureUnbind(gl, 0);

		ShaderUnbind(gl);
	}
	else if (this.mCanGPUSkinUsingTextures) {
		let r = 1;
		ShaderBind(gl, this.mShaders[r]);

		UniformMat4(gl, this.mUniformModel[r], model);
		UniformMat4(gl, this.mUniformMVP[r], mvp);
		UniformInt(gl, this.mUniformNumBones[r], this.mInvBindPalette.length);
		
		TextureBind(gl, this.mDisplayTexture, this.mUniformTex[r], 0);
		gl.activeTexture(gl.TEXTURE0 + 1);
		gl.bindTexture(gl.TEXTURE_2D, this.mBoneMatrixtexture);
		gl.uniform1i(this.mUniformPoseTex[r], 1);

		this.mWomanMesh.Bind(this.mAttribPos[r], this.mAttribNorm[r], this.mAttribUV[r], this.mAttribWeights[r], this.mAttribIndices[r]);
		this.mWomanMesh.Draw();
		this.mWomanMesh.UnBind(this.mAttribPos[r], this.mAttribNorm[r], this.mAttribUV[r], this.mAttribWeights[r], this.mAttribIndices[r]);

		gl.activeTexture(gl.TEXTURE0 + 1);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.activeTexture(gl.TEXTURE0);
		TextureUnbind(gl, 0);

		ShaderUnbind(gl);
	}
	else {
		let r = 2;

		ShaderBind(gl, this.mShaders[r]);

		UniformMat4(gl, this.mUniformModel[r], model);
		UniformMat4(gl, this.mUniformMVP[r], mvp);
		TextureBind(gl, this.mDisplayTexture, this.mUniformTex[r], 0);

		this.mWomanMesh.Bind(this.mAttribPos[r], this.mAttribNorm[r], this.mAttribUV[r], -1, -1);
		this.mWomanMesh.Draw();
		this.mWomanMesh.UnBind(this.mAttribPos[r], this.mAttribNorm[r], this.mAttribUV[r], -1, -1);

		TextureUnbind(gl, 0);

		ShaderUnbind(gl);
	}
};