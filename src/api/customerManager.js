import service from '@/utils/request'

export const getTableList = (data) => {
    console.log(data)
    return service({
        url: '/admin/getCustomerInfo',
        method: 'post',
        data
    })
}

export const exitStatus = (data) => {
    return service({
        url: '/admin/getCustomerInfo/CancelLogOut/' + data,
        method: 'get',
    })
}