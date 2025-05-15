import {defineStore} from "pinia";
import CryptoJS from 'crypto-js'
const KEY = "dfjoiefqi421"
export const useUserStore = defineStore("userState",{
    state:()=> {
        return {
            user:{},
            avatar:'',
            nickName:'',
            token:'',
            uuid:'',
            isLogin:false,
            userName:'aa@wzu.edu.cn',
            password:"",
            tabValue:0,
            justLoggedIn: false,
        }
    },
    getters:{
        getDecodedPwd(){
            return decryptText(this.password)
        }
    },
    actions:{
        setUser(userData){
            this.user = userData
        },
        setToken(token){
            this.token = token
        },
        setLoginState(isLogin){
            this.isLogin = isLogin
            if (isLogin) {
                this.justLoggedIn = true;
            } else {
                this.justLoggedIn = false;
            }
        },
        setUserName(name){
            this.userName = name
        },
        setPassword(pwd){
            this.password = encryptText(pwd)
        },
        setUserDetail(userDetail){
            this.avatar = userDetail?.avatar ?? ""
            this.nickName = userDetail?.name ?? ""
            this.uuid = userDetail?.uuid ?? ""
        },
        setTabValue(value){
            this.tabValue = value
        },
        clearJustLoggedInFlag() {
            this.justLoggedIn = false;
        }
    },
    // persist:true,
    persist:{
        serializer:{
            serialize:(state)=>encryptObject(state),
            deserialize:(data)=>decrypObject(data)
        },
        paths: [
            'user', 'avatar', 'nickName', 'token', 'uuid', 
            'isLogin', 'userName', 'password', 'tabValue'
        ]
    }
})

function encryptText(text){
    return CryptoJS.AES.encrypt(text,KEY).toString();
}

function decryptText(encoded_text){
    let bytes = CryptoJS.AES.decrypt(encoded_text,KEY);
    return bytes.toString(CryptoJS.enc.Utf8)
}

function encryptObject(object){
    return CryptoJS.AES.encrypt(JSON.stringify(object),KEY).toString()
}
function decrypObject(encoded_object){
    let bytes = CryptoJS.AES.decrypt(encoded_object, KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
}