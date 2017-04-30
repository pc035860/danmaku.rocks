import $ from 'jquery';
import { default as api, getChannelId } from './twitchApi';

let cheersCache = null;
export const get = (channel) => {
  if (cheersCache) {
    return $.when(cheersCache);
  }

  return getChannelId(channel)
  .then((channelId) => {
    return api(`https://api.twitch.tv/v5/bits/actions?channel_id=${channelId}`);
  })
  .then((res) => {
    const cheers = {};
    try {
      res.actions.forEach((action) => {
        const cheer = cheers[action.prefix] = {};
        action.tiers.forEach((tier) => {
          cheer[tier.min_bits] = tier.images.light.animated['4'];
        });
      });
      cheersCache = cheers;
    }
    catch (e) {
      console.warn(e);
    }
    return cheers;
  });
};

export const getCheer = (cheers, prefix, amount) => {
  const amounts = cheers[prefix];
  return amounts[
    Object.keys(amounts)
    .sort(function(a, b) {
      return parseInt(b, 10) - parseInt(a, 10);
    })
    .find(function(a) {
      return amount >= a;
    })
  ];
};

export const findCheerInToken = (cheers, token) => {
  const cheerPrefixes = Object.keys(cheers);
  const tokenLower = token.toLowerCase();
  for (let i = 0; i < cheerPrefixes.length; i++) {
    const prefixLower = cheerPrefixes[i].toLowerCase();
    if (tokenLower.startsWith(prefixLower)) {
      const amount = parseInt(tokenLower.substr(prefixLower.length), 10);
      return getCheer(cheers, cheerPrefixes[i], amount);
    }
  }
  return null;
};
