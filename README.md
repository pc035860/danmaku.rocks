# danmaku.rocks

Twitch danmaku player & overlay service.

### Player

https://danmaku.rocks/{CHANNEL}

### Overlay

Can be used in OBS BrowserSource.

https://danmaku.rocks/overlay/{CHANNEL}

## Install

```sh
# get submodules
git submodule update --init --recursive

npm install
# or
yarn install
```

## Develop

```sh
node fuse
# then go to http://localhost:4444
```

## Deploy

```sh
# deploy to docs/
npm run dist

# github pages with docs/
git add -u docs/
git push
```
