import {createRouter, createWebHashHistory} from "vue-router";
import MyLogin from "@/views/MyLogin.vue";
//import MyProfile from "@/views/MyProfile.vue";
import MyRegister from "@/views/MyRegister.vue";
import MyHome from "@/views/MyHome.vue"
import MySettings from "@/views/MySettings.vue";
import ShowComment from "@/views/ShowComment.vue";
import PostArticle from "@/views/PostArticle.vue";
import ShowArticle from "@/views/ShowArticle.vue";
//import MyProfile from '@/views/TestImageuploader.vue'

const routes = [
    {path:'/',component:MyHome,name:'home'},
    //{path:'/login',component: MyLogin,name:'login'},
    {path:'/login/:back?',component: MyLogin,name:'login'},
    {path:'/register',component: MyRegister,name:'register'},
    {path:'/settings',component: MySettings,name:'settings'},
    {path:'/post-article',component: PostArticle,name:'postArticle'},
    {path:'/show-article/:id',component: ShowArticle,name:'showArticle'},
    {path:'/show-comment/:id',component: ShowComment,name:'showComment',props:true},
    // {path:'/show-article/:id',component: ShowArticle,name:'showArticle',props:true},
];
const router = createRouter({
    history: createWebHashHistory(),
    scrollBehavior(to,from,savedPosition){
        console.log('router','savedPosition',savedPosition);
        if(savedPosition){
            return savedPosition
        }else{
            return {top : 0}
        }
    },
    routes,
})
export default router
export function gotoLogin(goWhere = 0){
    router.push({name:'login',params:{back:goWhere}})
}
export function gotoHome(){
    router.push({name:'home'})
}
export function gotoBack(){
    router.back()
}
export function gotoRegister(){
    router.push({name:'register'})
}
export function gotoSettings(){
    router.push({name:'settings'})
}
export function gotoShowComment(itemId){
    router.push({name:'showComment',params:{id:itemId}})
}
export function gotoShowArticle(itemId){
    router.push({name:'showArticle',params:{id:itemId}})
}
export function gotoPostArticle(){
    router.push({name:'postArticle'})
}
export function replaceToShowArticle(itemId){
    router.replace({name:'showArticle',params:{id:itemId}})
}