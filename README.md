# danmaku.rocks

Twitch danmaku player & overlay service.

### Player

https://danmaku.rocks/{CHANNEL}

### Overlay

Can be used in OBS BrowserSource.

https://danmaku.rocks/overlay/{CHANNEL}

### URL Parameters

| 設定名稱   | 敘述                                               |
|------------|----------------------------------------------------|
| shownick   | Show user nickname (value: `0` or `1`)           |
| showbadges | Show user badges (value: `0` or `1`)             |
| speed      | Danmaku speed (default value: `100`)             |
| theme      | Optimize danmaku text color for `light` or `dark` background  |
| reverse    | Invert danmaku stream's vertical starting point (value: `0`(from top) or `1`(from bottom)         |
| rect       | Danmaku streams's vertical range in screen percentage (default value: `0,100`)  |

#### Parameter Examples (with overlay)

- [Basic](https://danmaku.rocks/overlay/lirik)
- [Show Nicknames](https://danmaku.rocks/overlay/lirik?shownick=1)
- [Show Badges](https://danmaku.rocks/overlay/lirik?shownick=1&showbadges=1)
- [Invert Danmaku vertical starting point](https://danmaku.rocks/overlay/lirik?shownick=1&showbadges=1&reverse=1)
- [Show Danmaku between specified vertical range](https://danmaku.rocks/overlay/lirik?shownick=1&showbadges=1&reverse=1&rect=50,100)

## Develop

### Install

Clone this repo, then

```sh
# get submodules
git submodule update --init --recursive

yarn install
```

### Dev server

```sh
node fuse
or
yarn start

# then go to http://localhost:4444
```

### Deploy

```sh
# deploy to docs/
yarn dist

# github pages with docs/
git add -u docs/
git push
```
