import './style.css'
import * as dat from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

/**
 * Base
 */

// Debug
const debugObject = {}
const gui = new dat.GUI({
    width: 256
})
gui.open( gui._closed ); 

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader()

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

/**
 * Textures
 */
const bakedTexture = textureLoader.load('textures/baked/baked.jpg')
bakedTexture.flipY = false
bakedTexture.encoding = THREE.sRGBEncoding

let vImages = []
let hImages = []

for (let index = 0; index < 9; index++) {
    const vTexture = textureLoader.load(`textures/images/v${index}-color.jpg`)
    vTexture.flipY = false
    vTexture.encoding = THREE.sRGBEncoding

    const vMaterial = new THREE.MeshBasicMaterial({ map: vTexture})
    vImages.push(vMaterial)
}

for (let index = 0; index < 8; index++) {
    const hTexture = textureLoader.load(`textures/images/h${index}-color.jpg`)
    hTexture.flipY = false
    hTexture.encoding = THREE.sRGBEncoding

    const hMaterial = new THREE.MeshBasicMaterial({ map: hTexture})
    hImages.push(hMaterial)
}

/**
 * Materials
 */

// Baked material
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture})


/**
 * Model
 */
gltfLoader.load(
    'models/gallery/gallery.glb',
    (gltf) =>
    {
        scene.add(gltf.scene)

        const bakedMesh = gltf.scene.children.find((child) => child.name === 'baked')
        bakedMesh.material = bakedMaterial
        
        for (let index = 1; index < vImages.length; index++) {
            const vMesh = gltf.scene.children.find((child) => child.name === `v${index}`)
            vMesh.material = vImages[index]
        }

        for (let index = 1; index < hImages.length; index++) {
            const hMesh = gltf.scene.children.find((child) => child.name === `h${index}`)
            hMesh.material = hImages[index]
        }
        
    }
)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
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
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.set(6, 4, 6)
scene.add(camera)

gui.add(camera.position, 'x' ).min(0).max(16).step(1).name("cameraX");
gui.add(camera.position, 'y' ).min(0).max(16).step(1).name("cameraY");
gui.add(camera.position, 'z' ).min(0).max(16).step(1).name("cameraZ");

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.outputEncoding = THREE.sRGBEncoding
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()