import React from 'react';

const MsgStyle = {
    fontSize: '1.8em',
    fontWeight: '800',
    lineHeight: '1.4',
    opacity:'1',
    color: '#FFFFFF'
};
const sizes = {
    small: '15px',
    normal: '24px',
    large: '14px',
    huge: '16px'
};

const StyledDanmaku = ({ msg, size = 'small', color , alpha}) => {
    console.log("#0 msg get "+color+" "+alpha)
    MsgStyle.opacity=alpha;
    MsgStyle.color=color;
    MsgStyle.fontSize=sizes[size];
    console.log("#1 msg get "+MsgStyle.opacity+" "+MsgStyle.color+" "+MsgStyle.fontSize)
    return (
        <div>
            <div style={MsgStyle}>{msg}</div>
        </div>
    );
};
export default StyledDanmaku;
