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