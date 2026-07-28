"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

import type { ProjectTexture } from "@/types/project";

import styles from "./ProjectScene.module.css";

const INITIAL_PROJECT_INDEX = 36;
const MOBILE_BREAKPOINT = 768;
const VISIBLE_SLOT_START = -5.75;
const VISIBLE_SLOT_END = 7.15;
const TEXTURE_SLOT_START = -8.25;
const TEXTURE_SLOT_END = 10.25;
const MAX_TEXTURES = 20;

type Placement = {
  x: number;
  y: number;
  width: number;
  z: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
};

type MeshRuntime = {
  baseZ: number;
  baseWidth: number;
  baseHeight: number;
};

const desktopPlacements: Record<number, Placement> = {
  [-5]: {
    x: -34,
    y: 103,
    width: 34,
    z: 360,
    rotateX: 1.6,
    rotateY: -2.5,
    rotateZ: 4,
  },
  [-4]: {
    x: -15,
    y: 91,
    width: 38,
    z: 320,
    rotateX: 1.4,
    rotateY: -2.2,
    rotateZ: 3.2,
  },
  [-3]: {
    x: 2.5,
    y: 79,
    width: 40,
    z: 270,
    rotateX: 1.2,
    rotateY: -1.9,
    rotateZ: 5.6,
  },
  [-2]: {
    x: 19.5,
    y: 67,
    width: 30,
    z: 210,
    rotateX: 1,
    rotateY: -1.6,
    rotateZ: 5.8,
  },
  [-1]: {
    x: 35,
    y: 53,
    width: 31,
    z: 140,
    rotateX: 0.8,
    rotateY: -1.2,
    rotateZ: 5.4,
  },
  0: {
    x: 46,
    y: 44.5,
    width: 33.5,
    z: 65,
    rotateX: 0.5,
    rotateY: -0.7,
    rotateZ: 6,
  },
  1: {
    x: 59,
    y: 32.5,
    width: 38,
    z: -20,
    rotateX: 0.2,
    rotateY: 0,
    rotateZ: 4.5,
  },
  2: {
    x: 69.5,
    y: 16.5,
    width: 30,
    z: -110,
    rotateX: -0.1,
    rotateY: 0.7,
    rotateZ: 3.6,
  },
  3: {
    x: 79,
    y: 14,
    width: 31,
    z: -190,
    rotateX: -0.3,
    rotateY: 1,
    rotateZ: 3,
  },
  4: {
    x: 86,
    y: 7,
    width: 26,
    z: -270,
    rotateX: -0.5,
    rotateY: 1.4,
    rotateZ: -1.4,
  },
  5: {
    x: 95,
    y: 1,
    width: 23,
    z: -350,
    rotateX: -0.8,
    rotateY: 1.8,
    rotateZ: -1.8,
  },
  6: {
    x: 108,
    y: -9,
    width: 21,
    z: -430,
    rotateX: -1,
    rotateY: 2.2,
    rotateZ: -2.2,
  },
};

const mobilePlacements: Record<number, Placement> = {
  [-5]: {
    x: -170,
    y: 100,
    width: 90,
    z: 280,
    rotateX: 1.3,
    rotateY: -1.8,
    rotateZ: 2.6,
  },
  [-4]: {
    x: -130,
    y: 92,
    width: 90,
    z: 245,
    rotateX: 1.1,
    rotateY: -1.5,
    rotateZ: 2.1,
  },
  [-3]: {
    x: -100,
    y: 85,
    width: 95,
    z: 205,
    rotateX: 0.9,
    rotateY: -1.2,
    rotateZ: 6.4,
  },
  [-2]: {
    x: -55,
    y: 71,
    width: 90,
    z: 160,
    rotateX: 0.7,
    rotateY: -0.9,
    rotateZ: 6.2,
  },
  [-1]: {
    x: -18,
    y: 54,
    width: 82,
    z: 105,
    rotateX: 0.5,
    rotateY: -0.6,
    rotateZ: 6,
  },
  0: {
    x: 15,
    y: 40.5,
    width: 128,
    z: 35,
    rotateX: 0.2,
    rotateY: -0.2,
    rotateZ: 6,
  },
  1: {
    x: 55,
    y: 28.5,
    width: 110,
    z: -45,
    rotateX: 0,
    rotateY: 0.4,
    rotateZ: 4.8,
  },
  2: {
    x: 100,
    y: 22,
    width: 95,
    z: -125,
    rotateX: -0.2,
    rotateY: 0.7,
    rotateZ: 3.8,
  },
  3: {
    x: 140,
    y: 14,
    width: 90,
    z: -200,
    rotateX: -0.4,
    rotateY: 1,
    rotateZ: -1.2,
  },
  4: {
    x: 178,
    y: 8,
    width: 82,
    z: -275,
    rotateX: -0.6,
    rotateY: 1.4,
    rotateZ: -1.6,
  },
  5: {
    x: 214,
    y: 1,
    width: 74,
    z: -350,
    rotateX: -0.8,
    rotateY: 1.8,
    rotateZ: -2,
  },
  6: {
    x: 248,
    y: -8,
    width: 68,
    z: -425,
    rotateX: -1,
    rotateY: 2.1,
    rotateZ: -2.4,
  },
};

function interpolate(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}

function placementForSlot(slot: number, mobile: boolean): Placement {
  const placements = mobile ? mobilePlacements : desktopPlacements;
  const knownPlacement = placements[slot];

  if (knownPlacement) {
    return knownPlacement;
  }

  if (slot < -5) {
    const edge = placements[-5];
    const distance = -5 - slot;

    return {
      x: edge.x - distance * (mobile ? 48 : 18),
      y: edge.y + distance * (mobile ? 10 : 13),
      width: edge.width,
      z: edge.z + distance * 45,
      rotateX: edge.rotateX,
      rotateY: edge.rotateY - distance * 0.25,
      rotateZ: edge.rotateZ + distance * 0.45,
    };
  }

  const edge = placements[6];
  const distance = slot - 6;

  return {
    x: edge.x + distance * (mobile ? 34 : 14),
    y: edge.y - distance * (mobile ? 9 : 11),
    width: Math.max(mobile ? 54 : 15, edge.width - distance * 1.8),
    z: edge.z - distance * 70,
    rotateX: edge.rotateX - distance * 0.15,
    rotateY: edge.rotateY + distance * 0.25,
    rotateZ: edge.rotateZ - distance * 0.35,
  };
}

function placementAt(relativeSlot: number, mobile: boolean): Placement {
  const lowerSlot = Math.floor(relativeSlot);
  const amount = relativeSlot - lowerSlot;
  const lower = placementForSlot(lowerSlot, mobile);
  const upper = placementForSlot(lowerSlot + 1, mobile);

  return {
    x: interpolate(lower.x, upper.x, amount),
    y: interpolate(lower.y, upper.y, amount),
    width: interpolate(lower.width, upper.width, amount),
    z: interpolate(lower.z, upper.z, amount),
    rotateX: interpolate(lower.rotateX, upper.rotateX, amount),
    rotateY: interpolate(lower.rotateY, upper.rotateY, amount),
    rotateZ: interpolate(lower.rotateZ, upper.rotateZ, amount),
  };
}

function wrappedRelativeSlot(index: number, progress: number, projects: ProjectTexture[]) {
  const count = projects.length;
  const half = count / 2;
  const unwrapped = index - INITIAL_PROJECT_INDEX - progress;

  return ((((unwrapped + half) % count) + count) % count) - half;
}

function cameraDistance(mobile: boolean) {
  return mobile ? 1150 : 1500;
}

function configureCamera(
  camera: THREE.PerspectiveCamera,
  width: number,
  height: number,
  mobile: boolean,
) {
  const distance = cameraDistance(mobile);

  camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(height / (2 * distance)));
  camera.aspect = width / height;
  camera.near = 0.1;
  camera.far = 4000;
  camera.position.set(0, 0, distance);
  camera.rotation.set(0, 0, 0);
  camera.updateProjectionMatrix();
}

function worldPositionForPlacement(
  placement: Placement,
  project: ProjectTexture,
  width: number,
  height: number,
  mobile: boolean,
) {
  const planeWidth = (placement.width / 100) * width;
  const planeHeight = planeWidth / project.aspectRatio;
  const rawCenterX = (placement.x / 100) * width + planeWidth / 2;
  const rawCenterY = (placement.y / 100) * height + planeHeight / 2;
  const distance = cameraDistance(mobile);
  const perspectiveScale = distance / (distance - placement.z);
  const perspectiveOriginX = width * (mobile ? 0.65 : 0.64);
  const perspectiveOriginY = height * (mobile ? 0.43 : 0.46);

  return {
    x:
      rawCenterX -
      width / 2 +
      (perspectiveOriginX - width / 2) * (1 / perspectiveScale - 1),
    y:
      height / 2 -
      rawCenterY +
      (height / 2 - perspectiveOriginY) * (1 / perspectiveScale - 1),
    width: planeWidth,
    height: planeHeight,
  };
}

export function ProjectScene({ projects }: { projects: ProjectTexture[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverLabelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const hoverLabel = hoverLabelRef.current;

    if (!canvas || !hoverLabel) {
      return;
    }

    const context = canvas.getContext("webgl2", {
      alpha: false,
      antialias: true,
      powerPreference: "high-performance",
    });

    if (!context) {
      canvas.dataset.webglUnavailable = "true";
      return;
    }

    const renderer = new THREE.WebGLRenderer({
      canvas,
      context,
      alpha: false,
      antialias: true,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 1);
    const maxTextureAnisotropy = Math.min(
      4,
      renderer.capabilities.getMaxAnisotropy(),
    );

    const scene = new THREE.Scene();
    const projectGroup = new THREE.Group();
    scene.add(projectGroup);

    const camera = new THREE.PerspectiveCamera();
    const geometry = new THREE.PlaneGeometry(1, 1);
    const materials = projects.map(
      () =>
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0,
          depthTest: true,
          depthWrite: true,
        }),
    );
    const meshes = projects.map((project, index) => {
      const mesh = new THREE.Mesh(geometry, materials[index]);
      mesh.visible = false;
      mesh.userData.projectIndex = index;
      mesh.userData.runtime = {
        baseZ: 0,
        baseWidth: 1,
        baseHeight: 1,
      } satisfies MeshRuntime;
      projectGroup.add(mesh);
      return mesh;
    });

    const textureLoader = new THREE.TextureLoader();
    const textureCache = new Map<number, THREE.Texture>();
    const pendingTextures = new Map<number, number>();
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();
    const targetProgress = { value: 0 };
    const currentProgress = { value: 0 };
    const pointerTarget = { x: 0, y: 0 };
    const pointerCurrent = { x: 0, y: 0 };
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    let reducedMotion = reducedMotionQuery.matches;
    let mobile = window.innerWidth < MOBILE_BREAKPOINT;
    let viewportWidth = Math.max(1, window.innerWidth);
    let viewportHeight = Math.max(1, window.innerHeight);
    let desiredTextureIndices = new Set<number>();
    let desiredTextureKey = "";
    let textureRequestId = 0;
    let hoveredIndex: number | null = null;
    let pointerInside = false;
    let contextLost = false;
    let disposed = false;
    let animationFrame = 0;
    let visibleMeshes: THREE.Mesh[] = [];

    const clearHover = () => {
      hoveredIndex = null;
      hoverLabel.dataset.visible = "false";
      canvas.style.cursor = "";
    };

    const applyTexture = (index: number, texture: THREE.Texture | null) => {
      const material = materials[index];
      material.map = texture;
      material.needsUpdate = true;
    };

    const disposeCachedTexture = (index: number) => {
      const texture = textureCache.get(index);

      if (!texture) {
        return;
      }

      applyTexture(index, null);
      texture.dispose();
      textureCache.delete(index);
    };

    const requestTexture = async (index: number) => {
      if (
        disposed ||
        textureCache.has(index) ||
        pendingTextures.has(index)
      ) {
        return;
      }

      const requestId = ++textureRequestId;
      pendingTextures.set(index, requestId);

      try {
        const texture = await textureLoader.loadAsync(projects[index].localPath);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = maxTextureAnisotropy;

        if (pendingTextures.get(index) !== requestId) {
          texture.dispose();
          return;
        }

        pendingTextures.delete(index);

        if (disposed || !desiredTextureIndices.has(index)) {
          texture.dispose();
          return;
        }

        textureCache.set(index, texture);
        applyTexture(index, texture);

        if (textureCache.size > MAX_TEXTURES) {
          for (const staleIndex of textureCache.keys()) {
            if (!desiredTextureIndices.has(staleIndex)) {
              disposeCachedTexture(staleIndex);
              break;
            }
          }
        }
      } catch {
        if (pendingTextures.get(index) === requestId) {
          pendingTextures.delete(index);
        }
      }
    };

    const syncTextureWindow = (progress: number) => {
      const candidates = projects
        .map((_, index) => ({
          index,
          relativeSlot: wrappedRelativeSlot(index, progress, projects),
        }))
        .filter(
          ({ relativeSlot }) =>
            relativeSlot > TEXTURE_SLOT_START &&
            relativeSlot < TEXTURE_SLOT_END,
        )
        .sort(
          (a, b) =>
            Math.abs(a.relativeSlot) - Math.abs(b.relativeSlot),
        )
        .slice(0, MAX_TEXTURES);
      const nextIndices = candidates.map(({ index }) => index).sort((a, b) => a - b);
      const nextKey = nextIndices.join(",");

      if (nextKey === desiredTextureKey) {
        return;
      }

      desiredTextureKey = nextKey;
      desiredTextureIndices = new Set(nextIndices);

      for (const index of textureCache.keys()) {
        if (!desiredTextureIndices.has(index)) {
          disposeCachedTexture(index);
        }
      }

      for (const index of desiredTextureIndices) {
        void requestTexture(index);
      }
    };

    const resizeRenderer = () => {
      viewportWidth = Math.max(1, window.innerWidth);
      viewportHeight = Math.max(1, window.innerHeight);
      mobile = viewportWidth < MOBILE_BREAKPOINT;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.setSize(viewportWidth, viewportHeight, false);
      configureCamera(camera, viewportWidth, viewportHeight, mobile);
    };

    const updateMeshes = () => {
      const progress = currentProgress.value;
      const nextVisibleMeshes: THREE.Mesh[] = [];

      syncTextureWindow(progress);

      meshes.forEach((mesh, index) => {
        const relativeSlot = wrappedRelativeSlot(index, progress, projects);
        const visible =
          relativeSlot > VISIBLE_SLOT_START &&
          relativeSlot < VISIBLE_SLOT_END &&
          textureCache.has(index);

        if (!visible) {
          mesh.visible = false;
          return;
        }

        const placement = placementAt(relativeSlot, mobile);
        const project = projects[index];
        const world = worldPositionForPlacement(
          placement,
          project,
          viewportWidth,
          viewportHeight,
          mobile,
        );
        const edgeFade = Math.min(
          1,
          Math.max(0, relativeSlot - VISIBLE_SLOT_START),
          Math.max(0, VISIBLE_SLOT_END - relativeSlot),
        );
        const material = materials[index];
        const runtime = mesh.userData.runtime as MeshRuntime;

        runtime.baseZ = placement.z;
        runtime.baseWidth = world.width;
        runtime.baseHeight = world.height;
        mesh.visible = true;
        mesh.position.set(world.x, world.y, placement.z);
        mesh.rotation.set(
          THREE.MathUtils.degToRad(-placement.rotateX),
          THREE.MathUtils.degToRad(placement.rotateY),
          THREE.MathUtils.degToRad(-placement.rotateZ),
        );
        mesh.scale.set(world.width, world.height, 1);
        material.opacity = Math.min(1, edgeFade * 1.75);
        nextVisibleMeshes.push(mesh);
      });

      visibleMeshes = nextVisibleMeshes;
    };

    const raycastProject = () => {
      scene.updateMatrixWorld(true);
      camera.updateMatrixWorld(true);
      raycaster.setFromCamera(pointerNdc, camera);
      const hit = raycaster.intersectObjects(visibleMeshes, false)[0];

      return hit ? (hit.object.userData.projectIndex as number) : null;
    };

    const updateHover = () => {
      if (!pointerInside || contextLost) {
        clearHover();
        return;
      }

      hoveredIndex = raycastProject();

      if (hoveredIndex === null) {
        clearHover();
        return;
      }

      if (mobile) {
        hoverLabel.dataset.visible = "false";
        canvas.style.cursor = "";
        return;
      }

      hoverLabel.textContent = projects[hoveredIndex].title;
      hoverLabel.dataset.visible = "true";
      canvas.style.cursor = "pointer";
    };

    const applyHoverTransforms = () => {
      for (const mesh of visibleMeshes) {
        const index = mesh.userData.projectIndex as number;
        const runtime = mesh.userData.runtime as MeshRuntime;
        const hovered = index === hoveredIndex;
        const hoverScale = hovered ? 1.012 : 1;

        mesh.position.z = runtime.baseZ + (hovered ? 58 : 0);
        mesh.scale.set(
          runtime.baseWidth * hoverScale,
          runtime.baseHeight * hoverScale,
          1,
        );
      }
    };

    const animate = () => {
      if (disposed) {
        return;
      }

      if (reducedMotion) {
        currentProgress.value = targetProgress.value;
        pointerCurrent.x = 0;
        pointerCurrent.y = 0;
      } else {
        currentProgress.value +=
          (targetProgress.value - currentProgress.value) * 0.075;
        pointerCurrent.x += (pointerTarget.x - pointerCurrent.x) * 0.055;
        pointerCurrent.y += (pointerTarget.y - pointerCurrent.y) * 0.055;
      }

      projectGroup.position.set(
        pointerCurrent.x * 14,
        -pointerCurrent.y * 10,
        0,
      );
      projectGroup.rotation.set(
        THREE.MathUtils.degToRad(-pointerCurrent.y * 0.7),
        THREE.MathUtils.degToRad(pointerCurrent.x * 0.9),
        0,
      );

      updateMeshes();
      updateHover();
      applyHoverTransforms();

      if (!contextLost) {
        renderer.render(scene, camera);
      }

      animationFrame = window.requestAnimationFrame(animate);
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const delta = Math.max(-140, Math.min(140, event.deltaY));
      targetProgress.value += delta / 430;
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointerInside = true;
      pointerTarget.x = (event.clientX / viewportWidth) * 2 - 1;
      pointerTarget.y = (event.clientY / viewportHeight) * 2 - 1;
      pointerNdc.set(pointerTarget.x, -pointerTarget.y);

      const rightSide = event.clientX > viewportWidth * 0.72;
      hoverLabel.style.left = `${event.clientX + (rightSide ? -14 : 14)}px`;
      hoverLabel.style.top = `${event.clientY}px`;
      hoverLabel.style.setProperty(
        "--label-translate-x",
        rightSide ? "-100%" : "0%",
      );
    };

    const handlePointerLeave = () => {
      pointerInside = false;
      pointerTarget.x = 0;
      pointerTarget.y = 0;
      clearHover();
    };

    const handleClick = (event: MouseEvent) => {
      pointerNdc.set(
        (event.clientX / viewportWidth) * 2 - 1,
        -((event.clientY / viewportHeight) * 2 - 1),
      );
      const clickedIndex = raycastProject();

      if (clickedIndex === null) {
        return;
      }

      window.location.assign(projects[clickedIndex].slug);
    };

    const handleResize = () => {
      resizeRenderer();
      desiredTextureKey = "";
      syncTextureWindow(currentProgress.value);
    };

    const handleReducedMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
    };

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      contextLost = true;
      clearHover();
    };

    const handleContextRestored = () => {
      contextLost = false;
      renderer.resetState();
      resizeRenderer();
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    canvas.addEventListener("pointermove", handlePointerMove, { passive: true });
    canvas.addEventListener("pointerleave", handlePointerLeave);
    canvas.addEventListener("click", handleClick);
    window.addEventListener("resize", handleResize, { passive: true });
    canvas.addEventListener("webglcontextlost", handleContextLost);
    canvas.addEventListener("webglcontextrestored", handleContextRestored);
    reducedMotionQuery.addEventListener("change", handleReducedMotionChange);

    resizeRenderer();
    syncTextureWindow(currentProgress.value);
    animationFrame = window.requestAnimationFrame(animate);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      canvas.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      canvas.removeEventListener("webglcontextrestored", handleContextRestored);
      reducedMotionQuery.removeEventListener("change", handleReducedMotionChange);

      desiredTextureIndices.clear();
      pendingTextures.clear();
      for (const texture of textureCache.values()) {
        texture.dispose();
      }
      textureCache.clear();

      projectGroup.clear();
      scene.clear();
      for (const material of materials) {
        material.map = null;
        material.dispose();
      }
      geometry.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      clearHover();
    };
  }, []);

  return (
    <main className={styles.projectScene} aria-label="Selected projects">
      <canvas
        ref={canvasRef}
        className={styles.sceneCanvas}
        aria-hidden="true"
      />
      <div
        ref={hoverLabelRef}
        className={styles.hoverLabel}
        data-visible="false"
        aria-hidden="true"
      />
      <nav className={styles.srOnly} aria-label="Project links">
        {projects.map((project) => (
          <a
            key={project.id}
            href={project.slug}
          >
            {project.title}
          </a>
        ))}
      </nav>
    </main>
  );
}
