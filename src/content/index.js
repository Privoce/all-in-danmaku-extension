/* Global Chrome */
import React, {useEffect, useState} from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import {fetchDanmaku} from "@/api/danmaku";
import BulletScreen, {StyledBullet} from "rc-bullets";

console.log("Hello World");

let value = "test";
chrome.storage.local.set({videoname: value}, () => {
    console.log('Value is set to ' + value);
})
chrome.storage.local.get(['videoname'], (result) => {
    console.log('Value currently is ' + result.videoname);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message === 'success') {
        chrome.storage.local.get(['danmakuData'], (result) => {
            console.log('print first data elem' + result.danmakuData.elem[0])
        })
        chrome.storage.local.get(['danmakuData'], (result) => {
            console.log(result)
        })
    }
})

/*class Danmaku extends React.Component {
    constructor(props) {
        super(props);
    }

    render(i) {
        return (
            <div className='danmaku-content' id={i}>
                {this.props.text}
            </div>
        )
    }
}*/
function Danmaku(props) {
    const divStyle = {
        color: props.value.color, //TODO: to hex color
        fontsize: props.value.fontsize.toString() + 'px',
    }
    return (
        <div className='danmaku-content' style={divStyle}>
            {props.value.content}
        </div>
    )
}

class DanmakuLayer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            videoName: props.value,
            bvId: null,
            danmakuList: null,
            timeStamp: 0,
            // screen: new BulletScreen('.screen', {duration: 20}),
        }
        this.tryGetDanmaku()
        // TODO: sendMessage to background, background start the actual request and store contents in localStorage,
        //  then tab.sendMessage to content script. When caught tab message with current bvID, fetching danmaku contents
        //  from localStorage
    }

    renderDanmaku(singleDanmaku) {
        return (
            <Danmaku
                value={singleDanmaku}
            />
        )
    }

    tryGetDanmaku() {
        this.state.bvId = 'BV1F54y1G7mi'
        //TODO: do some search
        let newBVId = prompt("Please Enter BV ID: ")
        this.state.bvId = newBVId
        let appID = chrome.runtime.id
        chrome.runtime.sendMessage(this.state.bvId, (response) => {
            if (response.farewell === 'success') {
                chrome.storage.local.get(['danmakuData'], (result) => {
                    this.state.danmakuList = result.danmakuData
                    if (Array.isArray(this.state.danmakuList)) {
                        this.state.danmakuList.sort((a, b) => {
                            if (a.progress < b.progress) {
                                return -1;
                            } else if (a.progress > b.progress) {
                                return 1;
                            }
                            return 0;
                        })
                    }
                    console.log('success')
                    console.log(this.state.danmakuList)
                    console.log(Array.isArray(this.state.danmakuList))
                })
            }
        })
        // fetchDanmaku(this.state.bvId).then(({data, status}) => {
        //    this.state.danmakuList = data.elems
        // }, (err) => {
        //    console.log("try get danmaku error:" + err.measure)
        // })
    }

    render() {
        /*const listDiv = document.createElement('div')
        listDiv.id = 'danmaku-list-div'
        if (Array.isArray(this.state.danmakuList)) {
            for (let i = 0; i < this.state.danmakuList.length; i++) {
                const newDanmaku = this.renderDanmaku(i)
                listDiv.appendChild(newDanmaku)
            }
        }
        return listDiv*/
        return (
            /*Array.isArray(this.state.danmakuList) ? (
                <div className='danmaku-container'>
                    {this.state.danmakuList.map((danmaku) => this.renderDanmaku(danmaku))}
                </div>
            ) : (
                <div className='danmaku-container'></div>
            )*/
            <div className='screen' style={{width: '100vw', height: '80vh'}}></div>
        )
    }
}


const parentVideoContainer = document.querySelector(".html5-video-container")
const abstractLayer = document.createElement('div')
abstractLayer.id = 'danmaku-abstract-layer'
abstractLayer.className = 'extension-top-layer'
parentVideoContainer.appendChild(abstractLayer)

const videoTitle = document.getElementsByName('title')
const currentVideoName = videoTitle.innerHTML

const instanceLayer = ReactDOM.render(<DanmakuLayer value={currentVideoName}/>, abstractLayer);

const VT = document.getElementById('movie_player')
let playBackIndex = 0

function pushDanmaku() {
    const timeStamp = VT.getCurrentTime()
    const newIndex = instanceLayer.state.danmakuList.findIndex((element) =>
        element.progress > Math.floor(timeStamp * 1000)
    )
    while (playBackIndex < newIndex) {
        instanceLayer.state.screen.push(/*this danmaku body*/)
        playBackIndex += 1
    }
}

// let danmakuInterval = setInterval(pushDanmaku, 5)