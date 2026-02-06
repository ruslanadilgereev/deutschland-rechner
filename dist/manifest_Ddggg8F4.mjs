import '@astrojs/internal-helpers/path';
import '@astrojs/internal-helpers/remote';
import 'piccolore';
import { N as NOOP_MIDDLEWARE_HEADER, h as decodeKey } from './chunks/astro/server_X4Fuu-a1.mjs';
import 'clsx';
import 'es-module-lexer';
import 'html-escaper';

const NOOP_MIDDLEWARE_FN = async (_ctx, next) => {
  const response = await next();
  response.headers.set(NOOP_MIDDLEWARE_HEADER, "true");
  return response;
};

const codeToStatusMap = {
  // Implemented from IANA HTTP Status Code Registry
  // https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  PROXY_AUTHENTICATION_REQUIRED: 407,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  CONTENT_TOO_LARGE: 413,
  URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA_TYPE: 415,
  RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,
  MISDIRECTED_REQUEST: 421,
  UNPROCESSABLE_CONTENT: 422,
  LOCKED: 423,
  FAILED_DEPENDENCY: 424,
  TOO_EARLY: 425,
  UPGRADE_REQUIRED: 426,
  PRECONDITION_REQUIRED: 428,
  TOO_MANY_REQUESTS: 429,
  REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
  UNAVAILABLE_FOR_LEGAL_REASONS: 451,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,
  VARIANT_ALSO_NEGOTIATES: 506,
  INSUFFICIENT_STORAGE: 507,
  LOOP_DETECTED: 508,
  NETWORK_AUTHENTICATION_REQUIRED: 511
};
Object.entries(codeToStatusMap).reduce(
  // reverse the key-value pairs
  (acc, [key, value]) => ({ ...acc, [value]: key }),
  {}
);

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///home/ubuntu/clawd/deutschlandrechner/","cacheDir":"file:///home/ubuntu/clawd/deutschlandrechner/node_modules/.astro/","outDir":"file:///home/ubuntu/clawd/deutschlandrechner/dist/","srcDir":"file:///home/ubuntu/clawd/deutschlandrechner/src/","publicDir":"file:///home/ubuntu/clawd/deutschlandrechner/public/","buildClientDir":"file:///home/ubuntu/clawd/deutschlandrechner/dist/client/","buildServerDir":"file:///home/ubuntu/clawd/deutschlandrechner/dist/server/","adapterName":"","routes":[{"file":"file:///home/ubuntu/clawd/deutschlandrechner/dist/arbeitslosengeld-rechner/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/arbeitslosengeld-rechner","isIndex":false,"type":"page","pattern":"^\\/arbeitslosengeld-rechner\\/?$","segments":[[{"content":"arbeitslosengeld-rechner","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/arbeitslosengeld-rechner.astro","pathname":"/arbeitslosengeld-rechner","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"file:///home/ubuntu/clawd/deutschlandrechner/dist/bafoeg-rechner/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/bafoeg-rechner","isIndex":false,"type":"page","pattern":"^\\/bafoeg-rechner\\/?$","segments":[[{"content":"bafoeg-rechner","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/bafoeg-rechner.astro","pathname":"/bafoeg-rechner","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"file:///home/ubuntu/clawd/deutschlandrechner/dist/brutto-netto-rechner/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/brutto-netto-rechner","isIndex":false,"type":"page","pattern":"^\\/brutto-netto-rechner\\/?$","segments":[[{"content":"brutto-netto-rechner","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/brutto-netto-rechner.astro","pathname":"/brutto-netto-rechner","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"file:///home/ubuntu/clawd/deutschlandrechner/dist/buergergeld-rechner/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/buergergeld-rechner","isIndex":false,"type":"page","pattern":"^\\/buergergeld-rechner\\/?$","segments":[[{"content":"buergergeld-rechner","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/buergergeld-rechner.astro","pathname":"/buergergeld-rechner","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"file:///home/ubuntu/clawd/deutschlandrechner/dist/einkommensteuer-rechner/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/einkommensteuer-rechner","isIndex":false,"type":"page","pattern":"^\\/einkommensteuer-rechner\\/?$","segments":[[{"content":"einkommensteuer-rechner","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/einkommensteuer-rechner.astro","pathname":"/einkommensteuer-rechner","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"file:///home/ubuntu/clawd/deutschlandrechner/dist/elterngeld-rechner/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/elterngeld-rechner","isIndex":false,"type":"page","pattern":"^\\/elterngeld-rechner\\/?$","segments":[[{"content":"elterngeld-rechner","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/elterngeld-rechner.astro","pathname":"/elterngeld-rechner","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"file:///home/ubuntu/clawd/deutschlandrechner/dist/elternzeit-rechner/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/elternzeit-rechner","isIndex":false,"type":"page","pattern":"^\\/elternzeit-rechner\\/?$","segments":[[{"content":"elternzeit-rechner","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/elternzeit-rechner.astro","pathname":"/elternzeit-rechner","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"file:///home/ubuntu/clawd/deutschlandrechner/dist/geburtstermin-rechner/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/geburtstermin-rechner","isIndex":false,"type":"page","pattern":"^\\/geburtstermin-rechner\\/?$","segments":[[{"content":"geburtstermin-rechner","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/geburtstermin-rechner.astro","pathname":"/geburtstermin-rechner","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"file:///home/ubuntu/clawd/deutschlandrechner/dist/grunderwerbsteuer-rechner/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/grunderwerbsteuer-rechner","isIndex":false,"type":"page","pattern":"^\\/grunderwerbsteuer-rechner\\/?$","segments":[[{"content":"grunderwerbsteuer-rechner","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/grunderwerbsteuer-rechner.astro","pathname":"/grunderwerbsteuer-rechner","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"file:///home/ubuntu/clawd/deutschlandrechner/dist/kindergeld-rechner/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/kindergeld-rechner","isIndex":false,"type":"page","pattern":"^\\/kindergeld-rechner\\/?$","segments":[[{"content":"kindergeld-rechner","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/kindergeld-rechner.astro","pathname":"/kindergeld-rechner","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"file:///home/ubuntu/clawd/deutschlandrechner/dist/kinderzuschlag-rechner/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/kinderzuschlag-rechner","isIndex":false,"type":"page","pattern":"^\\/kinderzuschlag-rechner\\/?$","segments":[[{"content":"kinderzuschlag-rechner","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/kinderzuschlag-rechner.astro","pathname":"/kinderzuschlag-rechner","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"file:///home/ubuntu/clawd/deutschlandrechner/dist/krankengeld-rechner/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/krankengeld-rechner","isIndex":false,"type":"page","pattern":"^\\/krankengeld-rechner\\/?$","segments":[[{"content":"krankengeld-rechner","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/krankengeld-rechner.astro","pathname":"/krankengeld-rechner","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"file:///home/ubuntu/clawd/deutschlandrechner/dist/midijob-rechner/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/midijob-rechner","isIndex":false,"type":"page","pattern":"^\\/midijob-rechner\\/?$","segments":[[{"content":"midijob-rechner","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/midijob-rechner.astro","pathname":"/midijob-rechner","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"file:///home/ubuntu/clawd/deutschlandrechner/dist/minijob-rechner/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/minijob-rechner","isIndex":false,"type":"page","pattern":"^\\/minijob-rechner\\/?$","segments":[[{"content":"minijob-rechner","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/minijob-rechner.astro","pathname":"/minijob-rechner","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"file:///home/ubuntu/clawd/deutschlandrechner/dist/mutterschutz-rechner/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/mutterschutz-rechner","isIndex":false,"type":"page","pattern":"^\\/mutterschutz-rechner\\/?$","segments":[[{"content":"mutterschutz-rechner","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/mutterschutz-rechner.astro","pathname":"/mutterschutz-rechner","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"file:///home/ubuntu/clawd/deutschlandrechner/dist/pendlerpauschale-rechner/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/pendlerpauschale-rechner","isIndex":false,"type":"page","pattern":"^\\/pendlerpauschale-rechner\\/?$","segments":[[{"content":"pendlerpauschale-rechner","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/pendlerpauschale-rechner.astro","pathname":"/pendlerpauschale-rechner","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"file:///home/ubuntu/clawd/deutschlandrechner/dist/promille-rechner/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/promille-rechner","isIndex":false,"type":"page","pattern":"^\\/promille-rechner\\/?$","segments":[[{"content":"promille-rechner","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/promille-rechner.astro","pathname":"/promille-rechner","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"file:///home/ubuntu/clawd/deutschlandrechner/dist/renten-rechner/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/renten-rechner","isIndex":false,"type":"page","pattern":"^\\/renten-rechner\\/?$","segments":[[{"content":"renten-rechner","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/renten-rechner.astro","pathname":"/renten-rechner","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"file:///home/ubuntu/clawd/deutschlandrechner/dist/rundfunkbeitrag-rechner/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/rundfunkbeitrag-rechner","isIndex":false,"type":"page","pattern":"^\\/rundfunkbeitrag-rechner\\/?$","segments":[[{"content":"rundfunkbeitrag-rechner","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/rundfunkbeitrag-rechner.astro","pathname":"/rundfunkbeitrag-rechner","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"file:///home/ubuntu/clawd/deutschlandrechner/dist/unterhalts-rechner/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/unterhalts-rechner","isIndex":false,"type":"page","pattern":"^\\/unterhalts-rechner\\/?$","segments":[[{"content":"unterhalts-rechner","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/unterhalts-rechner.astro","pathname":"/unterhalts-rechner","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"file:///home/ubuntu/clawd/deutschlandrechner/dist/wohngeld-rechner/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/wohngeld-rechner","isIndex":false,"type":"page","pattern":"^\\/wohngeld-rechner\\/?$","segments":[[{"content":"wohngeld-rechner","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/wohngeld-rechner.astro","pathname":"/wohngeld-rechner","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"file:///home/ubuntu/clawd/deutschlandrechner/dist/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"site":"https://deutschland-rechner.vercel.app","base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["/home/ubuntu/clawd/deutschlandrechner/src/pages/arbeitslosengeld-rechner.astro",{"propagation":"none","containsHead":true}],["/home/ubuntu/clawd/deutschlandrechner/src/pages/bafoeg-rechner.astro",{"propagation":"none","containsHead":true}],["/home/ubuntu/clawd/deutschlandrechner/src/pages/brutto-netto-rechner.astro",{"propagation":"none","containsHead":true}],["/home/ubuntu/clawd/deutschlandrechner/src/pages/buergergeld-rechner.astro",{"propagation":"none","containsHead":true}],["/home/ubuntu/clawd/deutschlandrechner/src/pages/einkommensteuer-rechner.astro",{"propagation":"none","containsHead":true}],["/home/ubuntu/clawd/deutschlandrechner/src/pages/elterngeld-rechner.astro",{"propagation":"none","containsHead":true}],["/home/ubuntu/clawd/deutschlandrechner/src/pages/elternzeit-rechner.astro",{"propagation":"none","containsHead":true}],["/home/ubuntu/clawd/deutschlandrechner/src/pages/geburtstermin-rechner.astro",{"propagation":"none","containsHead":true}],["/home/ubuntu/clawd/deutschlandrechner/src/pages/grunderwerbsteuer-rechner.astro",{"propagation":"none","containsHead":true}],["/home/ubuntu/clawd/deutschlandrechner/src/pages/index.astro",{"propagation":"none","containsHead":true}],["/home/ubuntu/clawd/deutschlandrechner/src/pages/kindergeld-rechner.astro",{"propagation":"none","containsHead":true}],["/home/ubuntu/clawd/deutschlandrechner/src/pages/kinderzuschlag-rechner.astro",{"propagation":"none","containsHead":true}],["/home/ubuntu/clawd/deutschlandrechner/src/pages/krankengeld-rechner.astro",{"propagation":"none","containsHead":true}],["/home/ubuntu/clawd/deutschlandrechner/src/pages/midijob-rechner.astro",{"propagation":"none","containsHead":true}],["/home/ubuntu/clawd/deutschlandrechner/src/pages/minijob-rechner.astro",{"propagation":"none","containsHead":true}],["/home/ubuntu/clawd/deutschlandrechner/src/pages/mutterschutz-rechner.astro",{"propagation":"none","containsHead":true}],["/home/ubuntu/clawd/deutschlandrechner/src/pages/pendlerpauschale-rechner.astro",{"propagation":"none","containsHead":true}],["/home/ubuntu/clawd/deutschlandrechner/src/pages/promille-rechner.astro",{"propagation":"none","containsHead":true}],["/home/ubuntu/clawd/deutschlandrechner/src/pages/renten-rechner.astro",{"propagation":"none","containsHead":true}],["/home/ubuntu/clawd/deutschlandrechner/src/pages/rundfunkbeitrag-rechner.astro",{"propagation":"none","containsHead":true}],["/home/ubuntu/clawd/deutschlandrechner/src/pages/unterhalts-rechner.astro",{"propagation":"none","containsHead":true}],["/home/ubuntu/clawd/deutschlandrechner/src/pages/wohngeld-rechner.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000noop-middleware":"_noop-middleware.mjs","\u0000virtual:astro:actions/noop-entrypoint":"noop-entrypoint.mjs","\u0000@astro-page:src/pages/arbeitslosengeld-rechner@_@astro":"pages/arbeitslosengeld-rechner.astro.mjs","\u0000@astro-page:src/pages/bafoeg-rechner@_@astro":"pages/bafoeg-rechner.astro.mjs","\u0000@astro-page:src/pages/brutto-netto-rechner@_@astro":"pages/brutto-netto-rechner.astro.mjs","\u0000@astro-page:src/pages/buergergeld-rechner@_@astro":"pages/buergergeld-rechner.astro.mjs","\u0000@astro-page:src/pages/einkommensteuer-rechner@_@astro":"pages/einkommensteuer-rechner.astro.mjs","\u0000@astro-page:src/pages/elterngeld-rechner@_@astro":"pages/elterngeld-rechner.astro.mjs","\u0000@astro-page:src/pages/elternzeit-rechner@_@astro":"pages/elternzeit-rechner.astro.mjs","\u0000@astro-page:src/pages/geburtstermin-rechner@_@astro":"pages/geburtstermin-rechner.astro.mjs","\u0000@astro-page:src/pages/grunderwerbsteuer-rechner@_@astro":"pages/grunderwerbsteuer-rechner.astro.mjs","\u0000@astro-page:src/pages/kindergeld-rechner@_@astro":"pages/kindergeld-rechner.astro.mjs","\u0000@astro-page:src/pages/kinderzuschlag-rechner@_@astro":"pages/kinderzuschlag-rechner.astro.mjs","\u0000@astro-page:src/pages/krankengeld-rechner@_@astro":"pages/krankengeld-rechner.astro.mjs","\u0000@astro-page:src/pages/midijob-rechner@_@astro":"pages/midijob-rechner.astro.mjs","\u0000@astro-page:src/pages/minijob-rechner@_@astro":"pages/minijob-rechner.astro.mjs","\u0000@astro-page:src/pages/mutterschutz-rechner@_@astro":"pages/mutterschutz-rechner.astro.mjs","\u0000@astro-page:src/pages/pendlerpauschale-rechner@_@astro":"pages/pendlerpauschale-rechner.astro.mjs","\u0000@astro-page:src/pages/promille-rechner@_@astro":"pages/promille-rechner.astro.mjs","\u0000@astro-page:src/pages/renten-rechner@_@astro":"pages/renten-rechner.astro.mjs","\u0000@astro-page:src/pages/rundfunkbeitrag-rechner@_@astro":"pages/rundfunkbeitrag-rechner.astro.mjs","\u0000@astro-page:src/pages/unterhalts-rechner@_@astro":"pages/unterhalts-rechner.astro.mjs","\u0000@astro-page:src/pages/wohngeld-rechner@_@astro":"pages/wohngeld-rechner.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astrojs-manifest":"manifest_Ddggg8F4.mjs","/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/ArbeitslosengeldRechner.tsx":"_astro/ArbeitslosengeldRechner.CkmqRIjz.js","/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/BafoegRechner":"_astro/BafoegRechner.DKv6e56W.js","/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/BruttoNettoRechner":"_astro/BruttoNettoRechner.DZuHTzIy.js","/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/BuergergeldRechner":"_astro/BuergergeldRechner.CClMH9t2.js","/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/EinkommensteuerRechner":"_astro/EinkommensteuerRechner.RRdoxDhu.js","/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/ElterngeldRechner":"_astro/ElterngeldRechner.DsyyskTg.js","/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/ElternzeitRechner":"_astro/ElternzeitRechner.BquNyTpz.js","/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/GeburtsterminRechner":"_astro/GeburtsterminRechner.BuoZf6gN.js","/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/GrunderwerbsteuerRechner":"_astro/GrunderwerbsteuerRechner.Bw2n1p6p.js","/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/KindergeldRechner":"_astro/KindergeldRechner.D5qOXokm.js","/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/KinderzuschlagRechner":"_astro/KinderzuschlagRechner.4CpSxmLL.js","/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/KrankengeldRechner":"_astro/KrankengeldRechner.B1gxrSt9.js","/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/MidijobRechner":"_astro/MidijobRechner.CR7FwPHn.js","/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/MinijobRechner":"_astro/MinijobRechner.BlVrTsqb.js","/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/MutterschutzRechner":"_astro/MutterschutzRechner.DsBQSfIG.js","/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/PendlerpauschaleRechner":"_astro/PendlerpauschaleRechner.DUaUDw10.js","/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/PromilleRechner":"_astro/PromilleRechner.C_ugIL8P.js","/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/RentenRechner":"_astro/RentenRechner.C9iZgqlX.js","/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/RundfunkbeitragRechner":"_astro/RundfunkbeitragRechner.DzOUhWj6.js","/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/UnterhaltsRechner":"_astro/UnterhaltsRechner.CwU8ntrr.js","/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/WohngeldRechner":"_astro/WohngeldRechner.NwxEcy9P.js","/home/ubuntu/clawd/deutschlandrechner/src/components/RechnerCard":"_astro/RechnerCard.CFM1NHfd.js","@astrojs/react/client.js":"_astro/client.Dc9Vh3na.js","/home/ubuntu/clawd/deutschlandrechner/src/pages/index.astro?astro&type=script&index=0&lang.ts":"_astro/index.astro_astro_type_script_index_0_lang.CaYnzxGa.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[["/home/ubuntu/clawd/deutschlandrechner/src/pages/index.astro?astro&type=script&index=0&lang.ts","document.addEventListener(\"DOMContentLoaded\",()=>{const n=document.getElementById(\"search-input\"),r=document.querySelectorAll(\".rechner-item\"),o=document.querySelectorAll(\".kategorie-section\");n&&n.addEventListener(\"input\",c=>{const s=c.target.value.toLowerCase().trim();if(!s){r.forEach(e=>e.style.display=\"\"),o.forEach(e=>e.style.display=\"\");return}r.forEach(e=>{const t=(e.getAttribute(\"data-name\")||\"\").includes(s);e.style.display=t?\"\":\"none\"}),o.forEach(e=>{const a=e.querySelectorAll(\".rechner-item\"),t=Array.from(a).some(l=>l.style.display!==\"none\");e.style.display=t?\"\":\"none\"})})});"]],"assets":["/file:///home/ubuntu/clawd/deutschlandrechner/dist/arbeitslosengeld-rechner/index.html","/file:///home/ubuntu/clawd/deutschlandrechner/dist/bafoeg-rechner/index.html","/file:///home/ubuntu/clawd/deutschlandrechner/dist/brutto-netto-rechner/index.html","/file:///home/ubuntu/clawd/deutschlandrechner/dist/buergergeld-rechner/index.html","/file:///home/ubuntu/clawd/deutschlandrechner/dist/einkommensteuer-rechner/index.html","/file:///home/ubuntu/clawd/deutschlandrechner/dist/elterngeld-rechner/index.html","/file:///home/ubuntu/clawd/deutschlandrechner/dist/elternzeit-rechner/index.html","/file:///home/ubuntu/clawd/deutschlandrechner/dist/geburtstermin-rechner/index.html","/file:///home/ubuntu/clawd/deutschlandrechner/dist/grunderwerbsteuer-rechner/index.html","/file:///home/ubuntu/clawd/deutschlandrechner/dist/kindergeld-rechner/index.html","/file:///home/ubuntu/clawd/deutschlandrechner/dist/kinderzuschlag-rechner/index.html","/file:///home/ubuntu/clawd/deutschlandrechner/dist/krankengeld-rechner/index.html","/file:///home/ubuntu/clawd/deutschlandrechner/dist/midijob-rechner/index.html","/file:///home/ubuntu/clawd/deutschlandrechner/dist/minijob-rechner/index.html","/file:///home/ubuntu/clawd/deutschlandrechner/dist/mutterschutz-rechner/index.html","/file:///home/ubuntu/clawd/deutschlandrechner/dist/pendlerpauschale-rechner/index.html","/file:///home/ubuntu/clawd/deutschlandrechner/dist/promille-rechner/index.html","/file:///home/ubuntu/clawd/deutschlandrechner/dist/renten-rechner/index.html","/file:///home/ubuntu/clawd/deutschlandrechner/dist/rundfunkbeitrag-rechner/index.html","/file:///home/ubuntu/clawd/deutschlandrechner/dist/unterhalts-rechner/index.html","/file:///home/ubuntu/clawd/deutschlandrechner/dist/wohngeld-rechner/index.html","/file:///home/ubuntu/clawd/deutschlandrechner/dist/index.html"],"buildFormat":"directory","checkOrigin":false,"allowedDomains":[],"serverIslandNameMap":[],"key":"YxmPnkWeR40gpaK98l9Mj4tqnis4teIridHXMWwrgCs="});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = null;

export { manifest };
