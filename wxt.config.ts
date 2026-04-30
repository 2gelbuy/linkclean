import { defineConfig } from "wxt";

const EXT_NAME = "__MSG_extName__";
const EXT_DESC = "__MSG_extDesc__";
const EXT_VERSION = "1.3.3";
const EXT_HOMEPAGE = "https://konabayev.com/linkclean/";

export default defineConfig({
  srcDir: "src",
  publicDir: "src/public",
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: EXT_NAME,
    default_locale: "en",
    description: EXT_DESC,
    version: EXT_VERSION,
    homepage_url: EXT_HOMEPAGE,
    icons: {
      16: "icon/16.png",
      32: "icon/32.png",
      48: "icon/48.png",
      128: "icon/128.png",
    },
    permissions: ["storage"],
    host_permissions: ["https://www.google-analytics.com/*"],
    browser_specific_settings: {
      gecko: {
        id: "linkclean@konabayev.com",
        strict_min_version: "109.0",
      },
      edge: {
        browser_action_next_to_addressbar: false,
      },
    },
  },
  browser: "chrome",
});
