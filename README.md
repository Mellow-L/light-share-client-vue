# 图文分享平台

一个基于 Vue 3构建的移动端Web应用，实现了文章浏览、发布、评论、用户登录注册、查看个人中心等功能。

## 技术栈

*   **前端框架**: [Vue 3](https://vuejs.org/) (使用 Composition API 和 `<script setup>`)
*   **UI 组件库**: [NutUI 4.x](https://nutui.jd.com/h5/vue/4x/#/zh-CN/component/) - 京东风格的移动端组件库
*   **状态管理**: [Pinia](https://pinia.vuejs.org/) - Vue 官方推荐的状态管理库
*   **路由**: [Vue Router 4.x](https://router.vuejs.org/)
*   **HTTP 请求**: [Axios](https://axios-http.com/)
*   **图标库**: `@nutui/icons-vue` (NutUI 内置) 和 `@arco-design/web-vue/es/icon` (部分组件可能用到)
*   **JavaScript 工具**:
    *   `qs` (用于序列化请求参数)
    *   `crypto-js` (用于本地存储加密)
    *   `browser-image-compression` (用于图片上传前压缩)
*   **构建工具**: Vue CLI (根据项目结构推断)
*   **代码规范**: (如果使用了 ESLint, Prettier 等，请列出)

## 快速开始

### 先决条件

*   [Node.js](https://nodejs.org/) (建议 LTS 版本，例如 v16.x 或 v18.x)
*   npm 或 yarn

### 安装依赖

在项目根目录下运行：

```bash
npm install
# 或者
# yarn install
```

### 开发环境运行

```bash
npm run serve
# 或者
# yarn serve
```

应用默认会在 `http://localhost:8080` (或其他 Vue CLI 配置的端口) 启动。

### 生产环境构建

```bash
npm run build
# 或者
# yarn build
```

构建后的静态文件会输出到 `dist` 目录。

## 项目配置

### 关键配置

*   **后端 API 地址**: 后端服务的基地址配置在 `src/stores/basic-data.js` 文件中的 `baseUrl` 和 `imageBaseUrl` 常量。请根据您的后端部署情况进行修改。
    ```javascript
    // src/stores/basic-data.js
    // export const imageBaseUrl = 'http://YOUR_BACKEND_IP_OR_DOMAIN:PORT'
    // export const baseUrl = imageBaseUrl + "/"
    // export const imgUploadUrl = imageBaseUrl + '/uploadimage'
    ```
*   **Pinia 本地存储加密密钥**: `src/stores/user.js` 文件中的 `KEY` 常量用于加密持久化的用户状态。
    ```javascript
    // src/stores/user.js
    // const KEY = "dfjoiefqi421" // 出于安全考虑，生产环境中建议使用更复杂的密钥或环境变量
    ```

## 主要功能

*   **用户模块**:
    *   用户注册与登录 (JWT 认证)
    *   Token 持久化与加密存储
    *   自动登录与 Token 过期处理 (尝试自动续期)
    *   个人资料查看与编辑 (昵称、头像修改)
    *   修改密码
    *   登出
*   **文章模块**:
    *   文章列表展示 (首页、所有文章、我的文章)
    *   下拉刷新与无限滚动加载
    *   搜索文章 (支持防抖自动搜索和手动按钮搜索)
    *   查看文章详情
    *   发布新文章 (包含标题、简介、封面图、图文内容块)
    *   编辑已有文章
    *   删除文章 (作者本人操作，带确认提示)
    *   文章点赞/取消点赞
*   **评论模块**:
    *   查看文章下的评论列表 (支持嵌套回复展示)
    *   发表评论 (支持文本和图片)
    *   回复指定评论
    *   删除自己的评论
    *   查看我的评论列表 (支持前端过滤搜索)
*   **其他**:
    *   图片上传与压缩处理
    *   全局消息提示 (成功、失败、警告)
    *   路由导航与页面缓存 (`<keep-alive>`)

