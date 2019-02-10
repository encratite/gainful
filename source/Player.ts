import { Sample } from "./Sample";
import { Dom } from "./Dom";

export class Player {
	container: HTMLElement;
	topRow: HTMLDivElement;
	bottomRow: HTMLDivElement;
	trackSelect: HTMLSelectElement;
	playButton: HTMLButtonElement;
	stopButton: HTMLButtonElement;

	samples: Sample[];
	samplePromise: Promise<void[]>;
	audioContext: AudioContext;

	constructor(samples: Sample[]) {
		this.samples = samples;
		this.samplePromise = Promise.all<void>(samples.map((sample) => sample.load()));
	}
	
	async render(container: HTMLElement) {
		this.container = container;
		this.container.classList.add("gainfulPlayer");
		const createDiv = () => Dom.createElement<HTMLDivElement>("div", this.container);
		this.topRow = createDiv();
		this.bottomRow = createDiv();
		this.trackSelect = Dom.createElement<HTMLSelectElement>("select", this.topRow, {
			disabled: true,
		});
		this.playButton = Dom.createButton("Play", this.bottomRow, () => this.onPlayButtonClick());
		this.stopButton = Dom.createButton("Stop", this.bottomRow, () => this.onStopButtonClick());
		await this.samplePromise;
		this.samples.forEach((sample) => {
			const option = Dom.createElement<HTMLOptionElement>("option", this.trackSelect, {
				value: sample.path,
				textContent: sample.name,
			});
			this.trackSelect.appendChild(option);
		});
		this.setPlayState(false);
	}

	async initializeContext() {
		if (this.audioContext == null) {
			this.audioContext = new AudioContext();
			const decodePromises = this.samples.map((sample) => sample.decode(this.audioContext));
			await Promise.all(decodePromises);
		}
	}
	
	async onPlayButtonClick() {
		await this.initializeContext();
		const sample = this.getCurrentSample();
		sample.play(() => this.setPlayState(false));
		this.setPlayState(true);
	}
	
	onStopButtonClick() {
		const sample = this.getCurrentSample();
		sample.stop();
	}

	setPlayState(playing: boolean) {
		this.trackSelect.disabled = playing;
		this.playButton.disabled = playing;
		this.stopButton.disabled = !playing;
	}

	getCurrentSample(): Sample {
		const sample = this.samples.find((s) => s.path === this.trackSelect.value);
		return sample;
	}
}