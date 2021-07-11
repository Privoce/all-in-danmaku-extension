/* Global Chrome */
import React, {useEffect, useState} from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import {fetchDanmaku} from "@/api/danmaku";
import BulletScreen, {StyledBullet} from "rc-bullets";
import {Drawer, makeStyles} from "@material-ui/core";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import Switch from "@material-ui/core/Switch";
import FormGroup from "@material-ui/core/FormGroup"
import FormControlLabel from "@material-ui/core/FormControlLabel"
import Dialog from "@material-ui/core/Dialog"
import DialogTitle from "@material-ui/core/DialogTitle"
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent"
import DialogContentText from "@material-ui/core/DialogContentText";
import Button from "@material-ui/core/Button"
import IconButton from "@material-ui/core/IconButton"
import Tabs from "@material-ui/core/Tabs"
import Tab from "@material-ui/core/Tab"
import MenuIcon from "@material-ui/icons/Menu"
import SearchIcon from "@material-ui/icons/Search"
import ListIcon from "@material-ui/icons/List"
import ReplayIcon from "@material-ui/icons/Replay"
import Paper from '@material-ui/core/Paper';
import DirectionsIcon from '@material-ui/icons/Directions';
import InputBase from '@material-ui/core/InputBase';
import ArrowUpwardRoundedIcon from '@material-ui/icons/ArrowUpward';
import { EventEmitter } from "events";
import * as target from "semver";
import { FixedSizeList } from 'react-window';
import AutoSizer from "react-virtualized-auto-sizer";


let eventEmitter = new EventEmitter();

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

// ReactDOM.render(<PageSwitcher />, toolBar)

class DanmakuLayer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // videoName: props.value,
            bvId: null,
            danmakuList: null,
            // timeStamp: 0,
            screen: null,
            // intervalID: null,
            width: '500px',
            height: '300px',
            msg:null,
        }
        // this.tryGetDanmaku()
        // TODO: sendMessage to background, background start the actual request and store contents in localStorage,
        //  then tab.sendMessage to content script. When caught tab message with current bvID, fetching danmaku contents
        //  from localStorage
    }

    componentDidMount() {
        const switcher = document.getElementById('all-in-danmaku-switcher')
        // 声明一个自定义事件
        this.eventEmitter = eventEmitter.addListener("sendDanmaku",(msg)=>{
            this.setState({
                msg:msg,
            })
            console.log("msg recieved: "+msg);
            if(msg){
                this.state.screen.push(<StyledBullet
                    size="small"
                    msg={msg}
                />);
            }
        });
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

    componentWillUnmount(){
        eventEmitter.removeListener(this.eventEmitter);
    }

    render() {
        return (
            <div className="screen" style={{ width: this.state.width, height: this.state.height, zIndex: 15 }}></div>
        )
    }
}

class DanmakuSidebar extends React.Component {
    constructor(props) {
        super(props);
        // this.classes = sidebarStyle();
        this.state = {
            videoName: props.value,
            display: false,
            danmakuList:null,
        }
    }

    componentDidMount(){
        this.eventEmitter = eventEmitter.addListener("getDanmakuList",(BVid)=>{
            chrome.storage.local.get([BVid],(result)=>{
                this.setState({danmakuList:result.danmakuData})
            })
        });
    }

    componentWillUnmount(){
        eventEmitter.removeListener(this.eventEmitter);
    }

    toggleSidebar(open) {
        return (event) => {
            if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
                return;
            }
            this.setState({
                display: open
            });
        }
    }

    renderList() {
        const renderRow = ({ index, style }) => (
            <div style={style}>{this.state.danmakuList[index].content}</div>
        );
        return (
            <div
                className="danmaku-sidebar"
                role="presentation"
                onKeyDown={this.toggleSidebar(false)}
            >
                <Tabs className="tab-space-holder">

                </Tabs>
                <Tabs
                    variant="fullWidth"
                >
                    <Tab label="Danmaku List" />
                </Tabs>
                <AutoSizer>
                    {({ height, width }) => (
                        <FixedSizeList
                            className="danmakulist"
                            height={height-96}
                            itemCount={1000}
                            itemSize={35}
                            width={width}
                        >
                            {renderRow}
                        </FixedSizeList>
                    )}
                </AutoSizer>
            </div>
        )
    }

    render() {
        return (
                <div>
                    <React.Fragment key={'right'}>
                        <IconButton onClick={this.toggleSidebar(true)} style={{padding: 10}}>
                            <ListIcon />
                        </IconButton>
                        <Drawer anchor={'right'} open={this.state.display} onClose={this.toggleSidebar(false)} className="sidedrawer">
                            {this.renderList()}
                        </Drawer>
                    </React.Fragment>
                </div>
            )

    }
}

class DanmakuSearchResultItem extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
                <div style={{display: "flex"}}>
                    <img ref={this.props.href} />
                    <div>
                        <h3>{this.props.title}</h3>
                        <div style={{display: "inline-block"}}>
                            <div>{this.props.times}</div>
                            <div>{this.props.date}</div>
                        </div>
                        <div style={{display: "inline-block"}}>
                            <img ref={this.props.icon} />
                            <div>{this.props.author}</div>
                        </div>
                    </div>
                </div>
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
    return (
        <div className={classes.root}>
            <IconButton className={classes.iconButton}>
                <MenuIcon />
            </IconButton>
            <InputBase
                className={classes.input}
                placeholder="Manually Search or Select bvID Directly!"
                inputProps={{ 'aria-label': 'search matching video resource'}}
            />
            <Divider className={classes.divider} orientation="vertical" />
            <IconButton type="submit" className={classes.iconButton} aria-label="search">
                <SearchIcon />
            </IconButton>
        </div>
    );
}

class DanmakuSendBar extends React.Component {
    constructor(props) {
        super(props);
        this.state={
            msg:null,
        }
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.setState({msg: event.target.value});
    }

    render() {
        const sendDanmaku = (msg) => {
            return () => {
                // 触发自定义事件
                eventEmitter.emit("sendDanmaku",msg)
            }
        }
        return (
            <Paper component="form" className="danmaku-sendbar-root">
                <IconButton className="danmaku-sendbar-iconButton" aria-label="menu">
                    <MenuIcon fontsize="small"/>
                </IconButton>
                <InputBase
                    className="danmaku-sendbar-input"
                    placeholder="Send a friendly danmaku"
                    inputProps={{ 'aria-label': 'Send a friendly danmaku'}}
                    onChange={this.handleChange}
                />
                {/*<IconButton type="submit" className="danmaku-sendbar-iconButton" aria-label="search">*/}
                {/*    <SearchIcon />*/}
                {/*</IconButton>*/}
                <Divider className="danmaku-sendbar-divider" orientation="vertical" />
                <IconButton color="primary" className="danmaku-sendbar-iconButton" aria-label="arrowupward" onClick={sendDanmaku(this.state.msg)}>
                    <ArrowUpwardRoundedIcon fontSize="small"/>
                </IconButton>
            </Paper>
        );
    }
}

class DanmakuSearchDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false
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

    renderDialog() {
        return (
            <div>
                Search Result Placeholder
            </div>
        )
    }

    render() {
        return (
            <div>
                <IconButton onClick={this.openDialog}>
                    <ReplayIcon />
                </IconButton>
                <Dialog
                    open={this.state.open}
                    onClose={this.toggleDialog}
                    scroll='paper'
                    maxWidth='md'
                    fullWidth={true}
                >
                    <DialogTitle>
                        <DanmakuSearchBar />
                    </DialogTitle>
                    <DialogContent dividers={true}>

                            {
                                `Cras mattis consectetur purus sit amet fermentum.
Cras justo odio, dapibus ac facilisis in, egestas eget quam.
Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
Praesent commodo cursus magna, vel scelerisque nisl consectetur et.`
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

function DanmakuToolBar(props) {
    return (
        <div className="danmaku-toolbar">
            <div className="toolbar-left">
                <PageSwitcher />
            </div>
            <div className="toolbar-middle">
                <DanmakuSendBar />
            </div>
            <div className="toolbar-right">
                <DanmakuSearchDialog />
                <DanmakuSidebar />
            </div>

        </div>
    )
}

ReactDOM.render(<DanmakuToolBar />, toolBar)
const switcher = document.getElementById('all-in-danmaku-switcher')

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