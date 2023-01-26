import * as CANNON from 'cannon-es'
import CannonDebugger from 'cannon-es-debugger'
import Experience from './Experience.js'
import EventEmitter from './Utils/EventEmitter.js'

export default class Pyshics extends EventEmitter {
    constructor() {
        super()
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.time = this.experience.time

        // Setup world
        this.world = new CANNON.World()

        // Tweak contact properties.
        // Contact stiffness - use to make softer/harder contacts
        this.world.defaultContactMaterial.contactEquationStiffness = 1e9

        // Stabilization time in number of timesteps
        this.world.defaultContactMaterial.contactEquationRelaxation = 3

        this.world.solver.iterations = 30

        this.world.gravity.set(0, -10, 0)

        this.cannonDebugger = new CannonDebugger(this.scene, this.world)
    }

    update() {
        // Update physics
        this.world.step(1 / 60, this.time.delta, 3)

        this.cannonDebugger.update()
    }

}