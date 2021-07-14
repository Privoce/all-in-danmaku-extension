import React from "react";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import Popper from "@material-ui/core/Popper";
import Grow from "@material-ui/core/Grow";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import MenuList from "@material-ui/core/MenuList";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import {Typography} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Slider from "@material-ui/core/Slider";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import InputBase from "@material-ui/core/InputBase";
import Divider from "@material-ui/core/Divider";
import ArrowUpwardRoundedIcon from "@material-ui/icons/ArrowUpward";
import {StyledMenuItem,eventEmitter} from "./Helper";

class DanmakuSendBar extends React.Component {

    constructor(props) {
        super(props);
        this.state={
            msg:null,
            anchorEl:null,
            open:false,
            sizeValue:"normal",
            alphaValue:1.0,
            colorValue:"#FFFFFF",
        }
        this.anchorRef = React.createRef();
    }

    handleChange=(event)=> {
        this.setState({msg: event.target.value});
    }

    handleClick=(event)=> {
        this.setState({anthorEl:event.currentTarget});
    };

    handleToggle=()=> {
        this.setState({open:!this.state.open})
    };

    handleSizeChange=(event)=> {
        this.setState({sizeValue:event.target.value})
    };

    handleClose=(event)=> {
        if (this.anchorRef.current && this.anchorRef.current.contains(event.target)) {
            return;
        }

        this.setState({open:false});
    };

    handleListKeyDown=(event)=> {
        if (event.key === 'Tab') {
            event.preventDefault();
            this.setState({open:false});
        }
    }

    handleAlphaSliderChange=(event, newValue)=>{
        this.setState({alphaValue:newValue})
    }

    handleAlphaInputChange=(event)=>{
        this.setState({alphaValue:event.target.value === '' ? '' : Number(event.target.value)})
    }

    handleBlur=(value)=>{
        if (value < 0) {
            this.setState({alphaValue:0});
        } else if (value > 1) {
            this.setState({alphaValue:1})
        }
    }

    handleColorChange=(event)=>{
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
                                    <MenuList autoFocusItem={this.state.open}
                                              id="menu-list-grow"
                                              onKeyDown={this.handleListKeyDown}
                                              dense={true}>
                                        <StyledMenuItem>
                                            <FormControl component="fieldset">
                                                <FormLabel component="legend">FontSize</FormLabel>
                                                <RadioGroup aria-label="gender"
                                                            name="gender1"
                                                            value={this.state.sizeValue}
                                                            row
                                                            onChange={this.handleSizeChange}>
                                                    <FormControlLabel value="small"
                                                                      control={<Radio />}
                                                                      label="Small" />
                                                    <FormControlLabel value="normal"
                                                                      control={<Radio />}
                                                                      label="Normal" />
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
                <IconButton color="primary"
                            className="danmaku-sendbar-iconButton"
                            aria-label="arrowupward"
                            onClick={sendDanmaku(this.state.msg)}>
                    <ArrowUpwardRoundedIcon fontSize="small"/>
                </IconButton>
            </Paper>
        );
    }
}

export default DanmakuSendBar