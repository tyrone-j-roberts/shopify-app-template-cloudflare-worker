import { AutoRouter, error, json, withCookies } from 'itty-router';
import { RequestWithShopify, RequestWithShopifySession } from '../types';
import withShopifyAuth from '../middleware/withShopifySession';

import { shopifyAuthBegin, shopifyAuthCallback } from './shopifyAuthHandler';

const apiRouter = AutoRouter({ base: '/api' });

apiRouter
	.get('/auth', withCookies, shopifyAuthBegin)
	.get<RequestWithShopify>('/auth/callback', withCookies, shopifyAuthCallback)
	.get('/products/count', withShopifyAuth, async (request: RequestWithShopifySession, env: Env) => {
			return json({
				count: 5,
				shop: request.shopifySession.shop
			})
	});

export default apiRouter;