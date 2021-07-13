/* Global Chrome */
import {fetchDanmaku} from "@/api/danmaku"
import axios from "axios";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('request received.')
    console.log(message)
    if (message.slice(0, 2) === 'BV') {
        let danmakuRequest = message.split('_')
        let url = 'http://ec2-18-163-238-71.ap-east-1.compute.amazonaws.com'
            + '?bvid=' + danmakuRequest[0]
            + '&segment=' + danmakuRequest[1]
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
            if (response.elems) {
                chrome.storage.local.set({[danmakuRequest[0]]: response.elems}, () => {
                    console.log("danmaku fetched")
                    sendResponse({farewell: 'success'})
                    console.log('responded')
                })
            } else {
                sendResponse({farewell: 'invalid'})
            }

        })
        return true
    } else if (message.slice(0, 1) === 's') {
        let keyword = message.slice(1)
        let url = 'http://ec2-18-163-238-71.ap-east-1.compute.amazonaws.com' + '?search=' + keyword
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
            console.log(response)
            sendResponse({
                farewell: 'success',
                result: response.data.result[8].data
            })
        })
        return true

    } else {
        sendResponse({farewell: 'invalid'})
        return true
    }

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