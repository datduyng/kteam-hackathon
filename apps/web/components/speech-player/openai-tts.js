

async function speakText(text, onended = null) {
  const endpoint = `/tts`;
  const data = {
    input: text,
  };
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  let audioEl = document.createElement('audio');

  const player = new SpeechPlayer({
    audio: audioEl,
    onPlaying: () => { },
    onPause: () => { },
    onChunkEnd: () => { },
    onEnded: onended, // Pass the onended callback to the SpeechPlayer options
    mimeType: 'audio/mpeg',
  });
  await player.init();

  await player.feedWithResponse(response);
}