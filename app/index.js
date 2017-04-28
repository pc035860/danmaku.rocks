/* global CommentManager */
import './sass/index.scss';

import $ from 'jquery';
import Danmaku from 'danmaku';
import debounce from 'lodash/debounce';
import { parse as parseQuery } from 'query-string';

import createSocketEmitter from './createSocketEmitter';
import parseTags from './utils/parseTags';
import * as colors from './utils/colors';

$(() => {
  /**
   * parameters
   *
   * @param {string} channel   channel id
   * @param {string} shownick  show nick before message or not (default: "false")
   * @param {string} theme     target background theme dark or light (default: "light")
   * @param {string} speed     danmaku speed (default: 100)
   *                           see https://github.com/weizhenye/Danmaku#speed for more information
   */
  const params = parseQuery(location.search);

  const danmaku = new Danmaku();
  danmaku.init({
    container: document.getElementById('danmaku-container'),
    speed: params.speed ? Number(params.speed) : 100
  });

  const socket = createSocketEmitter({
    nick: 'justinfan12345',
    channel: params.channel
  });

  socket.on('$msg', (nick, rawTags, message) => {
    const tags = parseTags(nick, rawTags);

    console.info('$msg', nick, tags.color, message);

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
      const actionMessage = message.replace(/^\x01ACTION/, '').replace(/\x01$/, '').trim();
      danmaku.emit({
        html: true,
        text: `<span class="action" style="color: ${tags.color};">${actionMessage}</span>`,
        mode: 'bottom'
      });
    }
    else {
      // normal message

      if (params.shownick && params.shownick === 'true') {
        danmaku.emit({
          html: true,
          text: `<span class="nick" style="color: ${tags.color};">${tags.displayName || nick}:</span> <span class="message">${message}</span>`
        });
      }
      else {
        danmaku.emit({
          html: true,
          text: `<span class="message" style="color: ${tags.color};">${message}</span>`
        });
      }
    }
  });

  $(window).on('resize', debounce(() => danmaku.resize(), 100));

  if (params.theme) {
    $('body').addClass(`theme-${params.theme}`);
  }
});
