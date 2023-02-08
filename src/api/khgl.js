import service from '@/utils/request'

export const getTableList = (data) => {
    return service({
        url: '/admin/queryCustomerInfosByConditions',
        method: 'post',
        data: data
    })
}

export const setLeader = (data) => {
    return service({
        url: '/admin/batchUpdLeaders',
        method: 'post',
        data
    })
}

export const deleteLeader = (data) => {
    return service({
        url: '/admin/leaderManagers/deleteLeader/' + data,
        method: 'post',
    })
}

export const modifyStatus = (data) => {
    return service({
        url: '/admin/investment/status/modify',
        method: 'post',
        data
    })
}

export const getCustomerProfit = (data) => {
    return service({
        url: '/admin/queryCustomerProfitDetails',
        method: 'post',
        data
    })
}