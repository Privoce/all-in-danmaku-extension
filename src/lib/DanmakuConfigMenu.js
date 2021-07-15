import React from "react";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import Popper from "@material-ui/core/Popper";
import Grow from "@material-ui/core/Grow";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import MenuList from "@material-ui/core/MenuList";
import {Typography} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Slider from "@material-ui/core/Slider";
import Input from "@material-ui/core/Input";
import {StyledMenuItem,eventEmitter} from "./Helper";
import SettingsIcon from '@material-ui/icons/Settings';

class DanmakuConfigMenu extends React.Component {

    constructor(props) {
        super(props);
        this.state={
            msg:null,
            anchorEl:null,
            open:false,
            alphaValue:1.0,
            simplifyValue:0,
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
        eventEmitter.emit("configChanged",this.state.alphaValue,this.state.simplifyValue)
    }

    handleSimplifySliderChange=(event, newValue)=>{
        this.setState({simplifyValue:newValue})
    }

    handleAlphaInputChange=(event)=>{
        this.setState({alphaValue:event.target.value === '' ? '' : Number(event.target.value)})
    }

    handleSimplifyInputChange=(event)=>{
        this.setState({simplifyValue:event.target.value === '' ? '' : Number(event.target.value)})
    }

    handleAlphaBlur=(value)=>{
        if (value < 0) {
            this.setState({alphaValue:0});
        } else if (value > 1) {
            this.setState({alphaValue:1})
        }
    }

    handleSimplifyBlur=(value)=>{
        if (value < 0) {
            this.setState({simplifyValue:0});
        } else if (value > 10) {
            this.setState({simplifyValue:10})
        }
    }

    handleColorChange=(event)=>{
        this.setState({colorValue:event.target.value})
    }

    render() {
        return (
            <div>
                <IconButton className={"danmaku-toolbar-iconButton"}
                            aria-label="menu"
                            ref={this.anchorRef}
                            aria-controls={this.state.open ? 'menu-list-grow' : undefined}
                            aria-haspopup="true"
                            onClick={this.handleToggle}
                            >
                    <SettingsIcon/>
                </IconButton>
                <Popper open={this.state.open} anchorEl={this.anchorRef.current} role={undefined} transition disablePortal style={{zIndex:100}}>
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
                                            <div style={{width:150}}>
                                                <Typography id="input-slider" gutterBottom>
                                                    Auto Simplify
                                                </Typography>
                                                <Grid container spacing={2} alignItems="center">
                                                    <Grid item xs>
                                                        <Slider
                                                            value={typeof this.state.simplifyValue === 'number' ? this.state.simplifyValue : 0}
                                                            defaultValue={0}
                                                            step={1}
                                                            min={0}
                                                            max={10}
                                                            onChange={this.handleSimplifySliderChange}
                                                            aria-labelledby="input-slider"
                                                            style={{width:85}}
                                                        />
                                                    </Grid>
                                                    <Grid item>
                                                        <Input
                                                            value={this.state.simplifyValue}
                                                            margin="dense"
                                                            onChange={this.handleSimplifyInputChange}
                                                            onBlur={this.handleSimplifyBlur}
                                                            inputProps={{
                                                                step: 1,
                                                                min: 0,
                                                                max: 10,
                                                                type: 'number',
                                                                'aria-labelledby': 'input-slider',
                                                            }}
                                                            style={{width:42}}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </div>
                                        </StyledMenuItem>
                                    </MenuList>
                                </ClickAwayListener>
                            </Paper>
                        </Grow>
                    )}
                </Popper>
            </div>
        );
    }
}

export default DanmakuConfigMenu