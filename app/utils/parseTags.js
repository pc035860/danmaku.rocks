export const defaultColors = [
  "#FF0000", "#0000FF", "#008000", "#B22222", "#FF7F50",
  "#9ACD32", "#FF4500", "#2E8B57", "#DAA520", "#D2691E",
  "#5F9EA0", "#1E90FF", "#FF69B4", "#8A2BE2", "#00FF7F"
];

export default function parseTags(nick, rawTags) {
  const res = {
    name: nick,
    displayName: nick,
    color: defaultColors[nick.charCodeAt(0) % 15],
    emotes: null,
    badges: []
  };

  if(rawTags['display-name'] && typeof rawTags['display-name'] === 'string') {
    res.displayName = rawTags['display-name'];
  }

  if(rawTags.color && typeof rawTags.color === 'string') {
    res.color = rawTags.color;
  }

  if(rawTags.emotes && typeof rawTags.emotes === 'string') {
    res.emotes = rawTags.emotes;
  }

  if(rawTags.badges && typeof rawTags.badges === 'string') {
    res.badges = rawTags.badges.split(',').map((badge) => {
      badge = badge.split('/');
      return {
        type: badge[0],
        version: badge[1]
      };
    });
  }

  return res;
}
