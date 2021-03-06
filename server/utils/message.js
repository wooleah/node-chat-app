var moment = require('moment');

var generateMessage = (from, text, color) => {
  return {
    from,
    text,
    color,
    createdAt: moment().valueOf()
  };
};

// var generateMediaMessage = (from, media) => {
//
// };

var generateLocationMessage = (from, lat, lng, color) => {
  return {
    from,
    url: `https://www.google.com/maps?q=${lat},${lng}`,
    color,
    createdAt: moment().valueOf()
  };
};

module.exports = {generateMessage, generateLocationMessage};
