import { axiosApi, responseHandler } from "src/services/core";

export const homeApi = {
  getHomeData: async (
    address,
    toast_success = false,
    toast_loading = false
  ) => {
    const api_call = axiosApi.get(
      `https://37nbvl1laf.execute-api.us-east-1.amazonaws.com/Stage2?address=${address}`,
      {}
    );
    return responseHandler(api_call, toast_success, toast_loading);
  },
  onOffButtonState: async (
    data,
    toast_success = false,
    toast_loading = false
  ) => {
    const api_call = axiosApi.post(
      `https://1ubydbt2t9.execute-api.us-east-1.amazonaws.com/STAGE1/trigger`,
      data,
      {}
    );
    return responseHandler(api_call, toast_success, toast_loading);
  },
};
