"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Pastel shader background — pinks, lavenders, sage. Tweaked from the original
 * darker shader to suit a soft, cute aesthetic.
 */
export function ShaderAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    camera: THREE.Camera;
    scene: THREE.Scene;
    renderer: THREE.WebGLRenderer;
    uniforms: { time: { value: number }; resolution: { value: THREE.Vector2 } };
    animationId: number;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const vertexShader = `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `;

    // Pastel palette: blush (1.0, 0.55, 0.72), lavender (0.72, 0.62, 1.0), sage (0.62, 0.86, 0.72)
    const fragmentShader = `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;

      vec3 palette(float t) {
        // Soft pastel gradient cycling between blush -> lavender -> sage -> cream
        vec3 a = vec3(0.92, 0.78, 0.85);
        vec3 b = vec3(0.18, 0.10, 0.10);
        vec3 c = vec3(0.95, 0.95, 0.95);
        vec3 d = vec3(0.95, 0.65, 0.78); // phase shift
        return a + b * cos(6.28318 * (c * t + d));
      }

      void main(void) {
        vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
        float t = time * 0.04;
        float lineWidth = 0.0028;

        vec3 color = vec3(0.0);
        for (int j = 0; j < 3; j++) {
          for (int i = 0; i < 5; i++) {
            float fi = float(i);
            float fj = float(j);
            float d = abs(fract(t - 0.012 * fj + fi * 0.011) * 5.0 - length(uv) + mod(uv.x + uv.y, 0.22));
            float intensity = lineWidth * (fi * fi) / max(d, 0.0001);
            // Tint each layer with a pastel hue
            vec3 tint = palette(0.18 * fj + 0.04 * fi + t * 0.4);
            color += intensity * tint;
          }
        }

        // Lift to near-cream base so it never goes black
        vec3 base = vec3(1.0, 0.97, 0.95);
        vec3 finalColor = mix(base, base * 0.6 + color, clamp(length(color) * 0.8, 0.0, 1.0));
        finalColor = clamp(finalColor, 0.0, 1.0);

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    const camera = new THREE.Camera();
    camera.position.z = 1;

    const scene = new THREE.Scene();
    const geometry = new THREE.PlaneGeometry(2, 2);

    const uniforms = {
      time: { value: 1.0 },
      resolution: { value: new THREE.Vector2() },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const onResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      uniforms.resolution.value.x = renderer.domElement.width;
      uniforms.resolution.value.y = renderer.domElement.height;
    };
    onResize();
    window.addEventListener("resize", onResize);

    const animate = () => {
      const id = requestAnimationFrame(animate);
      uniforms.time.value += 0.04;
      renderer.render(scene, camera);
      if (sceneRef.current) sceneRef.current.animationId = id;
    };

    sceneRef.current = { camera, scene, renderer, uniforms, animationId: 0 };
    animate();

    return () => {
      window.removeEventListener("resize", onResize);
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animationId);
        if (container.contains(sceneRef.current.renderer.domElement)) {
          container.removeChild(sceneRef.current.renderer.domElement);
        }
        sceneRef.current.renderer.dispose();
        geometry.dispose();
        material.dispose();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 h-full w-full"
      style={{ overflow: "hidden" }}
      aria-hidden
    />
  );
}
