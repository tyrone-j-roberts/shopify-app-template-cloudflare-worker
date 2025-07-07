import { IRequestStrict } from "itty-router";
import { Shopify, Session as ShopifySession } from "@shopify/shopify-api";

export type CFArgs = [Env, ExecutionContext];

export type ShopifySessionRow = {
    id?: number,
    session_id: string,
    shop: string,
    state: string, 
    is_online: number,
    access_token: string,
    scope: string,
    created_at: string,
    updated_at: string
};

export type RequestWithShopify = {
    shopify: Shopify
} & IRequestStrict;

export type RequestWithShopifySession = {
    shopifySession: ShopifySession
} & RequestWithShopify;