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

	effectBox: HTMLDivElement;

	samples: Sample[];
	samplePromise: Promise<void[]>;
	audioContext: AudioContext;

	effects: Effect[] = [];

	constructor(samples: Sample[]) {
		this.samples = samples;
		this.samplePromise = Promise.all<void>(samples.map((sample) => sample.load()));
	}
	
	async render(container: HTMLElement) {
		this.container = container;
		this.container.classList.add("gainful");
		this.menuBox = Dom.div(this.container, "menu");
		this.renderSampleMenu();
		this.renderEffectMenu();
		this.effectBox = Dom.div(this.container, "effects");
		await this.samplePromise;
		for (const sample of this.samples) {
			Dom.option(sample.name, sample.path, this.trackSelect);
		}
		this.setPlayState(false);
	}

	renderSampleMenu() {
		this.sampleBox = Dom.div(this.menuBox, "samples");
		this.trackSelect = Dom.select(this.sampleBox);
		this.trackSelect.disabled = true;
		this.playButton = Dom.iconButton("play", this.sampleBox, () => this.onPlayButtonClick());
		this.stopButton = Dom.iconButton("stop", this.sampleBox, () => this.onStopButtonClick());
	}

	renderEffectMenu() {
		this.addEffectBox = Dom.div(this.menuBox, "addEffect");
		this.effectList = Dom.select(this.addEffectBox);
		Effects.forEach((name: string, effectConstructor: () => Effect) => {
			Dom.option(name, name, this.effectList);
		});
		Dom.button("Add", this.addEffectBox, () => this.onAddEffectClick());
	}

	renderEffects() {
		while (this.effectBox.hasChildNodes()) {
			this.effectBox.removeChild(this.effectBox.firstChild);
		}
		for (const effect of this.effects) {
			effect.render(this.effectBox);
		}
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
		effect.setAudioContext(this.audioContext);
		this.effects.push(effect);
		this.renderEffects();
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