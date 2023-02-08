import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [{
        path: '/',
        redirect: '/login'
    },
    {
        path: '/init',
        name: 'Init',
        component: () =>
            import ('@/view/init/index.vue')
    },
    {
        path: '/login',
        name: 'Login',
        component: () =>
            import ('@/view/login/index.vue')
    },
    {
        path: '/join',
        name: 'Join',
        component: () =>
            import ('@/view/join/join.vue'),
    },
    {
        path: '/HadaMetaProtocal',
        name: 'HadaMetaProtocal',
        component: () =>
            import ('@/view/join/HadaMetaProtocal.vue')
    },
    {
        path: '/HadaMetaPolicy',
        name: 'HadaMetaPolicy',
        component: () =>
            import ('@/view/join/HadaMetaPolicy.vue')
    },
    {
        path: '/HadaMetaStatement',
        name: 'HadaMetaStatement',
        component: () =>
            import ('@/view/join/HadaMetaStatement.vue')
    },

]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router