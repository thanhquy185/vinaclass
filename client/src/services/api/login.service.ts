import axiosClient from "./axios";

export const authService = {
  login: async (data: { login: string; password: string }) => {
    const res = await axiosClient.post("/login", data);
    console.log("data", res);
    return res.data;
  },
  me: async () => {
    const res = await axiosClient.get("/me");
    return res.data;
  },
  setCookie: async (data: { access_token: string }) => {
    const res = await axiosClient.post("/auth/set-cookie", data);
    return res.data;
  },
};
