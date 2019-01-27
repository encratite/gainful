export class Player {
	container: HTMLElement;
	topRow: HTMLDivElement;
	bottomRow: HTMLDivElement;
    trackSelect: HTMLSelectElement;
    playButton: HTMLButtonElement;
    stopButton: HTMLButtonElement;

    samples: Array<Sample>;
    samplePromise: Promise<void[]>;
    audioContext: AudioContext;

	constructor(samples: Array<Sample>) {
		this.samples = samples;
		this.samplePromise = Promise.all<void>(samples.map((sample) => sample.load()));
	}
	
	async render(container: HTMLElement) {
		this.container = container;
		this.container.classList.add("gainfulPlayer");
		const createDiv = () => this.createElement<HTMLDivElement>("div", this.container);
		this.topRow = createDiv();
		this.bottomRow = createDiv();
		this.trackSelect = this.createElement<HTMLSelectElement>("select", this.topRow, {
			disabled: true,
		});
		this.playButton = this.createButton("Play", () => this.onPlayButtonClick());
		this.stopButton = this.createButton("Stop", () => this.onStopButtonClick());
		await this.samplePromise;
		this.samples.forEach((sample) => {
			const option = this.createElement<HTMLOptionElement>("option", this.trackSelect, {
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
	
	createElement<T extends HTMLElement>(tagName: string, parent: HTMLElement, properties: Object = {}): T {
		const element = <T>document.createElement(tagName);
		parent.appendChild(element);
		for  (let property in properties) {
			const value = properties[property];
			element[property] = value;
		}
		return element;
	}

	createButton(label: string, handler: () => void): HTMLButtonElement {
		const button = this.createElement<HTMLButtonElement>("button", this.bottomRow, {
			textContent: label,
			disabled: true,
			onclick: (e: MouseEvent) => handler(),
		});
		return button;
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