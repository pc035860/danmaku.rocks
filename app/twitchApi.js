import kapchat from './kapchat';

export const getChannel = channel => {
  return kapchat(channel, 'channel');
};

export const getChannelId = channel => {
  return getChannel(channel).then(res => res.id);
};

export const getBadges = channel => {
  return kapchat(channel, 'badges');
};

export const getCheermotes = channel => {
  return kapchat(channel, 'cheermotes');
};
