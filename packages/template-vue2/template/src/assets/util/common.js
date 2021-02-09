export function queryStringParse(url) {
    let formattedParams = {};
    const urlArr = url.split("?")
    if(urlArr.length>1) {
        const params = url.split("?")[1].split("&");

        for (let i = 0; i < params.length; i++) {

            formattedParams[params[i].split("=")[0]] = params[i].split("=")[1];

        }
    }
    return formattedParams
}
