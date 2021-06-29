import React from 'react'
import {Button, Input} from "antd"
import './login.css'
import electron from './electron.png'

function Login(props) {
    const login = () => {
        props.history.push('/home')
    }

    return (
        <div className="P-login">
            <img src={electron} alt="" className="electron"/>
            <div className="login-con">
                <div className="input-con">
                    <Input
                        placeholder="Please Input Account No."
                        size="large"
                    />
                </div>
                <div className="input-con">
                    <Input
                        placeholder="Please Input Password"
                        size="large"
                    />
                </div>
                <Button type="primary" size="large" onClick={login}>Login</Button>
            </div>
        </div>
    )
}

export default Login