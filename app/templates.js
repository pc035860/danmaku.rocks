export const extraEmote = (emote) => {
  return `<img class="emoticon ${emote.source}-emo-${emote.id}"
            src="${emote['1x']}"
            srcset="${emote['2x']} 2x, ${emote['3x']} 4x"
          />`;
};

export const emote = (id) => {
  return `<img class="emoticon ttv-emo-${id}"
            src="//static-cdn.jtvnw.net/emoticons/v1/${id}/1.0"
            srcset="
              //static-cdn.jtvnw.net/emoticons/v1/${id}/2.0 2x,
              //static-cdn.jtvnw.net/emoticons/v1/${id}/3.0 4x"
          />`;
};

export const cheer = (url) => {
  return `<img class="emoticon cheermote" src="${url}" />`;
};
