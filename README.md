# danmaku.rocks

Twitch / YouTube danmaku player & overlay service.

### Player

Twitch player:

https://danmaku.rocks/{CHANNEL}

YouTube player (watch mode):

https://danmaku.rocks/watch.html?provider=youtube&v={YOUTUBE_VIDEO_ID}

### Overlay

Can be used in OBS BrowserSource. (需手動確認)

Twitch overlay:

https://danmaku.rocks/overlay/{CHANNEL}

YouTube overlay:

https://danmaku.rocks/overlay/?provider=youtube&v={YOUTUBE_VIDEO_ID}

### URL Parameters

| Name   | Description                                               |
|------------|----------------------------------------------------|
| provider | Chat source provider. `twitch` (default) or `youtube` |
| channel (`c`) | Twitch channel name. Optional if channel is provided in path |
| video (`v`) | YouTube video id (required when `provider=youtube`) |
| ytproxy (`yp`) | YouTube SSE proxy base URL (default: `https://cloud.pymaster.tw/ndapi`) |
| shownick   | Show user nickname (value: `0` or `1`)           |
| showbadges | Show user badges (value: `0` or `1`)             |
| speed      | Danmaku speed (default value: `100`)             |
| theme      | Optimize danmaku text color for `light` or `dark` background  |
| reverse    | Invert danmaku stream's vertical starting point (value: `0`(from top) or `1`(from bottom)         |
| rect       | Danmaku streams's vertical range in screen percentage (default value: `0,100`)  |
| nochat     | Do not render chat iframe (value: `0` or `1`) |
| showstream | Enable stream iframe rendering (value: `0` or `1`, watch mode enables this automatically) |

#### Parameter Examples (with overlay)

Example URL availability on production deployment is 需手動確認.

- [Basic](https://danmaku.rocks/overlay/lirik)
- [Show Nicknames](https://danmaku.rocks/overlay/lirik?shownick=1)
- [Show Badges](https://danmaku.rocks/overlay/lirik?shownick=1&showbadges=1)
- [Invert Danmaku vertical starting point](https://danmaku.rocks/overlay/lirik?shownick=1&showbadges=1&reverse=1)
- [Show Danmaku between specified vertical range](https://danmaku.rocks/overlay/lirik?shownick=1&showbadges=1&reverse=1&rect=50,100)
- [YouTube overlay](https://danmaku.rocks/overlay/?provider=youtube&v=AO8yfw84kh4)

## Develop

### Install

Clone this repo, then

```sh
# get submodules
git submodule update --init --recursive

yarn install
```

Use Node.js 22 or newer (see `engines` in `package.json`).

For YouTube SSE testing, also install dependencies in your local SSE proxy project:

```sh
npm install
```

### Dev server

```sh
yarn start

# then open the local URL printed in the terminal (Vite default: http://localhost:5173)
```

For YouTube mode (local), run proxy server in another terminal:

```sh
BASE_PATH="" npm run server
```

Then open:

```txt
http://localhost:5173/watch.html?provider=youtube&v=AO8yfw84kh4&showstream=1&shownick=1&showbadges=1&ytproxy=http://localhost:3000
```

If Vite chose another port (for example when 5173 is busy), swap the host/port to match the dev server URL from your terminal.

### Deploy

```sh
# static output goes to docs/ (vite.config.js build.outDir)
yarn build

# optional: commit built assets for a static host that reads /docs from the repo
git add -u docs/
git push
```

Pushes to `master` run `.github/workflows/pages.yml`: checkout with submodules, `yarn install --frozen-lockfile`, `yarn build`, then deploy the `docs/` artifact to GitHub Pages.
