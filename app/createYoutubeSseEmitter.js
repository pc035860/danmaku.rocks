import ee from 'event-emitter';

export default function createYoutubeSseEmitter(options_ = {}) {
  const options = Object.assign(
    {
      sseUrl: null,
    },
    options_
  );

  if (!options.sseUrl) {
    throw new Error('No SSE URL specified');
  }

  const source = new EventSource(options.sseUrl);
  const eeSource = ee(source);

  source.onopen = () => {
    eeSource.emit('open');
  };

  source.onmessage = event => {
    if (!event || !event.data) {
      return;
    }
    let payload = null;
    try {
      payload = JSON.parse(event.data);
    } catch (error) {
      eeSource.emit('error', error);
      return;
    }
    if (!payload || !payload.nick || typeof payload.message !== 'string') {
      return;
    }
    eeSource.emit('$msg', payload.nick, payload.tags || {}, payload.message);
  };

  source.onerror = error => {
    eeSource.emit('error', error);
  };

  source.addEventListener('end', () => {
    eeSource.emit('close');
    source.close();
  });

  eeSource.close = () => {
    source.close();
  };

  return eeSource;
}
