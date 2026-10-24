export function apiResponse<T>(msg: string, data: T, success: boolean = true) {
  return {
    message: msg,
    success,
    data,
  };
}
