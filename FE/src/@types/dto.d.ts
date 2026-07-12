declare module '@dto' {
  export interface BaseResponse<T> {
    data?: T;
    error?: any;
    eData?: any;
    success?: boolean;
  }
}
