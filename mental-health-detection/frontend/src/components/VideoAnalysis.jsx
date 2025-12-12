import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import { Button } from './ui/button';
import { Video, VideoOff, Loader2, AlertTriangle } from 'lucide-react';
import { EmotionChart } from './EmotionChart';

let modelsLoaded = false;

export function VideoAnalysis({ onEmotionChange }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [status, setStatus] = useState('Idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [detectedExpressions, setDetectedExpressions] = useState(null);
  
  // Function to load AI models
  const loadModels = async () => {
    if (modelsLoaded) return true;
    const MODEL_URL = '/models';
    try {
      setStatus('Loading Models');
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
      ]);
      modelsLoaded = true;
      setStatus('Idle');
      return true;
    } catch (error) {
      console.error('CRITICAL: Error loading face-api.js models:', error);
      setErrorMessage('Could not load AI models. Please check public/models folder.');
      setStatus('Error');
      return false;
    }
  };

  useEffect(() => {
    loadModels();
    // Cleanup on component unmount
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Rewritten effect for starting/stopping camera and analysis
  useEffect(() => {
    let intervalId;

    const startVideoAndAnalysis = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStatus('Running');
        }

        // Start analysis loop
        intervalId = setInterval(async () => {
          // Add a strong safeguard inside the loop
          if (videoRef.current && videoRef.current.readyState === 4) {
            
            // Final check: ensure video has dimensions before proceeding
            if (videoRef.current.clientWidth === 0 || videoRef.current.clientHeight === 0) {
              return; // Skip this frame if dimensions aren't ready
            }

            const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.SsdMobilenetv1Options()).withFaceLandmarks().withFaceExpressions();
            
            if (detections && detections.length > 0) {
              const expressions = detections[0].expressions;
              setDetectedExpressions(expressions);
              const dominantEmotion = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);
              onEmotionChange(dominantEmotion);
            } else {
              setDetectedExpressions(null);
              onEmotionChange(null);
            }
          }
        }, 1000); // Analyze once per second

      } catch (error) {
        console.error('Error accessing camera:', error);
        setErrorMessage('Camera permission denied or camera not found.');
        setStatus('Error');
        setIsCameraOn(false);
      }
    };

    const stopVideo = () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      clearInterval(intervalId);
    };

    if (isCameraOn) {
      startVideoAndAnalysis();
    } else {
      stopVideo();
    }

    // This is the critical cleanup function for the effect
    return () => {
      clearInterval(intervalId);
      stopVideo();
    };
  }, [isCameraOn, onEmotionChange]);

  const handleButtonClick = async () => {
    setErrorMessage('');
    if (!isCameraOn) {
      setStatus('Requesting Camera');
      const modelsAreLoaded = await loadModels();
      if (modelsAreLoaded) {
        setIsCameraOn(true);
      }
    } else {
      setIsCameraOn(false);
      setStatus('Idle');
      setDetectedExpressions(null);
      onEmotionChange(null);
    }
  };
  
  const getButtonContent = () => {
    if (status === 'Loading Models' || status === 'Requesting Camera') return <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading...</>;
    if (isCameraOn) return <><VideoOff className="w-4 h-4 mr-2" /> Stop Camera</>;
    return <><Video className="w-4 h-4 mr-2" /> Start Camera</>;
  };

  return (
    <div className="p-6 mt-8 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Video className="w-8 h-8 mr-3 text-violet-600" />
          <div>
            <h3 className="text-xl font-semibold">Real-time Video Analysis</h3>
            <p className="text-slate-500">See a live analysis of facial expressions.</p>
          </div>
        </div>
        <Button type="button" onClick={handleButtonClick} variant="outline" size="sm" disabled={status === 'Loading Models' || status === 'Requesting Camera'}>
          {getButtonContent()}
        </Button>
      </div>

      {status === 'Error' && (
        <div className="flex items-center p-3 mt-4 text-sm text-red-700 border border-red-200 rounded-md bg-red-50">
          <AlertTriangle className="flex-shrink-0 w-5 h-5 mr-3" />
          <p>{errorMessage}</p>
        </div>
      )}

      {isCameraOn && (
        <div className="grid items-center grid-cols-1 gap-6 mt-4 md:grid-cols-2">
          <div className="relative overflow-hidden border rounded-md aspect-video">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scaleX(-1)" />
            {/* Canvas is no longer needed for drawing, but can be kept for future use */}
            {/* <canvas ref={canvasRef} className="absolute top-0 left-0" /> */}
          </div>
          <EmotionChart expressions={detectedExpressions} />
        </div>
      )}
    </div>
  );
}

