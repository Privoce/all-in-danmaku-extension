import axios from 'axios'
import protoRoot from '@/proto/proto'
import protobuf from 'protobufjs'

const httpService = axios.create({
    timeout: 45000,
    method: 'get',
    headers: {
        "X-Requested-With": "XMLHttpRequest"
    },
    responseType: "arraybuffer"
})

let httpHeaders = new Headers();
httpHeaders.append('X-Requested-With', 'XMLHttpRequest')

let httpInitializer = {
    method: 'GET',
    headers: httpHeaders
}

let httpRequest = new Request('http://api.bilibili.com/x/v2/dm/web')

const danmakuSegmentReply = protoRoot.lookup('bilibili.community.service.dm.v1.DmSegMobileReply')
const danmakuSegmentRequest = protoRoot.lookup('bilibili.community.service.dm.v1.DmSegMobileReq')

function isArrayBuffer (obj) {
    return Object.prototype.toString.call(obj) === '[object ArrayBuffer]'
}

function parsingFromResponse (rawResponse) {
    if (rawResponse == null || !isArrayBuffer(rawResponse)) {
        return rawResponse
    }
    try {
        const buf = protobuf.util.newBuffer(rawResponse)
        const decodedResponse = danmakuSegmentReply.decode(buf)
        return decodedResponse
    } catch (e) {
        return e
    }
}

function request(req) {
    return axios.get('/seg.so', {
        baseURL: 'http://api.bilibili.com/x/v2/dm/web',
        params: {
            type: 1,
            oid: req.cid,
            pid: req.pid,
            segment_index: req.segmentId
        },
        transformResponse: parsingFromResponse
    }).then((response) => {
        if (response.status !== 200) {
            console.log('server error')
        }
        else {
            console.log('success')
        }
    }).catch((error) => {
        console.log(error)
    })
}

request.create = (cid, pid, segmentId) => {
    return {
        cid: cid,
        pid: pid,
        segmentId: segmentId
    }
}

export default request