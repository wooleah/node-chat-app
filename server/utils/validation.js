var isRealString = (str) => {
  return typeof str === 'string' && str.trim().length > 0;
};

var isValidURL = (str) => {
  if(new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?").test(str)) {
        return true;
  }else{
    return false;
  }
};

module.exports = {isRealString, isValidURL};
