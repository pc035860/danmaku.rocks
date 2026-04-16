const PALETTE = {
  dark: {
    owner: '#FFC107',
    moderator: '#64B5F6',
    member: '#4CAF50',
    verified_artist: '#CE93D8',
    verified: '#90CAF9',
    default: '#BDBDBD',
  },
  light: {
    owner: '#E65100',
    moderator: '#0D47A1',
    member: '#1B5E20',
    verified_artist: '#6A1B9A',
    verified: '#1565C0',
    default: '#616161',
  },
};

export const resolveYoutubeRoleColor = (role, theme) => {
  const t = theme === 'light' ? 'light' : 'dark';
  const bucket = PALETTE[t];
  const hex = bucket[role];
  return typeof hex === 'string' ? hex : bucket.default;
};
