// const express = require("express");
const Koa = require("koa");
const Router = require("koa-router");
const serve = require("koa-static");
const mount = require("koa-mount");
const path = require("path");
const fs = require("fs");
const LRU = require("lru-cache");
// const compress = require("koa-compress");
const { createBundleRenderer } = require("vue-server-renderer");

const isProd = process.env.NODE_ENV === "production";
const port = 3000;
const app = new Koa();
const router = new Router();
const templatePath = path.resolve(__dirname, "./src/web/cms/index.html");
const serverInfor = `koa/${
  require("koa/package.json").version
} vue-server-renderer/${require("vue-server-renderer/package.json").version}`;

let renderer;
let readypromise;

function createRenderer(bundle, options) {
  return createBundleRenderer(
    bundle,
    Object.assign(options, {
      cache: new LRU({
        max: 1000,
        maxAge: 1000 * 60 * 15,
      }),
      basedir: path.resolve(__dirname, "./dist"),
      runInNewContext: false,
    })
  );
}

// 根据环境确定 renderer
// 生产环境中可直接用于生产返回
// 开发环境是一个promise
if (isProd) {
  const serverBundle = require("./dist/vue-ssr-server-bundle.json");
  const clientManifest = require("./dist/vue-ssr-client-manifest.json");
  const template = fs.readFileSync(templatePath, "utf-8"),
    renderer = createRenderer(serverBundle, { clientManifest, template });
} else {
  // 开发环境中：开启dev server 来热重载
  readyPromise = require("./build/setup-dev-server")(
    app,
    templatePath,
    (serverBundle, options) => {
      renderer = createRenderer(serverBundle, options);
    }
  );
}

// 调用renderer，组装响应
async function render(ctx, next) {
  ctx.type = "html";
  ctx.append("Server", serverInfor);

  let context = ctx.content || {};
  context = Object.assign({ url: ctx.originalUrl }, context);

  const result = await renderer.renderToString(context);
  ctx.response.body = result;
}

// app.use(compress({ threshold: 0 }));
app.use(serve("./src/web/cms/public"));
app.use(serve("./dist"));

router.get(
  "*",
  isProd ? render : (ctx, next) => readyPromise.then(() => render(ctx, next))
);
app.use(router.routes());

app.on("error", (err, ctx) => {
  if (err.url) {
    ctx.redirect(err.url);
  } else if (err.code === 404) {
    ctx.status = 404;
    ctx.body = "404 | Page Not Found";
  } else {
    // Render Error Page or Redirect
    ctx.status = 500;
    ctx.body = "500 | Internal Server Error";
    console.error(`error during render : ${ctx.url}`);
    console.error(err.stack);
  }
});

app.listen(port, () => {
  console.log(`Listening on: ${port}`);
  console.log(`Open in browser: http://localhost:${port}`);
});

// // const express = require("express");
// const path = require("path");
// const fs = require("fs");
// const Router = require("koa-router");
// const mount = require("koa-mount");
// // const compress = require("koa-compress");

// const Koa = require("koa");
// const LRU = require("lru-cache");
// const serve = require("koa-static");
// const { createBundleRenderer } = require("vue-server-renderer");

// const { isProd, PORT, ASSETS_ROOT } = require("./config");

// class SSRApp {
//   constructor({
//     templatePath = "",
//     bundlePath = "",
//     manifestpath = "",
//     setupPath = "",
//     cacheConfig = {},
//     baseDir = "",
//     assetspaths = [],
//     router,
//   }) {
//     this.templatePath = templatePath;
//     this.bundlePath = bundlePath;
//     this.manifestpath = manifestpath;
//     this.setupPath = setupPath;

//     this.app = new Koa();
//     this.router = router;
//     this.cacheConfig = cacheConfig;
//     this.baseDir = baseDir;

//     this.renderer;
//     this.readyPromise;

//     if (isProd) this.setRenderer();
//     else this.setReadyPromise();

//     this.setRouter(assetspaths);

//     return this.app;
//   }

//   getTemplate() {
//     return fs.readFileSync(this.templatePath, "utf-8");
//   }
//   getBundle() {
//     return require(this.bundlePath);
//   }
//   getManifest() {
//     return require(this.manifestpath);
//   }
//   setRenderer(
//     bundle = this.getBundle(),
//     manifest = this.getManifest(),
//     template = this.getTemplate()
//   ) {
//     const { cacheConfig, basedir } = this;
//     const cache = new LRU(cacheConfig);

//     this.renderer = createBundleRenderer(bundle, {
//       template,
//       manifest,
//       cache,
//       basedir,
//       runInNewContext: false,
//     });
//   }

//   setReadyPromise() {
//     const { app, templatePath, setupPath } = this;
//     this.readyPromise = require(setupPath)(
//       app,
//       templatePath,
//       (bundle, manifest, template) => {
//         this.setRenderer(bundle, manifest, template);
//       }
//     );
//   }
//   setRouter(assetspaths = []) {
//     // 静态资源
//     // app.use(compress({ threshold: 0 }));
//     assetspaths.map((path) => {
//       this.app.use(serve(path));
//     });

//     this.router.get("*", async (ctx, next) => {
//       ctx.type = "html";

//       let context = ctx.content || {};
//       context = Object.assign(context, { url: ctx.originalUrl });

//       let result;

//       if (isProd) {
//         result = await this.renderer.renderToString(context);
//         ctx.response.body = result;
//       } else {
//         this.readyPromise.then(async () => {
//           // result = await this.renderer.renderToString(context);
//           // console.log(result);
//           ctx.response.body = "hello";
//         });
//       }
//     });

//     // 自定义路由
//     this.app.use(this.router.routes());
//   }
// }

// const app = new Koa();
// const cmsApp = new SSRApp({
//   templatePath: "./src/web/cms/index.html",
//   bundlePath: "./dist/vue-ssr-server-bundle.json",
//   manifestpath: "./dist/vue-ssr-client-manifest.json",
//   setupPath: "./build/setup-dev-server",
//   cacheConfig: {
//     max: 1000,
//     maxAge: 1000 * 60 * 15,
//   },
//   baseDir: ASSETS_ROOT,
//   assetspaths: [],
//   router: new Router(),
// });
// app.use(mount("/cms", cmsApp));

// app.on("error", (err, ctx) => {
//   if (err.url) {
//     ctx.redirect(err.url);
//   } else if (err.code === 404) {
//     ctx.status = 404;
//     ctx.body = "404 | Page Not Found";
//   } else {
//     // Render Error Page or Redirect
//     ctx.status = 500;
//     ctx.body = "500 | Internal Server Error";
//     console.error(`error during render : ${ctx.url}`);
//     console.error(err.stack);
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Listening on: ${PORT}`);
//   console.log(`Open in browser: http://localhost:${PORT}`);
// });
