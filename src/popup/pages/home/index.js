import React from 'react'
import {Button} from "antd"
import './home.css'

function Home(props) {
    const logout = () => {
        props.history.push('./login')
    }
    return (
        <div className="P-home">
            <h1>Home</h1>
            <Button
                type="primary"
                size="large"
                onClick={logout}
            >Logout</Button>
        </div>
    )
}

export default Home