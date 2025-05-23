import {Cookies} from 'react-cookie';

const cookies = new Cookies();

export const setCookie = (name, value) => {
    return cookies.set(name, value);
}

export const getCookie = (name) => {
    return cookies.get(name);
}

export const DeleteCookie = (name) => {
    return cookies.remove(name);
}