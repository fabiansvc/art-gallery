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
        this.setExternalRoomPyshics()
        this.setInternalRoomPyshics()
        this.setCenterWallShape()

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

    setExternalRoomPyshics() {
        this.floorShape = new CANNON.Box(new CANNON.Vec3(
            (this.bakedMesh.geometry.boundingBox.max.x - this.bakedMesh.geometry.boundingBox.min.x) * 0.5,
            (this.bakedMesh.geometry.boundingBox.max.y - this.bakedMesh.geometry.boundingBox.min.y) * 0.5,
            (this.bakedMesh.geometry.boundingBox.max.z - this.bakedMesh.geometry.boundingBox.min.z) * 0.5))

        this.floorBody = new CANNON.Body({ material: new CANNON.Material('default') })
        this.floorBody.mass = 0
        this.floorBody.position.copy(new CANNON.Vec3(this.bakedMesh.position.x, this.bakedMesh.position.y + 2, this.bakedMesh.position.z))
        this.floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, -1, 0), Math.PI * 0.5)
        this.floorBody.addShape(this.floorShape)
        this.physics.world.addBody(this.floorBody)
    }

    setInternalRoomPyshics() {
        this.floorShape = new CANNON.Box(new CANNON.Vec3(
            (this.bakedMesh.geometry.boundingBox.max.x - this.bakedMesh.geometry.boundingBox.min.x) * 0.45,
            (this.bakedMesh.geometry.boundingBox.max.y - this.bakedMesh.geometry.boundingBox.min.y) * 0.5,
            (this.bakedMesh.geometry.boundingBox.max.z - this.bakedMesh.geometry.boundingBox.min.z) * 0.45))

        this.floorBody = new CANNON.Body({ material: new CANNON.Material('default') })
        this.floorBody.mass = 0
        this.floorBody.position.copy(new CANNON.Vec3(this.bakedMesh.position.x, this.bakedMesh.position.y + 2, this.bakedMesh.position.z))
        this.floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, -1, 0), Math.PI * 0.5)
        this.floorBody.addShape(this.floorShape)
        this.physics.world.addBody(this.floorBody)
    }

    setCenterWallShape() {
        this.centerWallShape = new CANNON.Box(new CANNON.Vec3(
            (this.bakedMesh.geometry.boundingBox.max.x - this.bakedMesh.geometry.boundingBox.min.x) * 0.15,
            (this.bakedMesh.geometry.boundingBox.max.y - this.bakedMesh.geometry.boundingBox.min.y) * 0.5,
            (this.bakedMesh.geometry.boundingBox.max.z - this.bakedMesh.geometry.boundingBox.min.z) * 0.15))

        this.centerWallBody = new CANNON.Body({ material: new CANNON.Material('default') })
        this.centerWallBody.mass = 0
        this.centerWallBody.position.copy(new CANNON.Vec3(this.bakedMesh.position.x, this.bakedMesh.position.y + 2, this.bakedMesh.position.z))
        this.centerWallBody.addShape(this.centerWallShape)
        this.physics.world.addBody(this.centerWallBody)
    }

}