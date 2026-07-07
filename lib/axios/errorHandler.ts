import { AxiosError } from "axios";

export function errorHandler(error: Error) {
  const axiosError = error as AxiosError<{
    success: Boolean;
    message: String;
  }>;
  const errorMessage = axiosError.response?.data?.message ?? null;
  if (errorMessage) {
    alert(`Error: ${errorMessage}`);
  }
  console.log(errorMessage, axiosError.status, error);
  return { status: axiosError.status, message: errorMessage };
}