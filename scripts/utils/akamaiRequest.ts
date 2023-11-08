import {eg} from "./edgeGrid";
import {AxiosResponse} from "axios";

type AkamaiResponse<ResponseBody extends any | any [] = any> = {
    response: AxiosResponse;
    body: ResponseBody;
}

export const akamaiRequest = async <ResponseBody = any>(authOptions: any,) => {
    return new Promise<AkamaiResponse<ResponseBody>>((resolve, reject) => {
        eg.auth(authOptions);
        eg.send((err, response, body) => {
            if (err) {
                reject({error: err});
            }
            if (!err && response && response.status >= 200 && response.status < 300 && body) {
                resolve({body: JSON.parse(body ?? '{}'), response});
            } else {
                reject({error: body, response});
            }
        });
    });
}