#ifndef _H_CROWD_
#define _H_CROWD_

#include <vector>
#include "vec2.h"
#include "vec3.h"
#include "quat.h"
#include "Transform.h"
#include "Shader.h"
#include "Clip.h"

#define CROWD_MAX_ACTORS 80

struct Crowd {
protected:
	std::vector<vec3> mPositions;
	std::vector<quat> mRotations;
	std::vector<vec3> mScales;
	std::vector<ivec2> mFrames;
	std::vector<float> mTimes;

	std::vector<float> mCurrentPlayTimes;
	std::vector<float> mNextPlayTimes;
protected:
	float AdjustTime(float time, float start, float end, bool looping);
	void UpdatePlaybackTimes(float deltaTime, bool looping, float start, float end);
	void UpdateFrameIndices(float start, float duration, unsigned int texWidth);
	void UpdateInterpolationTimes(float start, float duration, unsigned int texWidth);
public:
	unsigned int Size();
	void Resize(unsigned int size);

	Transform GetActor(unsigned int index);
	void SetActor(unsigned int index, const Transform& t);

	void Update(float deltaTime, Clip& mClip, unsigned int texWidth);
	void SetUniforms(Shader* shader);
};


#endif 