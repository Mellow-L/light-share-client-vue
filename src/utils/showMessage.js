import {showToast} from "@nutui/nutui";

export function showFail(tag, msg){
    console.log('Fail at ' +tag, msg)
}
export function alertFail(tag, msg){
    console.log(tag, msg)
}
export function showSuccess(tag,msg){
    console.log('Success at '+tag, msg)
}
export function alertSuccess(tag, msg){
    showToast.success(msg,{
        title:tag
    })
}