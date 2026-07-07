import { API_ROUTES } from "@/constants/ApiRoutes";
import { api } from "../axios/axios";

export async function getMe() {
  const res = await api.get(API_ROUTES.AUTH.ME);
  return res.data;
}


/* import { API_ROUTES } from "@/constants/ApiRoutes";
import { api } from "../axios/axios";

export async function getMe() {
  const res = await fetch('https://salesmen-server-9vy2j.ondigitalocean.app/health', {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'ExpoApp/1.0',
    },
  });
  
  if (res.ok) {
    const data = await res.json(); // Parse the response as JSON
    console.log('Response Data:', data);
    return data;
  } else {
    console.error('Error:', res.status, res.statusText);
  }
} */