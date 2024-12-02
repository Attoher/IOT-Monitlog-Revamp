const video = document.getElementById('video-background');

video.addEventListener('ended', function() {
  const newVideo = document.createElement('video');
  newVideo.autoplay = true;
  newVideo.muted = true;
  newVideo.loop = true;
  newVideo.src = 'video.mp4';
  newVideo.style.position = 'absolute';
  newVideo.style.top = '0';
  newVideo.style.left = '0';
  newVideo.style.width = '100%';
  newVideo.style.height = '100%';
  newVideo.style.objectFit = 'cover';
  newVideo.style.zIndex = '-2';

  document.body.appendChild(newVideo);

  video.remove();
});
