var InputSnapshot,
  __hasProp = Object.prototype.hasOwnProperty;

InputSnapshot = (function() {

  InputSnapshot.name = 'InputSnapshot';

  function InputSnapshot() {
    this.states = [
      {
        left: false,
        right: false,
        up: false
      }
    ];
  }

  InputSnapshot.prototype.get = function(name, player) {
    return this.states[player][name];
  };

  InputSnapshot.prototype.getState = function(player) {
    var key, state, val, _ref;
    state = {};
    _ref = this.states[player];
    for (key in _ref) {
      if (!__hasProp.call(_ref, key)) continue;
      val = _ref[key];
      state[key] = val;
    }
    return state;
  };

  InputSnapshot.prototype.setState = function(newStates, player) {
    var key, val, _results;
    _results = [];
    for (key in newStates) {
      if (!__hasProp.call(newStates, key)) continue;
      val = newStates[key];
      _results.push(this.states[player][key] = newStates[key]);
    }
    return _results;
  };

  InputSnapshot.prototype.left = function(player) {
    return this.states[player]['left'];
  };

  InputSnapshot.prototype.right = function(player) {
    return this.states[player]['right'];
  };

  InputSnapshot.prototype.up = function(player) {
    return this.states[player]['up'];
  };

  return InputSnapshot;

})();

if (module) module.exports = InputSnapshot;
