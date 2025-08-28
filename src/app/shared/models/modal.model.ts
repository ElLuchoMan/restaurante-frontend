export interface ModalButton {
    label: string;
    class?: string;
    action: () => void;
}

export interface ModalSelectOption {
    label: string;
    value: any;
}

export interface ModalSelect {
    label: string;
    options: ModalSelectOption[];
    selected: any;
}

export interface ModalDetails {
    precio: number;
    calorias?: number;
    categoria?: string;
    subcategoria?: string;
    descripcion?: string;
}

export interface ModalData {
    title?: string;
    image?: string;
    message?: string;
    details?: ModalDetails;
    select?: ModalSelect;
    selects?: ModalSelect[];
    input?: { label: string; value: string };
    buttons?: ModalButton[];
}
