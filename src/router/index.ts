import { createRouter, createWebHashHistory } from 'vue-router'

import Covid19 from '../views/Covid19/Covid19.vue'

const routes = [
    {
        path: '/',
        name: 'Covid19',
        component: Covid19,
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

export default router