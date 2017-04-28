import $ from 'jquery';
import raf from 'raf';

export default function handleContainerDimension(container, onChange) {
  const $win = $(window);
  const $container = $(container);
  let animating = false;

  const handleContainer = (winWidth, winHeight) => {

  };

  const onWindowResize = () => {
    if (animating) {
      return;
    }

    animating = true;

    raf(() => {
      handleContainer($win.width(), $win.height());
      animating = false;
    });
  };
  $win.on('resize', onWindowResize);
}
