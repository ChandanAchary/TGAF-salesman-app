import { AxiosError } from "axios";

export interface ErrorResponse {
  response: { data: { message: string; log:any } };
}

export interface Response {
  success: boolean;
  message: string;
}