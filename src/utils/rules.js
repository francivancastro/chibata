function sizeRule(size, text) {
  return (value) => {
    if (!value) return true;
    if (typeof value == "number") value = value.toString();
    return (
      (value || " ").length === size ||
      (text ?? `Aceita exatamente ${size} caracteres`)
    );
  };
}

function minSizeRule(size, text) {
  return (value) => {
    if (!value) return true;
    if (typeof value == "number") value = value.toString();
    return (
      (value || " ").length >= size ||
      (text ?? `Informe pelo menos ${size} caracteres`)
    );
  };
}

function maxSizeRule(size, text) {
  return (value) => {
    if (!value) return true;
    if (typeof value == "number") value = value.toString();
    return (
      (value || " ").length <= size || (text ?? `Aceita até ${size} caracteres`)
    );
  };
}

function regexRule(regex, text) {
  return (value) => {
    if (!value) return true;
    return regex.test(value) || (text ?? "Valor Inválido");
  };
}

function required() {
  return (value) => !!value || "Campo Obrigatório";
}

export default {
  regexRule,
  sizeRule,
  minSizeRule,
  maxSizeRule,
  required,
};
