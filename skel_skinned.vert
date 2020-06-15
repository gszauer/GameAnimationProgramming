#version 100
precision mediump float;

uniform mat4 model;
uniform mat4 mvp;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 texCoord;
attribute vec4 weights;
attribute vec4 joints;

uniform mat4 palette[43];

void main() {
	mat4 skin =  palette[int(joints.x)] * weights.x;
		 skin += palette[int(joints.y)] * weights.y;
		 skin += palette[int(joints.z)] * weights.z;
		 skin += palette[int(joints.w)] * weights.w;

	gl_Position = mvp * skin * vec4(position, 1.0);
}
