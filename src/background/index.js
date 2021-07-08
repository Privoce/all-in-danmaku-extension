/* Global Chrome */
import {fetchDanmaku} from "@/api/danmaku"
import axios from "axios";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('bvID received.')
    let url = 'http://ec2-18-163-238-71.ap-east-1.compute.amazonaws.com' + '?bvid=' + message
    console.log(url)
    let myRequest = new Request(url, {
        method: 'GET',
    })
    // console.log(myRequest)
    fetch(myRequest).then((response) => {
        console.log(response)
        if (response.ok) {
            return response.json()
        } else {
            return ""
        }
    }).then((response) => {
        // console.log(response)
        chrome.storage.local.set({danmakuData: response.elems}, () => {
            console.log("danmaku fetched")
            sendResponse({farewell: 'success'})
            console.log('responded')
        })
    })
    return true
    /*fetchDanmaku(message).then(({data, status}) => {
        chrome.storage.local.set({danmakuData: data}, () => {
            console.log('data fetched successfully')
        })
        tabRequestResponse(sender)
    }, (err) => {
        throw err
    })*/
    /*axios.get('/view', {
        baseURL: 'https://api.bilibili.com/x/web-interface',
        params: {
            bvid: message
        }
    }).then((response) => {
        console.log(response.data.data.cid)
    })*/
})