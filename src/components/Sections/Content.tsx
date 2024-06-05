"use client"; // Ensure this component is treated as a client component

import React, { useEffect, useState } from 'react';
import { FileInput } from "flowbite-react";
import * as tf from '@tensorflow/tfjs';
import loadModel from '../../utils/loadmodel';

export default function Nyoba() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [predictionResult, setPredictionResult] = useState<string>('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement> | undefined) => {
    if (!event) {
      return;
    }
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPredictionResult(''); 
    }
  };

  const handlePredictClick = async () => {
    if (selectedFile) {
      const model = await loadModel();
      const predictedClass = await predictImage(model, selectedFile);
      setPredictionResult(predictedClass);
    }
  };

  useEffect(() => {
    handleFileUpload(undefined)
  })

  const preprocessImage = async (img: HTMLImageElement): Promise<tf.Tensor> => {
    const resizedImg = tf.image.resizeBilinear(tf.browser.fromPixels(img), [150, 150]);
    const normalizedImg = resizedImg.div(tf.scalar(255));
    const expandedImg = normalizedImg.expandDims(0);
    return expandedImg;
  };

  const predictImage = async (model: tf.LayersModel, file: File): Promise<string> => {
    const img = new Image();
    const imageUrl = URL.createObjectURL(file);
    img.src = imageUrl;

    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
    });

    const processedImg = await preprocessImage(img);

    console.log('Model Input Shape:', model.inputs[0].shape);
    console.log('Processed Image Shape:', processedImg.shape);

    const prediction = model.predict(processedImg) as tf.Tensor;
    const predictionData = await prediction.data();

    console.log('Prediction Data:', predictionData);

    const predictionArray = Array.from(predictionData);
    const predictedClassIndex = predictionArray.indexOf(Math.max(...predictionArray));
    const predictedClass = predictedClassIndex === 0 ? 'Normal' : 'Pneumonia';

    return predictedClass;
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-neutral-800">
      <div className="p-12 rounded-md shadow-md bg-neutral-100 max-w-3xl w-full">
        <h1 className="text-3xl font-bold text-black mb-8 text-center">Image Prediction</h1>
        <div className="mb-4">
          <label htmlFor="file-upload" className="block text-gray-700 font-bold mb-2">
            Upload file
          </label>
          <FileInput id="file-upload" accept="image/*" onChange={handleFileUpload} />
        </div>
        <button
          onClick={handlePredictClick}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded mb-4"
        >
          Predict
        </button>
        {selectedFile && (
          <div className="mt-4">
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="Uploaded"
              className="max-w-[400px] h-auto mx-auto"
            />
            <p className="mt-2 text-gray-700 text-center">Prediction: {predictionResult}</p>
          </div>
        )}
      </div>
    </div>
  );


}
