import { CommonInterceptor, getIn } from "anysend";
import { Notification } from "element-ui";
import { Loading as LoadingUi } from "element-ui";
export class AppInterceptor extends CommonInterceptor {
  loadingInstance;
  LoadingUiOptions = {
    fullscreen: true,
    customClass: "loading-ui",
  };
  async closeLoading(params) {
    this.loadingInstance.close();
  }

  async renderErrorNotice(error, params) {
    const reponse = getIn(error, ["response", "data", "message"], "");
    const noticeErrorMessage = getIn(params, ["noticeErrorMessage"], reponse);
    Notification.error({
      title: "恭喜你",
      message: noticeErrorMessage,
    });
  }

  async renderLoading(params) {
    this.loadingInstance = LoadingUi.service(this.LoadingUiOptions);
  }

  async renderNotice(result, params) {
    const { message } = result;
    const noticeMessage = getIn(params, ["noticeMessage"], message);
    Notification.success({
      title: "恭喜你",
      message: noticeMessage,
    });
  }
}
