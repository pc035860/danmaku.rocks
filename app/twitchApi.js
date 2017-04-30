import $ from 'jquery';

import { twitchClientId } from './config';

const twitchApi = (url, clientId = twitchClientId) => {
  const mark = (url.indexOf('?') > -1 ? '&' : '?');
  return $.getJSON(`${url}${mark}client_id=${clientId}`);
};

const channelIdCache = {};
export const getChannelId = (channel) => {
  if (channelIdCache[channel]) {
    return $.when(channelIdCache[channel]);
  }

  return twitchApi(`https://api.twitch.tv/v5/users?login=${channel}`)
  .then((res) => {
    const channelId = res.users[0]._id;
    channelIdCache[channel] = channelId;
    return channelId;
  });
};

export default twitchApi;
