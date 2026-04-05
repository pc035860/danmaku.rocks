/* global gtag */

import './sass/index.scss';

import $ from 'jquery';
import Danmaku from '_Danmaku';
import raf from 'raf';
import { parse as parseQuery, stringify as makeQuery } from 'query-string';

import createSocketEmitter from './createSocketEmitter';
import createYoutubeSseEmitter from './createYoutubeSseEmitter';
import parseTags, { defaultColors } from './parseTags';
import parseEmotes from './parseEmotes';
import * as colors from './utils/colors';
import { loadBadges } from './badges';
import { get as getCheers } from './cheers';
import { getChannel } from './twitchApi';
import boolish from './utils/boolish';
import createWatchParams from './createWatchParams';
import createDanmakuRectHandler from './createDanmakuRectHandler';

import { siteName as SITE_NAME } from './config';

const EVT_FULLSCREEN =
  'fullscreenchange mozfullscreenchange webkitfullscreenchange msfullscreenchange';
const DEFAULT_CHANNEL = 'vtuber_inugamirin';
const GITHUB_REPO_URL = 'https://github.com/pc035860/danmaku.rocks';
const PROVIDER_TWITCH = 'twitch';
const PROVIDER_YOUTUBE = 'youtube';
const DEFAULT_YOUTUBE_PROXY_BASE = 'https://cloud.pymaster.tw/ndapi';

const isOverlay = () => {
  return /\/overlay/.test(location.pathname);
};

const isElementFullscreen = () => {
  return !!(
    document.fullscreenElement ||
    document.mozFullScreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement
  );
};

const rdrToDefaultChannel = () => {
  const params = parseQuery(location.search);
  const q = makeQuery(
    Object.assign(params, {
      c: DEFAULT_CHANNEL,
    })
  );
  location.href = `?${q}`;
};

const rdrToGithubRepo = () => {
  location.href = GITHUB_REPO_URL;
};

const byFrame = (() => {
  let animating = false;
  return fn => {
    return raf(() => {
      if (animating) {
        return;
      }
      animating = true;
      fn();
      animating = false;
    });
  };
})();

/**
 * try to obtain channel from rewrite path
 */
const getPathChannel = () => {
  const buf = location.pathname.split('/');
  const l = buf.length;

  // /{channel} || /{channel}/
  return buf[l - 1] || buf[l - 2];
};

const escapeHtml = message => {
  const text = String(message || '');
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const parseYoutubeTags = (nick, rawTags = {}) => {
  return {
    name: nick,
    displayName: rawTags['display-name'] || nick,
    color: rawTags.color || defaultColors[nick.charCodeAt(0) % 15],
    emotes: null,
    badges: [],
    badgeImages: Array.isArray(rawTags.badgeImages) ? rawTags.badgeImages : [],
    messageIsHtml: !!rawTags.messageIsHtml,
  };
};

const getProvider = params => {
  const provider = String(
    params.get('provider') || params.get('p') || PROVIDER_TWITCH
  ).toLowerCase();
  if (provider === PROVIDER_YOUTUBE) {
    return PROVIDER_YOUTUBE;
  }
  return PROVIDER_TWITCH;
};

const resolveBaseUrl = baseUrl => {
  if (/^https?:\/\//i.test(baseUrl)) {
    return baseUrl.replace(/\/$/, '');
  }
  if (/^\//.test(baseUrl)) {
    return `${location.origin}${baseUrl}`.replace(/\/$/, '');
  }
  return `${location.origin}/${baseUrl}`.replace(/\/$/, '');
};

const getYoutubeSseUrl = (videoId, params) => {
  const proxyBase = params.get('ytproxy') || params.get('yp') || DEFAULT_YOUTUBE_PROXY_BASE;
  const urlBase = resolveBaseUrl(proxyBase);
  return `${urlBase}/youtube/${videoId}/events`;
};

const putYoutubeIframeSrc = (videoId, shouldLoadChat = true) => {
  const domain = location.host.split(':')[0];
  const streamSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&origin=${encodeURIComponent(
    location.origin
  )}`;
  const chatSrc = `https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${encodeURIComponent(domain)}`;
  $('#stream').attr('src', streamSrc);
  if (shouldLoadChat) {
    $('#chat').attr('src', chatSrc);
  } else {
    $('#chat').attr('src', '');
  }
};

const putIframeSrc = (elm, channel) => {
  const $elm = $(elm);

  // 拿 host 去掉 port
  const domain = location.host.split(':')[0];
  const src = $elm
    .data('src')
    .replace('{CHANNEL}', channel)
    .replace('{PARENT}', domain);
  $elm.attr('src', src);
};

const onChannelFetched = (owner, params, provider = PROVIDER_TWITCH) => {
  const boolParam = boolish(() => params.get());

  const isYoutubeProvider = provider === PROVIDER_YOUTUBE;
  const channel = owner.name;
  const $body = $('body');

  if (/\/watch(:?\/|\.html)?$/.test(location.pathname) && !isOverlay()) {
    // watch mode
    params.set('showstream', 1);
    $body.addClass('watch');
  }

  /**
   * Static setup
   */
  {
    if (boolParam('showstream')) {
      const nochat = boolParam('nochat');
      if (isYoutubeProvider) {
        putYoutubeIframeSrc(channel, !nochat);
      } else {
        putIframeSrc('#stream', channel);
        if (!nochat) {
          putIframeSrc('#chat', channel);
        }
      }
      $body.addClass('showstream');
      $body.toggleClass('no-chat', nochat);
    }

    if (!isYoutubeProvider) {
      loadBadges(channel);
      getChannel(channel).then(c => {
        const name = c.display_name || c.name;
        document.title = `${name} - ${SITE_NAME}`;
      });
    } else {
      document.title = `${channel} - ${SITE_NAME}`;
    }
  }

  const cheersPromise = isYoutubeProvider ? Promise.resolve({}) : getCheers(channel);

  /**
   * Danmaku
   */
  const danmaku = new Danmaku();
  const handleDanmakuRect = createDanmakuRectHandler(
    $('#danmaku-position'),
    $('#stream-wrap')
  );
  danmaku.init({
    container: document.getElementById('danmaku-container'),
    speed: params.get('speed'),
    reverse: boolParam('reverse'),
  });
  const danmakuReisze = () => {
    handleDanmakuRect($body.hasClass('stream-fullscreen'));
    danmaku.resize();
  };
  $(window).on('resize', () => {
    byFrame(danmakuReisze);
  });
  $(document).on(EVT_FULLSCREEN, $evt => {
    if (isElementFullscreen()) {
      const isStreamIframe = $evt.target.id === 'stream';
      $body.toggleClass('stream-fullscreen', isStreamIframe);
    } else {
      $body.removeClass('stream-fullscreen');
    }
    danmakuReisze();
  });
  danmakuReisze();
  // TODO: 在調整 nochat 的時候要觸發 danmaku.resize()

  /**
   * Socket
   */
  const socket = isYoutubeProvider
    ? createYoutubeSseEmitter({
      sseUrl: getYoutubeSseUrl(channel, params),
    })
    : createSocketEmitter({
      nick: 'justinfan12345',
      channel: channel,
    });
  const handleMsg = (cheers, nick, rawTags, message) => {
    const tags = isYoutubeProvider
      ? parseYoutubeTags(nick, rawTags)
      : parseTags(nick, rawTags);

    // console.info('$msg', nick, tags.color, message);

    let action = false;
    let linePrepend = ''; // message text line

    if (boolParam('showbadges') && tags.badges) {
      tags.badges.forEach(function (badge) {
        const badgeClass = `${badge.type}-${badge.version}`;
        linePrepend += `<span class="${badgeClass} tag">&nbsp;</span>`;
      });
    }

    if (
      boolParam('showbadges') &&
      tags.badgeImages &&
      Array.isArray(tags.badgeImages)
    ) {
      tags.badgeImages.forEach(badge => {
        if (!badge || !badge.url) {
          return;
        }
        linePrepend += `<img class="tag youtube-badge" src="${badge.url}" alt="${escapeHtml(
          badge.label || ''
        )}" />`;
      });
    }

    if (params.get('theme')) {
      const bgTheme = params.get('theme');

      if (/^#[0-9a-f]+$/i.test(tags.color)) {
        while (colors.calcBgTheme(tags.color) !== bgTheme) {
          tags.color = colors.calcReplacement(
            tags.color,
            colors.calcBgTheme(tags.color)
          );
        }
      }
    }

    if (/^\x01ACTION.*\x01$/.test(message)) {
      // action
      action = true;
      message = message
        .replace(/^\x01ACTION/, '')
        .replace(/\x01$/, '')
        .trim();
    }

    if (!(isYoutubeProvider && tags.messageIsHtml)) {
      message = parseEmotes(cheers, message, tags);
    }

    if (action) {
      // action message
      danmaku.emit({
        html: true,
        text: `${linePrepend}<span class="action" style="color: ${tags.color};">${message}</span>`,
        mode: 'bottom',
      });
    } else if (boolParam('shownick')) {
      // show nick

      let text = `${linePrepend}<span class="nick" style="color: ${
        tags.color
      };">${
        tags.displayName || nick
      }:</span> <span class="message">${message}</span>`;

      if (params.get('highlight') === 'message') {
        text = `${linePrepend}<span class="nick">${
          tags.displayName || nick
        }:</span> <span class="message" style="color: ${
          tags.color
        };">${message}</span>`;
      }

      danmaku.emit({
        html: true,
        text,
      });
    } else {
      // default
      danmaku.emit({
        html: true,
        text: `${linePrepend}<span class="message" style="color: ${tags.color};">${message}</span>`,
      });
    }
  };
  socket.on('$msg', (nick, rawTags, message) => {
    const perfNow = window.performance.now();
    cheersPromise.then(cheers => {
      // skip comments user might not see (page is not visible)
      raf(tickNow => {
        const visibilityDiff = (tickNow - perfNow) / 1000;
        const threshold = danmaku.duration / 5;
        if (visibilityDiff > threshold) {
          console.info('comment skipped');
          return;
        }
        handleMsg(cheers, nick, rawTags, message);
      });
    });
  });

  /**
   * Dynamic setup
   */
  {
    const updateThemeClass = theme => {
      $body.removeClass('theme-dark theme-light').addClass(`theme-${theme}`);
    };
    const updateHighlightClass = highlight => {
      $body
        .removeClass('highlight-nick highlight-message')
        .addClass(`highlight-${highlight}`);
    };
    const parseRect = rect => {
      return rect.split(',').map(v => Number(v));
    };
    const setDanmakuRect = (fromP, toP) => {
      $('#danmaku-container').css({
        top: `${fromP}%`,
        bottom: `${100 - toP}%`,
      });
      danmaku.resize();
    };

    updateThemeClass(params.get('theme'));
    updateHighlightClass(params.get('highlight'));
    setDanmakuRect(...parseRect(params.get('rect')));

    // watch params change
    params.on('change', changes => {
      changes.forEach(({ name, newValue, oldValue }) => {
        switch (name) {
          case 'theme':
            updateThemeClass(newValue);
            break;
          case 'highlight':
            updateHighlightClass(newValue);
            break;
          case 'reverse':
            danmaku.reverse = !!newValue;
            break;
          case 'rect':
            setDanmakuRect(...parseRect(newValue));
            break;
        }
      });
    });
  }
};

$(() => {
  /**
   * parameters
   *
   * @param {string}  channel     channel id
   * @param {boolean} shownick    show nick before message or not (default: "false")
   * @param {string}  highlight   which part will colors be applied "nick" or "message" (default: "nick")
   *                              only works when shownick is activated
   * @param {boolean} showbadges  show badges before message or not (default: "false")
   * @param {string}  theme       target background theme "dark" or "light" (default: "dark")
   * @param {string}  speed       danmaku speed (default: 100)
   *                              see https://github.com/weizhenye/Danmaku#speed for more information
   * @param {boolean} reverse     reverse danmaku's vertical position (default: "false")
   * @param {string}  rect        danmaku's display rect (default: 0,100)
   *
   * @param {boolean} nochat      do not load chat in the first place (default: "false")
   */
  const params = createWatchParams(parseQuery(location.search), {
    channel: 'c', // alias
    provider: 'p',
    video: 'v',
    ytproxy: 'yp',
  });
  const provider = getProvider(params);
  const isYoutubeProvider = provider === PROVIDER_YOUTUBE;

  const paramChannel = params.get('channel');
  const paramVideo = params.get('video');
  const pathChannel = getPathChannel();

  // the most important parameter
  const channel = isYoutubeProvider ? paramVideo : (paramChannel || pathChannel);

  if (!channel) {
    rdrToGithubRepo();
    return;
  }

  const isUsingPathChannel = !paramChannel && !isYoutubeProvider;
  const isWatchMode = isUsingPathChannel && !isOverlay();

  if (isWatchMode) {
    // watch mode
    params.set('showstream', 1);
    $('body').addClass('watch');
  }

  if (isYoutubeProvider) {
    onChannelFetched({ name: channel }, params, provider);
    const eventName = isOverlay() ? 'mode_overlay' : 'mode_player';
    const eventParameters = params.get();
    gtag('event', eventName, {
      ...eventParameters,
      provider,
      channel: channel || eventParameters.v,
    });
    return;
  }

  getChannel(channel).then(
    channelOwner => {
      if (!channelOwner) {
        rdrToDefaultChannel();
        return;
      }
      onChannelFetched(channelOwner, params, provider);

      const eventName = isOverlay() ? 'mode_overlay' : 'mode_player';
      const eventParameters = params.get();
      gtag('event', eventName, {
        ...eventParameters,
        provider,
        channel: channel || eventParameters.c,
      });
    },
    () => {
      rdrToDefaultChannel();
    }
  );
});
