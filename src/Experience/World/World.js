import Experience from '../Experience.js'
import Character from './Character.js'
import Environment from './Environment.js'
import Gallery from './Gallery.js'

export default class World
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        // Wait for resources
        this.resources.on('ready', () =>
        {
            // Setup
            this.gallery = new Gallery()
            this.character = new Character()
            this.environment = new Environment()
        })
    }

    update()
    {
        if(this.character)
            this.character.update()     
    }
}