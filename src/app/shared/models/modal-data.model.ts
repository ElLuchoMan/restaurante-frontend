export interface ModalButton {
    label: string;
    class: string;
    action: () => void;
}

export interface ModalOption<T = unknown> {
    label: string;
    value: T;
}

export interface ModalSelect<T = unknown> {
    label: string;
    options: ModalOption<T>[];
    selected: T | null;
}

export interface ModalData {
    title: string;
    message?: string;
    image?: string;
    select?: ModalSelect;
    selects?: ModalSelect[];
    buttons: ModalButton[];
}
