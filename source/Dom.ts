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
            onclick: (e: MouseEvent) => handler(),
        });
        return button;
    }

    static createIconButton(className: string, container: HTMLElement, handler: () => void): HTMLButtonElement {
        const button = Dom.createElement<HTMLButtonElement>("button", container, {
            onclick: (e: MouseEvent) => handler(),
        });
        const icon = Dom.createElement<HTMLElement>("i", button, {
            className: "fa fa-" + className
        });
        return button;
    }
}