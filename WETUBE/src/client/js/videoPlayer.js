const video = document.querySelector("video");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");
const volumeRange = document.getElementById("volume");
const currenTime = document.getElementById("currenTime")  ;
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenIcon = fullScreenBtn.querySelector("i");

let controlsTimeout = null;
let controlsMovementTimeout = null;
let volumeValue = 0.5;
video.volume = volumeValue;
let videoPlayStatus = false;
let setVideoPlayStatus = false;

const formatTime = (seconds) => {
  if (seconds >= 3600 * 1000) {
    return new Date(seconds * 1000).toISOString().substring(11, 19);
  } else {
    return new Date(seconds * 1000).toISOString().substring(14, 19);
  }
};

const handlePlayClick = (e) => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
};

const handleMuteClick = (e) => {
  if (video.muted) {
    video.muted = false;
    video.volume = 0.5;
  } else {
    video.muted = true;
    video.volume = 0;
  }
  muteBtnIcon.classList = video.muted
    ? "fas fa-volume-mute"
    : "fas fa-volume-up";
  volumeRange.value = video.muted ? 0 : 0.5;
};
  
const handleVolumeChange = (event) => {
  const {
    target: { value },
  } = event;
  if (video.muted) {
    video.muted = false;
    muteBtn.innerText = "Mute";
  }
  video.volume = value;
  if (Number(value) === 0) {
    muteBtn.innerText = "Unmute";
    video.muted = true;
  } else {
    video.muted = false;
    muteBtn.innerText = "Mute";
  }
};


const handleLoadedMetadata = () => {
  totalTime.innerText = formatTime(Math.floor(video.duration));
  timeline.max = Math.floor(video.duration);
};
  
const handleTimeUpdate = () => {
  currenTime.innerText = formatTime(Math.floor(video.currentTime));
  timeline.value = Math.floor(video.currentTime);
};

const handleTimelineChange = (event) => {
  const {
    target: { value },
  } = event;
  if (!setVideoPlayStatus) {
    videoPlayStatus = video.paused ? false : true;
    setVideoPlayStatus = true;
  }
  video.pause();
  video.currentTime = value;
};

const handleTimelineSet = () => {
  videoPlayStatus ? video.play() : video.pause();
  setVideoPlayStatus = false;
};

const handleFullscreen = () => {
  const fullscreen = document.fullscreenElement;
  if (fullscreen) {
    document.exitFullscreen();
    fullScreenIcon.classList = "fas fa-expand";
  } else {
    videoContainer.requestFullscreen();
    fullScreenIcon.classList = "fas fa-compress";
  }
};

const hideControls = () => videoControls.classList.remove("showing");

const handleMouseMove = () => {
  if (controlsTimeout) {
    clearTimeout(controlsTimeout);
    controlsTimeout = null;
  }
  if (controlsMovementTimeout) {
      clearTimeout(controlsMovementTimeout);
      controlsMovementTimeout = null;
  }
  videoControls.classList.add("showing");
  controlsMovementTimeout = setTimeout(hideControls, 3000);
};
  
const handleMouseLeave = () => {
    controlsTimeout = setTimeout(hideControls, 3000);
};

const handleKeydown = (event) => {
  const fullScreen = document.fullscreenElement;
  if (event.code === "Space") {
    event.preventDefault();
    if (video.paused) {
      video.play();
      playPauseBtn.className = "fas fa-pause";
    } else {
      video.pause();
      playPauseBtn.className = "fas fa-play";
    }
  }
  if (event.code === "KeyF" && !fullScreen) {
    videoContainer.requestFullscreen();
    fullScreenBtn.innerHTML = "Exit Full Screen";
  }
  if (event.code === "Escape" && fullScreen) {
    document.exitFullscreen();
    fullScreenBtn.innerHTML = "Enter Full Screen";
  }
  if (event.code === "ArrowUp") {
    if (volumeRange.value < 1) {
      event.preventDefault();
      volumeValue += 0.1;
      video.volume = volumeValue;
      volumeRange.value = volumeValue;
    }
  }
  if (event.code === "ArrowDown") {
    if (volumeRange.value > 0) {
      event.preventDefault();
      volumeValue -= 0.1;
      video.volume = volumeValue;
      volumeRange.value = volumeValue;
    }
  }
  if (event.code === "ArrowLeft") {
    event.preventDefault();
    video.currentTime -= 5;
  }
  if (event.code === "ArrowRight") {
    event.preventDefault();
    video.currentTime += 5;
  }
  if (event.code === "KeyM") {
    if (video.muted) {
      video.muted = false;
      volumeRange.value = volumeValue;
      volumeBtn.className = "fas fa-volume-up";
    } else {
      video.muted = true;
      volumeRange.value = 0;
      volumeBtn.className = "fas fa-volume-mute";
    }
  }
  console.log(event.code);
};

const handleEnded = () => {
  const { id } = videoContainer.dataset;
  fetch(`/api/videos/${id}/view`, {
    method: "POST",
  });
};

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMuteClick);
volumeRange.addEventListener("input", handleVolumeChange);
video.addEventListener("loadedmetadata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("ended", handleEnded);
videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handleMouseLeave);
timeline.addEventListener("input", handleTimelineChange);
timeline.addEventListener("change", handleTimelineSet);
fullScreenBtn.addEventListener("click", handleFullscreen); 
document.addEventListener("keydown", handleKeydown);

video.readyState
  ? handleMetadata()
  : video.addEventListener("loadedmetadata", handleMetadata);