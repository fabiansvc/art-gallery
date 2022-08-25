import './style.css'
import * as dat from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import * as CANNON from 'cannon-es'
import CannonDebugger from 'cannon-es-debugger'

/**
 * Base
 */

// Debug
const debugObject = {}
const gui = new dat.GUI({
    width: 256
})
gui.open(gui._closed);

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

for (let index = 1; index < 9; index++) {
    const vTexture = textureLoader.load(`textures/images/v${index}-color.jpg`)
    vTexture.flipY = false
    vTexture.encoding = THREE.sRGBEncoding

    const vMaterial = new THREE.MeshBasicMaterial({ map: vTexture })
    vImages.push(vMaterial)
}

for (let index = 1; index < 8; index++) {
    const hTexture = textureLoader.load(`textures/images/h${index}-color.jpg`)
    hTexture.flipY = false
    hTexture.encoding = THREE.sRGBEncoding

    const hMaterial = new THREE.MeshBasicMaterial({ map: hTexture })
    hImages.push(hMaterial)
}

/**
 * Materials
 */

// Baked material
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })

/**
 * Physics
 */
const world = new CANNON.World()
world.broadphase = new CANNON.SAPBroadphase(world)
world.allowSleep = true
world.gravity.set(0, - 9.82, 0)

// Default material
const defaultMaterial = new CANNON.Material('default')
const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
        friction: 0.1,
        restitution: 0.7
    }
)
world.defaultContactMaterial = defaultContactMaterial

/**
 * Model
 */

gltfLoader.load(
    'models/gallery/gallery.glb',
    (gltf) => {
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

        /**
         * Physhics
         */
        const floorShape = new CANNON.Box(new CANNON.Vec3(
            (bakedMesh.geometry.boundingBox.max.x - bakedMesh.geometry.boundingBox.min.x) * 0.5,
            (bakedMesh.geometry.boundingBox.max.z - bakedMesh.geometry.boundingBox.min.z) * 0.5,
            bakedMesh.geometry.boundingBox.min.y * 0.5))

        const floorBody = new CANNON.Body({ material: defaultMaterial })
        floorBody.mass = 0
        floorBody.position.copy(new CANNON.Vec3(bakedMesh.position.x, bakedMesh.position.y, bakedMesh.position.z))
        floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(- 1, 0, 0), Math.PI * 0.5)
        floorBody.addShape(floorShape)
        world.addBody(floorBody)

        const topShape = new CANNON.Box(new CANNON.Vec3(
            (bakedMesh.geometry.boundingBox.max.x - bakedMesh.geometry.boundingBox.min.x) * 0.5,
            (bakedMesh.geometry.boundingBox.max.z - bakedMesh.geometry.boundingBox.min.z) * 0.5,
            bakedMesh.geometry.boundingBox.min.y * 0.5))

        const topBody = new CANNON.Body({ material: defaultMaterial })
        topBody.mass = 0
        topBody.position.copy(new CANNON.Vec3(bakedMesh.position.x, bakedMesh.position.y + 4, bakedMesh.position.z))
        topBody.quaternion.setFromAxisAngle(new CANNON.Vec3(- 1, 0, 0), Math.PI * 0.5)
        topBody.addShape(topShape)
        world.addBody(topBody)


        const centerWallShape = new CANNON.Box(new CANNON.Vec3(
            (bakedMesh.geometry.boundingBox.max.x - bakedMesh.geometry.boundingBox.min.x) * 0.15,
            (bakedMesh.geometry.boundingBox.max.y - bakedMesh.geometry.boundingBox.min.y) * 0.5,
            (bakedMesh.geometry.boundingBox.max.z - bakedMesh.geometry.boundingBox.min.z) * 0.15))

        const centerWallBody = new CANNON.Body({ material: defaultMaterial })
        centerWallBody.mass = 0
        centerWallBody.position.copy(new CANNON.Vec3(bakedMesh.position.x, bakedMesh.position.y + 2, bakedMesh.position.z))
        centerWallBody.addShape(centerWallShape)
        world.addBody(centerWallBody)

        const WallShape = new CANNON.Box(new CANNON.Vec3(
            bakedMesh.geometry.boundingBox.min.x * 0.05,
            (bakedMesh.geometry.boundingBox.max.y - bakedMesh.geometry.boundingBox.min.y) * 0.5,
            (bakedMesh.geometry.boundingBox.max.z - bakedMesh.geometry.boundingBox.min.z) * 0.5))

        const Wall1Body = new CANNON.Body({ material: defaultMaterial })
        Wall1Body.mass = 0
        Wall1Body.position.copy(new CANNON.Vec3(bakedMesh.position.x + 7.5, bakedMesh.position.y + 2, bakedMesh.position.z))
        Wall1Body.addShape(WallShape)
        world.addBody(Wall1Body)

        const Wall2Body = new CANNON.Body({ material: defaultMaterial })
        Wall2Body.mass = 0
        Wall2Body.position.copy(new CANNON.Vec3(bakedMesh.position.x - 7.5, bakedMesh.position.y + 2, bakedMesh.position.z))
        Wall2Body.addShape(WallShape)
        world.addBody(Wall2Body)

        const Wall3Body = new CANNON.Body({ material: defaultMaterial })
        Wall3Body.mass = 0
        Wall3Body.position.copy(new CANNON.Vec3(bakedMesh.position.x, bakedMesh.position.y + 2, bakedMesh.position.z - 7.5))
        Wall3Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, -1, 0), Math.PI * 0.5)
        Wall3Body.addShape(WallShape)
        world.addBody(Wall3Body)

        const Wall4Body = new CANNON.Body({ material: defaultMaterial })
        Wall4Body.mass = 0
        Wall4Body.position.copy(new CANNON.Vec3(bakedMesh.position.x, bakedMesh.position.y + 2, bakedMesh.position.z + 7.5))
        Wall4Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, -1, 0), Math.PI * 0.5)
        Wall4Body.addShape(WallShape)
        world.addBody(Wall4Body)
    }
)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
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
camera.position.set(2, 4, 16)
scene.add(camera)

gui.add(camera.position, 'x').min(0).max(16).step(1).name("cameraX");
gui.add(camera.position, 'y').min(0).max(16).step(1).name("cameraY");
gui.add(camera.position, 'z').min(0).max(16).step(1).name("cameraZ");

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
let oldElapsedTime = 0
const cannonDebugger = new CannonDebugger(scene, world)
const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - oldElapsedTime
    oldElapsedTime = elapsedTime

    // Update physics
    world.step(1 / 60, deltaTime, 3)

    cannonDebugger.update()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()