import service from '@/utils/request'

export const getTableList = (data) => {
    console.log(data)
    return service({
        url: '/admin/getCustomerInfo',
        method: 'post',
        data
    })
}