import request from "@/lib/request";
import axios from "axios";

const httpServiceForCID = axios.create({
    timeout: 45000,
    method: 'get',
    headers: {
        "X-Requested-With": "XMLHttpRequest"
    },
    "responseType": "arraybuffer"
})

export async function fetchDanmaku(bvId) {
    return await httpServiceForCID.get('/view', {
        baseURL: 'https://api.bilibili.com/x/web-interface',
        params: {
            bvid: bvId
        }
    }).then(({data, status}) => {
        const reqPack = request.create(data.data.cid, data.aid, 1)
        return request(reqPack)
    }, (err) => {
        throw err
    })
    // In Axios responses are already served as javascript object,
    // no need to parse, simply get response and access data.
}

// TODO: Need to forward the request to background.js to avoid cors error