function formatearNumeroTelefono(numero) {
  // Eliminar cualquier carácter que no sea un dígito
  let numeroLimpio = numero.replace(/\D/g, '');

  // Verificar si el número es de formato internacional
  if (numeroLimpio.startsWith('1')) {
    // Si el número comienza con 1, supongamos que es un código de país y eliminamos ese 1
    numeroLimpio = numeroLimpio.substring(1);
  }

  // Aplicar formato según el país
  if (numeroLimpio.startsWith('57')) {
    // Si el número comienza con 57, supongamos que es de Colombia y le aplicamos el formato
    return `+57 ${numeroLimpio.substring(2, 4)} ${numeroLimpio.substring(
      4,
      7,
    )} ${numeroLimpio.substring(7)}`;
  } else {
    // Si no es de Colombia, simplemente devolvemos el número sin formato
    return numero;
  }
}

const formatPrice = (str, data = {style: 'currency', currency: 'COP'}) => {
  try {
    return Number(str).toLocaleString('es-CO', {...data}); //('es-CO', {style: 'currency', currency: 'COP'});
  } catch (error) {
    return '0';
  }
};

const cropText = (text, size = 5) => {
  // recibe un string y un tamaño, cuando se llega a la pocicion del size, se colocan 3 puntos adicionales
  try {
    return text && text.length > size
      ? text.substring(0, size) + '...'
      : text || '';
  } catch (error) {}
};

export {formatearNumeroTelefono, cropText, formatPrice};
