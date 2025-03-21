import { defineStore } from "pinia";
export const useCounterStore = defineStore("counterState",{
    state:()=>{
        return {
            articleCounter:0,
            commentCounter:0,
            timeId:null,
            articleCounterEnabled: false,
            commentCounterEnabled: false,
            interval:1000,
        }
    },
    getters:{},
    actions:{
        resetCounter(){
            this.articleCounter = 0;
            this.commentCounter = 0;
        },// 重置计时器
        incrementArticleCounter(){
            this.articleCounter ++
        },// 文章数++
        incrementCommentCounter(){
            this.commentCounter ++
        },// 评论数++
        timerArticleCounter(){
            if(this.articleCounterEnabled){
                this.incrementArticleCounter()
            }
        },
        timerCommentCounter(){
            if(this.commentCounterEnabled){
                this.incrementCommentCounter()
            }
        },// 根据状态调用计数
        setArticleCounterEnabled(status = true){
            this.articleCounterEnabled = status
        },
        setCommentCounterEnabled(status = true){
            this.commentCounterEnabled = status
        },// 调整计数器状态
        incrementTimerCounter(){
            this.timerArticleCounter()
            this.timerCommentCounter()
        },
        setInterval(interval = 1000){
            this.interval = interval
            this.stopTimer()
            this.startTimer()
        },
        startTimer(){
            this.timerId = setInterval(()=>
                this.incrementTimerCounter(),this.interval)
        },
        stopTimer(){
            clearInterval(this.timerId)
        },
    },
    persist:true,
})