/**
 * White-label branding loader.
 *
 * Runs synchronously in <head>, before Vue mounts, so a deployment with
 * custom branding never flashes the default ink/amber theme first. Looks
 * for /branding/config.json (per-deployment, not committed to this repo)
 * shaped like:
 *
 *   {
 *     "ink": "#14213D",
 *     "amber": "#F2A93C",
 *     "teal": "#1F7A5C",
 *     "productName": "NXT Pay",
 *     "logoUrl": "/branding/logo.svg"
 *   }
 *
 * Missing file or fields fall back to the defaults already set in
 * tokens.scss, so this is safe to leave in place even when no
 * white-label config exists for a given deployment.
 */
(function applyBranding() {
  var TOKEN_MAP = {
    ink: '--nxt-ink',
    amber: '--nxt-amber',
    amberDeep: '--nxt-amber-deep',
    teal: '--nxt-teal',
    paper: '--nxt-paper'
  };

  fetch('/branding/config.json', { cache: 'no-store' })
    .then(function (res) { return res.ok ? res.json() : null; })
    .then(function (config) {
      if (!config) return;
      var root = document.documentElement;
      Object.keys(TOKEN_MAP).forEach(function (key) {
        if (config[key]) root.style.setProperty(TOKEN_MAP[key], config[key]);
      });
      if (config.productName) document.title = config.productName;
      if (config.faviconUrl) {
        var link = document.querySelector('link[rel="icon"]');
        if (link) link.href = config.faviconUrl;
      }
      window.__NXT_BRANDING__ = config;
    })
    .catch(function () {
      // No branding config for this deployment — defaults apply.
    });
})();
