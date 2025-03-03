let mediaRecorder;
let recordedBlobs;

const errorMsgElement = document.querySelector('span#errorMsg');
const recordedVideo = document.querySelector('video#recorded');

const startButton = document.querySelector('button#startButton');
const stopButton = document.querySelector('button#stopButton');
const uploadButton = document.querySelector('button#uploadButton');

startButton.addEventListener('click', () => {
  startRecording();
});

stopButton.addEventListener('click', () => {
  stopRecording();
});

uploadButton.addEventListener('click', () => {
  uploadVideo();
});

function startRecording() {
  recordedBlobs = [];
  let options = { mimeType: 'video/webm;codecs=vp9' };
  try {
    mediaRecorder = new MediaRecorder(window.stream, options);
  } catch (e) {
    console.error('Exception while creating MediaRecorder:', e);
    errorMsgElement.innerHTML = `Exception while creating MediaRecorder: ${JSON.stringify(e)}`;
    return;
  }

  console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
  startButton.disabled = true;
  stopButton.disabled = false;
  uploadButton.disabled = true;

  mediaRecorder.onstop = (event) => {
    console.log('Recorder stopped: ', event);
    console.log('Recorded Blobs: ', recordedBlobs);
    recordedVideo.controls = true;
  };

  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start(10); // collect 10ms of data
  console.log('MediaRecorder started', mediaRecorder);
}

function stopRecording() {
  mediaRecorder.stop();
  console.log('Recorded Blobs: ', recordedBlobs);
  recordedVideo.controls = true;
  const superBuffer = new Blob(recordedBlobs, { type: 'video/webm' });
  recordedVideo.src = window.URL.createObjectURL(superBuffer);
  startButton.disabled = false;
  stopButton.disabled = true;
  uploadButton.disabled = false;
}

function handleDataAvailable(event) {
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
}

function uploadVideo() {
  const blob = new Blob(recordedBlobs, { type: 'video/webm' });
  const formData = new FormData();
  formData.append('video', blob, 'recorded-video.webm');

  fetch('/upload', {
    method: 'POST',
    body: formData
  }).then(response => {
    if (response.ok) {
      console.log('Video uploaded successfully');
    } else {
      console.error('Error uploading video');
    }
  }).catch(error => {
    console.error('Error uploading video:', error);
  });
}

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => {
    const video = document.querySelector('video#video');
    video.srcObject = stream;
    window.stream = stream;
  })
  .catch(error => {
    console.error('Error accessing media devices.', error);
    errorMsgElement.innerHTML = `Error accessing media devices: ${JSON.stringify(error)}`;
  });
