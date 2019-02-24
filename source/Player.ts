import { Sample } from "./Sample.js";
import { Dom } from "./Dom.js";
import { Effect } from "./Effect.js";
import { Effects } from "./Effects.js";

export class Player {
	container: HTMLElement;

	menuBox: HTMLDivElement;
	
	sampleBox: HTMLDivElement;
	trackSelect: HTMLSelectElement;
	playButton: HTMLButtonElement;
	stopButton: HTMLButtonElement;

	addEffectBox: HTMLDivElement;
	effectList: HTMLSelectElement;

	samples: Sample[];
	samplePromise: Promise<void[]>;
	audioContext: AudioContext;

	constructor(samples: Sample[]) {
		this.samples = samples;
		this.samplePromise = Promise.all<void>(samples.map((sample) => sample.load()));
	}
	
	async render(container: HTMLElement) {
		this.container = container;
		this.container.classList.add("gainful");
		this.menuBox = Dom.div(this.container, "menu");
		this.sampleBox = Dom.div(this.menuBox, "samples");
		this.trackSelect = Dom.select(this.sampleBox);
		this.trackSelect.disabled = true;
		this.playButton = Dom.iconButton("play", this.sampleBox, () => this.onPlayButtonClick());
		this.stopButton = Dom.iconButton("stop", this.sampleBox, () => this.onStopButtonClick());
		this.renderEffectMenu();
		await this.samplePromise;
		this.samples.forEach((sample) => {
			Dom.option(sample.name, sample.path, this.trackSelect);
		});
		this.setPlayState(false);
	}

	renderEffectMenu() {
		this.addEffectBox = Dom.div(this.menuBox, "addEffect");
		this.effectList = Dom.select(this.addEffectBox);
		Effects.forEach((name: string, effectConstructor: () => Effect) => {
			Dom.option(name, name, this.effectList);
		});
		Dom.button("Add", this.addEffectBox, () => this.onAddEffectClick());
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

	onAddEffectClick() {
		const effect = Effects.create(this.effectList.value);
		throw new Error("Not implemented.");
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