export class Dom {
    static createElement<T extends HTMLElement>(tagName: string, parent: HTMLElement, properties: any = {}): T {
        const element = <any>document.createElement(tagName);
        parent.appendChild(element);
        for (const name in properties) {
            element[name] = properties[name];
        };
        return <T>element;
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