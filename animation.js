/*jshint esversion: 6 */

const INTERPOLATION = {
	CONSTANT: 0,
	LINEAR: 1,
	CUBIC: 2
};

const ANIMBASETYPE = {
	FLOAT: 0,
	VEC3: 1,
	QUAT: 2
};

function Frame(numComponents) {
	this.mValue = new Float32Array(numComponents);
	this.mIn = new Float32Array(numComponents);
	this.mOut = new Float32Array(numComponents);
	this.mTime = 0.0;
	this.mType = ANIMBASETYPE.FLOAT;
	
	if (numComponents == 1) {
		this.mType = ANIMBASETYPE.FLOAT;
	}
	else if (numComponents == 3) {
		this.mType = ANIMBASETYPE.VEC3;
	}
	else if (numComponents == 4) {
		this.mType = ANIMBASETYPE.QUAT;
	}
	else {
		console.error("Wrong number of components: " + numComponents);
	}
}

Clip.prototype.InterpolationFromString = function(st) {
	if (st == "cubic") {
		return INTERPOLATION.CUBIC;
	}
	else if (st == "linear") {
		return INTERPOLATION.LINEAR;
	}
	else if (st == "constant") {
		return INTERPOLATION.CONSTANT;
	}
	console.error("Unknown interpolation type");
	return INTERPOLATION.CONSTANT;
}

Clip.prototype.LoadFromFile = function(filePath) {
	let clip = this;
	clip.mLoaded = false;
	let vertXhttp = new XMLHttpRequest();
	vertXhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			let content = JSON.parse(this.responseText);

			clip.mName = content.name;
			clip.mStartTime = content.start;
			clip.mEndTime = content.end;
			clip.mLooping = content.looping;
			clip.mTracks = [];
			let iSize = content.tracks.length;
			for (let i = 0; i < iSize; ++i) {
				let track = new TransformTrack();
				track.mId = content.tracks[i].id;

				track.mPosition = new Track(3);
				track.mPosition.mInterpolation = clip.InterpolationFromString(content.tracks[i].position.interpolation);
				let refFrames = content.tracks[i].position.frames;
				let jSize = refFrames.length;
				for (let j = 0; j < jSize; ++j) {
					let frame = new Frame(3);

					frame.mValue = new Float32Array(refFrames[j].value);
					frame.mIn = new Float32Array(refFrames[j].in);
					frame.mOut = new Float32Array(refFrames[j].out);
					frame.mTime = refFrames[j].time;

					track.mPosition.mFrames.push(frame);
				}

				track.mRotation = new Track(4);
				track.mRotation.mInterpolation = clip.InterpolationFromString(content.tracks[i].rotation.interpolation);
				refFrames = content.tracks[i].rotation.frames;
				jSize = refFrames.length;
				for (let j = 0; j < jSize; ++j) {
					let frame = new Frame(4);

					frame.mValue = new Float32Array(refFrames[j].value);
					frame.mIn = new Float32Array(refFrames[j].in);
					frame.mOut = new Float32Array(refFrames[j].out);
					frame.mTime = refFrames[j].time;

					track.mRotation.mFrames.push(frame);
				}

				track.mScale = new Track(3);
				track.mScale.mInterpolation = clip.InterpolationFromString(content.tracks[i].scale.interpolation);
				refFrames = content.tracks[i].scale.frames;
				jSize = refFrames.length;
				for (let j = 0; j < jSize; ++j) {
					let frame = new Frame(3);

					frame.mValue = new Float32Array(refFrames[j].value);
					frame.mIn = new Float32Array(refFrames[j].in);
					frame.mOut = new Float32Array(refFrames[j].out);
					frame.mTime = refFrames[j].time;

					track.mScale.mFrames.push(frame);
				}

				clip.mTracks.push(track);
			}

			clip.mLoaded = true;
		}
	};
	vertXhttp.open("GET", filePath, true);
	vertXhttp.send();
}

function Track(numComponents) {
	this.mFrames = [];
	this.mInterpolation = INTERPOLATION.CONSTANT;

	if (numComponents == 1) {
		this.mType = ANIMBASETYPE.FLOAT;
	}
	else if (numComponents == 3) {
		this.mType = ANIMBASETYPE.VEC3;
	}
	else if (numComponents == 4) {
		this.mType = ANIMBASETYPE.QUAT;
	}
	else {
		console.error("Wrong number of components: " + numComponents);
	}
}

function TransformTrack() {
	this.mId = 0;
	this.mPosition = new Track(3);
	this.mRotation = new Track(4);
	this.mScale = new Track(3);
}

function Clip() {
	this.mTracks = [];
	this.mName = "";
	this.mStartTime = 0.0;
	this.mEndTime = 0.0;
	this.mLooping = true;
	this.mLoaded = true;
}

function Pose() {
	this.mJoints = [];
	this.mParents = [];
}

function Skeleton() {
	this.mRestPose = null;
	this.mBindPose = null;
	this.mInvBindPose = [];
	this.mJointNames = [];
	this.mLoaded = true;
}

Skeleton.prototype.LoadFromFile = function(filePath) { 
	let skeleton = this;
	skeleton.mLoaded = false;
	let vertXhttp = new XMLHttpRequest();
	vertXhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			let content = JSON.parse(this.responseText);

			skeleton.mRestPose = new Pose();
			let numJoints = content.rest.joints.length / 3;
			for (let i = 0; i < numJoints; ++i) {
				skeleton.mRestPose.mJoints.push(t_new(
					content.rest.joints[i * 3 + 0],
					content.rest.joints[i * 3 + 1],
					content.rest.joints[i * 3 + 2]
				));
			}
			skeleton.mRestPose.mParents = content.rest.parents;

			skeleton.mBindPose = new Pose();
			numJoints = content.bind.joints.length / 3;
			for (let i = 0; i < numJoints; ++i) {
				skeleton.mBindPose.mJoints.push(t_new(
					content.bind.joints[i * 3 + 0],
					content.bind.joints[i * 3 + 1],
					content.bind.joints[i * 3 + 2]
				));
			}
			skeleton.mBindPose.mParents = content.bind.parents;

			skeleton._UpdateInverseBindPose();
			skeleton.mJointNames = content.names;

			skeleton.mLoaded = true;
		}
		/*else {
			console.error("can't load: " + this.readyState + ", " + this.status);
		}*/
	};
	vertXhttp.open("GET", filePath, true);
	vertXhttp.send();
};

Track.prototype._ReturnDefault = function() {
	if (this.mType == ANIMBASETYPE.FLOAT) {
		return 0.0;
	}
	else if (this.mType == ANIMBASETYPE.VEC3) {
		return [0.0, 0.0, 0.0];
	}
	else if (this.mType == ANIMBASETYPE.QUAT) {
		return [0.0, 0.0, 0.0, 1.0];
	}
	console.error("invalid type");
	return null;
};

Track.prototype._GetValue = function(frame) {
	if (this.mType == ANIMBASETYPE.FLOAT) {
		return this.mFrames[frame].mValue[0];
	}
	else if (this.mType == ANIMBASETYPE.VEC3) {
		return [
			this.mFrames[frame].mValue[0],
			this.mFrames[frame].mValue[1],
			this.mFrames[frame].mValue[2]
		];
	}
	else if (this.mType == ANIMBASETYPE.QUAT) {
		return [
			this.mFrames[frame].mValue[0],
			this.mFrames[frame].mValue[1],
			this.mFrames[frame].mValue[2],
			this.mFrames[frame].mValue[3]
		];
	}
	console.log("invalid type");
	return null;
};

Track.prototype._GetIn = function(frame) {
	if (this.mType == ANIMBASETYPE.FLOAT) {
		return this.mFrames[frame].mIn[0];
	}
	else if (this.mType == ANIMBASETYPE.VEC3) {
		return [
			this.mFrames[frame].mIn[0],
			this.mFrames[frame].mIn[1],
			this.mFrames[frame].mIn[2]
		];
	}
	else if (this.mType == ANIMBASETYPE.QUAT) {
		return [
			this.mFrames[frame].mIn[0],
			this.mFrames[frame].mIn[1],
			this.mFrames[frame].mIn[2],
			this.mFrames[frame].mIn[3]
		];
	}
	console.log("invalid type");
	return null;
};

Track.prototype._GetOut = function(frame) {
	if (this.mType == ANIMBASETYPE.FLOAT) {
		return this.mFrames[frame].mOut[0];
	}
	else if (this.mType == ANIMBASETYPE.VEC3) {
		return [
			this.mFrames[frame].mOut[0],
			this.mFrames[frame].mOut[1],
			this.mFrames[frame].mOut[2]
		];
	}
	else if (this.mType == ANIMBASETYPE.QUAT) {
		return [
			this.mFrames[frame].mOut[0],
			this.mFrames[frame].mOut[1],
			this.mFrames[frame].mOut[2],
			this.mFrames[frame].mOut[3]
		];
	}
	console.log("invalid type");
	return null;
};

Track.prototype._ThisFrame = function(time, looping) {
	let thisFrame = this._FrameIndex(time, looping);
	if (thisFrame < 0 || thisFrame >= this.mFrames.length - 1) {
		console.error("invalid frame");
		return this._ReturnDefault();
	}
	return thisFrame;
};

Track.prototype._SampleConstant = function(time, looping) { 
	let thisFrame = this._FrameIndex(time, looping);
	if (thisFrame < 0 || thisFrame >= this.mFrames.length) {
		console.error("invalid frame");
		return this._ReturnDefault();
	}
	return this._GetValue(thisFrame);
};

Track.prototype._FrameDelta = function(thisFrame, nextFrame) {
	let frameDelta = this.mFrames[nextFrame].mTime - this.mFrames[thisFrame].mTime;
	if (frameDelta <= 0.0) {
		return this._ReturnDefault();
	}
	return frameDelta;
};

Track.prototype._T = function(time, looping, thisFrame, nextFrame) {
	let trackTime = this._AdjustTimeToFitTrack(time, looping);
	let frameDelta = this._FrameDelta(thisFrame, nextFrame);

	let t = (trackTime - this.mFrames[thisFrame].mTime) / frameDelta;
	return t;
};

Track.prototype._SampleLinear = function(time, looping) { 
	let thisFrame = this._ThisFrame(time, looping);
	let nextFrame = thisFrame + 1;

	let t = this._T(time, looping, thisFrame, nextFrame);
	let start = this._GetValue(thisFrame);
	let end = this._GetValue(nextFrame);

	if (this.mType == ANIMBASETYPE.FLOAT) {
		return start + (end - start) * t;
	}
	else if (this.mType == ANIMBASETYPE.VEC3) {
		return v3_lerp(start, end, t);
	}
	else if (this.mType == ANIMBASETYPE.QUAT) {
		if (q_dot(start, end) < 0) {
			return q_nlerp(start, q_negate(end), t);
		}
		return q_nlerp(start, end, t);
	}

	console.log("invalid type");
	return null;
};

Track.prototype._SampleCubic = function(time, looping) { 
	let thisFrame = this._ThisFrame(time, looping);
	let nextFrame = thisFrame + 1;

	let t = this._T(time, looping, thisFrame, nextFrame);
	let frameDelta = this._FrameDelta(thisFrame, nextFrame);

	let point1 = this._GetValue(thisFrame);
	let slope1 = this._GetOut(thisFrame);
	let point2 = this._GetValue(nextFrame);
	let slope2 = this._GetIn(nextFrame);

	if (this.mType == ANIMBASETYPE.FLOAT) {
		slope1 = slope1 * frameDelta;
		slope2 = slope2 * frameDelta;
	}
	else if (this.mType == ANIMBASETYPE.VEC3) {
		slope1 = v3_scale(slope1, frameDelta);
		slope2 = v3_scale(slope2, frameDelta);
	}
	else if (this.mType == ANIMBASETYPE.QUAT) {
		slope1 = q_scale(slope1, frameDelta);
		slope2 = q_scale(slope2, frameDelta);
	}
	else {
		console.log("bad type");
	}

	return this._Hermite(t, point1, slope1, point2, slope2);
};

Track.prototype._Hermite = function(time, point1, slope1, point2, slope2) {
	let tt = time * time;
	let ttt = tt * time;

	if (this.mType == ANIMBASETYPE.QUAT) {
		if (q_dot(point1, point2) < 0) {
			point2 = q_negate(point2);
		}
	}

	let h1 = 2.0 * ttt - 3.0 * tt + 1.0;
	let h2 = -2.0 * ttt + 3.0 * tt;
	let h3 = ttt - 2.0 * tt + time;
	let h4 = ttt - tt;

	if (this.mType == ANIMBASETYPE.FLOAT) {
		return (point1 * h1) + (point2 * h2) + (slope1 * h3) + (slope2 * h4);
	}
	else if (this.mType == ANIMBASETYPE.VEC3) {
		let a = v3_scale(point1, h1);
		let b = v3_scale(point2, h2);
		let c = v3_scale(slope1, h3);
		let d = v3_scale(slope2, h4);

		return v3_add(
			v3_add(a, b),
			v3_add(c, d)
		);
	}
	else if (this.mType == ANIMBASETYPE.QUAT) {
		let a = q_scale(point1, h1);
		let b = q_scale(point2, h2);
		let c = q_scale(slope1, h3);
		let d = q_scale(slope2, h4);

		return q_normalized(q_add(
			q_add(a, b),
			q_add(c, d)
		));
	}
	console.log("bad type");
	return null;
};

Track.prototype._FrameIndex = function(time, looping) { 
	let size = this.mFrames.length;
	if (size <= 1) {
		return -1;
	}

	if (looping) {
		let startTime = this.mFrames[0].mTime;
		let endTime = this.mFrames[size - 1].mTime;
		let duration = endTime - startTime;

		if (duration < 0.0) {
			console.error("negative duration");
			duration *= -1.0;
		}

		while(time < startTime) { time += duration; }
		while (time > endTime) { time -= duration; }
		if (time == endTime) { time = startTime; }
	}
	else {
		if (time < this.mFrames[0].mTime) {
			return 0;
		}
		if (time >= this.mFrames[size - 2].mTime) {
			return size - 2;
		}
	}

	for (let i = size - 1; i >= 0; --i) {
		if (time >= this.mFrames[i].mTime) {
			return i;
		}
	}

	console.error("frame not found");
	return -1;
};

Track.prototype._AdjustTimeToFitTrack = function(time, looping) { 
	let size = this.mFrames.length;
	if (size <= 1) {
		return 0.0;
	}

	let startTime = this.mFrames[0].mTime;
	let endTime = this.mFrames[size - 1].mTime;
	let duration = endTime - startTime;
	if (duration <= 0.0) {
		return 0.0;
	}

	if (looping) {
		while(time < startTime) { time += duration; }
		while (time > endTime) { time -= duration; }
		if (time == endTime) { time = startTime; }
	}
	else {
		if (time < this.mFrames[0].mTime) {
			time = startTime;
		}
		if (time >= this.mFrames[size - 2].mTime) {
			time = endTime;
		}
	}

	return time;
};

Track.prototype.Resize = function(newSize) { 
	let oldSize = this.mFrames.length;

	if (newSize < oldSize) {
		let delta = oldSize - newSize;
		for (let i = 0; i < delta; ++i) {
			this.mFrames.pop();
		}
	}
	else if (newSize > oldSize) {
		let delta = newSize - oldSize;
		for (let i = 0; i < delta; ++i) {
			if (this.mType == ANIMBASETYPE.FLOAT) {
				this.mFrames.push(new Frame(1));
			}
			else if (this.mType == ANIMBASETYPE.VEC3) {
				this.mFrames.push(new Frame(3));
			}
			else if (this.mType == ANIMBASETYPE.QUAT) {
				this.mFrames.push(new Frame(4));
			}
			else {
				console.log("error type");
			}
		}
	}
};

Track.prototype.Size = function() { 
	return this.mFrames.length;
};

Track.prototype.GetInterpolation = function() { 
	return this.mInterpolation;
};

Track.prototype.SetInterpolation = function(interpolationType) { 
	this.mInterpolation = interpolationType;
};

Track.prototype.Sample = function(time, looping) {
	if (this.mInterpolation == INTERPOLATION.CONSTANT) {
		return this._SampleConstant(time, looping);
	}
	else if (this.mInterpolation == INTERPOLATION.LINEAR) {
		return this._SampleLinear(time, looping);
	}
	else if (this.mInterpolation == INTERPOLATION.CUBIC) {
		return this._SampleCubic(time, looping);
	}
	console.error("wrong interpolation");
	return null;
};

Track.prototype.At = function(index) { 
	return this.mFrames[index];
};

Track.prototype.GetStartTime = function() { 
	return this.mFrames[0].mTime;
};

Track.prototype.GetEndTime = function() { 
	return this.mFrames[this.mFrames.length - 1].mTime;
};

TransformTrack.prototype.GetId = function() {
	return this.mId;
};

TransformTrack.prototype.SetId = function(id) { 
	this.mId = id;
};

TransformTrack.prototype.GetPositionTrack = function() { 
	return this.mPosition;
};

TransformTrack.prototype.GetRotationTrack = function() { 
	return this.mRotation;
};

TransformTrack.prototype.GetScaleTrack = function() { 
	return this.mScale;
};

TransformTrack.prototype.GetStartTime = function() { 
	let result = 0.0;
	let isSet = false;

	if (this.mPosition.mFrames.length > 1) {
		result = this.mPosition.GetStartTime();
		isSet = true;
	}
	if (this.mRotation.mFrames.length > 1) {
		let rotationStart = this.mRotation.GetStartTime();
		if (rotationStart < result || !isSet) {
			result = rotationStart;
			isSet = true;
		}
	}
	if (this.mScale.mFrames.length > 1) {
		let scaleStart = this.mScale.GetStartTime();
		if (scaleStart < result || !isSet) {
			result = scaleStart;
			isSet = true;
		}
	}

	return result;
};

TransformTrack.prototype.GetEndTime = function() { 
		let result = 0.0;
	let isSet = false;

	if (this.mPosition.mFrames.length > 1) {
		result = this.mPosition.GetEndTime();
		isSet = true;
	}
	if (this.mRotation.mFrames.length > 1) {
		let rotationEnd = this.mRotation.GetEndTime();
		if (rotationEnd > result || !isSet) {
			result = rotationEnd;
			isSet = true;
		}
	}
	if (this.mScale.mFrames.length > 1) {
		let scaleEnd = this.mScale.GetEndTime();
		if (scaleEnd > result || !isSet) {
			result = scaleEnd;
			isSet = true;
		}
	}

	return result;
};

TransformTrack.prototype.IsValid = function() { 
	return this.mPosition.mFrames.length > 1 || this.mRotatio.mFrames.length > 1 || this.mScale.mFrames.length > 1;
};

TransformTrack.prototype.Sample = function(reference, time, looping) { 
	let result = t_copy(reference);
	if (this.mPosition.mFrames.length > 1) {
		result.position = this.mPosition.Sample(time, looping);
	}
	if (this.mRotation.mFrames.length > 1) {
		result.rotation = this.mRotation.Sample(time, looping);
	}
	if (this.mScale.mFrames.length > 1) {
		result.scale = this.mScale.Sample(time, looping);
	}
	return result;
};

Clip.prototype.IsLoaded = function() {
	return this.mLoaded;
}

Clip.prototype._AdjustTimeToFitToRange = function(time) { 
	if (this.mLooping) {
		let duration = this.mEndTime - this.mStartTime;
		if (duration <= 0.0) {
			return 0.0;
		} 
		while(time < this.mStartTime) {
			time += duration;
		}
		while (time > this.mEndTime) {
			time -= duration;
		}
		if (time == this.mEndTime) {
			time = this.mStartTime;
		}
	}
	else {
		if (time < this.mStartTime) {
			time = this.mStartTime;
		}
		if (time > this.mEndTime) {
			time = this.mEndTime;
		}
	}
	return time;
};

Clip.prototype.GetIdAtIndex = function(index) { 
	return this.mTracks[index].GetId();
};

Clip.prototype.SetIdAtIndex = function(index, id) { 
	this.mTracks[index].SetId(id);
};

Clip.prototype.Size = function() { 
	return this.mTracks.length;
};

Clip.prototype.Sample = function(outPose, time) { 
	if (this.GetDuration() == 0.0) {
		return 0.0;
	}
	time = this._AdjustTimeToFitToRange(time);

	let size = this.mTracks.length;
	for (let i = 0; i < size; ++i) {
		let joint = this.mTracks[i].GetId();
		let local = outPose.GetLocalTransform(joint);
		let animated = this.mTracks[i].Sample(local, time, this.mLooping);
		outPose.SetLocalTransform(joint, animated);
	}
	return time;
};

Clip.prototype.At = function(index) { 
	let size = this.mTracks.length;
	for (let i = 0; i < size; ++i) {
		if (this.mTracks[i].GetId() == index) {
			return this.mTracks[i];
		}
	}

	this.mTracks.push(new TransformTrack());
	let track = this.mTracks[this.mTracks.length - 1];
	track.SetId(index);
	return track;

};

Clip.prototype.RecalculateDuration = function() { 
	this.mStartTime = 0.0;
	this.mEndTime = 0.0;

	let startSet = false;
	let endSet = false;
	let trackSize = this.mTracks.length;

	for (let i = 0; i < trackSize; ++i) {
		if (this.mTracks[i].IsValid()) {
			let trackStartTime = this.mTracks[i].GetStartTime();
			let trackEndTime = this.mTracks[i].GetEndTime();

			if (trackStartTime < this.mStartTime || !startSet) {
				this.mStartTime = trackStartTime;
				startSet = true;
			}

			if (trackEndTime > this.mEndTime || !endSet) {
				this.mEndTime = trackEndTime;
				endSet = true;
			}
		}
	}
};

Clip.prototype.GetName = function() { 
	return this.mName;
};

Clip.prototype.SetName = function(name) { 
	this.mName = name;
};

Clip.prototype.GetDuration = function() { 
	return this.mEndTime - this.mStartTime;
};

Clip.prototype.GetStartTime = function( ) { 
	return this.mStartTime;
};

Clip.prototype.GetEndTime = function() {
	return this.mEndTime;
};

Clip.prototype.GetLooping = function() { 
	return this.mLooping;
};

Clip.prototype.SetLooping = function(v) {
	this.mLooping = v;
};

Pose.prototype.Copy = function(p) {
	let size = p.mParents.length;

	this.mJoints = [];
	this.mParents = [];

	for (let i = 0; i < size; ++i) {
		this.mJoints.push(t_copy(p.mJoints[i]));
		this.mParents.push(p.mParents[i]);
	}
};

Pose.prototype.Resize = function(newSize) {
	let oldSize = this.mParents.length;

	if (newSize < oldSize) {
		let delta = oldSize - newSize;
		for (let i = 0; i < delta; ++i) {
			this.mParents.pop();
			this.mJoints.pop();
		}
	}
	else if (newSize > oldSize) {
		let delta = newSize - oldSize;
		for (let i = 0; i < delta; ++i) {
			this.mParents.push(-1);
			this.mJoints.push(t_identity());
		}
	}
};

Pose.prototype.Size = function() { 
	return this.mParents.length;
};

Pose.prototype.GetLocalTransform  = function(index) { 
	return t_copy(this.mJoints[index]);
};

Pose.prototype.SetLocalTransform = function(index, val) { 
	this.mJoints[index] = t_copy(val);
};

Pose.prototype.GetGlobalTransform = function(index) { 
	let result = t_copy(this.mJoints[index]);
	for (let parent = this.mParents[index]; parent >= 0; parent = this.mParents[parent]) {
		result = t_combine(this.mJoints[parent], result);
	}
	return result;
};

Pose.prototype.At = function(index) { 
	return this.GetGlobalTransform(index);
};

Pose.prototype.GetMatrixPalette = function(output) { 
	let size = this.Size();
	if (output.length != size) {
		if (output.length > size) {
			let delta = output.length - size;
			for (let i = 0; i < delta; ++i) {
				output.pop();
			}
		}
		if (output.length < size) {
			let delta = size - output.length;
			for (let i = 0; i < delta; ++i) {
				output.push(m4_identity());
			}
		}
	}

	let i = 0;
	for (; i < size; ++i) {
		let parent = this.mParents[i];
		if (parent > i) {
			break;
		}

		let glbl = t_toMat4(this.mJoints[i]);
		if (parent >= 0) {
			glbl = m4_mul(output[parent], glbl);
		}
		output[i] = glbl;
	}
	for (; i < size; ++i) {
		let t = this.GetGlobalTransform(i);
		output[i] = t_toMat4(t);
	}
};

Pose.prototype.GetParent = function(index) { 
	return this.mParents[index];
};

Pose.prototype.SetParent = function(index, parent) {
	this.mParents[index] = parent;
};

Skeleton.prototype._UpdateInverseBindPose = function() { 
	let size = this.mBindPose.Size();
	this.mInvBindPose = [];

	for (let i = 0; i < size; ++i) {
		let mat = t_toMat4(this.mBindPose.GetGlobalTransform(i));
		m4_invert(mat);
		this.mInvBindPose.push(mat);
	}
};

Skeleton.prototype.Set = function(rest, bind, names) { 
	this.mRestPose = new Pose();
	this.mRestPose.Copy(rest);
	this.mBindPose = new Pose();
	this.mBindPose.Copy(bind);
	this.mJointNames = names;
	this._UpdateInverseBindPose();
};

Skeleton.prototype.GetBindPose = function() {
	return this.mBindPose;
};

Skeleton.prototype.GetRestPose = function() {
	return this.mRestPose;
};

Skeleton.prototype.GetInvBindPose = function() {
	return this.mInvBindPose;
};

Skeleton.prototype.GetJointNames = function() {
	return this.mJointNames;
};

Skeleton.prototype.GetJointName = function(index) {
	return this.mJointNames[index];
};

Skeleton.prototype.IsLoaded = function() { 
	return this.mLoaded;
};