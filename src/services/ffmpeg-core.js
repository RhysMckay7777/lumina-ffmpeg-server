import ffmpeg from 'fluent-ffmpeg';

export const getFfmpegInfo = () => {
  return new Promise((resolve, reject) => {
    ffmpeg.getAvailableFormats((err, formats) => {
      if (err) return reject(err);
      
      ffmpeg.getAvailableCodecs((err, codecs) => {
        if (err) return reject(err);
        
        resolve({
          formats,
          codecs
        });
      });
    });
  });
};

export const probeMetadata = (filePath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata);
    });
  });
};

export const checkHealth = () => {
  return new Promise((resolve) => {
    ffmpeg.getAvailableFormats((err) => {
      if (err) resolve(false);
      else resolve(true);
    });
  });
};
