/* Global Chrome */
import React, {useState} from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import BulletScreen from "rc-bullets";
import {makeStyles} from "@material-ui/core";
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel"
import Dialog from "@material-ui/core/Dialog"
import DialogTitle from "@material-ui/core/DialogTitle"
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent"
import Button from "@material-ui/core/Button"
import IconButton from "@material-ui/core/IconButton"
import MenuIcon from "@material-ui/icons/Menu"
import SearchIcon from "@material-ui/icons/Search"
import ReplayIcon from "@material-ui/icons/Replay"
import TimerIcon from "@material-ui/icons/Timer"
import PlayCircleOutlineIcon from "@material-ui/icons/PlayCircleOutline"
import TodayIcon from "@material-ui/icons/Today"
import {Typography} from "@material-ui/core";
import InputBase from '@material-ui/core/InputBase';
import StyledDanmaku from "@/api/StyledDanmaku";
import DanmakuSendBar from "@/lib/DanmakuSendBar";
import DanmakuSideBar from "@/lib/DanmakuSidebar";
import {eventEmitter} from "@/lib/Helper";
import DanmakuConfigMenu from "@/lib/DanmakuConfigMenu";

let globalDanmakuFetched = 0;
let globalComponentLoaded = 0;
let globalLayerMounted = 0;

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

let VT = getVideoPlayer()
let playBackIndex = 0

let parentVideoContainer = document.querySelector(".html5-video-container")
let abstractLayer = document.createElement('div')
abstractLayer.id = 'danmaku-abstract-layer'
abstractLayer.className = 'extension-top-layer'

let sizeReferenceContainer = document.querySelector(".html5-video-player")

let videoTitle = document.querySelector('meta[name~="title"]')
let currentVideoName = videoTitle && videoTitle.getAttribute("content")

let infoBar = document.getElementById('info')
let toolBar = document.createElement('div')
let referenceBar = document.getElementById('info-contents')
toolBar.id = 'all-in-danmaku-toolbar'


/*chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
    if (tabs[0].url.indexOf('watch?v') !== -1) {
        parentVideoContainer.appendChild(abstractLayer)
        infoBar.insertBefore(toolBar, referenceBar)
    }
})*/

console.log('init')



function unixTimeConverter(timeStamp) {
    let date = new Date(timeStamp * 1000)
    return date.getFullYear().toString()
        + '-' + (date.getMonth() + 1).toString().padStart(2, '0')
        + '-' + date.getDate().toString().padStart(2, '0')
}
function playTimesConverter(times) {
    if (times < 10000) {
        return times
    } else {
        return times/10000 + 'w'
    }
}
function durationSegmentConverter(duration) {
    let timeArray = duration.split(':')
    let minute = parseInt(timeArray[0])
    let second = parseInt(timeArray[0])
    if (isNaN(minute) || isNaN(second)) { return 1; }
    return Math.ceil(minute / 6)
}
function durationDisplayConverter(duration) {
    let times = duration.split(':')
    return times[0].padStart(2, '0') + ":" + times[1].padStart(2, '0')
}

class DanmakuLayer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            blocks: 0,
            bvid: null,
            danmakuList: null,
            screen: null,
            width: '500px',
            height: '300px',
            msg:null,
        }
        this.fetchedBlocks = 0
        this.alpha=1;
        this.simplify=0;
    }

    componentDidMount() {
        this.VT = getVideoPlayer()
        console.log(this.VT)
        const switcher = document.getElementById('all-in-danmaku-switcher')
        // 声明一个自定义事件
        this.eventEmitter = eventEmitter.addListener("sendDanmaku",(msg,color,size)=>{
            this.setState({
                msg:msg,
            })
            if(msg){
                console.log("msg received")
                this.state.screen.push(<StyledDanmaku
                    size={size}
                    alpha={this.alpha}
                    color={color}
                    msg={msg}
                    isMe={true}
                />);
            }
        });
        this.eventEmitter = eventEmitter.addListener("configChanged",(alpha,simplify)=>{
            this.alpha=alpha
            this.simplify=simplify
        });
        this.danmakuOnHandler = eventEmitter.addListener('danmakuon', () => {
            if (globalDanmakuFetched) {
                this.state.screen.show()
            }
        })
        this.danmakuOffHandler = eventEmitter.addListener('danmakuoff', () => {
            this.state.screen.hide()
        })
        this.directBVHandler = eventEmitter.addListener('directBV', (bvid, blocks) => {
            // this.state.bvId = bvid
            this.setState({
                bvid: bvid,
                danmakuList: null,
                blocks: blocks,
            })
            this.tryGetDanmaku(bvid, 1)
            this.fetchedBlocks = 1
        })
        this.multiSegmentsHandler = eventEmitter.addListener('continueFetch', (segmentIndex) => {
            this.tryGetDanmaku(this.state.bvid, segmentIndex)
        })
        this.resetHandler = eventEmitter.addListener('reset', () => {
            // VT = getVideoPlayer()
            if (this.state.screen) this.state.screen.clear()
            this.setState({
                blocks: 0,
                bvid: null,
                danmakuList: null,
                screen: null,
                width: this.VT.style.width,
                height: this.VT.style.height,
                msg:null,
            })
        })
        const resizeObserver = new ResizeObserver(entries => {
            console.log('modified')
            for (let entry of entries) {
                console.log(entry.target.clientWidth)
                if (entry.target.clientWidth) {
                    console.log('modified width')
                    this.setState({
                        width: entry.target.clientWidth.toString() + 'px',
                        height: entry.target.clientHeight.toString() + 'px',
                    })
                }
            }
        })
        resizeObserver.observe(sizeReferenceContainer)
        this.VT.onpause = () => {
            console.log('pause')
            if (this.state.screen) {
                this.state.screen.pause()
            }

        }
        this.VT.onplay = () => {
            console.log('play')
            if (this.state.screen) {
                this.state.screen.resume()
            }

        }
        this.VT.ontimeupdate = () => {
            if (Array.isArray(this.state.danmakuList) && this.state.screen) {
                const newIndex = this.state.danmakuList.findIndex((element) => {
                    console.log(element)
                    return element.progress > Math.floor(this.VT.currentTime * 1000)}

                )
                if (this.VT.currentTime > 350 && this.fetchedBlocks < this.state.blocks) {
                    console.log('start multi segments fetching')
                    for (let i = this.fetchedBlocks + 1; i <= this.state.blocks; i++) {
                        eventEmitter.emit('continueFetch', i)
                    }
                    this.fetchedBlocks = this.state.blocks
                }
                if (newIndex === -1) return;
                if (this.state.danmakuList[newIndex].progress - this.state.danmakuList[playBackIndex].progress > 8000
                    || newIndex < playBackIndex) { // 10s
                    console.log('refresh')
                    this.state.screen.clear()
                    playBackIndex = newIndex

                } else {
                    console.log('push')
                    while (playBackIndex < newIndex) {
                        // console.log('push' + this.state.danmakuList[playBackIndex].progress.toString())
                        console.log(this.state.danmakuList[playBackIndex].progress)
                        console.log(playBackIndex)
                        if(this.state.danmakuList[playBackIndex].weight>this.simplify){
                            this.state.screen.push(
                                <StyledDanmaku
                                    size="normal"
                                    color={'#' + this.state.danmakuList[playBackIndex].color.toString(16)}
                                    msg={this.state.danmakuList[playBackIndex].content}
                                    alpha={this.alpha}
                                />
                            );
                        }
                        playBackIndex += 1;
                    }
                }
            }
        }
        this.VT.onloadeddata = () => {
            this.setState({
                width: this.VT.style.width,
                height: this.VT.style.height
            })
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.width !== this.state.width || prevState.height !== this.state.height) {
            if (this.state.screen) this.state.screen.clear()
            const s = new BulletScreen(document.querySelector('.screen'), {duration: 10, trackHeight: 30})
            this.setState({screen: s})
        }
    }

    tryGetDanmaku(bvid, segmentIndex) {
        console.log(bvid)
        console.log(segmentIndex)
        chrome.runtime.sendMessage(bvid + '_' + segmentIndex.toString(), (response) => {
            if (response.farewell === 'success') {
                chrome.storage.local.get([bvid], (result) => {
                    let newComingArray = result[bvid]
                    if (Array.isArray(newComingArray)) {
                        for (let item of newComingArray) {
                            if (!item.progress) {
                                item.progress = Infinity
                            }
                        }
                        if (Array.isArray(this.state.danmakuList)) {
                            console.log('merge')
                            newComingArray = newComingArray.concat(this.state.danmakuList)

                        }
                        console.log(newComingArray)

                        newComingArray.sort((a, b) => {
                            if (a.progress < b.progress) {
                                return -1;
                            } else if (a.progress > b.progress) {
                                return 1;
                            }
                            return 0;
                        })
                        chrome.storage.local.set({[bvid]: newComingArray})
                        this.setState({danmakuList: newComingArray})
                        this.setState({screen: new BulletScreen(document.querySelector('.screen'), {duration: 10, trackHeight: 30})})
                    } else {
                        chrome.storage.local.set({[bvid]: this.state.danmakuList})
                    }
                    console.log('success')
                    console.log(this.state.danmakuList)
                    console.log(Array.isArray(this.state.danmakuList))
                    globalDanmakuFetched = 1
                })
                eventEmitter.emit('danmakuFetched', bvid)
            }
        })
    }

    componentWillUnmount(){
        eventEmitter.removeListener(this.eventEmitter);
        eventEmitter.removeListener(this.danmakuOnHandler)
        eventEmitter.removeListener(this.danmakuOffHandler)
        eventEmitter.removeListener(this.directBVHandler)
    }

    render() {
        return (
            <div className="screen" style={{ width: this.state.width, height: this.state.height, zIndex: 15 }}></div>
        )
    }
}

class DanmakuSearchResultItem extends React.Component {
    constructor(props) {
        super(props);
        this.selectHandler = this.selectHandler.bind(this)
    }

    selectHandler(event) {
        eventEmitter.emit('directBV', this.props.bvid, durationSegmentConverter(this.props.duration))
        eventEmitter.emit('toggleDialogOff')
    }

    render() {
        return (
                <ListItem alignItems="flex-start" onClick={this.selectHandler} button>
                    <ListItemText
                        primary={<h3 style={{fontSize: 16}} dangerouslySetInnerHTML={{__html: this.props.title}}/>}
                        secondary={
                            <React.Fragment>
                                <Typography
                                    component="span"
                                    variant="body2"
                                    style={{display: "inline", fontSize: 14}}
                                    color="textPrimary"
                                >
                                    {this.props.author}
                                </Typography>

                                <Typography style={{display: "flex", alignItems: "center"}}>
                                    <TimerIcon fontSize="small"/>
                                    <span className="search-result-text-span">{ durationDisplayConverter(this.props.duration) + " "}</span>
                                    <PlayCircleOutlineIcon fontSize="small"/>
                                    <span className="search-result-text-span">{ playTimesConverter(this.props.times) + " "}</span>
                                    <TodayIcon fontSize="small"/>
                                    <span className="search-result-text-span">{ unixTimeConverter(this.props.date)}</span>
                                </Typography>

                            </React.Fragment>
                        }
                    />
                </ListItem>
            )

    }
}

const useStyles = makeStyles((theme) => ({
    root: {
        padding: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        fontSize: 'medium'
    },
    input: {
        marginLeft: theme.spacing(1),
        flex: 1,
    },
    iconButton: {
        padding: 10,
    },
    divider: {
        height: 28,
        margin: 4,
    },
}))

function DanmakuSearchBar() {
    const classes = useStyles()
    const [msg, setMsg] = useState(null)
    let inputField = null

    const searchHandler = () => {
        const value = msg
        if (value.indexOf('/BV') !== -1) {
            const bvID = value.slice(1)
            eventEmitter.emit('directBV', bvID, 30)
            eventEmitter.emit('toggleDialogOff')
        } else {
            chrome.runtime.sendMessage('s' + value, (response) => {
                console.log(response)
                if (response.farewell === 'success') {
                    eventEmitter.emit('searchBarResult', response.result)
                }

            })
            inputField.value = ""
        }
    }
    const changeHandler = (event) => {
        setMsg(event.target.value)
    }

    return (
        <div className={classes.root}>
            <IconButton className={classes.iconButton}>
                <MenuIcon size="large"/>
            </IconButton>
            <InputBase
                className={classes.input}
                placeholder="Manually Search or Select bvID Directly!"
                inputProps={{ 'aria-label': 'search matching video resource'}}
                onChange={changeHandler}
                inputRef={(re) => inputField = re}
                style={{fontSize: 20}}
            />
            <Divider className={classes.divider} orientation="vertical" />
            <IconButton onClick={searchHandler} className={classes.iconButton} aria-label="search">
                <SearchIcon size={"large"}/>
            </IconButton>
        </div>
    );
}

class DanmakuSearchDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            searchResult: null,
            videoName: currentVideoName
        }
        this.openDialog = this.openDialog.bind(this)
        this.toggleDialog = this.toggleDialog.bind(this)
    }

    toggleDialog = () => {
        this.setState({open: false})
    }

    openDialog() {
        console.log('open dialog')
        this.setState({open: true})
    }

    componentDidMount() {
        this.eventEmitter = eventEmitter.addListener('danmakuon', () => {
            if (!globalDanmakuFetched) {
                let videoTitle = document.querySelector('.title yt-formatted-string.ytd-video-primary-info-renderer').innerHTML
                this.setState({
                    videoName: videoTitle,
                    searchResult: null
                })
                console.log(this.state.videoName)
                chrome.runtime.sendMessage('s' + videoTitle, (response) => {
                    console.log(response)
                    this.setState({searchResult: response.result})
                })
                this.setState({open: true})
            }
        })
        this.searchBarHandler = eventEmitter.addListener('searchBarResult', (msg) => {
            console.log(msg)
            this.setState({searchResult: msg})
        })
        this.toggleDialogOffHandler = eventEmitter.addListener('toggleDialogOff', () => {
            this.setState({open: false})
        })
        this.resetHandler = eventEmitter.addListener('reset', () => {
            let videoTitle = document.querySelector('.title yt-formatted-string.ytd-video-primary-info-renderer').innerHTML
            console.log(videoTitle)
            this.setState({
                videoName: videoTitle,
                searchResult: null
            })
        })
    }

    renderDialog() {
        return (
            <List style={{width: '100%'}}>
                {(this.state.searchResult||[]).map((resultItem) =>
                    <DanmakuSearchResultItem
                        author={resultItem.author}
                        title={resultItem.title}
                        times={resultItem.play}
                        date={resultItem.pubdate}
                        duration={resultItem.duration}
                        bvid={resultItem.bvid}
                    />
                )}
            </List>
        )
    }

    render() {
        return (
            <div>
                <IconButton onClick={this.openDialog} className={"danmaku-toolbar-iconButton"}>
                    <ReplayIcon />
                </IconButton>
                <Dialog
                    open={this.state.open}
                    onClose={this.toggleDialog}
                    scroll='paper'
                    maxWidth='md'
                    fullWidth={true}
                    style={{height: '75vh', top: '13%'}}
                >
                    <DialogTitle>
                        <DanmakuSearchBar />
                    </DialogTitle>
                    <DialogContent dividers={true}>

                            {
                                'We have found the following results:\n'
                            }

                        {this.renderDialog()}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.toggleDialog} color="primary">
                            Cancel
                        </Button>
                    </DialogActions>

                </Dialog>
            </div>

        )
    }
}

class DanmakuSwitcher extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            checked: false
        }
    }

    handleChange = (event) => {
        this.setState({checked: event.target.checked})
        if (event.target.checked) {
            if (!globalLayerMounted) {
                parentVideoContainer = document.querySelector(".html5-video-container")
                abstractLayer = document.createElement('div')
                abstractLayer.id = 'danmaku-abstract-layer'
                abstractLayer.className = 'extension-top-layer'
                parentVideoContainer.appendChild(abstractLayer)
                ReactDOM.render(<DanmakuLayer value={currentVideoName}/>, abstractLayer);
                globalLayerMounted = 1
                globalComponentLoaded = 1
            }
            console.log('danmakuon')
            eventEmitter.emit('danmakuon')
        } else {
            console.log('danmakuoff')
            eventEmitter.emit('danmakuoff')
        }
    }

    componentDidMount() {
        eventEmitter.addListener('reset', () => {
            this.setState({checked: false})
        })
    }

    render() {
        return (
            <FormControlLabel control={
                <Switch
                    checked={this.state.checked}
                    onChange={this.handleChange}
                    name="danmaku-switch"
                    color="primary"
                />
            } label="Switch Danmaku" />
        )
    }
}

function DanmakuToolBar(props) {
    return (
        <div className="danmaku-toolbar">
            <div className="toolbar-left">
                <DanmakuSwitcher />
            </div>
            <div className="toolbar-middle">
                <DanmakuSendBar />
            </div>
            <div className="toolbar-right">
                <DanmakuSearchDialog />
                <DanmakuSideBar />
                <DanmakuConfigMenu />
            </div>
        </div>
    )
}

referenceBar = document.getElementById('info-contents')
infoBar.insertBefore(toolBar, referenceBar)
ReactDOM.render(<DanmakuToolBar />, toolBar)
//ReactDOM.render(<DanmakuLayer value={currentVideoName}/>, abstractLayer);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(message.message)
    if (message.message === 'success') {
        chrome.storage.local.get(['danmakuData'], (result) => {
            console.log('print first data elem' + result.danmakuData.elem[0])
        })
        chrome.storage.local.get(['danmakuData'], (result) => {
            console.log(result)
        })
    } else if (message.message === 'resetStatus') {
        eventEmitter.emit('resetInit', message.url)
    }
})
eventEmitter.addListener('resetInit', (url) => {
    //videoTitle = document.querySelector('meta[name~="title"]')
    //currentVideoName = videoTitle && videoTitle.getAttribute("content")
    globalDanmakuFetched = 0
    console.log('reset')
    console.log(url)
    if (!globalComponentLoaded && url.indexOf('watch?v') !== -1) {
        VT = getVideoPlayer()
        playBackIndex = 0

        parentVideoContainer = document.querySelector(".html5-video-container")
        abstractLayer = document.createElement('div')
        abstractLayer.id = 'danmaku-abstract-layer'
        abstractLayer.className = 'extension-top-layer'
        parentVideoContainer.appendChild(abstractLayer)

        sizeReferenceContainer = document.querySelector(".html5-video-player")

        videoTitle = document.querySelector('meta[name~="title"]')
        currentVideoName = videoTitle && videoTitle.getAttribute("content")

        infoBar = document.getElementById('info')
        toolBar = document.createElement('div')
        referenceBar = document.getElementById('info-contents')
        toolBar.id = 'all-in-danmaku-toolbar'
        infoBar.insertBefore(toolBar, referenceBar)

        ReactDOM.render(<DanmakuToolBar />, toolBar)
        //ReactDOM.render(<DanmakuLayer value={currentVideoName}/>, abstractLayer);
        globalComponentLoaded = 1;
    }
    eventEmitter.emit('reset')
})