const socket = io('/');

const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;
const peer = new Peer(undefined, {
  host: '/',
  port: '3001',
});
const peers = {};
var promise = navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: false,
  })
  .then(stream => {
    addVideoStream(myVideo, stream);
    peer.on('call', call => {
      call.answer(stream);
      const video = document.createElement('video');
      call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on('user-connected', userId => {
      connectToNewUser(userId, stream);
      console.log('User connected', userId);
    });
  });

socket.on('user-disconnected', userId => {
  console.log(userId);
  if (peers[userId]) {
    peers[userId].close();
  }
});

peer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id);
});

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
}
function connectToNewUser(userId, stream) {
  const call = peer.call(userId, stream);
  const video = document.createElement('video');
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream);
  });
  call.on('close', () => {
    video.remove();
  });
  peers[userId] = call;
}
