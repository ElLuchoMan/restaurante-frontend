export interface ModalButton {
  label: string;
  class?: string;
  action: () => void;
}

export interface ModalSelectOption {
  label: string;
  value: string | number | boolean;
}

export interface ModalSelect {
  label: string;
  options: ModalSelectOption[];
  selected: string | number | boolean | null;
}

export interface ModalInput {
  label: string;
  value: string;
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
  input?: ModalInput;
  buttons?: ModalButton[];
}
