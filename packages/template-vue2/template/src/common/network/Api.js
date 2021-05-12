import {
  GlobalInterceptor,
  IAxiosSend,
  Controller,
  Path,
  Post,
  Get,
  IAxiosOptions,
  AxiosStatic,
  AxiosResponse,
} from "anysend";
import { AppInterceptor } from "./AppInterceptor";
import Axios from "axios";

const { Loading, ShowNotice, ErrorNotice } = AppInterceptor;
@Controller("/music")
// 通用拦截器加入了刚刚的拦截器
@GlobalInterceptor(new AppInterceptor())
export class AxiosSend extends IAxiosSend {
  constructor() {
    super(
      {
        baseURL: "/api/",
      },
      Axios
    );
  }

  @Get("/getDiscList")
  @Loading()
  async getDiscList(options = {}) {
    return this.send(options);
  }

  @Post("/delSong1")
  @ShowNotice()
  @ErrorNotice()
  async delSong(options = {}) {
    return this.send(options);
  }
  interceptorRequest(res) {
    return res;
  }

  interceptorResponse(response = {}) {
    return response;
  }

  isSuccess(result) {
    const { status } = result;
    return status > 199 && status < 300;
  }

  transformData(result) {
    const { data } = result;
    return data;
  }
}

export default new AxiosSend();
