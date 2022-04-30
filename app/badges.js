import $ from 'jquery';
import { getBadges } from './twitchApi';

const transformBadges = sets => {
  return Object.keys(sets).map(type => {
    const versionsObj = sets[type];
    const versions = Object.keys(versionsObj).map(versionKey => {
      return {
        type: versionKey,
        image_url_4x: versionsObj[versionKey],
      };
    });
    return {
      type,
      versions,
    };
  });
};

const injectCSS = css => {
  const $css = $('<style />');
  $css.attr('type', 'text/css');
  $css.html(css);
  $('head').append($css);
};

const getBadgeCSS = (type, version, url) => {
  return `.${type}-${version} { background-image: url("${url.replace(
    'http:',
    'https:'
  )}"); }`;
};

export const loadBadges = channel => {
  return getBadges(channel).then(badgeSets => {
    let css = '';

    transformBadges(badgeSets).forEach(badge => {
      badge.versions.forEach(version => {
        css +=
          getBadgeCSS(badge.type, version.type, version.image_url_4x) + '\n';
      });
    });
    injectCSS(css);
  });
};
