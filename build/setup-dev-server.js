const webpack = require("webpack");
// 监控文件变化
const chokidar = require("chokidar");
// 内存文件系统，将 bundle.js 文件打包到了内存中，Holds data in a javascript object
const MFS = require("memory-fs");

const fs = require("fs");
const { readFileSync, resolve } = require("../src/utils/system");
const {
  CLIENT_ENV,
  ASSETS_ROOT,
  ASSETS_PUBLIC_PATH,
  buildAssetsPath,
} = require("../config");
const clientConfig = require("./webpack.client.config");
const serverConfig = require("./webpack.server.config");
const koaWebpack = require("koa-webpack");

const bundlePath = resolve(
  clientConfig.output.path,
  "vue-ssr-server-bundle.json"
);

const manifestPath = resolve(
  clientConfig.output.path,
  "vue-ssr-client-manifest.json"
);
module.exports = async function setupDevServer(app, templatePath, cb) {
  let bundle;
  let template;
  let clientManifest;

  let ready;
  const readyPromise = new Promise((r) => {
    ready = r;
  });

  const update = () => {
    if (bundle && clientManifest) {
      ready();
      cb(bundle, {
        template,
        clientManifest,
      });
    }
  };

  // read template from disk and watch
  template = readFileSync(fs, templatePath);
  chokidar.watch(templatePath).on("change", () => {
    template = readFileSync(fs, templatePath);
    console.log("index.html template updated>>>>>>>>>>>>>>>");

    update();
  });

  // clientconfig 的 hot middleware 和 dev middleware
  clientConfig.output.filename = "static/js/[name].js";
  clientConfig.output.chunkFilename = "static/js/[id].js";
  clientConfig.plugins.push(new webpack.NoEmitOnErrorsPlugin());

  const clientCompiler = webpack(clientConfig);
  const devMiddleware = {
    publicPath: clientConfig.output.publicPath,
    noInfo: false,
    writeToDisk: true,
  };
  const hotClient = {
    allEntries: true,
  };

  const middleware = await koaWebpack({
    compiler: clientCompiler,
    hotClient,
    devMiddleware,
  });
  app.devMiddlewareFs = middleware.devMiddleware.fileSystem;

  clientCompiler.hooks.done.tap("done", async (stats) => {
    stats = stats.toJson();
    stats.errors.forEach((err) => console.error(err));
    stats.warnings.forEach((warn) => console.warn(warn));

    if (stats.errors.length) return;
    clientManifest = await JSON.parse(
      readFileSync(middleware.devMiddleware.fileSystem, manifestPath)
    );
    console.log("manifest update>>>>>>>>>>>>>>>");
    update();
  });

  app.use(middleware);

  // watch and update server renderer
  const serverCompiler = webpack(serverConfig);
  const mfs = new MFS();
  serverCompiler.outputFileSystem = mfs;
  serverCompiler.watch({}, async (err, stats) => {
    if (err) throw err;
    stats = stats.toJson();
    if (stats.errors.length) return;

    bundle = await JSON.parse(readFileSync(mfs, bundlePath));
    console.log("bundle update>>>>>>>>>>>>>>>");
    update();
  });

  return readyPromise;
};
