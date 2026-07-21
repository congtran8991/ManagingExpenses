export interface ITokenPayload {
  sub: number; // id
  email: string;
  iat?: number; // Dấu "?" để linh hoạt vì khi ký token chưa có iat/exp, giải mã ra mới có
  exp?: number;
}
