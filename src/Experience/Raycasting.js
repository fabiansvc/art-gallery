import Experience from './Experience.js'
import * as THREE from 'three'

export default class Raycasting {
    constructor() {
        this.experience = new Experience()
        this.raycaster = new THREE.Raycaster()
        this.mouse = new THREE.Vector2();

        this.setRayCaster()
    }

    setRayCaster() {
        window.addEventListener('mousemove', (event) => {

            this.mouse.x = event.clientX / this.experience.sizes.width * 2 - 1
            this.mouse.y = - (event.clientY / this.experience.sizes.height) * 2 + 1

            this.raycaster.setFromCamera(
                this.mouse,
                this.experience.camera.instance
            )

            let intersects = this.raycaster.intersectObject(this.experience.world.gallery.model.children.find((child) => child.name === 'v1'));

            if (intersects.length > 0) {
                document.body.style.cursor = 'zoom-in'

                window.addEventListener('click', (event) => {
                    
                })
            } else {
                document.body.style.cursor = 'default'
            }
        });
    }

}