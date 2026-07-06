export const API_URL_LOCAL = "http://localhost:5062";
export const API_URL_CLOUD = "https://andromeda-backend-7eko.onrender.com";

export let API_URL = API_URL_LOCAL;

export function configurarApiPorLogin(login) {

    const loginNormalizado =
        (login || "").trim().toLowerCase();

    API_URL =
        loginNormalizado === "cloud"
            ? API_URL_CLOUD
            : API_URL_LOCAL;

    return API_URL;

}
