
uniform vec2 uFrequency;
uniform float uTime;

// attribute float aRandom;

// varying float vRandom;
varying float vTime;
varying vec2 vUv;
varying float vElevation;


void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    float elevation = sin(modelPosition.x * uFrequency.x - uTime) * 0.1;
    elevation += sin(modelPosition.y * uFrequency.y - uTime) * 0.1;

    // modelPosition.z += sin(aRandom) * 0.1;
    modelPosition.z += elevation;
    modelPosition.z += elevation;
    // modelPosition.z += cos(modelPosition.x * 10.0) * 0.1;
    // modelPosition.z += aRandom * 0.1;

    vec4 viewPosition = viewMatrix * modelPosition;

    vec4 projectedMatrix = projectionMatrix * viewPosition;


    gl_Position = projectedMatrix;
    // vRandom = aRandom;
    vTime = uTime;
    vUv = uv;
    vElevation = elevation;
}