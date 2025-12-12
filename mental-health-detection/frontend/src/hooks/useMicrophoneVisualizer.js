import { useState, useRef, useCallback } from 'react';

/**
 * A custom hook to analyze microphone input volume in real-time.
 */
export const useMicrophoneVisualizer = () => {
  const [volume, setVolume] = useState(0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);

  const draw = useCallback(() => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Calculate the average volume
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      setVolume(average / 128.0); // Normalize to a 0-1 range
    }
    animationFrameRef.current = requestAnimationFrame(draw);
  }, []);

  const startVisualizing = useCallback(async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
        
        source.connect(analyserRef.current);
        analyserRef.current.fftSize = 256;
        
        animationFrameRef.current = requestAnimationFrame(draw);
      }
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  }, [draw]);

  const stopVisualizing = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    setVolume(0);
  }, []);

  return { volume, startVisualizing, stopVisualizing };
};