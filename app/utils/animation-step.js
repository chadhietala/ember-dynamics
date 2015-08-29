import { updateCurrVelocity, updateCurrValue } from './update-tree';
import noVelocity from './no-velocity';
import mergeDiff from './merge-diff';
import mapTree from './map-tree';
import zero from './zero';
import compareTrees from './compare-trees';


export default function animationStep(shouldMerge, stopAnimation, getAttrs, timestep, attrs) {
  let { currValue, currVelocity } = attrs;
  let { willEnter, willLeave, endValue } = getAttrs();


  if (typeof endValue === 'function') {
    endValue = endValue(currValue);
  }

  let mergedValue = endValue;
  let hasNewKey = false;
  if (shouldMerge) {
    mergedValue = mergeDiff(currValue, endValue, (key) => {
      const res = willLeave(key, currValue[key], endValue, currValue, currVelocity);
      if (res === null) {
        return null;
      }

      if ( noVelocity(currVelocity[key]) && compareTrees(currValue[key], res)) {
        return null;
      }

      return res;
    });


    Object.keys(mergedValue)
    .filter( key => {
      return !currValue.hasOwnProperty(key);
    })
    .forEach( key => {
      hasNewKey = true;
      const enterValue  = willEnter(key, mergedValue[key], endValue, currValue, currVelocity);
      mergedValue[key] = enterValue;

      currValue = {
        ...currValue,
        [key]: enterValue
      };
      currVelocity = {
        ...currVelocity,
        [key]: mapTree(zero, enterValue)
      };
    });
  }

  const newCurrValue = updateCurrValue(timestep, currValue, currVelocity, mergedValue);
  const newCurrVelocity = updateCurrVelocity(timestep, currValue, currVelocity, mergedValue);

  if (!hasNewKey && noVelocity(currVelocity) && noVelocity(newCurrVelocity)) {
    // check explanation in `Spring.animationRender`
    stopAnimation(); // Nasty side effects....
  }

  return {
    currValue: newCurrValue,
    currVelocity: newCurrVelocity,
  };
}
