import {instance} from "./base.js";

export const login = async (data) => {
    return instance.post("/auth/login", {
        email: data.email,
        password: data.password
    })
}

export const register = async (data) => {
    return instance.post("/auth/register", {
        email: data.email,
        name: data.name,
        password: data.password
    })
}

export const google = async (data) => {
    return await instance.post("/auth/google", {
        credential: data.credential,
    })
}
