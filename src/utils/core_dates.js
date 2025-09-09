import {DateTime} from 'luxon';

const core_print_datetime = (date, formato) => {
  // Recibe datetime en formato 2023-10-22T13:05:48.587882Z
  // retorna 22-10-2023 08:05 PM

  let data = '';
  let formatoData = '';
  if (!formato) {
    formatoData = 'dd-MM-yyyy hh:mm a';
  }

  try {
    data = DateTime.fromISO(date).toFormat(formatoData);
  } catch (error) {
    console.log(error);
  }
  return data;
};

const core_print_date = (date, formato) => {
  try {
    const fecha = DateTime.fromISO(date);
    return fecha.toFormat('dd-MM-yyyy');
  } catch (error) {
    console.error('Error al obtener solo la fecha:', error);
    return null;
  }
};

const core_print_time = (date, formato) => {
  try {
    const fecha = DateTime.fromISO(date);
    return fecha.toFormat('hh:mm a');
  } catch (error) {
    console.error('Error al obtener solo la hora:', error);
    return null;
  }
};

const corePrintDiffDates = (startDate, endDate, formato) => {
  // Recibe datetime en formato 2023-10-22T13:05:48.587882Z
  // retorna 22-10-2023 08:05 PM
  let data = '';

  let formatoData = '';
  if (!formato) {
    formatoData = 'dd-mm-yyyy hh:mm a';
  }

  try {
    const fecha1 = DateTime.fromISO(startDate);
    const fecha2 = DateTime.fromISO(endDate);
    data = fecha2.diff(fecha1).shiftTo('days', 'hours', 'minutes', 'seconds');
  } catch (error) {
    console.log(error);
  }
  return data;
};

export {
  core_print_datetime,
  corePrintDiffDates,
  core_print_date,
  core_print_time,
};
