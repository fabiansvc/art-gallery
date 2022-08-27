import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Character {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug
        this.physics = this.experience.pyshics

        // Debug
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('character')
        }

        // Resource
        this.resource = this.resources.items.characterModel
        this.setModel()
        this.setAnimation()
    }

    setModel() {
        this.model = this.resource.scene
        this.model.position.set(0, 0, 4)
        this.model.rotation.y = Math.PI * 1
        this.scene.add(this.model)

        this.model.traverse((child) =>
        {
            if(child instanceof THREE.Mesh)
            {
                //child.castShadow = true
            }
        })        
    }

    setAnimation()
    {
        this.animation = {}
        
        // Mixer
        this.animation.mixer = new THREE.AnimationMixer(this.model)
        
        // Actions
        this.animation.actions = {}
        
        this.animation.actions.idle = this.animation.mixer.clipAction(this.resource.animations[0])
        this.animation.actions.running = this.animation.mixer.clipAction(this.resource.animations[1])
        this.animation.actions.tPose = this.animation.mixer.clipAction(this.resource.animations[2])
        this.animation.actions.walking = this.animation.mixer.clipAction(this.resource.animations[3])
        
        
        this.animation.actions.current = this.animation.actions.idle
        this.animation.actions.current.play()

        // Play the action
        this.animation.play = (name) =>
        {
            const newAction = this.animation.actions[name]
            const oldAction = this.animation.actions.current

            newAction.reset()
            newAction.play()
            newAction.crossFadeFrom(oldAction, 1)

            this.animation.actions.current = newAction
        }

        // Debug
        if(this.debug.active)
        {
            const debugObject = {
                playIdle: () => { this.animation.play('idle') },
                playRunning: () => { this.animation.play('running') },
                playTPose: () => {this.animation.play('tPose')},
                playWalking: () => { this.animation.play('walking') }
            }
            this.debugFolder.add(debugObject, 'playIdle')
            this.debugFolder.add(debugObject, 'playRunning')
            this.debugFolder.add(debugObject, 'playTPose')
            this.debugFolder.add(debugObject, 'playWalking')
        }
    }

    update()
    {
        this.animation.mixer.update(this.time.delta * 0.001)
    }
}