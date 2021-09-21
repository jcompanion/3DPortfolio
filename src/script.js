import "./style.scss"
import "materialize-css/dist/css/materialize.min.css"
import "materialize-css/dist/js/materialize"
import * as THREE from "three"
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import axios from "axios"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrollToPlugin } from "gsap/ScrollToPlugin"
gsap.registerPlugin(ScrollTrigger)
gsap.registerPlugin(ScrollToPlugin)
import anime from "animejs/lib/anime.es.js"
import Stats from "stats.js"
import * as dat from "dat.gui"
import FVertexShader from "./shaders/test/vertex.glsl"
import FFragmentShader from "./shaders/test/fragment.glsl"

const portUrl = "https://backend-portfolio1.herokuapp.com"

//Debug
let userControls = false
const gui = new dat.GUI()

//FPS Stats
const stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)

//Point for lookat Animation
const currentFocusMaterial = new THREE.MeshBasicMaterial({ color: "white" })
const currentFocusGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1)
const currentFocusObj = new THREE.Mesh(currentFocusGeometry, currentFocusMaterial)
currentFocusObj.visible = false
currentFocusObj.position.set(1.9, 2, -1.2)
gui.add(currentFocusObj.position, "x").min(-10).max(10).step(0.0001).name("FocusX").onChange(console.log(currentFocusObj.position.x))
gui.add(currentFocusObj.position, "y").min(-10).max(10).step(0.0001).name("FocusY").onChange(console.log(currentFocusObj.position.y))
gui.add(currentFocusObj.position, "z").min(-10).max(10).step(0.0001).name("FocusZ").onChange(console.log(currentFocusObj.position.z))
gui.add(currentFocusObj, "visible").name("FocusCubeVisible")

/**
 * Loaders
 */

//Load About Page
const pAbout = document.querySelector(".p-about")
const skillsAbout = document.querySelector(".skills")

axios.get(portUrl + "/abouts").then(response => {
  pAbout.innerHTML = response.data[0].Bio
  skillsAbout.innerHTML = response.data[0].Skills
})

const loaderDiv = document.querySelector(".loader")
const loadingPercentElement = document.querySelector(".load-percent")
const loadingManager = new THREE.LoadingManager(
  // Loaded
  () => {
    window.setTimeout(() => {
      console.log("loaded")
      gsap.to(".fill", {
        fill: "rgb(73, 197, 42)",
        duration: 0.5
      })
      gsap.to([".loader", ".load-percent"], {
        opacity: 0,
        duration: 2,
        onComplete: () => {
          loaderDiv.style.display = "none"
        }
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
    }, 1000)
  },

  // Progress
  (itemUrl, itemsLoaded, itemsTotal) => {
    const progressRatio = itemsLoaded / itemsTotal
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
camera.position.set(0.5, 2.415, 0.3)
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
const ambientLight = new THREE.AmbientLight("white", 0.5)
scene.add(ambientLight)

gui.add(ambientLight, "intensity").min(0).max(3).step(0.0001).name("AmbientIntensity")

//Hemisphere Light

const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1)
hemisphereLight.position.set(-5, -15.8, -3.7)
scene.add(hemisphereLight)
gui.add(hemisphereLight, "intensity").min(0).max(5).step(0.0001).name("HemIntensity")
gui.add(hemisphereLight.position, "x").min(-50).max(50).step(0.0001).name("HemPosX")
gui.add(hemisphereLight.position, "y").min(-50).max(50).step(0.0001).name("HemPosY")
gui.add(hemisphereLight.position, "z").min(-50).max(50).step(0.0001).name("HemPosZ")
gui.add(hemisphereLight.rotation, "x").min(-50).max(50).step(0.0001).name("HemRotX")
gui.add(hemisphereLight.rotation, "y").min(-50).max(50).step(0.0001).name("HemRotY")
gui.add(hemisphereLight.rotation, "z").min(-50).max(50).step(0.0001).name("HemRotZ")

//Load Models and create groups
const textureLoader = new THREE.TextureLoader(loadingManager)

const roomMoon = new THREE.Group()
const austin = new THREE.Group()
const loader = new GLTFLoader(loadingManager)

//Load Room.gltf home page
loader.load(
  "/room.gltf",
  gltf => {
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

//load Earth about section
const earthTexture = textureLoader.load("/texture/earth/earthmap4k.jpg")
const earthSpecular = textureLoader.load("/texture/earth/earthspec4k.jpg")
const earthClouds = textureLoader.load("/texture/earth/clouds.jpg")
const earthBump = textureLoader.load("/texture/earth/earthbump4k.jpg")
const earthGeometry = new THREE.SphereGeometry(10, 64, 64)
const earthMaterial = new THREE.MeshPhongMaterial({
  map: earthTexture,
  bumpMap: earthBump,
  bumpScale: 0.5,
  specularMap: earthSpecular,
  specular: new THREE.Color("grey")
})
const cloudMaterial = new THREE.MeshPhongMaterial({
  color: 0xffffff,
  map: earthClouds,
  opacity: 0.4,
  transparent: true
})

const earth = new THREE.Mesh(earthGeometry, earthMaterial)
earth.receiveShadow = true
earth.castShadow = true
earth.rotation.set(0.211, 1.653, -0.115)

const cloudLayer = new THREE.Mesh(earthGeometry, cloudMaterial)
cloudLayer.scale.set(1.015, 1.015, 1.015)

earth.add(cloudLayer)
austin.add(earth)

gui.add(earth.rotation, "x").min(-10).max(10).step(0.001).name("EarthRotationX")
gui.add(earth.rotation, "y").min(-10).max(10).step(0.001).name("EarthRotationY")
gui.add(earth.rotation, "z").min(-10).max(10).step(0.001).name("EarthRotationZ")
gui.add(earth.position, "x").min(-20).max(20).step(0.001).name("EarthPositionX")
gui.add(earth.position, "y").min(-20).max(20).step(0.001).name("EarthPositionY")
gui.add(earth.position, "z").min(-20).max(20).step(0.001).name("EarthPositionZ")
gui.add(earth.scale, "x").min(-20).max(20).step(0.001).name("EarthSizeX")
gui.add(earth.scale, "y").min(-20).max(20).step(0.001).name("EarthSizeY")
gui.add(earth.scale, "z").min(-20).max(20).step(0.001).name("EarthSizeZ")

//Create flags and last 6 projects
const flagT = textureLoader.load("/texture/txflag.jpg")
const flagC = textureLoader.load("/texture/flagCali.png")
// Geometry
const geometry = new THREE.PlaneGeometry(1, 1, 32, 32)

//Adding attributes variables to use in vertex glsl to manipulate position
const count = geometry.attributes.position.count
let randoms = new Float32Array(count)

for (let i = 0; i < count; i++) {
  randoms[i] = Math.random()
}

geometry.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 1))

// Material Texas Flag
const materialT = new THREE.ShaderMaterial({
  vertexShader: FVertexShader,
  fragmentShader: FFragmentShader,
  uniforms: {
    uFrequency: { value: new THREE.Vector2(5, 3) },
    uTime: { value: 0 },
    uColor: { value: new THREE.Color("orange") },
    uTexture: { value: flagT }
  }
})

gui.add(materialT.uniforms.uFrequency.value, "x").min(0).max(20).step(0.01).name("flagFreqX")
gui.add(materialT.uniforms.uFrequency.value, "y").min(0).max(20).step(0.01).name("flagFreqY")

// Material Texas Flag
const materialC = new THREE.ShaderMaterial({
  vertexShader: FVertexShader,
  fragmentShader: FFragmentShader,
  uniforms: {
    uFrequency: { value: new THREE.Vector2(5, 3) },
    uTime: { value: 1 },
    uColor: { value: new THREE.Color("orange") },
    uTexture: { value: flagC }
  }
})

// Mesh
const flagTexas = new THREE.Mesh(geometry, materialT)
const flagCali = new THREE.Mesh(geometry, materialC)
flagTexas.scale.y = 2 / 3
flagCali.scale.y = 2 / 3
flagTexas.position.set(9.158, 5.843, 1.47)
flagCali.position.set(7.83, 6.5, 3.4)
flagTexas.rotation.set(-0.294, 1.035, 0.149)
flagCali.rotation.set(0.15, 1.7, -0.294)
gui.add(flagTexas.rotation, "x").min(-10).max(10).step(0.001).name("flagTexasRotationX")
gui.add(flagTexas.rotation, "y").min(-10).max(10).step(0.001).name("flagTexasRotationY")
gui.add(flagTexas.rotation, "z").min(-10).max(10).step(0.001).name("flagTexasRotationZ")
gui.add(flagTexas.position, "x").min(-20).max(20).step(0.001).name("flagTexasPositionX")
gui.add(flagTexas.position, "y").min(-20).max(20).step(0.001).name("flagTexasPositionY")
gui.add(flagTexas.position, "z").min(-20).max(20).step(0.001).name("flagTexasPositionZ")
gui.add(flagCali.rotation, "x").min(-10).max(10).step(0.001).name("flagCaliRotationX")
gui.add(flagCali.rotation, "y").min(-10).max(10).step(0.001).name("flagCaliRotationY")
gui.add(flagCali.rotation, "z").min(-10).max(10).step(0.001).name("flagCaliRotationZ")
gui.add(flagCali.position, "x").min(-20).max(20).step(0.001).name("flagCaliPositionX")
gui.add(flagCali.position, "y").min(-20).max(20).step(0.001).name("flagCaliPositionY")
gui.add(flagCali.position, "z").min(-20).max(20).step(0.001).name("flagCaliPositionZ")
austin.add(flagTexas, flagCali)
scene.add(austin)

gui.add(austin.position, "x").min(-20).max(20).step(0.001).name("AustinX")
gui.add(austin.position, "y").min(-20).max(20).step(0.001).name("AustinY")
gui.add(austin.position, "z").min(-20).max(20).step(0.001).name("AustinZ")
gui.add(austin.rotation, "x").min(-20).max(20).step(0.001).name("AustinRotationX")
gui.add(austin.rotation, "y").min(-20).max(20).step(0.001).name("AustinRotationY")
gui.add(austin.rotation, "z").min(-20).max(20).step(0.001).name("AustinRotationZ")

//Texture Loader

const moonColor = textureLoader.load("texture/moon_color.jpg")

/**
 * Sphere AKA Moon
 */
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32)
const sphereMaterial = new THREE.MeshStandardMaterial({ map: moonColor })
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
const moon = new THREE.Mesh(sphereGeometry, sphereMaterial)
moon.position.set(-9.85, -14.13, 2.504)
sphere.position.set(-2, 1.45, -2.8)
gui.add(sphere.position, "x").min(-10).max(10).step(0.001).name("RoomMoonX")
gui.add(sphere.position, "y").min(-10).max(10).step(0.001).name("RoomMoonY")
gui.add(sphere.position, "z").min(-10).max(10).step(0.001).name("RoomMoonZ")
gui.add(moon.position, "x").min(-50).max(50).step(0.001).name("MoonX")
gui.add(moon.position, "y").min(-50).max(50).step(0.001).name("MoonY")
gui.add(moon.position, "z").min(-50).max(50).step(0.001).name("MoonZ")
roomMoon.add(sphere)
roomMoon.position.z = 0.5

//creates projects carousel
const initCarouselModal = () => {
  console.log("init carousel and modal")
  var carousel = document.querySelectorAll(".carousel")
  var modal = document.querySelectorAll(".modal")
  var sideNav = document.querySelectorAll(".sidenav")

  var instances = M.Carousel.init(carousel)
  var instances = M.Modal.init(modal)
  var instances = M.Sidenav.init(sideNav)
}

const scrollContainer = document.querySelector(".page-container")
const shelf = document.querySelector(".shelf")
let shelfProjects = []
axios
  .get(`${portUrl}/projects`)
  .then(response => {
    let project = response.data.reverse()
    for (let i = 0; project.length > i; i++) {
      if (i < 6) {
        shelfProjects.push(project[i].Image.url)
      }
      document.querySelector("#slides").innerHTML += `<a class="carousel-item modal-trigger" href="#${project[i].ModalName}"><img src="${project[i].Image.url}" alt="${project[i].Title} screenshot"></a>`
      document.querySelector(".modals").innerHTML += `
      <div id="${project[i].ModalName}" class="modal">
              <div class="modal-content">
                <h4>${project[i].Title}</h4>
                <div class="modal-info">
                  <img src="${project[i].Image.url}" alt="${project[i].Title} screenshot" />
                  <p>${project[i].LgSummary}</p>
                </div>
              </div>
              <div class="modal-footer">
              <a class="btn waves-effect waves-light left" href="${project[i].Live}" target="_blank">Live Site</a>
                <a class="btn waves-effect waves-light left" href="${project[i].Code}" target="_blank">Code</a>
                <a class="modal-close waves-effect waves-green btn-flat">Close</a>
              </div>
            </div>
      `
    }
  })
  .then(x => {
    initCarouselModal()
    createShelfProjects()
    scene.add(roomMoon, moon)
  })

//Create plane and projects
const projectPosition = [new THREE.Vector3(-1.899, 1.809, 0.227), new THREE.Vector3(-1.606, 1.809, -0.11), new THREE.Vector3(-1.918, 1.362, 0.189), new THREE.Vector3(-1.634, 1.367, -0.111), new THREE.Vector3(-1.899, 0.922, 0.207), new THREE.Vector3(-1.618, 0.922, -0.096)]
const projectRotation = [new THREE.Vector3(-0.197, -2.369, -0.151)]
const createShelfProjects = () => {
  let projectNumber = 0
  for (const i of shelfProjects) {
    const img_plane = new Image()
    img_plane.crossOrigin = ""
    img_plane.src = i
    const texture_plane = new THREE.Texture(img_plane)
    img_plane.onload = () => {
      texture_plane.needsUpdate = true
    }
    const planeGeometry = new THREE.PlaneGeometry(1, 1)
    const planeMaterial = new THREE.MeshStandardMaterial({ map: texture_plane, side: THREE.DoubleSide })
    const project = new THREE.Mesh(planeGeometry, planeMaterial)
    project.scale.set(-0.27, 0.296, 1)
    project.position.set(projectPosition[projectNumber].x, projectPosition[projectNumber].y, projectPosition[projectNumber].z)
    project.rotation.set(projectRotation[0].x, projectRotation[0].y, projectRotation[0].z)
    roomMoon.add(project)
    gui.add(project.rotation, "x").min(-10).max(10).step(0.001).name("projectRotationX")
    gui.add(project.rotation, "y").min(-10).max(10).step(0.001).name("projectRotationY")
    gui.add(project.rotation, "z").min(-10).max(10).step(0.001).name("projectRotationZ")
    gui.add(project.position, "x").min(-20).max(20).step(0.001).name("projectPositionX")
    gui.add(project.position, "y").min(-20).max(20).step(0.001).name("projectPositionY")
    gui.add(project.position, "z").min(-20).max(20).step(0.001).name("projectPositionZ")
    gui.add(project.scale, "x").min(-20).max(20).step(0.001).name("projectSizeX")
    gui.add(project.scale, "y").min(-20).max(20).step(0.001).name("projectSizeY")
    gui.add(project.scale, "z").min(-20).max(20).step(0.001).name("projectSizeZ")
    projectNumber += 1
  }
}

//Navbar link animations
const aboutLinks = gsap.utils.toArray(".about-link")
const projectsLink = gsap.utils.toArray(".projects-link")
const contactLink = gsap.utils.toArray(".contact-link")
const scrollUp = gsap.utils.toArray(".scroll-up")

aboutLinks.forEach(i => {
  i.addEventListener("click", e => {
    e.preventDefault()
    gsap.to(scrollContainer, {
      duration: 1.5,
      scrollTo: "#about",
      ease: "sine.inOut"
    })
  })
})
projectsLink.forEach(i => {
  i.addEventListener("click", e => {
    e.preventDefault()
    gsap.to(scrollContainer, {
      duration: 1.5,
      scrollTo: "#projects",
      ease: "sine.inOut"
    })
  })
})
contactLink.forEach(i => {
  i.addEventListener("click", e => {
    e.preventDefault()
    gsap.to(scrollContainer, {
      duration: 1.5,
      scrollTo: "#contact",
      ease: "sine.inOut"
    })
  })
})
scrollUp.forEach(i => {
  i.addEventListener("click", e => {
    e.preventDefault()
    gsap.to(scrollContainer, {
      duration: 2,
      scrollTo: { y: 0 },
      ease: "sine.inOut"
    })
  })
})

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

let scrollEnabled = false

//Event Listeners

scrollContainer.addEventListener("scroll", () => {
  if (scrollContainer.scrollTop > 5) {
    gsap.to(".scroll-up", {
      opacity: 1,
      duration: 0.5
    })
  } else {
    gsap.to(".scroll-up", {
      opacity: 0,
      duration: 0.5
    })
  }
  if (userControls) {
    updateCamera()
    if (scrollContainer.scrollTop === 0) {
      scrollEnabled = false
    } else if (scrollContainer.scrollTop > 5) {
      scrollEnabled = true
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

//Earth Animation

const tl = gsap.timeline({
  scrollTrigger: {
    markers: false,
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
    roomMoon.position,
    {
      y: 10,
      duration: 1
    },
    "start"
  )

if (innerWidth > 900) {
  tl.to(
    austin.position,
    {
      x: 7.83,
      y: -11.222,
      z: -9.24,
      duration: 2.5
    },
    "start"
  )
    .to(
      austin.rotation,
      {
        x: 0.097,
        y: -1.871,
        z: 0.106,
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
        y: -4,
        duration: 2,
        ease: "power2.in"
      },
      "end"
    )
} else
  tl.to(
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
        y: -4,
        duration: 2,
        ease: "power2.in"
      },
      "end"
    )

//Moon animation in contact
const tl2 = gsap.timeline({
  scrollTrigger: {
    markers: false,
    trigger: ".contact",
    start: "40% center",
    toggleActions: "play reverse play reverse"
  }
})
if (innerWidth < 400) {
  tl2.to(moon.position, {
    x: -0.79,
    y: -8.4,
    duration: 1.5,
    ease: "power2.out"
  })
} else {
  tl2.to(moon.position, {
    x: -0.604,
    y: -12.18,
    z: 2.96,
    duration: 1.5,
    ease: "power2.out"
  })
}
// Controls for Testing***
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: false
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
  moon.rotation.y = -elapsedTime / 6
  cloudLayer.rotation.y = elapsedTime / 50

  // Update Materials
  materialT.uniforms.uTime.value = elapsedTime
  materialC.uniforms.uTime.value = elapsedTime

  //Camera Controls
  // controls.update()

  // Render
  renderer.render(scene, camera)
  stats.end()
  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
