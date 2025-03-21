import { onActivated, onDeactivated } from "vue"

export function useScrollPos(){
    var pos = 0
    function update(){
        pos = document.documentElement.scrollTop
    }
    onActivated(()=>{
        window.addEventListener('scroll',update)
        if(typeof pos == 'number'){
            document.documentElement.scrollTo(0,pos)
        }
    })
    onDeactivated(()=>{
        window.removeEventListener('scroll',update)
    })
}