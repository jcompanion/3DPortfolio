import "./style.scss"
import * as THREE from "three"
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import axios from "axios"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
gsap.registerPlugin(ScrollTrigger)
import EmblaCarousel from "embla-carousel"
import anime from "animejs/lib/anime.es.js"
import Stats from "stats.js"
import * as dat from "dat.gui"



//Debug
let userControls = false
let activeDebug = false
const gui = new dat.GUI()
gui.hide()
const debugObject = {}
//FPS Stats
const stats = new Stats()
stats.showPanel(0)

//Point for lookat Animation
const currentFocusMaterial = new THREE.MeshBasicMaterial({ color: "white" })
const currentFocusGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1)
const currentFocusObj = new THREE.Mesh(currentFocusGeometry, currentFocusMaterial)
currentFocusObj.visible = false
currentFocusObj.position.set(1.8, 2, -1.9)
gui.add(currentFocusObj.position, "x").min(-10).max(10).step(0.0001).name("FocusX").onChange(console.log(currentFocusObj.position.x))
gui.add(currentFocusObj.position, "y").min(-10).max(10).step(0.0001).name("FocusY").onChange(console.log(currentFocusObj.position.y))
gui.add(currentFocusObj.position, "z").min(-10).max(10).step(0.0001).name("FocusZ").onChange(console.log(currentFocusObj.position.z))
gui.add(currentFocusObj, "visible").name("FocusCubeVisible")

/**
 * Loaders
 */

const loaderDiv = document.querySelector(".loader")
const loadingPercentElement = document.querySelector(".load-percent")
const loadingManager = new THREE.LoadingManager(
  // Loaded
  () => {
    window.setTimeout(() => {
      gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 4, value: 0 })
      console.log("loaded")

      gsap.to([".loader", ".load-percent"], {
        opacity: 0,
        duration: 2,
        onComplete: () => {
          loaderDiv.style.display = "none"
        }
      })
      gsap.to(".fill", {
        fill: "rgb(73, 197, 42)",
        duration: 0.5
      })
      gsap.to(currentFocusObj.position, {
        delay: 3,
        duration: 4,
        ease: "sine.inOut",
        x: 0,
        y: 0,
        z: 0
      })
      gsap.to(camera.position, {
        duration: 4,
        delay: 3,
        ease: "sine.inOut",
        x: -0.286,
        y: 3,
        z: 4.5,
        onUpdate: () => {
          camera.lookAt(currentFocusObj.position)
          camera.updateProjectionMatrix()
        },
        onComplete: () => {
          loaderDiv.style.display = "none"
          userControls = true
          gsap.to(".nav", {
            opacity: 1,
            translateY: 10,
            duration: 2
          })
        }
      })
    }, 500)
  },

  // Progress
  (itemUrl, itemsLoaded, itemsTotal) => {
    const progressRatio = itemsLoaded / itemsTotal
    let path1Len = 402
    anime({
      targets: ".path1",
      strokeDashoffset: [402 - progressRatio * 402],
      easing: "linear"
    })
    anime({
      targets: ".path2",
      strokeDashoffset: [1015 - progressRatio * 1015],
      easing: "linear",
      duration: 1000
    })

    loadingPercentElement.innerHTML = `Loading: ${Math.ceil(progressRatio * 100)}%`
  }
)

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl")

// Scene
const scene = new THREE.Scene()

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(-0.286, 2.315, 0.364)
scene.add(camera)
gui.add(camera.position, "x").min(-10).max(10).step(0.001).name("CameraX")
gui.add(camera.position, "y").min(-10).max(10).step(0.001).name("CameraY")
gui.add(camera.position, "z").min(-10).max(10).step(0.001).name("CameraZ")
gui.add(camera.rotation, "x").min(-10).max(10).step(0.001).name("RotateCameraX")
gui.add(camera.rotation, "y").min(-10).max(10).step(0.001).name("RotateCameraY")
gui.add(camera.rotation, "z").min(-10).max(10).step(0.001).name("RotateCameraZ")
//Default Lookat the Welcome sign
scene.add(currentFocusObj)
camera.lookAt(currentFocusObj.position)

//Lights
const ambientLight = new THREE.AmbientLight("white", 0.7)
scene.add(ambientLight)

const pointLight = new THREE.PointLight(0xffd666, 0.0)
scene.add(pointLight)

gui.add(ambientLight, "intensity").min(0).max(3).step(0.0001).name("AmbientIntensity")
gui.add(pointLight, "intensity").min(0).max(3).step(0.0001).name("PointLightIntensity")

//Load Models and create groups
const textureLoader = new THREE.TextureLoader(loadingManager)

const roomMoon = new THREE.Group()
const austin = new THREE.Group()
const loader = new GLTFLoader(loadingManager)

//Load Room.gltf home page
loader.load(
  "/room.gltf",
  gltf => {
    console.log(gltf)
    gltf.scene.rotation.y = -0.75
    roomMoon.add(gltf.scene)
    gui.add(gltf.scene.rotation, "y").min(-10).max(10).step(0.001).name("RoomRotationY")
    gui.add(gltf.scene.position, "x").min(-10).max(10).step(0.001).name("RoomPositionX")
    gui.add(gltf.scene.position, "y").min(-10).max(10).step(0.001).name("RoomPositionY")
    gui.add(gltf.scene.position, "z").min(-10).max(10).step(0.001).name("RoomPositionZ")
  },
  undefined,
  error => {
    console.error(error)
  }
)

//load austin.gltf about section
loader.load(
  "/earth.gltf",
  gltf => {
    console.log(gltf)
    gltf.scene.scale.set(0.02, 0.02, 0.02)

    austin.add(gltf.scene)
  },
  undefined,
  error => {
    console.error(error)
  }
)

scene.add(austin)

gui.add(austin.rotation, "x").min(-10).max(10).step(0.001).name("EarthRotationX")
gui.add(austin.rotation, "y").min(-10).max(10).step(0.001).name("EarthRotationY")
gui.add(austin.rotation, "z").min(-10).max(10).step(0.001).name("EarthRotationZ")
gui.add(austin.position, "x").min(-20).max(20).step(0.001).name("EarthPositionX")
gui.add(austin.position, "y").min(-20).max(20).step(0.001).name("EarthPositionY")
gui.add(austin.position, "z").min(-20).max(20).step(0.001).name("EarthPositionZ")

//Texture Loader

const moonNorm = textureLoader.load("texture/moon_normal.jpg")
const moonColor = textureLoader.load("texture/moon_color.jpg")

/**
 * Sphere AKA Moon
 */
const sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), new THREE.MeshStandardMaterial({ map: moonColor, normalMap: moonNorm }))
sphere.position.set(-2, 1.45, -2.8)
scene.add(sphere)
gui.add(sphere.position, "x").min(-10).max(10).step(0.001).name("MoonX")
gui.add(sphere.position, "y").min(-10).max(10).step(0.001).name("MoonY")
gui.add(sphere.position, "z").min(-10).max(10).step(0.001).name("MoonZ")
roomMoon.add(sphere)
scene.add(roomMoon)

//creates projects carousel



const emblaNode = document.querySelector(".embla")
const options = {
  loop: true,
  align: "center",
  inViewThreshold: 1
}

const embla = EmblaCarousel(emblaNode, options)

//Function to move camera on scroll
const updateCamera = () => {
  gsap.to(camera.position, {
    y: 3 - scrollContainer.scrollTop / 200.0,
    duration: 0.5,
    onUpdate: () => {
      camera.updateProjectionMatrix()
    }
  })
}

//Scroll Trigger

const scrollContainer = document.querySelector(".page-container")

let scrollEnabled = false

//Event Listeners

scrollContainer.addEventListener("scroll", () => {
  if (userControls) {
    updateCamera()
    if (scrollContainer.scrollTop === 0) {
      scrollEnabled = false
    } else if (scrollContainer.scrollTop > 0) {
      scrollEnabled = true
    }
  }
})

//Debug options enable with % key
document.addEventListener("keydown", event => {
  if (event.key === "%") {
    if (!activeDebug) {
      gui.show()
      document.body.appendChild(stats.dom)
      activeDebug = true
    } else {
      gui.hide()
      document.body.removeChild(stats.dom)
      activeDebug = false
    }
  }
})
//CURSOR
const cursor = {
  x: null,
  y: null
}
window.addEventListener("mousemove", event => {
  cursor.x = (event.clientX / innerWidth - 0.5) * 2.2
  cursor.y = (event.clientY / innerWidth - 0.5) * 2.2
  if (userControls && !scrollEnabled) {
    // console.log(cursor.x, cursor.y);
    gsap.to(roomMoon.rotation, {
      x: Math.sin(cursor.y / 13),
      y: Math.sin(cursor.x / 5),
      duration: 3
    })
  }
})

//Function to animate Earth model on scroll

ScrollTrigger.defaults({ scroller: scrollContainer })

//Smooth scroll snapping

gsap.utils.toArray(".panel").forEach(box => {
  ScrollTrigger.create({
    trigger: box,
    pin: true,
    start: "top top",
    end: "+=300",
    markers: true
  })
})

const tl = gsap.timeline({
  scrollTrigger: {
    markers: true,
    trigger: ".about",
    start: "top bottom",
    end: "80% top",
    scrub: 3,
    duration: 4,
    ease: "power1.inOut"
  }
})
tl.set(austin.position, {
  x: -10,
  y: -13,
  z: 10
})
  .add("start")
  .to(
    austin.position,
    {
      x: -0.57,
      y: -13.58,
      z: -9.24,
      duration: 2.5
    },
    "start"
  )
  .to(
    austin.rotation,
    {
      x: -0.069,
      y: -1.37,
      z: 0.1,
      duration: 2.5
    },
    "start"
  )
  .to(
    pointLight,
    {
      intensity: 3.0,
      duration: 2
    },
    "start"
  )
  .to(
    pointLight.position,
    {
      y: camera.position.y,
      duration: 2.5
    },
    "start"
  )
  .add("end")
  .to(
    austin.position,
    {
      x: 30,
      z: 20,
      duration: 2,
      ease: "power2.in"
    },
    "end"
  )
  .to(
    austin.rotation,
    {
      x: -1,
      y: -3,
      duration: 2,
      ease: "power2.in"
    },
    "end"
  )

// Controls for Testing***
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

//Overlay
const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1)
const overlayMaterial = new THREE.ShaderMaterial({
  // wireframe: true,
  uniforms: {
    uAlpha: { value: 1 }
  },
  transparent: true,
  vertexShader: `
    void main()
    {
        gl_Position = vec4(position, 1.0);
    }
    `,
  fragmentShader: `
    uniform float uAlpha;
    void main()
    {
        gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
    }
    `
})
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
scene.add(overlay)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let lastElapsedTime = 0

const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - lastElapsedTime
  lastElapsedTime = elapsedTime
  stats.begin()

  //Animate
  sphere.rotation.y = elapsedTime / 6

  //Camera Controls

  //View current position stats for debug purposes
  // console.log(`Current Focus: X: ${currentFocus.x}, Y: ${currentFocus.y}, Z: ${currentFocus.z}`)
  // Update Orbit controls Testing ***
  // controls.update()

  // Render
  renderer.render(scene, camera)

  stats.end()
  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
