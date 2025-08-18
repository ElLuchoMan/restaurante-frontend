export interface ModalOption {
  label: string;
  value: any;
}

export interface ModalSelect {
  label: string;
  options: ModalOption[];
  selected: any;
}

export interface ModalButton {
  label: string;
  class: string;
  action: () => void;
}

export interface ModalData {
  title: string;
  message?: string;
  image?: File | string;
  selects?: ModalSelect[];
  buttons?: ModalButton[];
}
