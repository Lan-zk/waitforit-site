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
const MIN_RENDER_INSTANCES = 20;

// Card sizing: shrink every card toward a shared factor, then clamp the result
// into a per-breakpoint [min, max] band so sizes vary without becoming chaotic.
const CARD_WIDTH_SCALE = 0.7;
const DESKTOP_CARD_MIN_WIDTH = 15;
const DESKTOP_CARD_MAX_WIDTH = 30;
const MOBILE_CARD_MIN_WIDTH = 46;
const MOBILE_CARD_MAX_WIDTH = 96;

// Trajectory framing: recentre the visible band on the screen middle, spread
// the (now smaller) cards out so neighbours keep clear gaps, and lift the band
// upward. The pivot is the band's natural centre of mass; scaling around it
// recentres while scale > 1 opens up the spacing.
const HORIZONTAL_CENTER = 50;
const DESKTOP_TRAJECTORY_PIVOT_X = 58;
const MOBILE_TRAJECTORY_PIVOT_X = 70;
const DESKTOP_TRAJECTORY_SCALE_X = 0.8;
const MOBILE_TRAJECTORY_SCALE_X = 1.08;
const DESKTOP_TRAJECTORY_PIVOT_Y = 44;
const MOBILE_TRAJECTORY_PIVOT_Y = 44;
const DESKTOP_TRAJECTORY_SCALE_Y = 0.8;
const MOBILE_TRAJECTORY_SCALE_Y = 1.08;
const DESKTOP_VERTICAL_LIFT = 7;
const MOBILE_VERTICAL_LIFT = 4;

// Coherent ribbon tilt (degrees). A consistent yaw turns every card so the
// strip reads as receding into the distance, a slight lean tips them back, and
// the raw in-plane wobble is damped so the arrangement feels ordered rather
// than scattered. The small TILT_VARIATION keeps a hint of the original pose.
const RIBBON_YAW_Y = -30;
const RIBBON_LEAN_X = -5;
const TILT_VARIATION = 0.35;
const SCATTER_SCALE = 0.3;

// Glass treatment: cards render as translucent panels with a subtle sheen.
const GLASS_MAX_OPACITY = 0.85;

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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

// Reframe a raw placement: shrink the card around its own center, clamp its
// width into the allowed band, recentre and spread the band so neighbours keep
// clear gaps, lift it upward, and rebase the tilt onto a coherent ribbon.
// Applied uniformly so extrapolated slots match.
function adjustPlacement(placement: Placement, mobile: boolean): Placement {
  const minWidth = mobile ? MOBILE_CARD_MIN_WIDTH : DESKTOP_CARD_MIN_WIDTH;
  const maxWidth = mobile ? MOBILE_CARD_MAX_WIDTH : DESKTOP_CARD_MAX_WIDTH;
  const pivotX = mobile
    ? MOBILE_TRAJECTORY_PIVOT_X
    : DESKTOP_TRAJECTORY_PIVOT_X;
  const scaleX = mobile
    ? MOBILE_TRAJECTORY_SCALE_X
    : DESKTOP_TRAJECTORY_SCALE_X;
  const pivotY = mobile
    ? MOBILE_TRAJECTORY_PIVOT_Y
    : DESKTOP_TRAJECTORY_PIVOT_Y;
  const scaleY = mobile
    ? MOBILE_TRAJECTORY_SCALE_Y
    : DESKTOP_TRAJECTORY_SCALE_Y;
  const lift = mobile ? MOBILE_VERTICAL_LIFT : DESKTOP_VERTICAL_LIFT;

  const centerX = placement.x + placement.width / 2;
  const width = clamp(placement.width * CARD_WIDTH_SCALE, minWidth, maxWidth);
  const x = HORIZONTAL_CENTER + (centerX - pivotX) * scaleX - width / 2;
  const y = pivotY + (placement.y - pivotY) * scaleY - lift;

  return {
    ...placement,
    width,
    x,
    y,
    rotateX: RIBBON_LEAN_X + placement.rotateX * TILT_VARIATION,
    rotateY: RIBBON_YAW_Y + placement.rotateY * TILT_VARIATION,
    rotateZ: placement.rotateZ * SCATTER_SCALE,
  };
}

function placementAt(relativeSlot: number, mobile: boolean): Placement {
  const lowerSlot = Math.floor(relativeSlot);
  const amount = relativeSlot - lowerSlot;
  const lower = placementForSlot(lowerSlot, mobile);
  const upper = placementForSlot(lowerSlot + 1, mobile);

  const interpolated: Placement = {
    x: interpolate(lower.x, upper.x, amount),
    y: interpolate(lower.y, upper.y, amount),
    width: interpolate(lower.width, upper.width, amount),
    z: interpolate(lower.z, upper.z, amount),
    rotateX: interpolate(lower.rotateX, upper.rotateX, amount),
    rotateY: interpolate(lower.rotateY, upper.rotateY, amount),
    rotateZ: interpolate(lower.rotateZ, upper.rotateZ, amount),
  };

  return adjustPlacement(interpolated, mobile);
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

function buildRenderProjects(projects: ProjectTexture[]) {
  if (projects.length === 0 || projects.length >= MIN_RENDER_INSTANCES) {
    return projects;
  }

  return Array.from(
    { length: MIN_RENDER_INSTANCES },
    (_, index) => projects[index % projects.length],
  );
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

interface ProjectSceneLabels {
  explore: string;
  projectLinks: string;
  selectedProjects: string;
}

export function ProjectScene({
  labels,
  projects,
}: {
  labels: ProjectSceneLabels;
  projects: ProjectTexture[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverLabelRef = useRef<HTMLDivElement>(null);
  const interactionHintRef = useRef<HTMLParagraphElement>(null);
  const mobileCardLinkRef = useRef<HTMLAnchorElement>(null);
  const accessibleProjects = Array.from(
    new Map(projects.map((project) => [project.slug, project])).values(),
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const hoverLabel = hoverLabelRef.current;
    const interactionHint = interactionHintRef.current;
    const mobileCardLink = mobileCardLinkRef.current;

    if (!canvas || !hoverLabel || !interactionHint || !mobileCardLink) {
      return;
    }

    const renderProjects = buildRenderProjects(projects);
    canvas.dataset.webglUnavailable = "false";
    canvas.dataset.contextState = "initializing";
    canvas.dataset.sceneInstanceCount = String(renderProjects.length);
    canvas.dataset.sceneVisibleCount = "0";
    canvas.dataset.textureCount = "0";
    const context = canvas.getContext("webgl2", {
      alpha: false,
      antialias: true,
      powerPreference: "high-performance",
    });

    if (
      !context ||
      context.isContextLost() ||
      context.getContextAttributes() === null
    ) {
      canvas.dataset.webglUnavailable = "true";
      canvas.dataset.contextState = "unavailable";
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
    const materials = renderProjects.map(() => {
      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        // Cards only tilt a few degrees, so the front face always points at the
        // camera. FrontSide avoids the two faces of a translucent plane blending
        // over each other, which would make the glass look opaque again.
        side: THREE.FrontSide,
        transparent: true,
        opacity: 0,
        depthTest: true,
        // Translucent panels must not write depth, otherwise nearer cards would
        // hide the ones behind them instead of letting them show through.
        depthWrite: false,
      });

      // Inject a subtle glass sheen: a soft top glow plus a diagonal glossy
      // streak, driven by the card's own UVs so it sticks to the artwork.
      material.onBeforeCompile = (shader) => {
        shader.fragmentShader = shader.fragmentShader.replace(
          "#include <opaque_fragment>",
          `#ifdef USE_MAP
            float glassTopGlow = smoothstep(0.35, 1.0, vMapUv.y) * 0.035;
            float glassDiag = vMapUv.x + (1.0 - vMapUv.y);
            float glassBand =
              smoothstep(0.15, 0.75, glassDiag) *
              smoothstep(1.35, 0.75, glassDiag);
            float glassStreak = pow(glassBand, 2.0) * 0.1;
            outgoingLight += vec3(glassTopGlow + glassStreak);
          #endif

          #include <opaque_fragment>`,
        );
      };

      return material;
    });
    const meshes = renderProjects.map((project, index) => {
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
    const textureCache = new Map<string, THREE.Texture>();
    const pendingTextures = new Map<string, number>();
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
    let desiredTextureKeys = new Set<string>();
    let desiredTextureKey = "";
    let textureRequestId = 0;
    let hoveredIndex: number | null = null;
    let pointerInside = false;
    let contextLost = false;
    let disposed = false;
    let animationFrame = 0;
    let visibleMeshes: THREE.Mesh[] = [];
    let activePointerId: number | null = null;
    let pointerDownX = 0;
    let pointerDownY = 0;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let dragging = false;

    const clearHover = () => {
      hoveredIndex = null;
      hoverLabel.dataset.visible = "false";
      canvas.style.cursor = "";
    };

    const updateTextureCount = () => {
      canvas.dataset.textureCount = String(textureCache.size);
    };

    const applyTexture = (
      textureKey: string,
      texture: THREE.Texture | null,
    ) => {
      renderProjects.forEach((project, index) => {
        if (project.localPath !== textureKey) {
          return;
        }

        const material = materials[index];
        material.map = texture;
        material.needsUpdate = true;
      });
    };

    const disposeCachedTexture = (textureKey: string) => {
      const texture = textureCache.get(textureKey);

      if (!texture) {
        return;
      }

      applyTexture(textureKey, null);
      texture.dispose();
      textureCache.delete(textureKey);
      updateTextureCount();
    };

    const requestTexture = async (textureKey: string) => {
      if (
        disposed ||
        textureCache.has(textureKey) ||
        pendingTextures.has(textureKey)
      ) {
        return;
      }

      const requestId = ++textureRequestId;
      pendingTextures.set(textureKey, requestId);

      try {
        const texture = await textureLoader.loadAsync(textureKey);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = maxTextureAnisotropy;

        if (pendingTextures.get(textureKey) !== requestId) {
          texture.dispose();
          return;
        }

        pendingTextures.delete(textureKey);

        if (disposed || !desiredTextureKeys.has(textureKey)) {
          texture.dispose();
          return;
        }

        textureCache.set(textureKey, texture);
        applyTexture(textureKey, texture);
        updateTextureCount();

        if (textureCache.size > MAX_TEXTURES) {
          for (const staleKey of textureCache.keys()) {
            if (!desiredTextureKeys.has(staleKey)) {
              disposeCachedTexture(staleKey);
              break;
            }
          }
        }
      } catch {
        if (pendingTextures.get(textureKey) === requestId) {
          pendingTextures.delete(textureKey);
        }
      }
    };

    const syncTextureWindow = (progress: number) => {
      const candidates = renderProjects
        .map((_, index) => ({
          index,
          relativeSlot: wrappedRelativeSlot(index, progress, renderProjects),
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
      const nextKeys = Array.from(
        new Set(
          candidates.map(({ index }) => renderProjects[index].localPath),
        ),
      )
        .slice(0, MAX_TEXTURES)
        .sort();
      const nextKey = nextKeys.join(",");

      if (nextKey === desiredTextureKey) {
        return;
      }

      desiredTextureKey = nextKey;
      desiredTextureKeys = new Set(nextKeys);

      for (const textureKey of textureCache.keys()) {
        if (!desiredTextureKeys.has(textureKey)) {
          disposeCachedTexture(textureKey);
        }
      }

      for (const textureKey of desiredTextureKeys) {
        void requestTexture(textureKey);
      }
    };

    const resizeRenderer = () => {
      viewportWidth = Math.max(1, window.innerWidth);
      viewportHeight = Math.max(1, window.innerHeight);
      mobile = viewportWidth < MOBILE_BREAKPOINT;
      canvas.dataset.sceneLayout = mobile ? "mobile" : "desktop";
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.setSize(viewportWidth, viewportHeight, false);
      configureCamera(camera, viewportWidth, viewportHeight, mobile);
      canvas.dataset.cameraDistance = String(cameraDistance(mobile));
      canvas.dataset.cameraFov = camera.fov.toFixed(4);
    };

    const updateMeshes = () => {
      const progress = currentProgress.value;
      const nextVisibleMeshes: THREE.Mesh[] = [];

      syncTextureWindow(progress);

      meshes.forEach((mesh, index) => {
        const relativeSlot = wrappedRelativeSlot(
          index,
          progress,
          renderProjects,
        );
        const visible =
          relativeSlot > VISIBLE_SLOT_START &&
          relativeSlot < VISIBLE_SLOT_END &&
          textureCache.has(renderProjects[index].localPath);

        if (!visible) {
          mesh.visible = false;
          return;
        }

        const placement = placementAt(relativeSlot, mobile);
        const project = renderProjects[index];
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
        material.opacity = Math.min(1, edgeFade * 1.75) * GLASS_MAX_OPACITY;
        nextVisibleMeshes.push(mesh);
      });

      visibleMeshes = nextVisibleMeshes;
      canvas.dataset.sceneVisibleCount = String(visibleMeshes.length);
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

      hoverLabel.textContent = renderProjects[hoveredIndex].title;
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
      canvas.dataset.sceneProgress = currentProgress.value.toFixed(3);

      if (!contextLost) {
        renderer.render(scene, camera);
      }

      animationFrame = window.requestAnimationFrame(animate);
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const delta = Math.max(-140, Math.min(140, event.deltaY));
      targetProgress.value += delta / 430;
      interactionHint.dataset.hidden = "true";
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

      if (activePointerId !== event.pointerId) {
        return;
      }

      const deltaX = event.clientX - lastPointerX;
      const deltaY = event.clientY - lastPointerY;
      const totalDistance = Math.hypot(
        event.clientX - pointerDownX,
        event.clientY - pointerDownY,
      );

      if (totalDistance > 7) {
        dragging = true;
      }

      if (dragging) {
        event.preventDefault();
        const primaryDelta =
          Math.abs(deltaY) >= Math.abs(deltaX) ? -deltaY : -deltaX;
        targetProgress.value += primaryDelta / (mobile ? 145 : 240);
      }

      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
    };

    const handlePointerLeave = () => {
      pointerInside = false;
      pointerTarget.x = 0;
      pointerTarget.y = 0;
      clearHover();
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (!event.isPrimary) {
        return;
      }

      activePointerId = event.pointerId;
      pointerDownX = event.clientX;
      pointerDownY = event.clientY;
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      dragging = false;
      interactionHint.dataset.hidden = "true";

      if (event.pointerType !== "mouse") {
        try {
          canvas.setPointerCapture(event.pointerId);
        } catch {
          // Synthetic pointer events and older browsers can decline capture.
        }
      }
    };

    const releasePointer = (event: PointerEvent) => {
      if (activePointerId !== event.pointerId) {
        return;
      }

      activePointerId = null;
      dragging = false;

      try {
        if (canvas.hasPointerCapture(event.pointerId)) {
          canvas.releasePointerCapture(event.pointerId);
        }
      } catch {
        // Pointer capture may already have been released by the browser.
      }
    };

    const projectIndexAt = (clientX: number, clientY: number) => {
      pointerNdc.set(
        (clientX / viewportWidth) * 2 - 1,
        -((clientY / viewportHeight) * 2 - 1),
      );
      return raycastProject() ?? (pointerInside ? hoveredIndex : null);
    };

    const selectMobileProject = (event: PointerEvent) => {
      const selectedIndex = projectIndexAt(event.clientX, event.clientY);

      if (selectedIndex === null) {
        mobileCardLink.dataset.visible = "false";
        mobileCardLink.removeAttribute("href");
        return;
      }

      const project = renderProjects[selectedIndex];
      mobileCardLink.href = project.slug;
      mobileCardLink.textContent = `${project.title} \u2197`;
      mobileCardLink.dataset.visible = "true";
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (activePointerId !== event.pointerId) {
        return;
      }

      const wasDragging = dragging;
      releasePointer(event);

      if (mobile && !wasDragging) {
        selectMobileProject(event);
        return;
      }

      if (!mobile && !wasDragging) {
        const selectedIndex = projectIndexAt(event.clientX, event.clientY);

        if (selectedIndex !== null) {
          window.location.assign(renderProjects[selectedIndex].slug);
        }
      }
    };

    const handlePointerCancel = (event: PointerEvent) => {
      releasePointer(event);
      clearHover();
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
      canvas.dataset.contextState = "lost";
      clearHover();
    };

    const handleContextRestored = () => {
      contextLost = false;
      renderer.resetState();
      for (const texture of textureCache.values()) {
        texture.needsUpdate = true;
      }
      for (const material of materials) {
        material.needsUpdate = true;
      }
      resizeRenderer();
      canvas.dataset.contextState = "restored";
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointercancel", handlePointerCancel);
    canvas.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("resize", handleResize, { passive: true });
    canvas.addEventListener("webglcontextlost", handleContextLost);
    canvas.addEventListener("webglcontextrestored", handleContextRestored);
    reducedMotionQuery.addEventListener("change", handleReducedMotionChange);

    resizeRenderer();
    syncTextureWindow(currentProgress.value);
    canvas.dataset.contextState = "ready";
    animationFrame = window.requestAnimationFrame(animate);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointercancel", handlePointerCancel);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      canvas.removeEventListener("webglcontextrestored", handleContextRestored);
      reducedMotionQuery.removeEventListener("change", handleReducedMotionChange);

      desiredTextureKeys.clear();
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
      clearHover();
    };
  }, [projects]);

  return (
    <main className={styles.projectScene} aria-label={labels.selectedProjects}>
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
      <p
        ref={interactionHintRef}
        className={styles.interactionHint}
        data-hidden="false"
      >
        {labels.explore}
      </p>
      <a
        ref={mobileCardLinkRef}
        className={styles.mobileCardLink}
        data-visible="false"
      />
      <nav className={styles.projectLinks} aria-label={labels.projectLinks}>
        {accessibleProjects.map((project) => (
          <a
            key={project.slug}
            href={project.slug}
          >
            {project.title}
          </a>
        ))}
      </nav>
    </main>
  );
}
