const maxApi = require('max-api');
const OBSWebSocket = require('obs-websocket-js');

maxApi.post("hello n4m-obs");

const obs = new OBSWebSocket();
let connected = false;

maxApi.addHandler('connect', () => {

	obs.connect({
		address: 'localhost:4444'//, add password here if enabled
		//password: '$up3rSecretP@ssw0rd'
	})
	.then(() => {
		maxApi.post(`Success! We're connected & authenticated.`);
		return obs.send('GetSceneList');
	})
	.then(data => {
		connected = true;
		
		maxApi.post(`Current Scene is ${data.currentScene}`);
		maxApi.post(`${data.scenes.length} Available Scenes`);
		
		maxApi.outlet('scenelist');
		data.scenes.forEach(scene => {
			maxApi.outlet("scene", scene.name);
		});
	})
	.catch(err => { // Promise convention dicates you have a catch on every chain.
		maxApi.post(err);
	});
});

maxApi.addHandler('set_scene', (sceneName) => {
	if(connected) {
		obs.send('SetCurrentScene', {
			'scene-name': sceneName
		});
	}
	else {
		maxApi.post("not connected to OBS");
	}
});

maxApi.addHandler('set_recording', (state) => {
	if(connected) {
		if(state === "start") {
			obs.send('StartRecording')
			.catch(err => {
				maxApi.post('set_recording error');
				maxApi.post(err);
			});
		}
		else if(state === "stop") {
			obs.send('StopRecording')
			.catch(err => {
				maxApi.post('set_recording error');
				maxApi.post(err);
			});
		}
		else if(state === "pause") {
			obs.send('PauseRecording')
			.catch(err => {
				maxApi.post('set_recording error');
				maxApi.post(err);
			});
		}
		else if(state === "resume") {
			obs.send('ResumeRecording')
			.catch(err => {
				maxApi.post('set_recording error');
				maxApi.post(err);
			});
		}
	}
	else {
		maxApi.post("not connected to OBS");
	}
});

// recording filenames not yet implemented as of obs-websocket v 4.8
// https://github.com/Palakis/obs-websocket/pull/621
obs.on('RecordingStarted', data => {
	maxApi.post(`recording started to ${data.recordingFilename}`)
	maxApi.outlet('start');//, data.recordingFilename);
});

obs.on('RecordingStopped', data => {
	maxApi.post(`recording stopped to ${data.recordingFilename}`)
	maxApi.outlet('stop');//, data.recordingFilename);
});

obs.on('RecordingPaused', data => {
	maxApi.post(`recording paused`)
});

obs.on('RecordingResumed', data => {
	maxApi.post(`recording resumed`)
});

obs.on('SwitchScenes', data => {
	maxApi.post(`New Active Scene ${data.sceneName} with scene items:`);
	for (i in data.sources) {
		maxApi.post(`${data.sources[i].name}`);
	}	
});

// You must add this handler to avoid uncaught exceptions.
obs.on('error', err => {
	maxApi.post('socket error:', err);
});