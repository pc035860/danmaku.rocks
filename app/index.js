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
  const params = parseQuery(location.search);

  const danmaku = new Danmaku();
  danmaku.init({
    container: document.getElementById('danmaku-container'),
    speed: params.speed ? Number(params.speed) : 100
  });

  const socket = createSocketEmitter({
    nick: params.nick || 'justinfan12345',
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

    danmaku.emit({
      html: true,
      text: `<span class="nick" style="color: ${tags.color};">${tags.displayName || nick}:</span> <span class="message">${message}</span>`
    });
  });

  $(window).on('resize', debounce(() => danmaku.resize(), 100));

  if (params.theme) {
    $('body').addClass(`theme-${params.theme}`);
  }
});
