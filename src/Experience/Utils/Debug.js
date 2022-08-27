import * as dat from 'lil-gui'

export default class Debug
{
    constructor()
    {
        this.active = window.location.hash === '#debug'

        if(this.active)
        {
            this.ui = new dat.GUI()
            this.ui.open(this.ui._closed)
        }
    }
}