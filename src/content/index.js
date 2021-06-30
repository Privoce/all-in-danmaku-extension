/* Global Chrome */
import React, {useEffect, useState} from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import {fetchDanmaku} from "@/api/danmaku";
import BulletScreen, {StyledBullet} from "rc-bullets";

const YoutubePlayerState = {
    "UNSTARTED": -1,
    "ENDED": 0,
    "PLAYING": 1,
    "PAUSED": 2,
    "BUFFERING": 3,
    "VIDEO_CUED": 5
};

function getVideoPlayer() {
    let videos = Array.from(document.querySelectorAll('video')).filter((v) => !!v.src);
    let largestVideoSize = 0;
    let video = videos[0] || null;

    for (let i = 0; i < videos.length; ++i) {
        let rect = video.getBoundingClientRect();
        let size = rect.height * rect.width;
        if (size > largestVideoSize) {
            largestVideoSize = size;
            video = videos[i];
        }
    }
    return video;
}

const VT = getVideoPlayer()
let playBackIndex = 0

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
            screen: null,
            intervalID: null
        }
        // this.tryGetDanmaku()
        // TODO: sendMessage to background, background start the actual request and store contents in localStorage,
        //  then tab.sendMessage to content script. When caught tab message with current bvID, fetching danmaku contents
        //  from localStorage
    }

    componentDidMount() {
        this.tryGetDanmaku()
        VT.onpause = () => {
            console.log('pause')
            this.state.screen.pause()
        }
        VT.onplay = () => {
            console.log('play')
            this.state.screen.resume()
        }
        VT.ontimeupdate = () => {
            const newIndex = this.state.danmakuList.findIndex((element) =>
                element.progress > Math.floor(VT.currentTime * 1000)
            )
            if (newIndex === -1) return;
            if (this.state.danmakuList[newIndex].progress - this.state.danmakuList[playBackIndex].progress > 10000
                || newIndex <= playBackIndex) { // 10s
                console.log('refresh')
                this.state.screen.clear()
                playBackIndex = newIndex

            } else {
                console.log('push')
                while (playBackIndex < newIndex) {
                    this.state.screen.push(<StyledBullet msg={this.state.danmakuList}/>)
                    playBackIndex += 1
                }
            }
        }
    }

    onSwitchClicked() {

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
                    this.setState({danmakuList: result.danmakuData})
                    if (Array.isArray(this.state.danmakuList)) {
                        this.state.danmakuList.sort((a, b) => {
                            if (a.progress < b.progress) {
                                return -1;
                            } else if (a.progress > b.progress) {
                                return 1;
                            }
                            return 0;
                        })
                        this.state.screen = new BulletScreen(document.querySelector('.screen'), {duration: 20})
                        this.state.screen.push(<StyledBullet msg={this.state.danmakuList[0].content} />)
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
            <div className='screen' style={{width: '100vw', height: '80vh', zIndex: 15}}></div>
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

// let instanceLayer = 0;
ReactDOM.render(<DanmakuLayer value={currentVideoName}/>, abstractLayer);

/*setTimeout(() => {
    console.log(VT.getCurrentTime())
}, 20000)*/

/*function pushDanmaku() {
    const timeStamp = VT.getCurrentTime()

    while (playBackIndex < newIndex) {
        instanceLayer.state.screen.push()
        playBackIndex += 1
    }
}*/

// let danmakuInterval = setInterval(pushDanmaku, 5)