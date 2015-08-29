import presets from './presets';
import stepper from './stepper';
import mapTree from './map-tree';
import zero from './zero';


export function interpolateValue(alpha, nextValue, prevValue) {
  if (nextValue === null) {
    return null;
  }
  if (prevValue == null) {
    return nextValue;
  }
  if (typeof nextValue === 'number') {
    return nextValue * alpha + prevValue * (1 - alpha);
  }
  if (nextValue.val != null && nextValue.config && nextValue.config.length === 0) {
    return nextValue;
  }
  if (nextValue.val != null) {
    let ret = {
      val: interpolateValue(alpha, nextValue.val, prevValue.val),
    };
    if (nextValue.config) {
      ret.config = nextValue.config;
    }
    return ret;
  }
  if (Array.isArray(nextValue)) {
    return nextValue.map((_, i) => interpolateValue(alpha, nextValue[i], prevValue[i]));
  }
  if (_.isPlainObject(nextValue)) {
    return Object.keys(nextValue).reduce((ret, key) => {
      ret[key] = interpolateValue(alpha, nextValue[key], prevValue[key]);
      return ret;
    }, {});
  }
  return nextValue;
}

export function updateCurrValue(frameRate, currValue, currVelocity, endValue) {
  if (typeof endValue === 'number') {
    const [k, b] = presets.noWobble;

    return stepper(frameRate, currValue, currVelocity, endValue, k, b)[0];
  }

  return _updateCurrValue(frameRate, currValue, currVelocity, endValue);
}

function _updateCurrValue(frameRate, currValue, currVelocity, endValue, k, b) {
  if (endValue == null) {
    return null;
  }
  if (typeof endValue === 'number') {
    if (k == null || b == null) {
      return endValue;
    }
    return stepper(frameRate, currValue, currVelocity, endValue, k, b)[0];
  }
  if (endValue.val != null && endValue.config && endValue.config.length === 0) {
    return endValue;
  }
  if (endValue.val != null) {
    const [_k, _b] = endValue.config || presets.noWobble;
    let ret = {
      val: _updateCurrValue(frameRate, currValue.val, currVelocity.val, endValue.val, _k, _b),
    };
    if (endValue.config) {
      ret.config = endValue.config;
    }
    return ret;
  }
  if (Array.isArray(endValue)) {
    return endValue.map((_, i) => _updateCurrValue(frameRate, currValue[i], currVelocity[i], endValue[i], k, b));
  }
  if (_.isPlainObject(endValue)) {
    return Object.keys(endValue).reduce((ret, key) => {
      ret[key] = _updateCurrValue(frameRate, currValue[key], currVelocity[key], endValue[key], k, b);
      return ret;
    }, {});
  }
  return endValue;
}

export function updateCurrVelocity(frameRate, currValue, currVelocity, endValue) {
  if (typeof endValue === 'number') {
    const [k, b] = presets.noWobble;

    return stepper(frameRate, currValue, currVelocity, endValue, k, b)[1];
  }

  return _updateCurrVelocity(frameRate, currValue, currVelocity, endValue);
}

function _updateCurrVelocity(frameRate, currValue, currVelocity, endValue, k, b) {
  if (endValue == null) {
    return null;
  }
  if (typeof endValue === 'number') {
    if (k == null || b == null) {
      return mapTree(zero, currVelocity);
    }
    return stepper(frameRate, currValue, currVelocity, endValue, k, b)[1];
  }
  if (endValue.val != null && endValue.config && endValue.config.length === 0) {
    return mapTree(zero, currVelocity);
  }
  if (endValue.val != null) {
    const [_k, _b] = endValue.config || presets.noWobble;
    let ret = {
      val: _updateCurrVelocity(frameRate, currValue.val, currVelocity.val, endValue.val, _k, _b),
    };
    if (endValue.config) {
      ret.config = endValue.config;
    }
    return ret;
  }
  if (Array.isArray(endValue)) {
    return endValue.map((_, i) => _updateCurrVelocity(frameRate, currValue[i], currVelocity[i], endValue[i], k, b));
  }
  if (_.isPlainObject(endValue)) {
    return Object.keys(endValue).reduce((ret, key) => {
      ret[key] = _updateCurrVelocity(frameRate, currValue[key], currVelocity[key], endValue[key], k, b);
      return ret;
    }, {});
  }

  return mapTree(zero, currVelocity);
}
