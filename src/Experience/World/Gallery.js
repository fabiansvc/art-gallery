import * as THREE from 'three'
import Experience from '../Experience.js'
import * as CANNON from 'cannon-es'

export default class Gallery {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug
        this.physics = this.experience.pyshics

        // Debug
        if (this.debug.active) {
            //this.debugFolder = this.debug.ui.addFolder('gallery')
        }

        // Resource
        this.resource = this.resources.items.galleryModel

        this.setTextures()
        this.setVerticalImages()
        this.setHorizontalImages()
        this.setMaterial()
        this.setModel()
        this.setWallsPhysics()
        this.setFloorPhysics()
        this.setCenterWallPhysics()
    }

    setTextures() {
        this.textures = {}
        this.textures.bakedColor = this.resources.items.bakedTexture
        this.textures.bakedColor.flipY = false
        this.textures.bakedColor.encoding = THREE.sRGBEncoding

    }

    setMaterial() {
        this.bakedMaterial = new THREE.MeshBasicMaterial({
            map: this.textures.bakedColor
        })
    }

    setVerticalImages() {
        this.verticalImages = {}
        for (let index = 1; index < 9; index++) {
            this.verticalImages[`v${index}Color`] = this.resources.items[`v${index}ColorTexture`]
            this.verticalImages[`v${index}Color`].flipY = false
            this.verticalImages[`v${index}Color`].encoding = THREE.sRGBEncoding

            this.verticalImages[`v${index}Material`] = new THREE.MeshBasicMaterial({
                map: this.verticalImages[`v${index}Color`]
            })
        }
    }

    setHorizontalImages() {
        this.horizontalImages = {}
        for (let index = 1; index < 8; index++) {
            this.horizontalImages[`h${index}Color`] = this.resources.items[`h${index}ColorTexture`]
            this.horizontalImages[`h${index}Color`].flipY = false
            this.horizontalImages[`h${index}Color`].encoding = THREE.sRGBEncoding

            this.horizontalImages[`h${index}Material`] = new THREE.MeshBasicMaterial({
                map: this.horizontalImages[`h${index}Color`]
            })
        }
    }

    setModel() {
        this.model = this.resource.scene
        this.scene.add(this.model)
        

        this.bakedMesh = this.model.children.find((child) => child.name === 'baked')
        this.bakedMesh.receiveShadow = true
        this.bakedMesh.material = this.bakedMaterial

        for (let index = 1; index < 9; index++) {
            this.model.children.find((child) => child.name === `v${index}`).material = this.verticalImages[`v${index}Material`]
        }

        for (let index = 1; index < 8; index++) {
            this.model.children.find((child) => child.name === `h${index}`).material = this.horizontalImages[`h${index}Material`]
        }

    }

    setWallsPhysics() {
        this.wallShape = new CANNON.Box(new CANNON.Vec3(
            (this.bakedMesh.geometry.boundingBox.max.x - this.bakedMesh.geometry.boundingBox.min.x) * 0.5,
            (this.bakedMesh.geometry.boundingBox.max.y - this.bakedMesh.geometry.boundingBox.min.y) * 0.5,
            this.bakedMesh.geometry.boundingBox.max.z / 16
        ))

        this.wallBody1 = new CANNON.Body({ mass: 0 })
        this.wallBody1.addShape(this.wallShape)
        this.wallBody1.position.copy(new CANNON.Vec3(this.bakedMesh.position.x + 7.5, this.bakedMesh.position.y + 2, this.bakedMesh.position.z))
        this.wallBody1.quaternion.setFromEuler(0, Math.PI * 0.5, 0)

        this.wallBody2 = new CANNON.Body({ mass: 0 })
        this.wallBody2.addShape(this.wallShape)
        this.wallBody2.position.copy(new CANNON.Vec3(this.bakedMesh.position.x - 7.5, this.bakedMesh.position.y + 2, this.bakedMesh.position.z))
        this.wallBody2.quaternion.setFromEuler(0, Math.PI * 0.5, 0)

        this.wallBody3 = new CANNON.Body({ mass: 0 })
        this.wallBody3.addShape(this.wallShape)
        this.wallBody3.position.copy(new CANNON.Vec3(this.bakedMesh.position.x, this.bakedMesh.position.y + 2, this.bakedMesh.position.z - 7.5))
        this.wallBody3.quaternion.setFromEuler(0, 0, 0)

        this.wallBody4 = new CANNON.Body({ mass: 0 })
        this.wallBody4.addShape(this.wallShape)
        this.wallBody4.position.copy(new CANNON.Vec3(this.bakedMesh.position.x, this.bakedMesh.position.y + 2, this.bakedMesh.position.z + 7.5))
        this.wallBody4.quaternion.setFromEuler(0, 0, 0)

        this.physics.world.addBody(this.wallBody1)
        this.physics.world.addBody(this.wallBody2)
        this.physics.world.addBody(this.wallBody3)
        this.physics.world.addBody(this.wallBody4)
    }

    setCenterWallPhysics() {
        this.centerWallShape = new CANNON.Box(new CANNON.Vec3(
            (this.bakedMesh.geometry.boundingBox.max.x - this.bakedMesh.geometry.boundingBox.min.x) * 0.15,
            (this.bakedMesh.geometry.boundingBox.max.y - this.bakedMesh.geometry.boundingBox.min.y) * 0.5,
            (this.bakedMesh.geometry.boundingBox.max.z - this.bakedMesh.geometry.boundingBox.min.z) * 0.15))

        this.centerWallBody = new CANNON.Body({ mass: 0 })
        this.centerWallBody.addShape(this.centerWallShape)
        this.centerWallBody.position.copy(new CANNON.Vec3(this.bakedMesh.position.x, this.bakedMesh.position.y + 2, this.bakedMesh.position.z))
        this.physics.world.addBody(this.centerWallBody)
    }

    setFloorPhysics() {
        this.floorShape = new CANNON.Box(new CANNON.Vec3(
            (this.bakedMesh.geometry.boundingBox.max.x - this.bakedMesh.geometry.boundingBox.min.x) * 0.45,
            0.1,
            (this.bakedMesh.geometry.boundingBox.max.z - this.bakedMesh.geometry.boundingBox.min.z) * 0.45))

        this.floorBody = new CANNON.Body({
            mass: 0
        })
        this.floorBody.addShape(this.floorShape)
        this.floorBody.position.copy(new CANNON.Vec3(this.bakedMesh.position.x, this.bakedMesh.position.y, this.bakedMesh.position.z))
        this.floorBody.quaternion.setFromEuler(0, -Math.PI * 0.5, 0)
        this.physics.world.addBody(this.floorBody)
    }
}