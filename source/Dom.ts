export class Dom {
    static createElement<T extends HTMLElement>(tagName: string, parent: HTMLElement, properties: any = {}): T {
        const element = <T>document.createElement(tagName);
        parent.appendChild(element);
        for (const name in properties) {
            const descriptor = Object.getOwnPropertyDescriptor(properties, name);
            Object.defineProperty(element, name, { value: descriptor.value, writable: true });
        };
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