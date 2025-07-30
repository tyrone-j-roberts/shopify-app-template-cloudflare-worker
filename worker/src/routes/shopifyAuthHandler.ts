import { error } from "itty-router";
import { RequestWithShopify } from "../types";

export async function shopifyAuthBegin(request: RequestWithShopify) {
  return request.shopify.auth.begin({
    rawRequest: request,
    shop: request.query.shop ? request.query.shop.toString() : "",
    callbackPath: '/api/auth/callback',
    isOnline: false
  });
}

export async function shopifyAuthCallback(request: RequestWithShopify, env: Env) {
  let session = null;

  try {
    session = await request.shopify.auth.callback({
      rawRequest: request
    });
  } catch (err) {
    return error(500, (err as Error).message);
  }

  const insertStatement = env.APP_DB.prepare(`
        INSERT INTO ShopifySessions (session_id, shop, access_token, scope, state, is_online)
        VALUES (?, ?, ?, ?, ?)    
        ON CONFLICT(shop)
        DO UPDATE SET
          session_id = excluded.session_id,
          access_token = excluded.access_token,
          scope = excluded.scope,
          state = excluded.state,
          is_online = excluded.is_online
    `).bind(session.session.id, session.session.shop, session.session.accessToken, session.session.scope, session.session.state, session.session.isOnline);

  try {
    await insertStatement.run();
  } catch (err) {
    return error(500, (err as Error).message);
  }

  const host = request.query.host?.toString() ?? "";
  const decodedHost = atob(host);
  const embeddedAppUrl = `https://${decodedHost}/apps/${env.SHOPIFY_API_KEY}`;

  return new Response(null, {
    status: 302,
    headers: { Location: embeddedAppUrl }
  });
}
