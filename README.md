# Shopify App - Cloudflare Worker

This is a template for building a Shopify app using Typescript, and React. It contains the basics for building a Shopify app for use as a [cloudflare worker](https://developers.cloudflare.com/workers/).

Rather than cloning this repo, you can use your preferred package manager and the Shopify CLI with [these steps](#installing-the-template).

## Tech Stack

This template combines a number of third party open source tools:

-   [Wrangler](https://developers.cloudflare.com/workers/wrangler/) builds and tests the backend.
-   [itty-router](https://itty.dev/itty-router/) a tiny router allowing url routes to be defined easier in cloudflare workers
-   [Vite](https://vitejs.dev/) builds the [React](https://reactjs.org/) frontend.
-   [React Router](https://reactrouter.com/) is used for routing. We wrap this with file-based routing.
-   [React Query](https://react-query.tanstack.com/) queries the Admin API.
-   [`i18next`](https://www.i18next.com/) and related libraries are used to internationalize the frontend.
    -   [`react-i18next`](https://react.i18next.com/) is used for React-specific i18n functionality.
    -   [`i18next-resources-to-backend`](https://github.com/i18next/i18next-resources-to-backend) is used to dynamically load app translations.
    -   [`@formatjs/intl-localematcher`](https://formatjs.io/docs/polyfills/intl-localematcher/) is used to match the user locale with supported app locales.
    -   [`@formatjs/intl-locale`](https://formatjs.io/docs/polyfills/intl-locale) is used as a polyfill for [`Intl.Locale`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale) if necessary.
    -   [`@formatjs/intl-pluralrules`](https://formatjs.io/docs/polyfills/intl-pluralrules) is used as a polyfill for [`Intl.PluralRules`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules) if necessary.

These third party tools are complemented by Shopify specific tools to ease app development:

-   [Shopify API library](https://github.com/Shopify/shopify-app-js) adds OAuth to the Worker backend. This lets users install the app and grant scope permissions.
-   [App Bridge React](https://shopify.dev/docs/tools/app-bridge/react-components) adds authentication to API requests in the frontend and renders components outside of the embedded App’s iFrame.
-   [Polaris React](https://polaris.shopify.com/) is a powerful design system and component library that helps developers build high quality, consistent experiences for Shopify merchants.
-   [File-based routing](https://github.com/Shopify/shopify-frontend-template-react/blob/main/Routes.jsx) makes creating new pages easier.
-   [`@shopify/i18next-shopify`](https://github.com/Shopify/i18next-shopify) is a plugin for [`i18next`](https://www.i18next.com/) that allows translation files to follow the same JSON schema used by Shopify [app extensions](https://shopify.dev/docs/apps/checkout/best-practices/localizing-ui-extensions#how-it-works) and [themes](https://shopify.dev/docs/themes/architecture/locales/storefront-locale-files#usage).

### Requirements

1. You must [create a Shopify partner account](https://partners.shopify.com/signup) if you don’t have one.
1. You must create a store for testing if you don't have one, either a [development store](https://help.shopify.com/en/partners/dashboard/development-stores#create-a-development-store) or a [Shopify Plus sandbox store](https://help.shopify.com/en/partners/dashboard/managing-stores/plus-sandbox-store).
1. You must have [Node.js](https://nodejs.org/) installed.
1. You must have a [Cloudflare](https://www.cloudflare.com/) account.

### Installing the template

This template runs on Shopify CLI 3.0, which is a node package that can be included in projects. You can install it using your preferred Node.js package manager:

Using yarn:

```shell
yarn create @shopify/app --template "https://github.com/tyrone-j-roberts/shopify-app-template-cloudflare-worker"
```

Using npx:

```shell
npm init @shopify/app@latest -- --template "https://github.com/tyrone-j-roberts/shopify-app-template-cloudflare-worker"
```

Using pnpm:

```shell
pnpm create @shopify/app@latest --template "https://github.com/tyrone-j-roberts/shopify-app-template-cloudflare-worker"
```

This will clone the template and install the CLI in that project.