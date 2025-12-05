// import axios from "axios";
import { toast } from "react-toastify";

const headers = {
  "Content-Type": "application/json",
  accept: "application/json",
  "Access-Control-Allow-Headers": "Content-Type",
  "access-control-allow-credentials": true,
  "Access-Control-Allow-Methods": "POST, GET, DELETE, PUT, PATCH",
  "Access-Control-Request-Method": "POST, GET, DELETE, PUT, PATCH",
  "Access-Control-Request-Headers": "POST, GET, DELETE, PUT, PATCH",
  "ngrok-skip-browser-warning": "69420",
};

export async function apiCall(requestMethod, url, body, onSuccess,onFailure,accessToken = null) {
  if (accessToken !== null) {
    headers["Authorization"] = accessToken;
  }
  const formData = {
    method: requestMethod,
    headers: headers,
  };
  const formBody = JSON.stringify(body);

  if (body !== undefined && body !== "") {
    formData.body = formBody;
  }
  // // console.log(formData, url);
  try {
    const response = await fetch(url, formData);
    const responseJson = await response.json();

  
    if (
      responseJson.status === "success" ||
      response.status === 200 ||
      response.status === 201
    ) {
      onSuccess(responseJson);
    } else {
      onFailure(responseJson);
    }
  } catch (error) {
    toast.error(error);
    onFailure(error);
  }
}

export async function deleteApi(url, onSuccess, token) {
  const formData = {
    method: "DELETE",
    headers: {
      Authorization: token,
    },
  };

  try {
    const response = await fetch(url, formData);
    const responseJson = await response.json();

    if (
      responseJson.status === "success" ||
      response.status === 200 ||
      response.status === 201
    ) {
      onSuccess(responseJson);
    }
  } catch (error) {
    toast.error(error);
  }
}

export function imageUploadApiCall(data) {
  const formData = new FormData();
  formData.append("document", data[0]);

  // try {
  //   axios
  //     .post(`${apiUrl.UPLOAD_IMAGE}`, formData, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     })

  //     .then((response) => {
  //       if (response.status === 200) {
  //         toast.success(response.data.message);
  //         onSuccess(response.data.url);
  //       } else {
  //         toast.error("images not upload");
  //       }
  //     });
  // } catch (e) {
  //   return e;
  // }
}
