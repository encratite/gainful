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

export class Sample {
	name: string;
	path: string;
	arrayBuffer: ArrayBuffer;
	audioContext: AudioContext;
	audioBuffer: AudioBuffer;
	sourceNode: AudioBufferSourceNode;

	constructor(name: string, path: string) {
		this.name = name;
		this.path = path;
	}
	
	async load() {
		const response = await fetch(this.path);
		this.arrayBuffer = await response.arrayBuffer();
	}
	
	async decode(audioContext: AudioContext) {
		this.audioContext = audioContext;
		this.audioBuffer = await audioContext.decodeAudioData(this.arrayBuffer);
	}

	play(onEnded: () => void) {
		this.sourceNode = this.audioContext.createBufferSource();
		this.sourceNode.buffer = this.audioBuffer;
		this.sourceNode.onended = (e: Event) => onEnded();
		this.sourceNode.connect(this.audioContext.destination);
		this.sourceNode.start();
	}

	stop() {
		if (this.sourceNode != null) {
			this.sourceNode.stop();
			delete this.sourceNode;
		}
	}
}

export class EffectFactory {
	name: string;
	type: () => Effect;

	constructor(name: string, type: () => Effect) {
		this.name = name;
		this.type = type;
	}

	create(): Effect {
		const effect = this.type();
		return effect;
	}
}

export abstract class Effect {
	parameters: EffectParameter[] = [];

	abstract process(input: Float32Array[]): Float32Array[];

	render(container: HTMLElement) {
		const table = Dom.createElement<HTMLTableElement>("table", container);
		for (let parameter of this.parameters) {
			const row = Dom.createElement<HTMLTableRowElement>("tr", table);
			parameter.render(row);
		};
	}
}

export class EffectParameter {
	name: string;
	defaultValue: number;
	min: number;
	max: number;
	step: number;

	value: number;

	constructor(name: string, defaultValue: number, min: number, max: number, step: number) {
		this.name = name;
		this.defaultValue = defaultValue;
		this.min = min;
		this.max = max;
		this.step = step;
		this.value = defaultValue;
	}

	render(row: HTMLTableRowElement) {
		const nameCell = Dom.createElement<HTMLTableCellElement>("td", row, {
			textContent: this.name
		});
		const rangeCell = Dom.createElement<HTMLTableCellElement>("td", row);
		const range = Dom.createElement<HTMLInputElement>("input", rangeCell, {
			type: "range",
			min: this.min,
			max: this.max,
			step: this.step,
			value: this.value
		});
		const inputCell = Dom.createElement<HTMLTableCellElement>("td", row);
		const input = Dom.createElement<HTMLInputElement>("input", row, {
			value: this.value
		});
	}
}

class Dom {
	static createElement<T extends HTMLElement>(tagName: string, parent: HTMLElement, properties: Object = {}): T {
		const element = <T>document.createElement(tagName);
		parent.appendChild(element);
		for  (let property in properties) {
			const value = properties[property];
			element[property] = value;
		}
		return element;
	}

	static createButton(label: string, container: HTMLElement, handler: () => void): HTMLButtonElement {
		const button = Dom.createElement<HTMLButtonElement>("button", container, {
			textContent: label,
			disabled: true,
			onclick: (e: MouseEvent) => handler(),
		});
		return button;
	}
}