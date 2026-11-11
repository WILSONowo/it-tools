# 在线工具箱代码审查（2026-11-11）

审查范围：`main` @ `6ab379c`，109 个工具 + 应用框架。只读审查，未修改任何代码。
大部分问题已用 node / vitest 片段实际复现，标注「未验证」的仅为读代码推断。

基线：`pnpm lint` 0 错误 / 33 警告；`pnpm typecheck` 通过；`vitest` 17 个文件 62 个用例全过；`pnpm build` 通过。
测试覆盖：新增的约 57 个工具中只有 `cidr-aggregator` 有单元测试。

> **修复进度（2026-11-11 第一批）**：已修复 #1、#2（含 SVG 文本 XML 转义）、#4、#6、#8、#10、#11、#12、#14，并顺带修复：正则替换 `$1` 实际取到第 2 组的错位、text-compare「忽略空白」会把全文合成一行、ffmpeg 进度回调只绑定首个工具、加载失败被永久缓存。新增 5 个单元测试文件（共 82 个用例全部通过）。

---

## P0 —— 安全 / 结果错误 / 页面崩溃或卡死

### 横向问题（影响多个工具，一处修好收益最大）

| # | 问题 | 位置 | 影响 | 修复 |
|---|---|---|---|---|
| 1 | `n-checkbox` 用了 `v-model:value`（应为 `checked`），`n-switch` 用了 `v-model:checked`（应为 `value`） | checkbox：ascii-table:5-6、checksum-bcc-lrc:18、chinese-pinyin:36、morse-code-translator:16、text-compare:29-31、text-entropy:31-32；switch：barcode-generator:15、text-to-html-table:25 | 这些选项点了**完全没反应** | 互换绑定 |
| 2 | `utils/base64.ts:4` 直接 `window.btoa/atob`，仅支持 Latin-1 | base64-string-converter、basic-auth-generator、svg-placeholder-generator | 输入中文/emoji 直接抛异常，computed 崩溃；解码中文得到乱码 | 用 `TextEncoder/TextDecoder`，并包 `withDefaultOnError` |
| 3 | 密码/Token/OTP 密钥/洗牌都用 `Math.random` | password-generator:110-121、token-generator.tool:101-110、utils/random.ts、otp.service:139、random-hex-generator | 非密码学随机，可被预测 | 统一 `secureRandomInt(n)`（`crypto.getRandomValues` + 拒绝采样） |
| 4 | `randIntFromInterval(min,max)` 不含 max，但新工具按「含 max」调用 | random-json-data-generator:34,60,72；random-data-generator:83,97,106,147；lorem-ipsum | 默认配置下布尔值永不出现、字母 z 永不出现、hex/UUID 永不含 `f`、最后一个域名永不出现 | 新增 `randIntInclusive` 并替换调用 |
| 5 | `useCopy` / `InputCopyable` / `TextareaCopyable` 不检查剪贴板是否可用 | composable/copy.ts:10-13 等 | Docker 镜像走 HTTP 局域网访问时，提示「已复制」但实际没复制 | 检查 `isSupported`，降级 `execCommand('copy')`，失败提示错误 |

### 单个工具

| # | 工具 | 问题 | 修复 |
|---|---|---|---|
| 6 | regex-tester:208 | 取消勾选 `g` 后替换循环 `while(regex.exec())` **死循环卡死标签页** | 非 global 时只 exec 一次 |
| 7 | regex-tester | 灾难性回溯（`(a+)+$` 对 27 个 a+b 耗时 9.6s），每次按键同步执行 | Web Worker + 超时 + 防抖 |
| 8 | hash-text:45、hmac-generator:60 | 标注 SHA3 实际是 Keccak-512（`abc` 得 `18587dc2…`，正确为 `b751850b…`） | 改用 hash-wasm `createSHA3(512)`，或改名 Keccak |
| 9 | data-masking.service | 手机/卡号规则先于身份证执行且无数字边界 → 身份证中出生年份泄露；姓名规则误伤普通文字（「今天天***」） | 身份证规则优先，加 `(?<!\d)…(?!\d)`，姓名规则改为可选/关键词锚定 |
| 10 | 4 个音视频工具（cut-audio:147、audio-converter:154、video-to-audio:165、video-converter:189） | ffmpeg worker 抛的是字符串，`(e as Error).message` 为 undefined → **所有失败都静默**，无任何提示 | `e instanceof Error ? e.message : String(e)`，附带 ffmpeg 日志尾部 |
| 11 | _media/ffmpeg-loader.ts:45-50 | 忽略 exec 返回码；失败时跳过 deleteFile，几百 MB 输入滞留在 MEMFS | 检查 `ret !== 0`，清理放 `finally` |
| 12 | video-converter:109 | 内置 ffmpeg-core 未编译 libaom，AV1 选项必然失败 | 删除该选项 |
| 13 | image-compressor:256 | 「PNG 无损」实际 `UPNG.encode(...,256)` 量化为 256 色，是有损 | `cnum=0` 或改标签 |
| 14 | text-compare/text-diff.service:43-62 | 回溯越界，相同文本也显示 1 行新增，右侧行号整体 +1 | 循环条件改 `d > 0` |
| 15 | rsa-encrypt-decrypt:93,106 | OAEP 哈希选择未传给 forge，永远是 SHA-1 | 传 `{ md, mgf1: { md } }` |
| 16 | rsa-sign-verify:138,161 | `forge.md.sha224` 不存在，选 SHA224 必报错 | `forge.md.sha512.sha224` 或去掉 |
| 17 | otp.service:35 | 密钥长度非 8 的倍数时多出半个字节，TOTP 码错误（26 位密钥 counter=1：812938 vs 正确 744635） | 丢弃不足 8 位的剩余 bit，并去空格 |
| 18 | uuid-generator:91-102 | ULID 用 base36、16 位，不符合规范（应为 26 位 Crockford Base32） | 按规范重写 |
| 19 | random-data/json-data-generator | 手写 UUID 为 9-4-4-4-11，无版本位 | `crypto.randomUUID()` |
| 20 | url-batch-generator:112,124 | 笛卡尔积无上限，10 参数×10 值 = 1e10 条 → 卡死 | 加上限提示 |
| 21 | unix-time-converter:94 | 偏移量显示的是浏览器时区（选 UTC 仍显示 +08:00） | 用 date-fns-tz 的 `format(..., { timeZone })` |
| 22 | integer-base-converter.model:12 | 用 `Number`，超过 2^53 丢精度（`2^64-1` → `10000000000000000`）；大写 `FF` 报错 | 改 BigInt，不区分大小写 |

---

## P1 —— 功能缺陷 / 明显错误输出

**应用框架**
- `tools.store.ts:8`、`CollapsibleToolMenu.vue:45-65`：localStorage 值损坏（如 `"null"`）→ 整站白屏。加容错 serializer 与 `?? []`。
- `router.ts`：无 `router.onError`，重新部署后旧标签页点任何工具都静默失败。检测动态导入失败后整页跳转。
- 移动端（≤700px）选择工具后菜单抽屉与遮罩不收起。
- 工具间切换不重置滚动位置（滚动容器是 `.n-layout-scroll-container`）。
- `main.ts:9-18`：Service Worker 注销未 await 就 reload；同时 VitePWA 仍生成 sw.js/manifest。二选一：移除 VitePWA，或改为自毁型 sw。
- `tool.layout.vue:41-52`：说明面板把 Markdown 表格分隔行 `| --- |` 当数据行渲染（audio-converter、video-to-audio、video-to-gif 可见）。`rich()` 的转义已确认安全。
- `FormatTransformer.vue:18`：「清空」按钮按 output 禁用，应按 input。

**加密安全**
- encryption:100：错误密钥时 `Malformed UTF-8` 抛出导致页面崩溃。
- bcrypt:69：每次按键同步 `hashSync`；清空 cost 抛错；超 72 字节截断无提示；「盐迭代次数」应为「成本因子」。
- argon2:95,112：`computedAsync` 吞掉错误，参数非法时仍显示旧哈希/旧的「匹配」。
- file-hash:122：整文件读入内存 + 8 次同步 WASM 计算阻塞 UI；1GB 限制未生效；换文件有竞态。
- bip39:134：拒绝 24 词（256 bit），却接受 64 bit。
- password-strength.service：熵未计入常见词惩罚（`Password123!` ≈ 170 万年）；超长显示 `Infinityk 年`。
- morse-code.service:73：不勾选「/」时单词无法还原；说明写「三格」与实现不符。
- token-generator.service:23-24：字母表漏了 `N`/`n`，符号重复。
- jwt-parser：数组/对象 claim 被 `_.toString` 拍平。

**格式转换 / 网页开发**
- ip-number-converter:76：`::ffff:1.2.3.4` 无法识别；该分支本身也算错；`BigInt('abc')` 未捕获。
- json-to-markdown-table:120-123：MD→JSON 把分隔行当数据；`\|` 拆分错误，无法回转自己的输出。
- json-to-entity-classes:95,107：对象数组不生成嵌套类；非法标识符/关键字/中文 key 生成不可编译代码。
- color-converter:57：输入不完整时其他字段被覆盖为黑色。
- temperature-converter:117：`Math.floor` 取整（37°C → 98.59°F）。
- url-param-formatter:114：`toString` / `__proto__` 等键出错；`+` 不解码；不去 `#fragment`。
- downloadBase64.ts:32：无 `data:` 前缀时下载到的是网站自身页面（未验证）。
- url-batch-generator:23,61：静态 `label` 里写 `{{ }}` 原样显示；复制用逗号拼接。
- base64-string-converter/index.ts:7：描述承诺 URL-safe/Base32/Hex，实际没有。
- punycode-converter:36：整条 URL 被错误编码；未转小写。
- case-converter:63：删除数字与中文（`oauth2 token v3` → `oauth_token_v`）。
- url-encoder:92：解码校验监听了错误的输入；说明中关于 `encodeURIComponent` 的描述错误。
- chinese-pinyin:87：「转换」按钮 `refresh()` 为空操作。
- device-information:36：Safari < 16.4 无 `screen.orientation` 会崩溃（未验证）。

**图片 / 音视频**
- ffmpeg-loader:13-16：进度回调只绑定首个加载的工具；「正在加载… (仅首次)」文案其实显示的是执行进度。
- ffmpeg-loader:9,11：加载失败的 Promise 被永久缓存，网络抖一次需刷新页面。
- 5 个音视频工具共享一个 ffmpeg 实例，无互斥、无取消、卸载时不清理；固定文件名 `input.mp4` 可能被另一工具删除（未验证）。
- 对象 URL 不释放：4 个音视频工具的输出、image-compressor:316、image-converter:232、image-to-ico:192 —— 每次重跑泄漏整个输出 Blob。
- image-crop:226-266：预设用显示尺寸而非原始像素，裁剪框位置/大小错；一寸/两寸只设比例，不输出 295×413。
- image-compressor:225,247：照片预设直接拉伸变形；`keepMeta` 选项无效。
- qrcode-reader：权限弹窗期间卸载 → 摄像头常亮；每帧新建 canvas + 全分辨率识别。
- image-converter:240：ZIP 内同名文件（a.png / a.jpg → a.webp）互相覆盖。
- image-to-ico:105：提供 512 尺寸，超出 ICO 规范上限 256。

**开发调试 / 网络 / 数学 / 测量 / 文本**
- random-json-data-generator:70：「深度」设置无效，字段数被卡在 3。
- ipv6-expand-compress:302-318：带 `::` 的嵌入 IPv4（`::ffff:192.0.2.1`）与 zone id 被判无效。
- date-calculator:37：用 30.44 天/月近似（2/1→3/1 显示「1 个月 -2 天」）。改用 `intervalToDuration`。
- endian-converter:101：去掉 `0x` 后按十进制解析（`0x10` → 10）。
- json-key-renamer:29,89：大小写转换选项从未调用。
- text-entropy:17：emoji 等非 BMP 字符分母错误。
- text-to-html-table:328-336：生成两个 `style` 属性，对齐丢失。
- ieee754-converter:102：0/次正规数指数显示错；float32 溢出未显示 Infinity。
- eta-calculator:19：清空输入后 `formatRelative` 抛错（未在浏览器验证）。
- math-calculators:20-24：末尾逗号多出一个 0；LCM(0,0) = NaN。
- json-minify / json-viewer：JSON5 解析使大整数丢精度、`NaN` 变 `null`；验证器拒绝合法的 `0`/`false`/`null`。
- ipv4-subnet-calculator：「子网掩码」行显示的是 CIDR；255.255.255.0/24 的「下一个子网」回绕到 0.0.0.0。
- common-ports：7001 不是 Consul（应为 8500/8300），Jupyter 默认 8888。

---

## P2 —— 性能

| 问题 | 位置 | 建议 |
|---|---|---|
| nginx 未开 gzip，`/assets/*` 无长缓存 | nginx.conf | `gzip on; gzip_types … application/wasm;`；`/assets/` 加 `max-age=31536000, immutable` |
| ffmpeg-core.wasm 32 MB 未压缩（gzip 10.3 MB / br 8.4 MB），路径无版本号，`toBlobURL` 复制 32 MB 到主线程且不检查 `res.ok` | nginx.conf、ffmpeg-loader:25-26 | 版本化路径 + immutable + `gzip_static`；同源直接传 URL |
| mac-address-lookup 静态导入 3.4 MB OUI 数据 | mac-address-lookup.vue:2 | 改为按需 fetch 压缩/分片 JSON |
| html-wysiwyg-editor 941 KB（大部分是 prettier），每次编辑同步格式化 | html-wysiwyg-editor | 防抖 + 显示代码视图时才 `import('prettier')` |
| 完整 lodash（约 70 KB）进入入口包 | tracker.services.ts:1、plausible.plugin.ts:2 | 改原生写法或统一 `lodash-es` |
| 首页 ↔ 工具切换整套布局重挂载（侧栏 109 项、Fuse 索引重建） | App.vue、tool.layout.vue:75 | BaseLayout 常驻，工具头部条件渲染 |
| date-time-converter 空输入时 `useNow()` 按 60fps 重渲染 9 个格式 | date-time-converter:133 | `useNow({ interval: 1000 })` |
| ascii-art-generator 一次性导入并解析 10 个字体（≈207 KB） | ascii-art-generator:37-66 | 按选择 `import()` |
| text-compare 每次按键对每对变更行建 n×m 表 | text-compare | 防抖 + 更轻量的字符级 diff |
| 生成器同步生成上限极大（10⁴×10⁶ 等） | password/token generator | 降低上限或分批 |
| http-status-codes/index.ts 为生成 keywords 导入整张状态码表进入口包 | http-status-codes/index.ts:4 | 预先写好 keywords |

---

## P3 —— 代码结构与可维护性

- **重复代码**：5 个音视频工具的 `onPick/reset/download/模板` 几乎一致 → 抽 `useFfmpegJob()`（进度、取消、URL 生命周期、错误格式化）；4 个图片工具的 `loadImage/downloadOne/downloadAllZip` → 抽到 `utils/image-encode.ts` 并加 `downloadBlob()`；password 与 token 生成器约 90% 重复；3 套 IPv4 解析工具函数；多个随机生成器各自实现复制/下载。
- **死代码**：rsa-encrypt-decrypt.service.ts 未被引用；token-generator.service 已不被自身工具使用；base-encoding 的 `A91`；rmb-case `two`；random-json-data-generator 的 name/types/array 分支；`notFavoriteTools`；`TextareaCopyable.vue:61` 恒真分支；SearchBar `default-value="'aa'"`。
- **依赖**：`@vueuse/router@9` 与 `@vueuse/core@8` 并存（两份 `@vueuse/shared`），且只有 hash-text 在用。
- **两份 `formatBytes`** 输出格式不一致（utils/convert.ts vs utils/image-encode.ts）；image-crop 又自己实现了一份。
- **本地化残留**：PWA manifest 名称 `IT Tools`、`lang: fr-FR`；收藏按钮提示、`useCopy` 默认文案、`Copy to clipboard`、FormatTransformer 的 Input/Output 仍为英文；标题后缀「IT Tools / IT-Tools / 在线工具箱」不统一；页脚版本与 commit 链接指向上游仓库（fork 的 SHA 会 404）。
- **收藏以工具显示名为键**：改名后用户收藏会丢失，建议改用 path。
- **说明文字纠错**：hash-text 建议「加盐快速哈希」存密码（应推荐 bcrypt/Argon2）；encryption 未说明 crypto-js 用单次 MD5 派生密钥；Base62 字母表顺序与代码不符；Morse「三格」；NATO 应为 Alfa/Juliett。
- **lint 警告**：33 条，多数为未使用变量，可一并清理。
- **测试**：建议优先为 P0 中的 service（random、base64、text-diff、otp、data-masking、rmb-case、cidr、ipv6）补单元测试。

---

## 建议修复顺序

1. **一小时内可完成、收益最大**：#1 checkbox/switch 绑定、#2 base64 UTF-8、#4 随机区间、#6 正则死循环、#10 ffmpeg 错误提示、#14 diff 越界、#8 SHA3。
2. **安全相关**：#3 安全随机、#9 脱敏、#5 复制失败提示。
3. **各工具 P0/P1 逐个修复**，每修一个补对应单元测试。
4. **部署性能**：nginx gzip/缓存、ffmpeg 版本化、MAC 数据按需加载、lodash。
5. **重构**：音视频与图片工具抽公共 composable、合并重复工具函数、清理死代码与英文残留。
