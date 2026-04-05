module.exports = function pLimitMock() {
  return (fn) => Promise.resolve().then(fn);
};
