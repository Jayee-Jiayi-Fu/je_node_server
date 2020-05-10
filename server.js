// webpack 打包 - 服务器需要
// 「服务器 bundle」然后用于服务器端渲染(SSR)
// 「客户端 bundle」会发送给浏览器，用于混合静态标记。
// const fs = require("fs");
// const LRU = require("lru-cache");
// // compression middleware: support deflate/gzip
// // const compression = require("compression");
// const server = new (require("koa"))();
// const serverRouter = require("koa-router")();
// const serverStatic = require("koa-send");
// const { isProd, ASSETS_ROOT } = require("./config");
// const { resolve, readFileSync } = require("./src/utils/system");
// const { createBundleRenderer } = require("vue-server-renderer");

// // 生成渲染器
// let renderer;
// let readypromise;
// const templatePath = "./src/template/index.template.html";

// function createRenderer(bundle, options) {
//   return createBundleRenderer(
//     bundle,
//     Object.assign(options, {
//       cache: new LRU({
//         max: 1000,
//         maxAge: 1000 * 60 * 15,
//       }),
//       baseDir: resolve(__dirname, "./dist"),
//       runInNewContext: false,
//     })
//   );
// }
// if (isProd) {
//   const template = readFileSync(fs, templatePath);
//   const serverBundle = require("./dist/vue-ssr-server-bundle.json");
//   const clientManifest = require("./dist/vue-ssr-client-manifest.json");
//   renderer = createRenderer(serverBundle, {
//     template,
//     clientManifest,
//   });
// } else {
//   // 开发环境中：开启dev server 来热重载
//   readyPromise = require("./build/setup-dev-server")(
//     server,
//     templatePath,
//     (bundle, options) => {
//       renderer = createRenderer(bundle, options);
//     }
//   );
// }

// //渲染函数
// const serverInfor = `koa/${
//   require("koa/package.json").version
// } vue-server-renderer/${require("vue-server-renderer/package.json").version}`;

// async function render(ctx) {
//   const s = Date.now();

//   ctx.type = "html";
//   ctx.append("Server", serverInfor);

//   const context = {
//     url: ctx.url,
//   };

//   ctx.body = await renderer.renderToString(context);

//   if (!isProd) {
//     console.log(ctx.method, ctx.url);
//     console.log(`whole request: ${Date.now() - s}ms`);
//   }
// }

// // 静态资源缓存

// // 服务器与路由配置
// serverRouter.get("/static/js/client.js", serve);
// serverRouter.get(
//   "*",
//   isProd ? render : (ctx) => readyPromise.then(() => render(ctx))
// );
// server.use(serverRouter.routes());

// // 错误处理
// server.on("error", (err, ctx) => {
//   if (err.url) {
//     ctx.redirect(err.url);
//   } else if (err.code === 404) {
//     ctx.status = 404;
//     ctx.body = "404 | Page Not Found";
//   } else {
//     // Render Error page and redirect
//     ctx.status = 500;
//     ctx.body = "500 | Internet Server Error";
//     console.error(`error during render: ${ctx.url}`);
//     console.error(err.stack);
//   }
// });

// const port = process.env.PORT || 3000;
// server.listen(port, () => {
//   console.log(`server started at http://localhost:${port}`);
// });
