import { defineConfig } from "dumi";

const repo = "bitlap";

export default defineConfig({
  title: repo,
  favicon:
    "https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png",
  logo:
    "https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png",
  outputPath: "docs-dist",
  mode: "site",
  hash: true,
  // Because of using GitHub Pages
  // base: `/${repo}/`,
  // publicPath: `/${repo}/`,
  navs: {
    "en-US": [
      // null,
      {
        title: "Lab",
        children: [
          { title: "Scala-Macro-Tools", path: "/lab/smt" },
          { title: "Foo", path: "/lab/foo" }
        ]
      },
      {
        title: "GitHub",
        path: "https://github.com/bitlap/bitlap"
      }
    ],
    "zh-CN": [
      // null,
      {
        title: "实验室",
        children: [
          { title: "Scala-Macro-Tools", path: "/zh-CN/lab/smt" },
          { title: "Foo", path: "/zh-CN/lab/foo" }
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
