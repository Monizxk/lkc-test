import axios from "axios";

export const instance = axios.create({
    baseURL: 'http://91.199.45.219:14088',
})
