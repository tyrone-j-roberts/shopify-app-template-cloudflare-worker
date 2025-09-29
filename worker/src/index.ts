/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import '@shopify/shopify-api/adapters/cf-worker';

import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api';

import { AutoRouter, cors, IRequest, json, RequestHandler, withContent, withParams } from 'itty-router'
import { CFArgs, RequestWithShopify } from './types';
import apiRouter from './routes/apiRouter';
import withEnsureShopifyInstalled from './middleware/withEnsureShopifyInstalled';

const appInit: RequestHandler<IRequest, CFArgs> = async (request: IRequest, env) => {
	let appHost: string = env.APP_HOST;

	if (!appHost) {
		const parsedUrl = new URL(request.url);
		appHost = parsedUrl.hostname;
	}

	request.shopify = shopifyApi({
		apiKey: env.SHOPIFY_API_KEY,
		apiSecretKey: env.SHOPIFY_API_SECRET,
		apiVersion: LATEST_API_VERSION,
		isEmbeddedApp: true,
		hostName: appHost,
		hostScheme: "https",
	});
};

const { preflight, corsify } = cors({
	origin: '*',
});

const router = AutoRouter({
	before: [preflight, appInit],
	finally: [corsify],
});

router
	.all('/api/*', apiRouter.fetch)
	.get('/assets/*', async (request, env) => {
		const asset = await env.ASSETS.fetch(request.url);

		return new Response(asset.body, {
			headers: asset.headers,
		});
	})
	.get<RequestWithShopify, CFArgs>('*', withEnsureShopifyInstalled, async (request, env) => {

		const requestUrlParsed = URL.parse(request.url);

		if (env.ENVIRONMENT == 'dev') {

			const response = await env.ASSETS.fetch(`${requestUrlParsed?.origin}/index-dev.html`);
			let responseText = await response.text();

			responseText = responseText.replace(/\%VITE_SHOPIFY_API_KEY\%/gm, env.SHOPIFY_API_KEY);

			return new Response(responseText, {
				headers: {
					'Content-type': 'text/html; charset=utf-8'
				}
			});
		}

		const asset = await env.ASSETS.fetch(requestUrlParsed?.origin ?? request.url);

		return new Response(asset.body, {
			headers: asset.headers,
		});
	});

export default {
	fetch: router.fetch
} satisfies ExportedHandler<Env>;
