import React from 'react';

const MsgStyle = {
    fontSize: '1.8em',
    fontWeight: '800',
    lineHeight: '1.4',
    opacity:'1',
    color: '#FFFFFF',
    textShadow: '1px 1px #000000, 1px -1px #000000, -1px -1px #000000, -1px 1px #000000',
    fontFamily: 'SimHei',
    border: ''
};

const sizes = {
    small: '18px',
    normal: '25px',
    large: '14px',
    huge: '16px'
};

const StyledDanmaku = ({ msg, size = 'small', color , alpha ,isMe=false}) => {
    MsgStyle.opacity=alpha;
    MsgStyle.color=color;
    MsgStyle.fontSize=sizes[size];
    if (isMe)
        MsgStyle.border="1px solid rgb(250,0,255)"
    else
        MsgStyle.border=''
    return (
        <div>
            <div style={MsgStyle}>{msg}</div>
        </div>
    );
};
export default StyledDanmaku;
