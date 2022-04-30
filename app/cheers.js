import $ from 'jquery';
import { getCheermotes } from './twitchApi';

let cheersCache = null;
export const get = channel => {
  if (cheersCache) {
    return $.when(cheersCache);
  }

  return getCheermotes(channel).then(motesData => {
    cheersCache = motesData;
    return motesData;
  });
};

export const getCheer = (cheers, prefix, amount) => {
  const amounts = cheers[prefix];
  return amounts[
    Object.keys(amounts)
      .sort(function (a, b) {
        return parseInt(b, 10) - parseInt(a, 10);
      })
      .find(function (a) {
        return amount >= a;
      })
  ];
};

export const findCheerInToken = (cheers, token) => {
  const cheerPrefixes = Object.keys(cheers);
  const tokenLower = token.toLowerCase();
  for (let i = 0; i < cheerPrefixes.length; i++) {
    const prefixLower = cheerPrefixes[i].toLowerCase();
    if (tokenLower.indexOf(prefixLower) === 0) {
      const amount = parseInt(tokenLower.substr(prefixLower.length), 10);
      return getCheer(cheers, cheerPrefixes[i], amount);
    }
  }
  return null;
};
