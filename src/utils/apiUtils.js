// 封装Axios请求函数
import axios from "axios";
import qs from "qs";
import {useUserStore} from "@/stores/user";
import {alertFail, showFail, showSuccess} from "@/utils/showMessage";
import {gotoLogin} from "@/router/my-router";
import {baseUrl} from "@/stores/basic-data";
import  { ref,watchEffect,toValue,watch } from 'vue'
import { useStarStore } from "@/stores/star-store";


let userStore;

const url = baseUrl
axios.defaults.baseURL = url;
export const axiosClient = axios.create({
    baseURL:url,
    timeout:3000,
    config:{

    }

})
axiosClient.interceptors.request.use(config=>{
    console.log("请求体：", config.data);
    console.log("请求头：", config.headers);
    userStore = useUserStore()
    config.headers['authorization'] = userStore?.token
    return config
})
axiosClient.interceptors.response.use(res=>{
    if(res.status >= 200 && res.status < 300){
        showSuccess(res?.config?.url,res)
    }else{
        showFail(res?.config?.url,res)
    }
    return Promise.resolve(res)
}), error=>{
    console.error("返回错误详情："+ error.response?.data)
    showFail(error?.config?.url,error)
    return Promise.reject(error)
}
export async function apiLogin(loginData){
    userStore = useUserStore()
    try{
        let res = await axiosClient.post('auth/jwt/login',qs.stringify(loginData))
        if(res){
            let token = 'Bearer '+res?.data?.access_token
            userStore.setToken(token)
            userStore.setLoginState(true)
            // 同步更新pinia中的用户名和密码为最近注册，登录的账户
            userStore.setUserName(loginData.username)
            userStore.setPassword(loginData.password)
            await apiGetProfile()
            return Promise.resolve(res?.data)
        }else{
            userStore.setLoginState(false)
            alertFail(apiLogin.name,"登录操作服务端无响应")
        }      
    }catch (e) {
        userStore.setLoginState(false)
        alertFail(apiLogin.name,e?.message)
    }
}
export async function apiGetProfile(){
    userStore = useUserStore()
    try{
        let res = await axiosClient.get('users/me')
        let userData = res?.data
        userStore.setUser(userData)
        return Promise.resolve(userData)
    }catch (e) {
        alertFail(apiGetProfile.name,e?.message)
    }
}
export async function apiLogout(){
    userStore = useUserStore()
    let res
    try{
        res = await axiosClient.post('auth/jwt/logout')
        userStore.setLoginState(false)
        userStore.setToken("")
        userStore.setUser({})
        return Promise.resolve(res.data?res.data:res?.statusText)
    }catch (e) {
        alertFail(apiLogout.name,e?.message)
        if(res?.status && res.status == 401){
            userStore.setLoginState(false)
            userStore.setToken("")
            userStore.setUser({})
        }
        gotoLogin()
    }
}
export async function autoLogin(e){
    if(e.status == 401){
        userStore = useUserStore()
        let loginData = {
            username: userStore.userName,
            password: userStore.getDecodedPwd
        }
        let data = await apiLogin(loginData)
        return Promise.resolve(data)
    }else{
        alertFail(e?.message)
    }
}
export async function apiDeleteImageByPath(path){
    console.log(apiDeleteImageByPath.name, path)
    if(path){
        try{
            let data = await axiosClient.delete('/deleteimage-bypath'+ path);
            showSuccess(apiDeleteImageByPath.name, data)
            return Promise.resolve(data);
        }catch (e) {
            let login = await autoLogin(e)
            if(login){
                try{
                    let data = await axiosClient.delete('/deleteimage-bypath'+ path);
                    showSuccess(apiDeleteImageByPath.name,data)
                    return Promise.resolve(data)
                }catch (e) {
                    alertFail(apiDeleteImageByPath.name,e?.message)
                }
            }
        }
    }else{
        showFail(apiDeleteImageByPath.name,'待删除文件不可为空')
    }
}
export async function apiGetDetailProfile(){
    userStore = useUserStore()
    try{
        let res = await axiosClient.get('/users/mine/')
        let userData = res?.data
        // userStore.setUser(userData)
        return Promise.resolve(userData)
    }catch (e) {
        alertFail(apiGetProfile.name,e?.message)
    }
}

export async function apiRenameMe(postData){
    //if(postData.name || postData.avatar){
        try{
            let data = await axiosClient.post('/users/rename/',postData)
            showSuccess(apiRenameMe.name,data)
            return Promise.resolve(data)
        }catch (e) {
            alertFail(apiRenameMe.name,e?.message)
        }
    //}
}

export async function apiModifyPassword(password){
    try{
        let user = await apiGetProfile()
        if(user){
            user.password = password
            let res = await axiosClient.patch('/users/me/',user)
            if(res?.data){
                showSuccess(apiModifyPassword.name,res?.data)
                return Promise.resolve(res.data)
            }else{
                alertFail(apiModifyPassword.name,"修改密码失败，patch失败")
            }
        }else{
            alertFail(apiModifyPassword.name,"修改密码失败，未获得用户数据")
        }
    }catch (e) {
        alertFail(apiRenameMe.name,e?.message)
    }
}

export async function apiRegister(postData){
    // 补充postData部分
    postData.is_active  = true
    postData.is_superuser  = false
    postData.is_verified  = false
    try{
        let res = await axiosClient.post('/auth/register',postData)
        if(res?.data){
            let loginData = {username:postData.email, password:postData.password}
            // 注册成功直接登录
            await apiLogin(loginData)
            // 使用renameMe接口在后端user_items的user表中插入完整记录，其中时间自己生成
            let out = await apiRenameMe({name:postData.email, avatar:""})
            showSuccess(apiRegister.name,out.data)
            return Promise.resolve(res.data)
        }else{
            alertFail(apiRegister.name,"Fail to register")
        }
    }catch(e){
        let detail = e?.response?.data?.detail
        alertFail(apiRegister.name,detail ? detail:e?.message)
    }
}

export function apiGetAllItemsRefresh(timeCounter,query = ref('skip=0&limit=100'),query2 = ref('')){
    //这里timeCounter由外部传入
    let list = ref(null)
    let error = ref(null)
    let isLoading = ref(true)
    let url
    let isSearchMode = ref(false)

    watchEffect(()=>{
        // NOTE: 搜索模式下不开启自动刷新，避免冲突
        if(isSearchMode.value) return
        
        url=`/items/auto-refresh/${toValue(timeCounter)}?${toValue(query)}`
        isLoading.value = true
        axiosClient.get(url).then(res =>{
            console.log("刷新数据请求已发送")
            if(res?.data){
                list.value = res.data
            }
            isLoading.value = false
            error.value = null
        }).catch(e => {
            //console.log("get失败")
            error.value = e?.message? e.message:JSON.stringify(e,null,1)
            isLoading.value = false
        })
    })
    
    watch(()=>toValue(query2),(newKeyword)=>{
        const keyword = newKeyword.trim()
        if(keyword === ''){// 关键词为空回归自动刷新模式
            isSearchMode.value = false
            return
        }
        isSearchMode.value = true
        url = `/items/?keyword=${keyword}`
        isLoading.value = true
        axiosClient.get(url).then(res=>{
            if(res?.data){
                list.value = res.data
            }
            isLoading.value = false
            error.value = null
        }).catch(e => {
            if(e.status == 404){
                showFail(apiGetAllItemsRefresh.name,'无数据')
                list.value = null
                error.value = null
            }else{
                error.value = e?.message ? e.message : JSON.stringify(e,null,1)
            }
            isLoading.value = false
        })
    })
    return {list,error,isLoading}
}

export async function loginOnLaunch(){
    userStore = useUserStore()
    if(userStore.isLogin){
        let loginData = {
            username: userStore.userName,
            password: userStore.getDecodedPwd
        }
        try{
            let data = await apiLogin(loginData)
            if(data){
                let userDetail = await apiGetDetailProfile()
                if(userDetail){
                    userStore.setUserDetail(userDetail)
                }
                return Promise.resolve(data)
            }else{
                return Promise.reject("Login failed")
            }
        }catch(e){
            return Promise.reject(e)
        }
    }
}



export function apiGetAllItemsByUserId(timeCounter,user_UUID,query = ref('')){
    // 根据uuid获取用户文章
    let list = ref(null)
    let error = ref(null)
    let isLoading = ref(true)
    let url
    let watchData = [
        ()=>toValue(timeCounter),
        ()=>toValue(user_UUID),
        ()=>toValue(query),
    ]
    watch(watchData,()=>{
        let q = toValue(query)
        let uuid = toValue(user_UUID)
        console.log(apiGetAllItemsByUserId.name,'UUID',uuid)
        if(!uuid){
            list.value = null
            isLoading.value = false
        }else{
            url =  `/items/users/${uuid}`
            if(q){
                url = `${url}?keyword=${q}`
            }
            isLoading.value = true
            axiosClient.get(url).then(res=>{
                if(res?.data){
                    list.value = res.data
                }
                isLoading.value = false
                error.value = null
            }).catch(e=>{
                if(e.status == 404){
                    showFail(apiGetAllItemsByUserId.name,'无数据')
                    list.value = null
                    error.value = null
                }else{
                    error.value = e?.message ? e.message:JSON.stringify(e,null,1)
                }
                isLoading.value = false
            })
        }
    })
    return {list,error,isLoading}
}
export async function apiDeleteImageById(id) {
    try {
        let res = await axiosClient.delete(`/deleteimage-byid/${id}`);
        return Promise.resolve(res?.data)
    } catch (error) {
        alertFail(apiDeleteImageById.name,error?.message)
    }
}
export async function apiAddOrEditImageById(itemId,params) {
    try {
        let res = await axiosClient.post(`/modifyimage/${itemId}/${params.id}`,params);
        return Promise.resolve(res?.data)
    } catch (error) {
        alertFail(apiAddOrEditImageById.name,error?.message)
    }
}
export async function apiPostItemTitle(params) {
    try {
        let res = await axiosClient.post(`/items/`,params)
        return Promise.resolve(res?.data)
    } catch (error) {
        alertFail(apiPostItemTitle.name,error?.message)
    }
}
export async function apiModifyItemTitle(itemId,params) {
    try {
        let res = await axiosClient.post(`/items/put/`+itemId,params)
        return Promise.resolve(res?.data)
    } catch (error) {
        alertFail(apiModifyItemTitle.name,error?.message)
    }
}
export function apiGetItemById(itemId,refreshCount = ref(0)){
    const error = ref(null)
    const itemData = ref(null)
    const isLoading = ref(true)

    watch(()=>toValue(refreshCount),()=>{
        isLoading.value = true
        axiosClient.get('/items/' + itemId).then(res=>{
            console.log('res',res)
            if(res?.data){
                itemData.value = res.data
                console.log(apiGetItemById.name,'itemData',itemData)
            }
            isLoading.value = false
            error.value = null
        }).catch(e=>{
            alertFail(apiGetItemById.name,e?.message)
            error.value = e?.message
            isLoading.value = false
        })
    })
    return {itemData,error,isLoading}
}

export async function apiDeleteItemById(itemId){
    try{
        let res = await axiosClient.delete('/deleteitem-byid/'+itemId);
        return Promise.resolve(res?.data);
    }catch(e){
        alertFail(apiDeleteImageById.name,e?.message)
    }
}


export function apiGetCommentsByItemId(counter = ref(1),itemId){
    const comments = ref(null)
    const error = ref(null)
    const isLoading = ref(true)
    const watchData = [
        // ()=>toValue(counter),
        // ()=>toValue(itemId),
        counter,itemId
    ]
    watch(watchData,()=>{
        let url = '/comments/by-itemid/'+toValue(itemId)
        console.log('comment_url',url)
        isLoading.value = true
        axiosClient.get(url).then(res =>{
            if(res?.data){
                comments.value = res.data
            }
            isLoading.value = false
            error.value = null
        }).catch(e=>{
            console.log('e',e)
            if(e.status == 404){
                showFail(apiGetCommentsByItemId.name,'无评论数据')
                comments.value = []
            }else{
                alertFail(apiGetCommentsByItemId.name,e?.message)
                error.value = e?.message
            }
            isLoading.value = false
        })
        
    })   
    return {comments,error,isLoading}
}

export async function apiDeleteCommentById(commentId){
    try {
        let res = await axiosClient.delete('/delete-comment/'+ commentId)
        return Promise.resolve(res?.data)
    } catch (error) {
        alertFail(apiDeleteCommentById.name,error?.message)
    }
}
export async function apiPostComment(itemId,params) {
    try {
        let res = await axiosClient.post('/comments/'+itemId,params)
        return Promise.resolve(res?.data)
    } catch (error) {
        alertFail(apiPostComment.name,error?.message)
    }
}
export async function apiAddItemStar(itemId){
    let starStore = useStarStore()
    try {
        let res = await axiosClient.post('/items/put/addstar/'+itemId)
        if(res?.data){
            starStore.setStarTime(itemId)
        }
        return Promise.resolve(res?.data)
    } catch (error) {
        alertFail(apiAddItemStar.name,error?.message)
    }
}
export async function apiGetMyComments(counter) {
    const comments = ref(null)
    const error = ref(null)
    const isLoading = ref(true)
    const watchData = [()=>toValue(counter)]
    watch(watchData,()=>{
        let url = '/comments/mine/'
        isLoading.value = true
        axiosClient.get(url)
            .then(res =>{
                if(res?.data){
                    comments.value = res.data
                }
                isLoading.value = false
                error.value = null
                console.log('in apiGetMyComments',comments.value)
            }).catch(e=>{
                console.log('e',e)
                if(e.status == 404 || e.status == 401){
                    showFail(apiGetCommentsByItemId.name,'无评论数据')
                    comments.value = []
                }else{
                    alertFail(apiGetCommentsByItemId.name,e?.message)
                    error.value = e?.message
                }
                isLoading.value = false
            })
    })
    
    return {comments,error,isLoading}
}

export async function apiPostItemDetail(itemIdRef,titleForm,imgContents){
    let itemId = itemIdRef.value
    if(itemId == 0){
        let item = await apiPostItemTitle(titleForm)
        itemIdRef.value = item.id
        itemId = item.id
        console.log(apiPostItemDetail.name,'itemIdRef未立即生效',
            'itemIdRef',itemIdRef.value,
            'itemId',itemId
        )
    }else{
        await apiModifyItemTitle(itemId,titleForm)
    }
    for(let i = 0;i < imgContents.length;i ++){
        let imgContent = imgContents[i]
        await apiAddOrEditImageById(itemId,imgContent)
    }
    console.log('异步循环结束的itemIdRef',itemIdRef.value);
    return Promise.resolve(itemId)
}