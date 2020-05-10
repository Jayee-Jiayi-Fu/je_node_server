const NODE_ENV = JSON.stringify(process.env.NODE_ENV || "production");
const SERVER_ENV = {
  NODE_ENV,
  VUE_ENV: "server",
};
const CLIENT_ENV = {
  NODE_ENV,
  VUE_ENV: "client",
};

const PORT = 3000;
const OPEN_BROWSER = true;
const ASSETS_PUBLIC_PATH = "/"; // Todo: 静态资源发布CDN之后的地址
const ASSETS_SUB_PATH = "static/";
const PROXY = {};

module.exports = {
  NODE_ENV,
  SERVER_ENV,
  CLIENT_ENV,
  PORT,
  OPEN_BROWSER,
  ASSETS_PUBLIC_PATH,
  ASSETS_SUB_PATH,
  PROXY,
};
