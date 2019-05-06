import moment from 'moment';

const timeFormat = 'YYYY-MM-DD HH:mm:ss';

export function _dateFormat(date = new Date(), format = timeFormat) {
  return moment(date).format(format);
}

export function _timeStampToDate(timeStamp, format = timeFormat) {
  return moment(new Date(timeStamp * 1000)).format(format);
}
