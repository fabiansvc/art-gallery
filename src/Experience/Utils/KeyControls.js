import EventEmitter from './EventEmitter.js'


export default class KeyControls extends EventEmitter {
    constructor() {
        super()
        this.DIRECTIONS = ["w", "a", "s", "d"]
        this.toggleRun = true
        this.keysPressed = {}  
        
        document.addEventListener('keydown', (event) => {
           
            if(event.shiftKey){
                this.toggleRun = !this.toggleRun
            }else{
                this.keysPressed[event.key.toLowerCase()] = true 
            }
                    
        }, false)

        document.addEventListener('keyup', (event) => {
            this.keysPressed = {}  
            this.keysPressed[event.key.toLowerCase()] = false 

        }, false)
    }

} 