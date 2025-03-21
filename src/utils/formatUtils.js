export function formatDateTime(datestr, onlyDate = false){
    if(datestr === ""|| !datestr){
        return ""
    }
    var d = new Date(datestr)
    var y = d.getFullYear()
    var m = d.getMonth() + 1
    var day = d.getDate()
    var h = d.getHours()
    var minute = d.getMinutes()
    var second = d.getSeconds()
    m = m < 10 ? ('0' + m):m
    d = d < 10 ? ('0' + d):d
    h = h < 10 ? ('0' + h):h
    minute = minute < 10 ? ('0'+minute):minute
    second = second < 10 ? ('0'+second):second
    var s = y+'-'+m+'-'+day
    if(onlyDate){
        return s
    }else{
        s = s+' '+h+":"+minute+":"+second
        return s
    }
}
export function simpleDateTime(datestr,onlyDate = false){
    if(datestr === "" || !datestr){
        return "";
    }
    var d = new Date(datestr)
    var dateformat = require('dateformat-util');
    return onlyDate ? dateformat.format(d,'yyyy-MM-dd'):
    dateformat.format(d,'yyyy-MM-dd hh:mm:ss')
}