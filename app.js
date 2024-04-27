const NodeMediaServer = require('node-media-server');
const fs = require('fs');
const path = require('path');

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: 8000,
    mediaroot: './media',
    allow_origin: '*'
  }
};

const nms = new NodeMediaServer(config);

nms.on('postPublish', (id, streamPath, args) => {
  console.log(`Stream published: ${streamPath}`);

  const mediaDir = path.join(__dirname, 'media', 'live');
  if (!fs.existsSync(mediaDir)) {
    fs.mkdirSync(mediaDir, { recursive: true });
  }

  const filePath = path.join(mediaDir, `${streamPath}.flv`);
  const fileStream = fs.createWriteStream(filePath);

  nms.getSession(id).on('donePublish', () => {
    console.log(`Stream finished: ${streamPath}`);
    fileStream.end();
  });

  nms.getSession(id).on('postPublish', () => {
    const stream = nms.getSession(id).streams[streamPath];
    if (stream) {
      stream.getAudio().pipe(fileStream);
      stream.getVideo().pipe(fileStream);
    }
  });

  fileStream.on('finish', () => {
    console.log(`Stream saved: ${filePath}`);
  });

  fileStream.on('error', (err) => {
    console.error(`Error saving stream: ${err}`);
  });
});

nms.run();

console.log('RTMP server started');
