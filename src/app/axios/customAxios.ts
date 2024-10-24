import axios from "axios";

const instance : any = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
    timeout: 10000,
});

const customAxiosPost = instance.create({
    headers : {
        'Content-Type' : 'application/json',
    },
    method : "POST",
    withCredentials : true
});

const customAxiosGet = instance.create({
    method : "GET",
});

const customAxiosDelete = instance.create({
    method : "delete",
    withCredentials : true
});

export {
    instance,
    customAxiosPost,
    customAxiosGet,
    customAxiosDelete
}