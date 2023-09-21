const CompressionPlugin = require("compression-webpack-plugin");
const BrotliPlugin = require("brotli-webpack-plugin");

module.exports = {
  transpileDependencies: ["vuetify"],

  devServer: {
    proxy: "http://localhost:8000",
  },

  pluginOptions: {
    i18n: {
      locale: "zh-cn",
      fallbackLocale: "zh-cn",
      localeDir: "locales",
      enableInSFC: false,
    },
  },

  outputDir: "./public",

  indexPath: "index.html",

  productionSourceMap: false,

  configureWebpack:
    process.env.NODE_ENV === "production"
      ? {
          plugins: [
            new CompressionPlugin({
              test: /\.(js|css|svg)$/,
            }),
            new BrotliPlugin({
              test: /\.(js|css|svg)$/,
            }),
          ],
        }
      : {},
};
