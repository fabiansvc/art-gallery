import * as CANNON from 'cannon-es'
import CannonDebugger from 'cannon-es-debugger'
import Experience from './Experience.js'
import EventEmitter from './Utils/EventEmitter.js'

export default class Pyshics extends EventEmitter{
    constructor() {
        super()
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.world = new CANNON.World();
        this.world.broadphase = new CANNON.SAPBroadphase(this.world)
        this.world.allowSleep = true
        this.world.gravity.set(0, - 9.82, 0)

        // Default material
        this.defaultMaterial = new CANNON.Material('default')
        this.defaultContactMaterial = new CANNON.ContactMaterial(
            this.defaultMaterial,
            this.defaultMaterial,
            {
                friction: 0.1,
                restitution: 0.7
            }
        )
        this.world.defaultContactMaterial = this.defaultContactMaterial
        
        //this.cannonDebugger = new CannonDebugger(this.scene, this.world)
    }

    update()
    {
        // Update physics
        this.world.step(1 / 60, this.time.delta, 3)

        //this.cannonDebugger.update()
    }

}