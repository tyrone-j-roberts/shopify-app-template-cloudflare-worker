import { IRequest } from "itty-router";
import { RequestWithShopify, ShopifySessionRow } from "../types";

export default async function withEnsureShopifyInstalled(request: RequestWithShopify, env: Env) : Promise<void | Response> {
    const shop = typeof request.query.shop == 'string' ? request.query.shop.toLocaleLowerCase() : "undefined";

    const shopifySessionStmt =  env.DB.prepare(`SELECT * FROM ShopifySessions WHERE shop = ?`).bind(shop);
    const shopifySessionRow : ShopifySessionRow | null = await shopifySessionStmt.first<ShopifySessionRow>();

    const url = URL.parse(request.url);

    const isExitingIframe = !!url?.pathname.match(/^\/ExitIframe/i);

    if (!isExitingIframe && !shopifySessionRow) {

        if (request.query.embedded == '1') {
            const redirectUri = encodeURIComponent(`https://${env.APP_HOST}/api/auth?shop=${shop}`);
            let queryParams = new URLSearchParams(request.query as Record<string, string>);
            queryParams.append('redirectUri', redirectUri);

            return new Response(null, {
                status: 302,
                headers: { Location: `/ExitIframe?${queryParams.toString()}` }
            });
        }

        return request.shopify.auth.begin({
            rawRequest: request,
            shop: shop,
            callbackPath: '/api/auth/callback',
            isOnline: false
        })
    }
}