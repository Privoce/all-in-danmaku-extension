/* Global Chrome */
import React, {useEffect, useState} from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import {fetchDanmaku} from "@/api/danmaku";
import BulletScreen, {StyledBullet} from "rc-bullets";
import {Drawer, makeStyles,withStyles} from "@material-ui/core";
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
import TimerIcon from "@material-ui/icons/Timer"
import PlayCircleOutlineIcon from "@material-ui/icons/PlayCircleOutline"
import TodayIcon from "@material-ui/icons/Today"
import Paper from '@material-ui/core/Paper';
import {Typography} from "@material-ui/core";
import DirectionsIcon from '@material-ui/icons/Directions';
import InputBase from '@material-ui/core/InputBase';
import ArrowUpwardRoundedIcon from '@material-ui/icons/ArrowUpward';
import { EventEmitter } from "events";
import { FixedSizeList } from 'react-window';
import AutoSizer from "react-virtualized-auto-sizer";
import StyledDanmaku from "../api/StyledDanmaku";
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Popper from '@material-ui/core/Popper';
import MenuList from '@material-ui/core/MenuList';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';
import Input from '@material-ui/core/Input';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import {Timer} from "@material-ui/icons";


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

const StyledMenuItem = withStyles((theme) => ({
    root: {

    },
}))(MenuItem);

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

const switcher = document.getElementById('all-in-danmaku-switcher')

let parentVideoContainer = document.querySelector(".html5-video-container")
let abstractLayer = document.createElement('div')
abstractLayer.id = 'danmaku-abstract-layer'
abstractLayer.className = 'extension-top-layer'
parentVideoContainer.appendChild(abstractLayer)

let sizeReferenceContainer = document.querySelector(".html5-video-player")

let videoTitle = document.querySelector('meta[name~="title"]')
let currentVideoName = videoTitle && videoTitle.getAttribute("content")


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
            blocks: 0,
            bvid: null,
            danmakuList: null,
            // timeStamp: 0,
            screen: null,
            // intervalID: null,
            width: '500px',
            height: '300px',
            msg:null,
        }
        this.fetchedBlocks = 0
        // this.tryGetDanmaku()
        // TODO: sendMessage to background, background start the actual request and store contents in localStorage,
        //  then tab.sendMessage to content script. When caught tab message with current bvID, fetching danmaku contents
        //  from localStorage
    }

    componentDidMount() {
        const switcher = document.getElementById('all-in-danmaku-switcher')
        // 声明一个自定义事件
        this.eventEmitter = eventEmitter.addListener("sendDanmaku",(msg,color,alpha,size)=>{
            this.setState({
                msg:msg,
            })
            console.log("msg received: "+msg+" "+color+" "+alpha+" "+size);
            if(msg){
                this.state.screen.push(<StyledDanmaku
                    size={size}
                    alpha={alpha}
                    color={color}
                    msg={msg}
                />);
                console.log("msg pushed")
            }
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
                // timeStamp: 0,
                screen: null,
                // intervalID: null,
                width: VT.style.height,
                height: VT.style.width,
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
        console.log(sizeReferenceContainer.clientWidth)
        console.log(sizeReferenceContainer.width)
        /*switcher.addEventListener('change', (event) => {
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
        })*/
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
                // console.log(this.state.danmakuList)
                const newIndex = this.state.danmakuList.findIndex((element) => {
                    //console.log(element)
                    return element.progress > Math.floor(VT.currentTime * 1000)}

                )
                if (VT.currentTime > 350 && this.fetchedBlocks < this.state.blocks) {
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
                        this.state.screen.push(
                            <StyledDanmaku
                                size="normal"
                                color={'#' + this.state.danmakuList[playBackIndex].color.toString(16)}
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

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.width !== this.state.width || prevState.height !== this.state.height) {
            if (this.state.screen) this.state.screen.clear()
            const s = new BulletScreen(document.querySelector('.screen'), {duration: 6, trackHeight: 30})
            this.setState({screen: s})
        }
    }

    onSwitchClicked() {

    }

    tryGetDanmaku(bvid, segmentIndex) {
        // this.state.bvId = 'BV1F54y1G7mi'
        //TODO: do some search
        // let newBVId = prompt("Please Enter BV ID: ")
        // this.state.bvId = newBVId
        console.log(bvid)
        console.log(segmentIndex)
        chrome.runtime.sendMessage(bvid + '_' + segmentIndex.toString(), (response) => {
            if (response.farewell === 'success') {
                chrome.storage.local.get([bvid], (result) => {
                    // this.setState({danmakuList: result.danmakuData})
                    console.log(result)
                    console.log(result[bvid])
                    let newComingArray = result[bvid]
                    if (Array.isArray(newComingArray)) {
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
                        this.setState({screen: new BulletScreen(document.querySelector('.screen'), {duration: 6, trackHeight: 30})})
                        // this.state.screen.push(<StyledBullet msg={this.state.danmakuList[0].content} />)
                    } else {
                        chrome.storage.local.set({[bvid]: this.state.danmakuList})
                    }
                    console.log('success')
                    console.log(this.state.danmakuList)
                    console.log(Array.isArray(this.state.danmakuList))
                    globalDanmakuFetched = 1
                })
                eventEmitter.emit('danmakuFetched', bvid)
                // this.fetchedBlocks = segmentIndex
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
        this.eventEmitter = eventEmitter.addListener("danmakuFetched",(bvid)=>{
            chrome.storage.local.get([bvid],(result)=>{
                this.setState({danmakuList:result[bvid]})
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
        let isNull = this.state.danmakuList==null;
        const renderRow = ({ index, style }) => (
            <div style={style}>{isNull?"no danmakulist info":this.state.danmakuList[index].content}</div>
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
                            itemCount={isNull?1:this.state.danmakuList.length}
                            itemSize={35}
                            width={width}
                            style={{paddingLeft: '2px'}}
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
        this.selectHandler = this.selectHandler.bind(this)
    }

    selectHandler(event) {
        eventEmitter.emit('directBV', this.props.bvid, durationSegmentConverter(this.props.duration))
        eventEmitter.emit('toggleDialogOff')
    }

    render() {
        return (
                    /*<div className="danmaku-list-item" id={this.props.bvid} onClick={this.selectHandler}>
                        <h3 dangerouslySetInnerHTML={{__html: this.props.title}}/>
                        <div style={{display: 'flex'}}>
                            <div style={{display: "inline-block"}}>
                                <div>{playTimesConverter(this.props.times)}</div>
                                <div>{unixTimeConverter(this.props.date)}</div>
                            </div>
                            <div style={{display: "inline-block"}}>
                                <div>{this.props.author}</div>
                                <div>{this.props.duration}</div>
                            </div>
                        </div>
                    </div>*/
                <ListItem alignItems="flex-start" onClick={this.selectHandler} button>
                    <ListItemText
                        style={{fontSize: "normal"}}
                        primary={<h3 dangerouslySetInnerHTML={{__html: this.props.title}}/>}
                        secondary={
                            <React.Fragment>
                                <Typography
                                    component="span"
                                    variant="body2"
                                    style={{display: "inline"}}
                                    color="textPrimary"
                                >
                                    {this.props.author}
                                </Typography>

                                <Typography style={{display: "flex", alignItems: "center"}}>
                                    <TimerIcon fontSize="small"/>
                                    <span className="search-result-text-span">{this.props.duration + " "}</span>
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
                <MenuIcon />
            </IconButton>
            <InputBase
                className={classes.input}
                placeholder="Manually Search or Select bvID Directly!"
                inputProps={{ 'aria-label': 'search matching video resource'}}
                onChange={changeHandler}
                inputRef={(re) => inputField = re}
            />
            <Divider className={classes.divider} orientation="vertical" />
            <IconButton onClick={searchHandler} className={classes.iconButton} aria-label="search">
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
            anchorEl:null,
            open:false,
            sizeValue:"small",
            alphaValue:1.0,
            colorValue:"#FFFFFF",
        }
        this.anchorRef = React.createRef();
        this.handleChange = this.handleChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleToggle = this.handleToggle.bind(this);
        this.handleSizeChange = this.handleSizeChange.bind(this);
        this.handleAlphaSliderChange = this.handleAlphaSliderChange.bind(this);
        this.handleAlphaInputChange = this.handleAlphaInputChange.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.handleColorChange=this.handleColorChange.bind(this);
    }

    handleChange(event) {
        this.setState({msg: event.target.value});
    }

    handleClick(event){
        this.setState({anthorEl:event.currentTarget});
    };

    handleToggle(){
        this.setState({open:!this.state.open})
    };

    handleSizeChange(event){
        this.setState({sizeValue:event.target.value})
    };

    handleClose(event){
        if (this.anchorRef.current && this.anchorRef.current.contains(event.target)) {
            return;
        }

        this.setState({open:false});
    };

    handleListKeyDown(event) {
        if (event.key === 'Tab') {
            event.preventDefault();
            this.setState({open:false});
        }
    }

    handleAlphaSliderChange(event, newValue){
        this.setState({alphaValue:newValue})
    }

    handleAlphaInputChange(event){
        this.setState({alphaValue:event.target.value === '' ? '' : Number(event.target.value)})
    }

    handleBlur(){
        if (value < 0) {
            this.setState({alphaValue:0});
        } else if (value > 1) {
            this.setState({alphaValue:1})
        }
    }

    handleColorChange(event){
        this.setState({colorValue:event.target.value})
    }

    render() {
        const sendDanmaku = (msg) => {
            return () => {
                // 触发自定义事件
                eventEmitter.emit("sendDanmaku",msg,this.state.colorValue,this.state.alphaValue,this.state.sizeValue)
            }
        }
        return (
            <Paper component="form" className="danmaku-sendbar-root">
                <IconButton className="danmaku-sendbar-iconButton"
                            aria-label="menu"
                            ref={this.anchorRef}
                            aria-controls={this.state.open ? 'menu-list-grow' : undefined}
                            aria-haspopup="true"
                            onClick={this.handleToggle}>
                    <MenuIcon fontsize="small"/>
                </IconButton>
                <Popper open={this.state.open} anchorEl={this.anchorRef.current} role={undefined} transition disablePortal>
                    {({ TransitionProps, placement }) => (
                        <Grow
                            {...TransitionProps}
                            style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
                        >
                            <Paper>
                                <ClickAwayListener onClickAway={this.handleClose}>
                                    <MenuList autoFocusItem={this.state.open} id="menu-list-grow" onKeyDown={this.handleListKeyDown} dense={true}>
                                        <StyledMenuItem>
                                            <FormControl component="fieldset">
                                                <FormLabel component="legend">FontSize</FormLabel>
                                                <RadioGroup aria-label="gender" name="gender1" value={this.state.sizeValue} row onChange={this.handleSizeChange}>
                                                    <FormControlLabel value="small" control={<Radio />} label="Small" />
                                                    <FormControlLabel value="normal" control={<Radio />} label="Normal" />
                                                </RadioGroup>
                                            </FormControl>
                                        </StyledMenuItem>
                                        <StyledMenuItem>
                                            <div style={{width:150}}>
                                                <Typography id="input-slider" gutterBottom>
                                                    Alpha
                                                </Typography>
                                                <Grid container spacing={2} alignItems="center">
                                                    <Grid item xs>
                                                        <Slider
                                                            value={typeof this.state.alphaValue === 'number' ? this.state.alphaValue : 1}
                                                            defaultValue={1}
                                                            step={0.1}
                                                            min={0}
                                                            max={1}
                                                            onChange={this.handleAlphaSliderChange}
                                                            aria-labelledby="input-slider"
                                                            style={{width:85}}
                                                        />
                                                    </Grid>
                                                    <Grid item>
                                                        <Input
                                                            value={this.state.alphaValue}
                                                            margin="dense"
                                                            onChange={this.handleAlphaInputChange}
                                                            onBlur={this.handleBlur}
                                                            inputProps={{
                                                                step: 0.1,
                                                                min: 0,
                                                                max: 1,
                                                                type: 'number',
                                                                'aria-labelledby': 'input-slider',
                                                            }}
                                                            style={{width:42}}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </div>
                                        </StyledMenuItem>
                                        <StyledMenuItem>
                                            <FormControl>
                                                <InputLabel >Color</InputLabel>
                                                <Select
                                                    native
                                                    value={this.state.colorValue}
                                                    onChange={this.handleColorChange}
                                                >
                                                    <option value={"#FFFFFF"} style={{color:"#FFFFFF"}}>White</option>
                                                    <option value={"#323338"} style={{color:"#323338"}}>Dark</option>
                                                    <option value={"#00C875"} style={{color:"#00C875"}}>Green</option>
                                                    <option value={"#E2445C"} style={{color:"#E2445C"}}>Red</option>
                                                    <option value={"#579BFC"} style={{color:"#579BFC"}}>LightBlue</option>
                                                    <option value={"#FFCB00"} style={{color:"#FFCB00"}}>EggYolk</option>
                                                </Select>
                                            </FormControl>
                                        </StyledMenuItem>
                                    </MenuList>
                                </ClickAwayListener>
                            </Paper>
                        </Grow>
                    )}
                </Popper>
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
            // let videoTitle = document.querySelector('meta[name~="title"]')
            // let currentVideoName = videoTitle && videoTitle.getAttribute("content")
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
                <DanmakuSidebar />
            </div>

        </div>
    )
}

ReactDOM.render(<DanmakuToolBar />, toolBar)

// let instanceLayer = 0;
ReactDOM.render(<DanmakuLayer value={currentVideoName}/>, abstractLayer);

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
        eventEmitter.emit('reset')
    }
})
eventEmitter.addListener('reset', () => {
    // VT = getVideoPlayer()
    videoTitle = document.querySelector('meta[name~="title"]')
    currentVideoName = videoTitle && videoTitle.getAttribute("content")
    globalDanmakuFetched = 0
})

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