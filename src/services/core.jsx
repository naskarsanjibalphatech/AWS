import axios from "axios";
import toast from "react-hot-toast";
import { CONFIG } from "src/config";

/**
 * Axios API instance with the base url from env config
 */
export const axiosApi = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

export const responseHandler = async (
  api_call,
  toast_success,
  toast_loading
) => {
  let response = null;
  // If loading and success message is provided then show promise toast message.
  const toastId = toast;
  if (toast_loading) toast.loading(toast_loading, { id: toastId });
  try {
    response = await api_call;
    if (toast_success) toast.success(toast_success, { id: toastId });
  } catch (e) {
    response = e;
  }

  // Handle success / error response
  if (response?.status == 200) return response.data;
  else if (response?.status == 400)
    toast.error("Error 400 : " + response?.response?.data?.error, {
      id: toastId,
    });
  else if (response?.status == 422)
    toast.error("Error 422 : " + response?.response?.data?.msg, {
      id: toastId,
    });
  else if (response?.status == 401) {
    toast.error(
      `Unauthorized 401 : ${
        response?.response?.data
          ? response?.response?.data
          : "Action is not permitted."
      }`,
      { id: toastId }
    );
    CONFIG.AUTHORIZATION_ERROR = true;
  } else if (response?.status == 403) {
    toast.error("Unauthorized 403 : Action forbidden.", { id: toastId });
  }

  // User session expired, redirect to login page
  else if (response?.status == 402) {
    localStorage.removeItem("userSession");
    toast.error("Session expired. Please login again.", { id: toastId });
    CONFIG.AUTHORIZATION_ERROR = true;
    window.location.href = "/";
    return null;
  } else if (response?.status === 500)
    toast.error("Error 500 : " + response?.message, { id: toastId });
  else
    toast.error("Error : Something went wrong. Please contact admin.", {
      id: toastId,
    });
  return null;
};
