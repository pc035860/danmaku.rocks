import $ from 'jquery';
import { default as api, getChannelId } from './twitchApi';

const transformBadges = (sets) => {
  return Object.keys(sets).map((b) => {
    const badge = sets[b];
    badge.type = b;
    badge.versions = Object.keys(sets[b].versions).map((v) => {
      const version = sets[b].versions[v];
      version.type = v;
      return version;
    });
    return badge;
  });
};

const injectCSS = (css) => {
  const $css = $('<style />');
  $css.attr('type', 'text/css');
  $css.html(css);
  $('head').append($css);
}

const getBadgeCSS = (type, version, url) => {
  return `.${type}-${version} { background-image: url("${url.replace('http:', 'https:')}"); }`;
};

export const loadSubscriberBadges = (channel) => {
  return getChannelId(channel)
  .then((channelId) => {
    return api(`https://badges.twitch.tv/v1/badges/channels/${channelId}/display`);
  })
  .then((res) => {
    let css = '';
    transformBadges(res.badge_sets).forEach((badge) => {
      badge.versions.forEach((version) => {
        css += getBadgeCSS(badge.type, version.type, version.image_url_4x) + '\n';
      });
    });
    injectCSS(css);
  });
};

export const loadGlobalBadges = () => {
  return api('https://badges.twitch.tv/v1/badges/global/display')
  .then((res) => {
    let css = '';
    transformBadges(res.badge_sets).forEach((badge) => {
      badge.versions.forEach((version) => {
        css += getBadgeCSS(badge.type, version.type, version.image_url_4x) + '\n';
      });
    });
    injectCSS(css);
  })
};
