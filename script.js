const audio = document.getElementById('audio');
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');

const overlay = document.getElementById('startOverlay');
const startBtn = document.getElementById('startBtn');

const bgVideo = document.getElementById('bgVideo');

function setPlayingUI(isPlaying) {
  if (isPlaying) {
    playBtn.disabled = true;
    pauseBtn.disabled = false;
    playBtn.textContent = 'მუსიკა უკრავს';
  } else {
    playBtn.disabled = false;
    pauseBtn.disabled = true;
    playBtn.textContent = 'მუსიკის ჩართვა';
  }
}

async function startBackgroundVideo() {
  if (!bgVideo) return false;

  try {
    // на всякий случай
    bgVideo.muted = true;
    bgVideo.playsInline = true;

    // сначала пытаемся реально запустить
    bgVideo.currentTime = 0;
    await bgVideo.play();

    // только после успешного play включаем "video-on",
    // чтобы убрать картинку bg.jpg и показать видео
    document.body.classList.add('video-on');
    return true;
  } catch (e) {
    // если не получилось, оставляем картинку-фон
    document.body.classList.remove('video-on');
    return false;
  }
}

async function unlockWebAudioHint() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    if (ctx.state === 'suspended') await ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    gain.gain.value = 0.0001;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.01);
  } catch (e) { }
}

function hideOverlayHard() {
  if (!overlay) return;
  overlay.hidden = true;
  overlay.style.display = 'none';
  overlay.style.pointerEvents = 'none';
}

async function startAllFromUserGesture() {
  // 1) скрываем модалку СРАЗУ и жёстко
  hideOverlayHard();

  // 2) запускаем видео (если видео не играет — хотя бы фон останется)
  await startBackgroundVideo();

  // 3) запускаем музыку
  try {
    await unlockWebAudioHint();
    audio.muted = false;
    audio.volume = 0.9;
    await audio.play();
    setPlayingUI(true);
  } catch (e) {
    setPlayingUI(false);
  }
}

async function tryPlayMusicOnly() {
  try {
    await unlockWebAudioHint();
    audio.muted = false;
    await audio.play();
    setPlayingUI(true);
  } catch (e) {
    playBtn.textContent = 'კიდევ ერთხელ დააჭირე';
  }
}

playBtn.addEventListener('click', tryPlayMusicOnly);

pauseBtn.addEventListener('click', () => {
  audio.pause();
  setPlayingUI(false);
});

window.addEventListener('load', () => {
  setPlayingUI(false);
  if (overlay) {
    overlay.hidden = false;
    overlay.style.display = '';
    overlay.style.pointerEvents = '';
  }
  if (bgVideo) bgVideo.load();
});

// Overlay / button click => старт всего
if (startBtn) startBtn.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  startAllFromUserGesture();
});

if (overlay) overlay.addEventListener('click', startAllFromUserGesture);
