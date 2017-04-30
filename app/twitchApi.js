import $ from 'jquery';

import { twitchClientId } from './config';

const twitchApi = (url, clientId = twitchClientId) => {
  const mark = (url.indexOf('?') > -1 ? '&' : '?');
  return $.getJSON(`${url}${mark}client_id=${clientId}`);
};

const channelCache = {};

export const getChannel = (channel) => {
  if (channelCache[channel]) {
    return $.when(channelCache[channel]);
  }

  return twitchApi(`https://api.twitch.tv/v5/users?login=${channel}`)
  .then((res) => {
    const channel = res.users[0];
    channelCache[channel] = channel;
    return channel;
  });
};

export const getChannelId = (channel) => {
  return getChannel(channel).then(res => res._id);
};

export default twitchApi;
