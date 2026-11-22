export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let response = await env.ASSETS.fetch(request);
    if (response.status === 404 && !url.pathname.includes(".")) {
      const target = url.pathname.endsWith("/")
        ? `${url.pathname}index.html`
        : `${url.pathname}.html`;
      response = await env.ASSETS.fetch(new Request(new URL(target, request.url).toString(), request));
    }
    return response;
  }
};
