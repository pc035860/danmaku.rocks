/* global CommentManager */
import './sass/index.scss';

import $ from 'jquery';
import Danmaku from 'danmaku';
import debounce from 'lodash/debounce';
import { parse as parseQuery } from 'query-string';

import createSocketEmitter from './createSocketEmitter';
import parseTags from './parseTags';
import parseEmotes from './parseEmotes';
import * as colors from './utils/colors';
import { loadSubscriberBadges, loadGlobalBadges } from './badges';
import { get as getCheers } from './cheers';

$(() => {
  /**
   * parameters
   *
   * @param {string} channel     channel id
   * @param {string} shownick    show nick before message or not (default: "false")
   * @param {string} showbadges  show badges before message or not (default: "false")
   * @param {string} theme       target background theme dark or light (default: "light")
   * @param {string} speed       danmaku speed (default: 100)
   *                             see https://github.com/weizhenye/Danmaku#speed for more information
   */
  const params = parseQuery(location.search);

  const boolParam = (name) => {
    if (params[name] && params[name] === 'true') {
      return true;
    }
    return false;
  };

  if (!params.channel) {
    throw new Error('No "channel" provided.');
  }

  if (boolParam('showbadges')) {
    loadGlobalBadges();
    loadSubscriberBadges(params.channel);
  }

  let cheers;
  const cheersPromise = getCheers(params.channel).then(res => cheers = res);

  /**
   * Danmaku
   * @type {Danmaku}
   */
  const danmaku = new Danmaku();
  danmaku.init({
    container: document.getElementById('danmaku-container'),
    speed: params.speed ? Number(params.speed) : 100
  });

  /**
   * Socket
   */
  const socket = createSocketEmitter({
    nick: 'justinfan12345',
    channel: params.channel
  });
  const handleMsg = (nick, rawTags, message) => {
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
      danmaku.emit({
        html: true,
        text: `${linePrepend}<span class="nick">${tags.displayName || nick}:</span> <span class="message" style="color: ${tags.color};">${message}</span>`
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
    cheersPromise.then(() => {
      handleMsg(nick, rawTags, message);
    });
  });

  $(window).on('resize', debounce(() => danmaku.resize(), 100));

  if (params.theme) {
    $('body').addClass(`theme-${params.theme}`);
  }
});
