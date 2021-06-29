import React from 'react'
import ReactDOM from 'react-dom'
import Popup from './popup'
import {ConfigProvider} from "antd";
import enUS from 'antd/es/locale/en_US'
const antdConfig = {
	locale: enUS
}
ReactDOM.render(
	<ConfigProvider {...antdConfig}><Popup /></ConfigProvider>,
	document.getElementById('root')
)