import './sass/index.scss';

import $ from 'jquery';
import Danmaku from '_Danmaku';
import debounce from 'lodash/debounce';
import raf from 'raf';
import { parse as parseQuery, stringify as makeQuery } from 'query-string';

import createSocketEmitter from './createSocketEmitter';
import parseTags from './parseTags';
import parseEmotes from './parseEmotes';
import * as colors from './utils/colors';
import { loadSubscriberBadges, loadGlobalBadges } from './badges';
import { get as getCheers } from './cheers';
import { getChannel } from './twitchApi';
import boolish from './utils/boolish';
import createWatchParams from './createWatchParams';

$(() => {
  /**
   * parameters
   *
   * @param {string}  channel     channel id
   * @param {boolean} shownick    show nick before message or not (default: "false")
   * @param {string}  highlight   which part will colors be applied "nick" or "message" (default: "nick")
   *                              only works when shownick is activated
   * @param {boolean} showbadges  show badges before message or not (default: "false")
   * @param {string}  theme       target background theme "dark" or "light" (default: "light")
   * @param {string}  speed       danmaku speed (default: 100)
   *                              see https://github.com/weizhenye/Danmaku#speed for more information
   * @param {boolean} reverse     reverse danmaku's vertical position
   */
  const params = createWatchParams(parseQuery(location.search));
  const boolParam = boolish(() => params.get());

  if (!params.get('channel')) {
    const q = makeQuery(Object.assign(params.get(), {
      channel: 'miao11255'
    }));
    window.location.href = `?${q}`;
    return;
  }

  const channel = params.get('channel');
  const $body = $('body');

  if (/\/watch(:?\/|\.html)?$/.test(window.location.pathname)) {
    params.set('showstream', 1);
    $body.addClass('watch');
  }

  /**
   * Static setup
   */
  {
    if (boolParam('showstream')) {
      $('#stream, #chat').each(function () {
        const $this = $(this);
        $this.attr('src', $this.data('src').replace('{CHANNEL}', channel));
      });
      $body.addClass('showstream');
    }

    loadGlobalBadges();
    loadSubscriberBadges(channel);

    /**
     * update title
     */
    getChannel(channel)
    .then((c) => {
      const name = c.display_name || c.name;
      document.title = `${name} @ ttv-danmaku`;
    });
  }

  const cheersPromise = getCheers(channel);

  /**
   * Danmaku
   */
  const danmaku = new Danmaku();
  danmaku.init({
    container: document.getElementById('danmaku-container'),
    speed: params.get('speed'),
    reverse: boolParam('reverse')
  });
  $(window).on('resize', debounce(() => danmaku.resize(), 100));
  // TODO: 在調整 nochat 的時候要觸發 danmaku.resize()

  /**
   * Socket
   */
  const socket = createSocketEmitter({
    nick: 'justinfan12345',
    channel: channel
  });
  const handleMsg = (cheers, nick, rawTags, message) => {
    const tags = parseTags(nick, rawTags);

    console.info('$msg', nick, tags.color, message);

    let action = false;
    let linePrepend = '';  // message text line

    if(boolParam('showbadges') && tags.badges) {
      tags.badges.forEach(function(badge) {
        const badgeClass = `${badge.type}-${badge.version}`;
        linePrepend += `<span class="${badgeClass} tag">&nbsp;</span>`;
      });
    }

    if (params.get('theme')) {
      const bgTheme = params.get('theme');

      if(/^#[0-9a-f]+$/i.test(tags.color)) {
        while(colors.calcBgTheme(tags.color) !== bgTheme) {
          tags.color = colors.calcReplacement(tags.color, colors.calcBgTheme(tags.color));
        }
      }
    }

    if(/^\x01ACTION.*\x01$/.test(message)) {
      // action
      action = true;
      message = message.replace(/^\x01ACTION/, '').replace(/\x01$/, '').trim();
    }

    message = parseEmotes(cheers, message, tags);

    if (action) {
      // action message
      danmaku.emit({
        html: true,
        text: `${linePrepend}<span class="action" style="color: ${tags.color};">${message}</span>`,
        mode: 'bottom'
      });
    }
    else if (boolParam('shownick')) {
      // show nick

      let text = `${linePrepend}<span class="nick" style="color: ${tags.color};">${tags.displayName || nick}:</span> <span class="message">${message}</span>`;

      if (params.get('highlight') === 'message') {
        text = `${linePrepend}<span class="nick">${tags.displayName || nick}:</span> <span class="message" style="color: ${tags.color};">${message}</span>`
      }

      danmaku.emit({
        html: true,
        text
      });
    }
    else {
      // default
      danmaku.emit({
        html: true,
        text: `${linePrepend}<span class="message" style="color: ${tags.color};">${message}</span>`
      });
    }
  };
  socket.on('$msg', (nick, rawTags, message) => {
    const perfNow = window.performance.now();
    cheersPromise.then((cheers) => {
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
    const updateThemeClass = (theme) => {
      $body
      .removeClass('theme-dark theme-light')
      .addClass(`theme-${theme}`);
    };
    const updateHighlightClass = (highlight) => {
      $body
      .removeClass('highlight-nick highlight-message')
      .addClass(`highlight-${highlight}`);
    };

    updateThemeClass(params.get('theme'));
    updateHighlightClass(params.get('highlight'));

    // watch params change
    params.on('change', (changes) => {
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
        }
      });
    });
  }

  window.params = params;  // xxx
});
