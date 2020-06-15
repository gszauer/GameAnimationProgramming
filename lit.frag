#version 100
precision mediump float;

varying vec3 norm;
varying vec3 fragPos;
varying vec2 uv;

uniform sampler2D tex0;

void main() {
	vec3 light = vec3(0, 1, 2);
	vec3 diffuseColor = vec3(texture2D(tex0, uv));

	vec3 n = normalize(norm);
	vec3 l = normalize(light);
	float diffuseIntensity = dot(n, l);
	
	if (diffuseIntensity < 0.0) {
		diffuseIntensity = 0.0;
	}
	if (diffuseIntensity > 1.0) {
		diffuseIntensity = 1.0;
	}

	gl_FragColor = vec4(diffuseColor * diffuseIntensity, 1);
}