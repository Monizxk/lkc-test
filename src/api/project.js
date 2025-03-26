import {instance} from "./base.js";

export const my = async () => {
    const response = await instance.get("/projects/@my")

    return response.data
}

export const create = async (data) => {
    const response = await instance.post("/projects", {
        name: data.name,
        description: data.description,
        content: data.content,
    })

    return {
        id: response.data.id,
        name: response.data.name,
        description: response.data.description,
        content: response.data.content,
    }
}

export const update = async (data) => {

}

export const remove = async (data) => {

}

