import { API_ROUTES } from "@/constants/ApiRoutes";
import { api } from "../axios/axios";

export async function postLogin({ email, password }: { email: string, password: string }) {
  const res = await api.post(API_ROUTES.AUTH.LOGIN, { email, password });
  return res.data;
}

export async function postSignup({ name, email, password }: { name: string, email: string, password: string }) {
  console.log("signup called")
  const res = await api.post(API_ROUTES.AUTH.SIGNUP, { name, email, password });
  return res.data;
}

// export async function addSalesMan({ name, userid, salesManType }: { name: string, userid: string, salesManType: "VANSALES" | "PRESELLER" | "MERCHANDISER" | "DILIVERY" | "CITYHEAD" | "SUPERVISOR" }) {
//   const res = await api.post(API_ROUTES.SALESMEN.CREATE, { name, userid, salesManType });
//   return res.data;
// }

// export async function addLocation({ name, marketName, address, latitude, longitude, region, state, storeType }: { name: string, marketName: string, address: string, latitude: number, longitude: number, region: string, state: string, storeType: "RETAILER" | "WHOLESALER" | "DISTRIBUTOR" | "MEGA" }) {
//   const res = await api.post(API_ROUTES.LOCATION.CREATE, { name, marketName, address, latitude, longitude, region, state, storeType });
//   console.log(res.data);
//   return res.data;
// }