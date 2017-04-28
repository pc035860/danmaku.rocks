/**
 * calculate color background theme according to given color
 * @param  {string} color hex color
 * @return {string}       dark / light
 */
export const calcBgTheme = (color) => {
  // Converts HEX to YIQ to judge what color background the color would look best on
  color = String(color).replace(/[^0-9a-f]/gi, '');
  if (color.length < 6) {
    color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
  }

  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? "dark" : "light";
};

/**
 * calculate a new color according to current color and give background theme
 * @param  {string} color   hex color
 * @param  {string} bgTheme dark / light
 * @return {string}         hex color
 */
export const calcReplacement = (color, bgTheme) => {
  // Modified from http://www.sitepoint.com/javascript-generate-lighter-darker-color/
  const inputColor = color;

  let rgb = "#";
  let brightness;

  color = String(color).replace(/[^0-9a-f]/gi, '');
  if (color.length < 6) {
    color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
  }

  (bgTheme === "light") ? (brightness = "0.2") : (brightness = "-0.5");

  for (let i = 0; i < 3; i++) {
    let c = parseInt(color.substr(i * 2, 2), 16);
    if(c < 10) c = 10;
    c = Math.round(Math.min(Math.max(0, c + (c * brightness)), 255)).toString(16);
    rgb += ("00" + c).substr(c.length);
  }

  if(inputColor === rgb) {
    if(bgTheme === "light") {
      return "#ffffff";
    } else {
      return "#000000";
    }
  } else {
    return rgb;
  }
};
