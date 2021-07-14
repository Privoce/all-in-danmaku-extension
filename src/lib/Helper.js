import {withStyles} from "@material-ui/core";
import MenuItem from "@material-ui/core/MenuItem";
import { EventEmitter } from "events";

let eventEmitter=new EventEmitter();

const StyledMenuItem = withStyles((theme) => ({
    root: {

    },
}))(MenuItem);

export {StyledMenuItem,eventEmitter}