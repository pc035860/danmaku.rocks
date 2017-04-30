import punycode from 'punycode';
import * as templates from './templates';
import { findCheerInToken } from './cheers';

const escape = (message) => {
  return message.replace(/</g,'&lt;').replace(/>/g, '&gt;');
};

export const emoticonize = (message, emotes) => {
  if(!emotes) return [message];

  const tokenizedMessage = [];

  const emotesList = Object.keys(emotes);

  const replacements = [];

  emotesList.forEach(function(id) {
    const emote = emotes[id];

    for(let i=emote.length-1; i>=0; i--) {
      replacements.push({ id: id, first: emote[i][0], last: emote[i][1] });
    }
  });

  replacements.sort(function(a, b) {
    return b.first - a.first;
  });

  // Tokenizes each character into an array
  // punycode deals with unicode symbols on surrogate pairs
  // punycode is used in the replacements loop below as well
  message = punycode.ucs2.decode(message);

  replacements.forEach(function(replacement) {
    // Unshift the end of the message (that doesn't contain the emote)
    tokenizedMessage.unshift(punycode.ucs2.encode(message.slice(replacement.last+1)));

    // Unshift the emote HTML (but not as a string to allow us to process links and escape html still)
    tokenizedMessage.unshift([ templates.emote(replacement.id) ]);

    // Splice the unparsed piece of the message
    message = message.slice(0, replacement.first);
  });

  // Unshift the remaining part of the message (that contains no emotes)
  tokenizedMessage.unshift(punycode.ucs2.encode(message));

  return tokenizedMessage;
};

export const extraMessageTokenize = (cheers, sender, message) => {
  var tokenizedString = message.split(' ');

  for(var i = 0; i < tokenizedString.length; i++) {
    let piece = tokenizedString[i];

    const cheer = findCheerInToken(cheers, piece);

    if (cheer) {
      piece = templates.cheer(cheer);
    }
    else {
      piece = escape(piece);
    }

    tokenizedString[i] = piece;
  }

  return tokenizedString.join(' ');
};

export default function parseEmotes(cheers, message, tags) {
  const emotes = {};

  if(tags.emotes) {
    tags.emotes.split('/').forEach((emote_) => {
      const emote = emote_.split(':');

      if(!emotes[emote[0]]) emotes[emote[0]] = [];

      var replacements = emote[1].split(',');
      replacements.forEach((replacement_) => {
        const replacement = replacement_.split('-');

        emotes[emote[0]].push([ parseInt(replacement[0]) , parseInt(replacement[1]) ]);
      });
    });
  }

  const tokenizedMessage = emoticonize(message, emotes);

  for (let i = 0; i < tokenizedMessage.length; i++) {
    if(typeof tokenizedMessage[i] === 'string') {
      tokenizedMessage[i] = extraMessageTokenize(cheers, tags, tokenizedMessage[i]);
    }
    else {
      tokenizedMessage[i] = tokenizedMessage[i][0];
    }
  }

  return tokenizedMessage.join(' ');
}
