#version 100
precision highp float;

uniform mat4 model;
uniform mat4 mvp;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 texCoord;
attribute vec4 weights;
attribute vec4 joints;

uniform sampler2D boneMatrixTexture;
uniform float numBones;

#define ROW0_U ((0.5 + 0.0) / 4.)
#define ROW1_U ((0.5 + 1.0) / 4.)
#define ROW2_U ((0.5 + 2.0) / 4.)
#define ROW3_U ((0.5 + 3.0) / 4.)
 
mat4 getBoneMatrix(float boneNdx) {
  float v = (boneNdx + 0.5) / numBones;
	return mat4(
		texture2D(boneMatrixTexture, vec2(ROW0_U, v)),
		texture2D(boneMatrixTexture, vec2(ROW1_U, v)),
		texture2D(boneMatrixTexture, vec2(ROW2_U, v)),
		texture2D(boneMatrixTexture, vec2(ROW3_U, v))
	);
}

void main() {
	mat4 bm0 = getBoneMatrix(joints.x);
	mat4 bm1 = getBoneMatrix(joints.y);
	mat4 bm2 = getBoneMatrix(joints.z);
	mat4 bm3 = getBoneMatrix(joints.w);

	vec4 pos =  bm0 * vec4(position, 1.0) * weights.x+
				bm1 * vec4(position, 1.0) * weights.y+
				bm2 * vec4(position, 1.0) * weights.z+
				bm3 * vec4(position, 1.0) * weights.w;

	gl_Position = mvp * pos;
}
