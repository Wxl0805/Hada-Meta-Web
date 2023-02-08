// 所有的请求的接口的方法

// 请求的axios
import axios from "axios";

import request from "../untils/request";

// 请求方法
const api = {
    // 发送短信验证码
    sendCodetel(query) {
        return request({
            method: "get",
            url: '/base1/sendsms?phone=' + query.phone,
        });
    },
    // 发送邮箱验证码
    sendCodeemail(query) {
        return request({
            method: "get",
            url: '/base1/send_email_code?email=' + query.email,
        });
    },
    // 手机注册
    signTel(query) {
        return request({
            method: "post",
            url: '/base1/customerRegister/takeInvitationCode/byPhone',
            headers: {
                "content-type": "application/json",
            },
            data: query,
        });
    },
    // 邮箱注册
    signEmail(query) {
        return request({
            method: "post",
            url: '/base1/customerRegister/takeInvitationCode/byEmail',
            headers: {
                "content-type": "application/json",
            },
            data: query,
        });
    },
    // 获取下载链接
    getUrl(query) {
        return request({
            method: "get",
            url: 'base1/get_version_info/' + query,
        });
    },
    // 三个协议
    Protocal(query) {
        return request({
            method: "get",
            url: '/base1/get_agreement?title=' + query,
        });
    },


};

export default api;