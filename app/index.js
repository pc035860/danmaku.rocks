/* global CommentManager */
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

$(() => {
  /**
   * parameters
   *
   * @param {string}  channel     channel id
   * @param {boolean} showstream  show embedded stream
   * @param {boolean} shownick    show nick before message or not (default: "false")
   * @param {string}  highlight   which part will colors be applied "nick" or "message" (default: "nick")
   *                              only works when shownick is activated
   * @param {boolean} showbadges  show badges before message or not (default: "false")
   * @param {string}  theme       target background theme "dark" or "light" (default: "light")
   * @param {string}  speed       danmaku speed (default: 100)
   *                              see https://github.com/weizhenye/Danmaku#speed for more information
   * @param {boolean} reverse     reverse danmaku's vertical position
   */
  const params = Object.assign({}, {
    theme: 'dark',
    highlight: 'nick'
  }, parseQuery(location.search));

  const boolParam = (name) => {
    if (params[name] && (
          params[name] === 'true' ||
          params[name] === '1'
        )
      ) {
      return true;
    }
    return false;
  };

  if (!params.channel) {
    const q = makeQuery(Object.assign(params, {
      channel: 'miao11255',
      showstream: 1
    }));
    window.location.href = `?${q}`;
    return;
  }

  if (boolParam('showstream')) {
    const $stream = $('#stream');
    $stream.attr('src', $stream.data('src').replace('{CHANNEL}', params.channel));
    $stream.show();
  }

  if (boolParam('showbadges')) {
    loadGlobalBadges();
    loadSubscriberBadges(params.channel);
  }

  const cheersPromise = getCheers(params.channel);

  /**
   * Danmaku
   * @type {Danmaku}
   */
  const danmaku = new Danmaku();
  danmaku.init({
    container: document.getElementById('danmaku-container'),
    speed: params.speed ? Number(params.speed) : 100,
    reverse: boolParam('reverse')
  });
  $(window).on('resize', debounce(() => danmaku.resize(), 100));

  /**
   * Socket
   */
  const socket = createSocketEmitter({
    nick: 'justinfan12345',
    channel: params.channel
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

    if (params.theme) {
      const bgTheme = params.theme;

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

      if (params.highlight && params.highlight === 'message') {
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
   * add <body> classes
   */
  const $body = $('body');
  if (params.theme) {
    $body.addClass(`theme-${params.theme}`);
  }
  if (params.highlight) {
    $body.addClass(`highlight-${params.highlight}`);
  }
  if (boolParam('showstream')) {
    $body.addClass(`showstream`);
  }

  /**
   * update title
   */
  getChannel(params.channel)
  .then((c) => {
    const name = c.display_name || c.name;
    document.title = `${name} @ ttv-danmaku`;
  });
});
