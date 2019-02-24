export class Dom {
    static element<T extends HTMLElement>(tagName: string, parent: HTMLElement, className: string = null): T {
        const element = <any>document.createElement(tagName);
        if (className != null) {
            element.className = className;
        }
        parent.appendChild(element);
        return <T>element;
    }

    static div(parent: HTMLElement, className: string = null): HTMLDivElement {
        const div = this.element<HTMLDivElement>("div", parent, className);
        return div;
    }

    static button(label: string, parent: HTMLElement, handler: () => void): HTMLButtonElement {
        const button = this.element<HTMLButtonElement>("button", parent);
        button.textContent = label;
        button.onclick = (e: MouseEvent) => handler();
        return button;
    }

    static iconButton(className: string, parent: HTMLElement, handler: () => void): HTMLButtonElement {
        const button = this.element<HTMLButtonElement>("button", parent);
        button.onclick = (e: MouseEvent) => handler();
        const icon = Dom.element<HTMLElement>("i", button, "fa fa-" + className);
        return button;
    }

    static select(parent: HTMLElement, className: string = null): HTMLSelectElement {
        const select = this.element<HTMLSelectElement>("select", parent, className);
        return select;
    }

    static option(name: string, value: string, parent: HTMLSelectElement): HTMLOptionElement {
        const option = this.element<HTMLOptionElement>("option", parent);
        option.textContent = name;
        option.value = value;
        return option;
    }
}