import { ensureBasicOptions, extractBearerToken, LogtoMiddlewareBasicOptions, validateUser } from '@logto/middleware-core';
import { Context, Next } from "koa";

export interface LogtoKoaOptions extends LogtoMiddlewareBasicOptions {
  unauthorizedHandler?: (ctx: Context) => void;
}

const defaultUnauthorizedHandler = (ctx: Context) => {
  ctx.throw(401, 'Unauthorized');
};

export default function logto(
  options?: LogtoKoaOptions
): (ctx: Context, next: Next) => void {
  const { strategy } = ensureBasicOptions(options);
  const {
    unauthorizedHandler = defaultUnauthorizedHandler,
  } = options || {};
  if (typeof unauthorizedHandler !== 'function') {
    throw new Error("Invalid unauthorizedHandler");
  }
  return async (
    ctx: Context,
    next: Next
  ) => {
    if (strategy === "bearer") {
      const token = extractBearerToken(ctx.req.headers.authorization);
      if (!token) {
        unauthorizedHandler(ctx);
        return;
      }
      const user = await validateUser(token);
      if (!user) {
        unauthorizedHandler(ctx);
        return;
      }
      ctx.user = user;
    }
    next();
  };
}