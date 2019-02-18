import { Sample } from "./Sample.js";
import { Dom } from "./Dom.js";
import { Effect } from "./Effect.js";
import { Effects } from "./Effects.js";

export class Player {
	container: HTMLElement;
	
	topRow: HTMLDivElement;
	trackSelect: HTMLSelectElement;
	playButton: HTMLButtonElement;
	stopButton: HTMLButtonElement;
	addEffectMenu: HTMLDivElement;

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
		this.topRow = Dom.createElement<HTMLDivElement>("div", this.container, {
			className: "topRow"
		});
		this.trackSelect = Dom.createElement<HTMLSelectElement>("select", this.topRow, {
			disabled: true
		});
		this.playButton = Dom.createIconButton("play", this.topRow, () => this.onPlayButtonClick());
		this.stopButton = Dom.createIconButton("stop", this.topRow, () => this.onStopButtonClick());
		Dom.createIconButton("bars", this.topRow, () => this.onOpenEffectMenuButtonClick());
		this.renderEffectMenu();
		await this.samplePromise;
		this.samples.forEach((sample) => {
			const option = Dom.createElement<HTMLOptionElement>("option", this.trackSelect, {
				value: sample.path,
				textContent: sample.name
			});
			this.trackSelect.appendChild(option);
		});
		this.setPlayState(false);
	}

	renderEffectMenu() {
		this.addEffectMenu = Dom.createElement<HTMLDivElement>("div", this.topRow, {
			className: "addEffectMenu"
		});
		this.addEffectMenu.style.display = "none";
		const effectList = Dom.createElement<HTMLUListElement>("ul", this.addEffectMenu);
		Effects.forEach((name: string, effectConstructor: () => Effect) => {
			Dom.createElement<HTMLLIElement>("li", effectList, {
				textContent: name,
				onclick: () => this.onAddEffectClick(name, effectConstructor)
			});
		});
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

	onOpenEffectMenuButtonClick() {
		this.showAddEffectMenu(true);
	}

	onAddEffectClick(name: string, effectConstructor: () => Effect) {
		const effect = effectConstructor();
		throw new Error("Not implemented.");
	}

	setPlayState(playing: boolean) {
		this.trackSelect.disabled = playing;
		this.playButton.disabled = playing;
		this.stopButton.disabled = !playing;
	}

	showAddEffectMenu(show: boolean) {
		this.addEffectMenu.style.display = show ? "block" : "none";
	}

	getCurrentSample(): Sample {
		const sample = this.samples.find((s) => s.path === this.trackSelect.value);
		return sample;
	}
}