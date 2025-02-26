import {instance} from "./base.js";

export const login = async (data) => {
    return instance.post("/auth/login", {
        name: data.name,
        password: data.password
    })
}

export const register = async (data) => {
    return instance.post("/auth/register", {
        name: data.name,
        password: data.password
    })
}
