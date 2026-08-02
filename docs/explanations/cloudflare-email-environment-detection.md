# Cloudflare email environment detection

Why the automatic `[STAGING]` email subject prefix did not appear, and how to
distinguish Cloudflare Pages preview email from production email reliably.

## Context

`CF_PAGES_BRANCH` is a **build-time** signal, not a documented Pages Functions
runtime binding. Cloudflare lists it with the system variables injected into the
Pages build environment and describes it as a way to customize a build for a
branch. It does not list `CF_PAGES_BRANCH` among the values available to a
Function at request time. [Cloudflare Pages build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/#environment-variables)

An earlier attempted configuration captured the variable only while Nuxt was
building:

```ts
runtimeConfig: {
  deploymentBranch: process.env.CF_PAGES_BRANCH || '',
}
```

That can work when Cloudflare itself builds the exact branch and preserves the
value in the generated artifact, but it is not a reliable runtime detector. If
the build environment does not provide the variable, the artifact is built
elsewhere, or the deployed branch is not literally `staging`, the stored value
is empty or different and the prefix is omitted.

Nuxt documents this exact limitation: assigning a runtime-config default from a
differently named environment variable such as `process.env.OTHER_VARIABLE`
works only at build time. Runtime overrides must use a matching `NUXT_` variable.
[Nuxt runtime configuration](https://nuxt.com/docs/4.x/guide/going-further/runtime-config#environment-variables)

This is related to server rendering only in the sense that the email is sent by
a Nitro server endpoint. The relevant boundary is **build time versus the
Cloudflare request runtime**, not whether Vue pages are rendered on the server.
Nitro notes that Cloudflare provides environment variables during the request
lifecycle and recommends accessing them inside the handler, through runtime
config or the request's Cloudflare bindings.
[Nitro Cloudflare environment variables](https://nitro.build/deploy/providers/cloudflare#environment-variables)

## Approach Chosen

Use one non-secret custom environment variable with values configured separately
for Cloudflare's Preview and Production environments:

```text
Preview:    DEPLOYMENT_ENV=staging
Production: DEPLOYMENT_ENV=production
```

At runtime, a Pages Function receives explicitly configured environment-variable
bindings. Cloudflare lets the same variable have different values in production
and preview, and exposes it to the Function through its environment binding.
[Cloudflare Pages bindings](https://developers.cloudflare.com/pages/functions/bindings/#environment-variables)

The request hostname can suggest that a deployment is a preview because Pages
uses hash and branch aliases under `pages.dev`, but it is an indirect signal and
couples application behavior to routing. It should not control transactional
email labeling. [Cloudflare Pages preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/)

Read it inside the email-delivery request lifecycle:

```ts
const isStaging = process.env.DEPLOYMENT_ENV === 'staging';
```

Nitro exposes Cloudflare environment bindings through `process.env` during the
request lifecycle. Reading the variable when the email is sent avoids both
build-time branch detection and Nuxt runtime-config mapping.

## Alternatives Considered

- `CF_PAGES_BRANCH`: useful during a Cloudflare Pages build, but not a documented
  request-time binding.
- Nuxt runtime-config overrides: require a matching `NUXT_` variable and add an
  unnecessary mapping for a server-only deployment label.
- Request hostname detection: indirect and couples email behavior to routing and
  domain configuration.

## Trade-offs

Cloudflare Pages supports only the `production` and `preview` configuration
classes, not per-branch runtime configuration. Consequently, this setting will
label email from every preview deployment as staging. If only the `staging`
branch should be allowed to send email, that is a separate policy and requires
either a branch value baked in at build time or a separate Pages project.
[Cloudflare Pages Wrangler environments](https://developers.cloudflare.com/pages/functions/wrangler-configuration/#environment-specific-overrides)

No secret is involved, but the variable must be configured for both environments
and the deployments must be redeployed before testing.

## Learnings

Cloudflare build variables and request-time bindings are different concerns.
Deployment-sensitive server behavior should use an explicit request-time binding
unless the behavior genuinely belongs to the build artifact.

---

**Last updated:** 2026-08-02
