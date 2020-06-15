/*jshint esversion: 6 */

function Mesh(gl, filePath) {
	this.mPosition = null;
	this.mNormal = null;
	this.mTexCoord = null;
	this.mWeights = null;
	this.mInfluences = null;
	this.mIndices = null;

	this.mCPUPositionRef = null;
	this.mCPUNormRef = null;
	this.mIsLoaded = false;

	this.mPosAttrib = MakeAttribute(gl);
	this.mNormAttrib = MakeAttribute(gl);
	this.mUvAttrib = MakeAttribute(gl);
	this.mWeightAttrib = MakeAttribute(gl);
	this.mInfluenceAttrib = MakeAttribute(gl);
	this.mIndexBuffer = MakeIndexBuffer(gl);

	this.mPosePalette = [];
	this.gl = gl;

	let mesh = this;
	let vertXhttp = new XMLHttpRequest();
	vertXhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			let content = JSON.parse(this.responseText);
			mesh.mPosition = new Float32Array(content.positions);
			mesh.mNormal = new Float32Array(content.normals);
			mesh.mTexCoord = new Float32Array(content.uvs);
			mesh.mWeights = new Float32Array(content.weights);
			mesh.mInfluences = new Float32Array(content.influences);
			mesh.mIndices =  (mesh.mIndexBuffer.componentType == INDEXBUFFER_TYPE.INT16)?new Uint16Array(content.indices) : new Uint32Array(content.indices);
			mesh.mCPUPositionRef = new Float32Array(content.positions);
			mesh.mCPUNormRef = new Float32Array(content.normals);
			mesh.mIsLoaded = true;
		}
	};
	vertXhttp.open("GET", filePath, true);
	vertXhttp.send();
}

Mesh.prototype.CPUSkin = function(skeleton, pose) {
	let numVerts = this.mPosition.length;
	if (numVerts == 0 || this.mInfluences.length == 0 || this.mWeights.length == 0) { 
		console.error("Mesh has no positions to skin");
		return;
	}
	numVerts = numVerts / 3;
	
	pose.GetMatrixPalette(this.mPosePalette);
	let invPosePalette = skeleton.GetInvBindPose();
	let numBones = this.mPosePalette.length;
	for (let i = 0; i < numBones; ++i) {
		this.mPosePalette[i] = m4_mul(this.mPosePalette[i], invPosePalette[i]);
	}

	for (let i = 0; i < numVerts; i++) {
		let j = [this.mInfluences[i * 4 + 0], this.mInfluences[i * 4 + 1], this.mInfluences[i * 4 + 2], this.mInfluences[i * 4 + 3]];
		let w = [this.mWeights[i * 4 + 0], this.mWeights[i * 4 + 1], this.mWeights[i * 4 + 2], this.mWeights[i * 4 + 3]];

		if (this.mCPUPositionRef.length > 0) {
			let p = [this.mCPUPositionRef[i * 3 + 0], this.mCPUPositionRef[i * 3 + 1], this.mCPUPositionRef[i * 3 + 2]];
			p = v3_add(
				v3_add(
					v3_scale(m4_transformPoint(this.mPosePalette[j[0]], p), w[0]),
					v3_scale(m4_transformPoint(this.mPosePalette[j[1]], p), w[1])
				),
				v3_add(
					v3_scale(m4_transformPoint(this.mPosePalette[j[2]], p), w[2]),
					v3_scale(m4_transformPoint(this.mPosePalette[j[3]], p), w[3])
				)
			);

			/*if (isNaN(p[0]) || isNaN(p[1]) || isNaN(p[2])) {
				console.logerror("skinned nan");
			}
			if (p[0] == p[1] && p[1] == p[2] && p[2] == 0.0) {
				console.log("skinned 0");
			}*/

			this.mPosition[i * 3 + 0] = p[0];
			this.mPosition[i * 3 + 1] = p[1];
			this.mPosition[i * 3 + 2] = p[2];
		}
		else {
			console.error("can't skin");
		}
		if (this.mNormal.length > 0 && this.mCPUNormRef.length > 0) {
			let n = [this.mCPUNormRef[i * 3 + 0], this.mCPUNormRef[i * 3 + 1], this.mCPUNormRef[i * 3 + 2]];
			n = v3_add(
				v3_add(
					(w[0] < 0.00001)? [0, 0, 0] : v3_scale(m4_transformVector(this.mPosePalette[j[0]], n), w[0]),
					(w[1] < 0.00001)? [0, 0, 0] : v3_scale(m4_transformVector(this.mPosePalette[j[1]], n), w[1])
				),
				v3_add(
					(w[2] < 0.00001)? [0, 0, 0] : v3_scale(m4_transformVector(this.mPosePalette[j[2]], n), w[2]),
					(w[3] < 0.00001)? [0, 0, 0] : v3_scale(m4_transformVector(this.mPosePalette[j[3]], n), w[3])
				)
			);
			this.mNormal[i * 3 + 0] = n[0];
			this.mNormal[i * 3 + 1] = n[1];
			this.mNormal[i * 3 + 2] = n[2];
		}
		else {
			console.error("can't skin");
		}
	}

	if (this.mPosition.length > 0) {
		AttributeVec3(this.gl, this.mPosAttrib, this.mPosition);
	}
	if (this.mNormal.length > 0) {
		AttributeVec3(this.gl, this.mNormAttrib, this.mNormal);
	}
}

Mesh.prototype.GetPosition = function() {
	return this.mPosition;
};

Mesh.prototype.GetNormal = function() {
	return this.mNormal;
};

Mesh.prototype.GetTexCoord = function() {
	return this.mTexCoord;
};

Mesh.prototype.GetWeights = function() {
	return this.mWeights;
};

Mesh.prototype.GetInfluences = function() {
	return this.mInfluences;
};

Mesh.prototype.GetIndices = function() {
	return this.mIndices;
};

Mesh.prototype.UpdateOpenGLBuffers = function() {
	if (this.mPosition.length > 0) {
		AttributeVec3(this.gl, this.mPosAttrib, this.mPosition);
	}
	if (this.mNormal.length > 0) {
		AttributeVec3(this.gl, this.mNormAttrib, this.mNormal);
	}
	if (this.mTexCoord.length > 0) {
		AttributeVec2(this.gl, this.mUvAttrib, this.mTexCoord);
	}
	if (this.mWeights.length > 0) {
		AttributeVec4(this.gl, this.mWeightAttrib, this.mWeights);
	}
	if (this.mInfluences.length > 0) {
		AttributeIVec4(this.gl, this.mInfluenceAttrib, this.mInfluences);
	}
	if (this.mIndices.length > 0) {
		IndexBufferData(this.gl, this.mIndexBuffer, this.mIndices);
	}
};

Mesh.prototype.Bind = function(pos, norm, tex, weight, influence) {
	if (pos >= 0) {
		AttributeBind(this.gl, this.mPosAttrib, pos);
	}
	if (norm >= 0) {
		AttributeBind(this.gl, this.mNormAttrib, norm);
	}
	if (tex >= 0) {
		AttributeBind(this.gl, this.mUvAttrib, tex);
	}
	if (weight >= 0) {
		AttributeBind(this.gl, this.mWeightAttrib, weight);
	}
	if (influence >= 0) {
		AttributeBind(this.gl, this.mInfluenceAttrib, influence);
	}
};

Mesh.prototype.Draw = function() {
	if (this.mIndices.length > 0) {
		Draw(this.gl, DRAW_MODE.TRIANGLES, this.mIndexBuffer);
	}
	else {
		Draw(this.gl, DRAW_MODE.TRIANGLES, this.mPosition.length);
	}
};

Mesh.prototype.DrawLines = function() {
	if (this.mIndices.length > 0) {
		Draw(this.gl, DRAW_MODE.LINES, this.mIndexBuffer);
	}
	else {
		Draw(this.gl, DRAW_MODE.LINES, this.mPosition.length);
	}
};

Mesh.prototype.UnBind = function(pos, norm, tex, weight, influence) {
	if (pos >= 0) {
		AttributeUnbind(this.gl, this.mPosAttrib, pos);
	}
	if (norm >= 0) {
		AttributeUnbind(this.gl, this.mNormAttrib, norm);
	}
	if (tex >= 0) {
		AttributeUnbind(this.gl, this.mUvAttrib, tex);
	}
	if (weight >= 0) {
		AttributeUnbind(this.gl, this.mWeightAttrib, weight);
	}
	if (influence >= 0) {
		AttributeUnbind(this.gl, this.mInfluenceAttrib, influence);
	}
};

Mesh.prototype.IsLoaded = function() {
	return this.mIsLoaded;
}