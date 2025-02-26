import { createRouter, createWebHistory } from 'vue-router'
import MainMenu from "@/components/MainMenu.vue";
import Board from "@/components/Board.vue";
import SignUp from "@/components/SignUp.vue";
import Register from "@/components/Register.vue";
import FileDiractory from "@/components/FileDiractory.vue";
import Help from "@/components/Help.vue"

const routes = [
    { path: '/menu', component: MainMenu },
    { path: '/canva', component: Board },
    { path: '/signup', component: SignUp },
    { path: '/register', component: Register },
    { path: '/files', component: FileDiractory },
    { path: '/help', component: Help },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
