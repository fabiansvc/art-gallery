import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Character {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.physics = this.experience.pyshics
        this.keyControl = this.experience.keyControl
        this.camera = this.experience.camera

        // temporary data
        this.walkDirection = new THREE.Vector3()
        this.rotateAngle = new THREE.Vector3(0, 1, 0)
        this.rotateQuarternion = new THREE.Quaternion()
        this.cameraTarget = new THREE.Vector3()

        // constants

        this.runVelocity = 0.004
        this.walkVelocity = 0.002

        // Resource
        this.resource = this.resources.items.characterModel
        this.setModel()

        // Animation
        this.setAnimation()

    }

    setModel() {
        this.model = this.resource.scene
        console.log(this.resource);
        this.model.position.set(0, 0.1, 4)
        this.scene.add(this.model)

        this.model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
            }
        })
    }

    setAnimation() {
        this.animation = {}

        // Mixer
        this.animation.mixer = new THREE.AnimationMixer(this.model)

        // Actions

        this.animation.actions = {}

        this.animation.actions.idle = this.animation.mixer.clipAction(this.resource.animations[2])
        this.animation.actions.running = this.animation.mixer.clipAction(this.resource.animations[3])
        this.animation.actions.walking = this.animation.mixer.clipAction(this.resource.animations[6])
        
        this.animation.actions.current = this.animation.actions.idle
        this.animation.actions.current.play()

        // Play the action

        this.animation.play = (name) => {
            const fadeDuration = 0.2
            const newAction = this.animation.actions[name]
            const oldAction = this.animation.actions.current

            oldAction.fadeOut(fadeDuration)
            newAction.reset().fadeIn(fadeDuration).play();

            this.animation.actions.current = newAction
        }
    }

    changeAnimation() {
        this.directionPressed = this.keyControl.DIRECTIONS.some((key) => this.keyControl.keysPressed[key] == true)
        if (this.directionPressed && this.keyControl.toggleRun & this.animation.actions.current != this.animation.actions.running) {
            this.animation.play('running')
        } else if (this.directionPressed && !this.keyControl.toggleRun & this.animation.actions.current != this.animation.actions.walking) {
            this.animation.play('walking')
        } else if (!this.directionPressed & this.animation.actions.current != this.animation.actions.idle) {
            this.animation.play('idle')
        }

        if (this.animation.actions.current == this.animation.actions.running || this.animation.actions.current == this.animation.actions.walking) {
            let angleYCameraDirection = Math.atan2(
                (this.camera.instance.position.x - this.model.position.x),
                (this.camera.instance.position.z - this.model.position.z))


            // diagonal movement angle offset
            let directionOffset = this.directionOffset()

            // rotate model
            this.rotateQuarternion.setFromAxisAngle(this.rotateAngle, angleYCameraDirection + directionOffset)
            this.model.quaternion.rotateTowards(this.rotateQuarternion, 0.2)

            // calculate direction
            this.camera.instance.getWorldDirection(this.walkDirection)
            this.walkDirection.y = 0
            this.walkDirection.normalize()
            this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset)

            // run/walk velocity
            const velocity = this.animation.actions.current == this.animation.actions.running ? this.runVelocity : this.walkVelocity

            // move model & camera
            const moveX = this.walkDirection.x * velocity * this.time.delta
            const moveZ = this.walkDirection.z * velocity * this.time.delta
            this.model.position.x += moveX
            this.model.position.z += moveZ
            this.updateCameraTarget(moveX, moveZ)
        }
    }
    updateCameraTarget(moveX, moveZ) {
        // move camera
        this.camera.instance.position.x += moveX 
        this.camera.instance.position.z += moveZ 
        // update camera target
        this.cameraTarget.x = this.model.position.x
        this.cameraTarget.y = this.model.position.y 
        this.cameraTarget.z = this.model.position.z
        this.camera.controls.target = this.cameraTarget
    }

    directionOffset() {
        let directionOffset = 0 // w

        if (this.keyControl.keysPressed.w) {
            if (this.keyControl.keysPressed.a) {
                directionOffset = Math.PI / 4 // w+a
            } else if (this.keyControl.keysPressed.d) {
                directionOffset = - Math.PI / 4 // w+d
            }
        } else if (this.keyControl.keysPressed.s) {
            if (this.keyControl.keysPressed.a) {
                directionOffset = Math.PI / 4 + Math.PI / 2 // s+a
            } else if (this.keyControl.keysPressed.d) {
                directionOffset = -Math.PI / 4 - Math.PI / 2 // s+d
            } else {
                directionOffset = Math.PI // s
            }
        } else if (this.keyControl.keysPressed.a) {
            directionOffset = Math.PI / 2 // a
        } else if (this.keyControl.keysPressed.d) {
            directionOffset = - Math.PI / 2 // d
        }

        return directionOffset
    }

    update() {
        this.changeAnimation()
        this.camera.instance.lookAt(new THREE.Vector3(this.model.position.x, this.model.position.y + 1.5, this.model.position.z))
        this.animation.mixer.update(this.time.delta * 0.001)
    }
}