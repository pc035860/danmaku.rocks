/* global CommentManager */
import './sass/index.scss';

import $ from 'jquery';
import Danmaku from 'danmaku';
import debounce from 'lodash/debounce';

import createSocketEmitter from './createSocketEmitter';
import { parse as parseQuery } from 'query-string';

$(() => {
  const params = parseQuery(location.search);

  const danmaku = new Danmaku();
  danmaku.init({
    container: document.getElementById('danmaku-container')
  });

  // const cm = new CommentManager(document.getElementById('danmaku-comment-stage'));
  // cm.init();

  const socket = createSocketEmitter({
    nick: params.nick || 'justinfan12345',
    channel: params.channel
  });

  // socket.on('join', () => {
  //   cm.start();
  // });

  socket.on('$msg', (nick, tags, message) => {
    console.info('$msg', nick, message);

    const color = tags.color === true ? '#ffffff' : tags.color;
    danmaku.emit({
      html: true,
      text: `<span class="nick" style="color: ${color};">${nick}:</span> <span class="message">${message}</span>`
    });

    // cm.send({
    //   mode: 2,
    //   text: '<strong>a</strong>' + message,
    //   size: 25,
    //   color: parseInt(color.substr(1), 16)
    // });
  });

  $(window).on('resize', debounce(() => danmaku.resize(), 100));
});
