function integerToStringWithTwoNumbers(integer) {
  var string = '' + integer;
  if (string.length === 1) {
    string = '0' + string;
  }
  return string;
}

export default function formatDuration(durationInMs) {
  var durationInS = parseInt(durationInMs / 1000);
  var hours = parseInt(durationInS / 3600),
      minutes = integerToStringWithTwoNumbers(parseInt(durationInS / 60) % 60),
      seconds = integerToStringWithTwoNumbers(parseInt(durationInS) % 60);
  return '' + hours + ':' + minutes + ':' + seconds;
}
