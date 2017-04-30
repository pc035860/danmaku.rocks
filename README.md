# ttv-danmaku

Twitch danmaku layer service.

https://pc035860.github.io/ttv-danmaku/?showstream=1&channel={CHANNEL}

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
