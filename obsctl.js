const maxApi = require('max-api');
const { default: OBSWebSocket } = require('obs-websocket-js');
const obs = new OBSWebSocket();

maxApi.post("hello n4m-obs");

let connected = false;

const port = 4455;

maxApi.addHandler('connect', () => {
	
	// To use LAN, or if password enabled, change to something like below, replacing with your server IP and password
	//obs.connect(`ws://192.168.1.17:4455`, 'your_obs_websocket_password').then((info) => {
	
	obs.connect(`ws://localhost:${port}`, 'password').then((info) => {
		maxApi.post('Connected and identified', info);
	}, () => {
		maxApi.post('Error Connecting, check your port and password (if enabled)');
	});
});

maxApi.addHandler('set_scene', (sceneName) => {
	if(connected) {
		obs.call('SetCurrentProgramScene', {
			'sceneName': sceneName
		});
	}
	else {
		maxApi.post("not connected to OBS");
	}
});

maxApi.addHandler('set_recording', (state) => {
	if(connected) {
		if(state === "start") {
			obs.call('StartRecord')
			.catch(err => {
				maxApi.post('set_recording error');
				maxApi.post(err);
			});
		}
		else if(state === "stop") {
			obs.call('StopRecord')
			.catch(err => {
				maxApi.post('set_recording error');
				maxApi.post(err);
			});
		}
		else if(state === "pause") {
			obs.call('PauseRecord')
			.catch(err => {
				maxApi.post('set_recording error');
				maxApi.post(err);
			});
		}
		else if(state === "resume") {
			obs.call('ResumeRecord')
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

function outputSceneList(scenes)
{
	maxApi.outlet('scenelist');
	scenes.forEach(scene => {
		maxApi.outlet("scene", scene.sceneName);
	});
}

// Declare some events to listen for.
obs.on('ConnectionOpened', () => {
	maxApi.post('Connection Opened');
});

obs.on('Identified', () => {
	maxApi.post('Identified, good to go!')

	obs.call('GetSceneList').then((data) => {
		connected = true;
		
		maxApi.post(`Current Scene is ${data.currentScene}`);
		maxApi.post(`${data.scenes.length} Available Scenes`);
		maxApi.post(data.scenes);
		outputSceneList(data.scenes);
	});
});

obs.on('RecordStateChanged', data => {
	if(data.outputState == 'OBS_WEBSOCKET_OUTPUT_STARTED') {
		maxApi.post(`recording started to ${data.outputPath}`)
		maxApi.outlet('start', data.outputPath);
	}
	else if(data.outputState == 'OBS_WEBSOCKET_OUTPUT_STOPPED') {
		maxApi.post(`recording stopped to ${data.outputPath}`)
		maxApi.outlet('stop', data.outputPath);
	}
	else if(data.outputState == 'OBS_WEBSOCKET_OUTPUT_PAUSED') {
		maxApi.post('recording paused');
	}
	else if(data.outputState == 'OBS_WEBSOCKET_OUTPUT_RESUMED') {
		maxApi.post('recording resumed');
	}
});

obs.on('CurrentProgramSceneChanged', data => {
	maxApi.post(`New Active Scene ${data.sceneName}`);
});

obs.on('SceneListChanged', data => {
	maxApi.post('scene list changed');
	maxApi.post(data.scenes);
	outputSceneList(data.scenes);
});

// You must add this handler to avoid uncaught exceptions.
obs.on('error', err => {
	maxApi.post('socket error:', err);
});
