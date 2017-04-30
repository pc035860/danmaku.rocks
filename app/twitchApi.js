import $ from 'jquery';

import { twitchClientId } from './config';

const twitchApi = (url, clientId = twitchClientId) => {
  const mark = (url.indexOf('?') > -1 ? '&' : '?');
  return $.getJSON(`${url}${mark}client_id=${clientId}`);
};

const channelCache = {};
const channelRequesting = {};
export const getChannel = (channel) => {
  if (channelCache[channel]) {
    return $.when(channelCache[channel]);
  }

  if (channelRequesting[channel]) {
    // returns a promise
    return channelRequesting[channel];
  }

  const promise = twitchApi(`https://api.twitch.tv/v5/users?login=${channel}`)
  .then((res) => {
    const channel = res.users[0];
    channelCache[channel] = channel;
    delete channelRequesting[channel];
    return channel;
  });
  channelRequesting[channel] = promise;
  return promise;
};

export const getChannelId = (channel) => {
  return getChannel(channel).then(res => res._id);
};

export default twitchApi;
