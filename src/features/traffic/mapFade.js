// Feather outer geometry into the transparent page background. Interior pixels
// retain full opacity and depth writes; zero-alpha fragments never occlude.
export function featherMapMaterial(material, yaw) {
  if (material.transparent) return;
  material.transparent = true;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.mapYaw = yaw;
    shader.vertexShader =
      "varying vec2 mapGround;\nuniform float mapYaw;\n" +
      shader.vertexShader.replace(
        "#include <project_vertex>",
        `#include <project_vertex>
      vec4 mapVertex = vec4(transformed, 1.0);
      #ifdef USE_INSTANCING
        mapVertex = instanceMatrix * mapVertex;
      #endif
      vec4 mapWorld = modelMatrix * mapVertex;
      mapGround = mat2(cos(mapYaw), sin(mapYaw), -sin(mapYaw), cos(mapYaw)) * mapWorld.xz;`,
      );
    shader.fragmentShader =
      `varying vec2 mapGround;
      float insideMapRect(vec2 p, vec2 center, vec2 halfSize) {
        vec2 q = abs(p - center) - halfSize;
        return -(length(max(q, 0.0)) + min(max(q.x, q.y), 0.0));
      }
    ` +
      shader.fragmentShader.replace(
        "#include <color_fragment>",
        `#include <color_fragment>
      float boundary = max(insideMapRect(mapGround, vec2(5.33, -1.15), vec2(16.27, 12.05)),
        max(insideMapRect(mapGround, vec2(22.85, -9.95), vec2(2.55, 3.25)),
            insideMapRect(mapGround, vec2(22.8, 0.0), vec2(1.8, 1.52))));
      diffuseColor.a *= smoothstep(0.0, 1.25, boundary);
      if(diffuseColor.a < 0.002) discard;`,
      );
  };
  material.customProgramCacheKey = () => "little-milwaukee-perimeter-v2";
}
