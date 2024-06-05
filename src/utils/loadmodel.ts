import * as tf from '@tensorflow/tfjs';

export async function loadModel() {
  const model = await tf.loadLayersModel('/model/model.json');
  // const model = await tf.loadLayersModel('/test_model/xray_model.json');
  return model;
}

export default loadModel;