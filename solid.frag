#version 100
precision mediump float;

uniform vec3 fragmentColor;

void main() {
	gl_FragColor = vec4(fragmentColor, 1);
}