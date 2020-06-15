#version 100
precision mediump float;

uniform mat4 model;
uniform mat4 mvp;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 texCoord;

varying vec3 norm;
varying vec3 fragPos;
varying vec2 uv;

void main() {
	gl_Position = mvp * vec4(position, 1.0);
	
	fragPos = vec3(model * vec4(position, 1.0));
	norm = vec3(model * vec4(normal, 0.0));
	uv = texCoord;
}