import { defineConfig } from "dumi";

const repo = "bitlap";

export default defineConfig({
  title: repo,
  favicon:
    // "https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png",
    "/logo.png",
  logo:
    // "https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png",
    "/logo.png",
  outputPath: "docs-dist",
  mode: "site",
  hash: true,
  // Because of using GitHub Pages
  // base: `/${repo}/`,
  // publicPath: `/${repo}/`,
  locales: [
    ["zh-CN", "中文"],
    ["en-US", "English"]
  ],
  navs: {
    "zh-CN": [
      // null,
      {
        title: "实验室",
        children: [
          { title: "smt", path: "/lab/smt" },
          { title: "zim", path: "/lab/zim" }
        ]
      },
      {
        title: "GitHub",
        path: "https://github.com/bitlap/bitlap"
      }
    ],
    "en-US": [
      // null,
      {
        title: "Lab",
        children: [
          { title: "smt", path: "/en-US/lab/smt" },
          { title: "zim", path: "/en-US/lab/zim" }
        ]
      },
      {
        title: "GitHub",
        path: "https://github.com/bitlap/bitlap"
      }
    ]
  }
  // more config: https://d.umijs.org/config
});
