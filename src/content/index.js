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

let globalDanmakuFetched = 0;


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

console.log(VT.style.width)
console.log(VT.style.height)

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

/*function rgbHex (value, prefix) {
    let codex = parseInt(value);
    let prefix_ = prefix || '';
    if (codex < 0) {
        codex = (256 * 256 * 256) + codex;
    }
    let hex = codex.toString(16);
    return prefix_ + (Array(6).join('0') + hex).slice(-6);
}*/


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

function PageSwitcher(props) {
    return (
        <div className="danmaku-page-switcher" style={{marginTop: '10px'}}>
            <span className="switcher-text">Danmaku Switcher:</span>
            <div className="danmaku-page-switcher-inner">
                <label className="switch" style={{marginLeft: '5px'}}>
                    <input type="checkbox" id="all-in-danmaku-switcher"/>
                    <span className="slider round"></span>
                </label>
            </div>
        </div>
    )
}

const infoBar = document.getElementById('info')
const toolBar = document.createElement('div')
const referenceBar = document.getElementById('info-contents')
toolBar.id = 'all-in-danmaku-toolbar'
infoBar.insertBefore(toolBar, referenceBar)

ReactDOM.render(<PageSwitcher />, toolBar)

const switcher = document.getElementById('all-in-danmaku-switcher')

class DanmakuLayer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            videoName: props.value,
            bvId: null,
            danmakuList: null,
            timeStamp: 0,
            screen: null,
            intervalID: null,
            width: '500px',
            height: '300px'
        }
        // this.tryGetDanmaku()
        // TODO: sendMessage to background, background start the actual request and store contents in localStorage,
        //  then tab.sendMessage to content script. When caught tab message with current bvID, fetching danmaku contents
        //  from localStorage
    }

    componentDidMount() {
        /*const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                if (entry.width) {
                    this.state.width = entry.width.toString() + 'px'
                }
                if (entry.height) {
                    this.state.height = entry.height.toString() + 'px'
                }
            }
        })
        resizeObserver.observe(VT)*/
        switcher.addEventListener('change', (event) => {
            if (event.currentTarget.checked) {
                if (globalDanmakuFetched === 0) {
                    this.tryGetDanmaku()
                } else {
                    if (this.state.screen) {
                        this.state.screen.show()
                    }
                }
            } else {
                if (this.state.screen) {
                    this.state.screen.hide()
                }
            }
        })
        VT.onpause = () => {
            console.log('pause')
            if (this.state.screen) {
                this.state.screen.pause()
            }

        }
        VT.onplay = () => {
            console.log('play')
            if (this.state.screen) {
                this.state.screen.resume()
            }

        }
        VT.ontimeupdate = () => {
            if (Array.isArray(this.state.danmakuList) && this.state.screen) {
                const newIndex = this.state.danmakuList.findIndex((element) =>
                    element.progress > Math.floor(VT.currentTime * 1000)
                )
                if (newIndex === -1) return;
                if (this.state.danmakuList[newIndex].progress - this.state.danmakuList[playBackIndex].progress > 10000
                    || newIndex < playBackIndex) { // 10s
                    console.log('refresh')
                    this.state.screen.clear()
                    playBackIndex = newIndex

                } else {
                    console.log('push')
                    while (playBackIndex < newIndex) {
                        this.state.screen.push(
                            <StyledBullet
                                size="small"
                                msg={this.state.danmakuList[playBackIndex].content}
                            />
                        );
                        playBackIndex += 1;
                    }
                }
            }
        }
        VT.onloadeddata = () => {
            this.setState({
                width: VT.style.width,
                height: VT.style.height
            })
            /*this.state.width = VT.style.width
            this.state.height = VT.style.height*/
        }
    }

    /*componentDidUpdate(prevProps, prevState, snapshot) {
        const s = new BulletScreen(document.querySelector('.screen'), {duration: 6})
        this.setState({screen: s})
    }*/

    onSwitchClicked() {

    }

    tryGetDanmaku() {
        // this.state.bvId = 'BV1F54y1G7mi'
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
                        this.state.screen = new BulletScreen(document.querySelector('.screen'), {duration: 6})
                        // this.state.screen.push(<StyledBullet msg={this.state.danmakuList[0].content} />)
                    }
                    console.log('success')
                    console.log(this.state.danmakuList)
                    console.log(Array.isArray(this.state.danmakuList))
                    globalDanmakuFetched = 1
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
        return (
            <div className="screen" style={{ width: this.state.width, height: this.state.height, zIndex: 15 }}></div>
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