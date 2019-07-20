// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { desktopCapturer } from 'electron';
import routes from '../constants/routes';
import styles from './Home.css';

desktopCapturer.getSources({ types: ['window', 'screen'] }, (error, sources) => {
  if (error) throw error;
  for (let i = 0; i < sources.length; ++i) {
    if (sources[i].name.indexOf('Zoom Meeting') > -1) {
      const constraints = {
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: sources[i].id,
            minWidth: 1280,
            maxWidth: 1280,
            minHeight: 720,
            maxHeight: 720
          }
        }
      };
      // const constraints = {
      //   audio: {
      //     mandatory: {
      //       chromeMediaSource: 'desktop'
      //     }
      //   },
      //   video: {
      //     mandatory: {
      //       chromeMediaSource: 'desktop'
      //     }
      //   }
      // };
      navigator.mediaDevices.getUserMedia(constraints)
        .then((stream) => handleStream(stream))
        .catch((e) => handleError(e));
      return;
    }
  }
});

function handleStream(stream) {
  startRecording(stream);
}

let recorder;
const recordedChunks = [];

function startRecording(stream) {
  recorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9'
  });

  recorder.addEventListener('dataavailable', function(e) {
    if (e.data.size > 0) {
      console.log(e);
      recordedChunks.push(e.data);
    }
  });

  recorder.addEventListener('stop', function() {
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(new Blob(recordedChunks));
    downloadLink.download = `${new Date().toISOString()}.webm`;
    downloadLink.click();
  });

  recorder.start();

  setTimeout(stopRecording, 5000);
}

function stopRecording() {
  recorder.stop();
}

function handleError(e) {
  console.log(e);
}

type Props = {};

export default class Home extends Component<Props> {
  props: Props;

  render() {
    return (
      <div className={styles.container} data-tid="container">
        <h2>Home</h2>
        <Link to={routes.COUNTER}>to Counter</Link>
      </div>
    );
  }
}
