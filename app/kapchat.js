import $ from 'jquery';
import get from 'lodash/get';

const cache = {};
const requesting = {};

const _kapchat = channelName => {
  if (cache[channelName]) {
    return $.when(cache[channelName]);
  }

  if (requesting[channelName]) {
    // returns a promise
    return requesting[channelName];
  }

  const promise = $.getJSON(
    `https://cloud.pymaster.tw/ndapi/kapchat/${channelName}`
  ).then(res => {
    delete requesting[channelName];
    return res;
  });
  requesting[channelName] = promise;
  return promise;
};

export default function kapchat(channelName, path = null) {
  const promise = _kapchat(channelName);
  if (path) {
    return promise.then(res => get(res, path));
  }
  return promise;
}
