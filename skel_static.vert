#version 100
precision mediump float;

uniform mat4 model;
uniform mat4 mvp;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 texCoord;

void main() {
	gl_Position = mvp * vec4(position, 1.0);
}