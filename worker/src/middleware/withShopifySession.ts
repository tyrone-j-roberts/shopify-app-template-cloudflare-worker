import { error, IRequest } from "itty-router";
import { Buffer } from "node:buffer";
import { ShopifySessionRow, RequestWithShopifySession } from "../types";

export default async function withShopifyAuth(request: IRequest, env: Env) : Promise<Response | void> {

    const authHeader = request.headers.get("Authorization");

    if (!authHeader || authHeader.toLocaleLowerCase().startsWith('Bearer ')) {
        return error(401, "Unauthorized, no header");
    }

    const [header, encodedPayload, signature] = authHeader.substring(7).split('.');

    // console.log("header", header, encodedPayload, signature, authHeader);
    // return error(401, JSON.stringify({header, encodedPayload, signature, authHeader}));

    let payloadData = JSON.parse(atob(encodedPayload));

    const nowTs = Date.now() / 1000;

    if (
        (payloadData.exp < nowTs) ||
        (payloadData.nbf > nowTs)
    ) {
        let errorResp: any = error(401, "Unauthorized, expired");
        errorResp.headers.set("X-Shopify-Retry-Invalid-Session-Request", "1");
        return errorResp;
    } 

    const issParsed = URL.parse(payloadData.iss);
    const destParsed = URL.parse(payloadData.dest);
    
    if (!issParsed?.hostname || !destParsed?.hostname || destParsed.hostname !== issParsed.hostname) {
        return error(401, "Unauthorized, no host");
    }

    if (payloadData.aud !== env.SHOPIFY_API_KEY) {
        return error(401, "Unauthorized, key mismatch");
    }

    const encoder = new TextEncoder();
    const secretKeyData = encoder.encode(env.SHOPIFY_API_SECRET);

    const key = await crypto.subtle.importKey(
        "raw",
        secretKeyData,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign", "verify"],
    );

    const verified = await crypto.subtle.verify(
        "HMAC",
        key,
        Buffer.from(signature, 'base64url'),
        encoder.encode(`${header}.${encodedPayload}`),
    );

    if (!verified) {
        return error(401, "Unauthorized, signature mismatch");
    }
    
    const queryStmt = env.DB.prepare("SELECT * FROM ShopifySessions WHERE shop = ?").bind(destParsed.hostname);

    let accessTokenRow : ShopifySessionRow | null = await queryStmt.first<ShopifySessionRow>();
    
    if (!accessTokenRow) {
        return error(401, "Unauthorized, no access token");
    }

    (request as RequestWithShopifySession).shopifySession = {
        shop: accessTokenRow.shop,
        accessToken: accessTokenRow.access_token
    };
}