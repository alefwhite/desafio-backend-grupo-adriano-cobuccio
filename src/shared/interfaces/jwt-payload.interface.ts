export interface JwtPayload {
  sub: string;
  [key: string]: unknown;
}
