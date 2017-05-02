import $ from 'jquery';

const frac = 9 / 16;

export default function createDanmakuRectHandler(positionWrap, targetWrap) {
  const $pos = $(positionWrap);
  const $target = $(targetWrap);

  return (isVideoFrameFullscreen) => {
    const $win = $(window);
    const $t = isVideoFrameFullscreen ? $win : $target;
    const tWidth = $t.width();
    const tHeight = $t.height();

    let width = tWidth;
    let height = tHeight;

    if (tHeight / tWidth >= frac) {
      height = width * frac;
    }
    else {
      width = height / frac;
    }

    $pos.css({
      width,
      height,
      marginLeft: -(width / 2),
      marginTop: -(height / 2)
    });
  };
}
