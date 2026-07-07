import { ErrorResponse } from "../types/types";

export function responseErrorHandler(error: ErrorResponse) {
  const errorData = error.response?.data;
  if (!errorData) return;
  if (errorData?.log?.code == "VALIDATION") {
    alert(`Validation Error: ${errorData.log.valueError.message}`);
  }
  else {
    const errorMessage = error.response?.data?.message ?? null;
    if (errorMessage) {
      alert(`Error: ${errorMessage}`);
    }
  }
}