import { defineStore } from "pinia";

export const useStarStore = defineStore("starstate",{
    state:()=>{
        return {
            starTimes:{}, // 内部以键值对形式存储，id：time
        }
    },
    getters:{
        canStar(){
            return (itemId)=>{
                if(!this.starTimes[itemId]){// 不存在，可以点赞
                    return true 
                }
                const starTime = this.starTimes[itemId]// 获取id对应的时间戳
                let interval = Date.now() - parseInt(starTime)
                if (interval > 24*60*60*1000){// 大于24小时，可以点
                    return true
                }
                return false
            }       
        }
    },
    actions:{
        setStarTime(itemId){
            this.starTimes[itemId] = Date.now().toString()
        }
    },
    persist:true,
})