/* global ReconnectingWebSocket */

import ee from 'event-emitter';

import parseIRC from './parseIRC';

const DEFAULT_OPTIONS = {
  channel: null,
  nick: 'justinfan12345',
  bot_activity: 'false'
};

export default function createSocketEmitter(options_ = {}) {
  const options = Object.assign({}, DEFAULT_OPTIONS, options_);

  if (!options.channel) {
    throw new Error('No channel specified');
  }

  const socket = new ReconnectingWebSocket('wss://irc-ws.chat.twitch.tv', 'irc', { reconnectInterval: 3000 });
  const eeSocket = ee(socket);

  socket.onopen = function(data) {
    console.info('Connected.');
    eeSocket.emit('open');
    socket.send('PASS blah\r\n');
    socket.send(`NICK ${options.nick}\r\n`);
    socket.send('CAP REQ :twitch.tv/commands twitch.tv/tags\r\n');
    socket.send(`JOIN #${options.channel}\r\n`);
  };

  socket.onclose = function() {
    console.info('You were disconnected from the server.');
    eeSocket.emit('close');
  };

  socket.onmessage = function(data) {
    var message = parseIRC(data.data.trim());

    if(!message.command) return;

    switch(message.command) {
      case "PING":
        eeSocket.emit('ping', message);
        socket.send('PONG ' + message.params[0]);
        return;
      case "JOIN":
        eeSocket.emit('join', message);
        console.info(`Joined channel: ${options.channel}.`);
        return;
      case "CLEARCHAT":
        eeSocket.emit('clearchat', message);
        return;
      case "PRIVMSG":
        if(message.params[0] !== '#' + options.channel || !message.params[1]) {
          return;
        }

        const nick = message.prefix.split('@')[0].split('!')[0];

        if(options.bot_activity && options.bot_activity.toLowerCase() !== 'true') {
          if(message.params[1].charAt(0) === '!') {
            return;
          }
          if(/bot$/.test(nick)) {
            return;
          }
        }

        // if (Chat.vars.spammers.indexOf(nick) > -1) return;

        eeSocket.emit('privmsg', message);
        eeSocket.emit('$msg', nick, message.tags, message.params[1]);
        return;
    }
  };

  return eeSocket;
}
