import { useEffect, useState } from 'react';

// This will hold the browser's speech recognition instance
let recognition = null;

// Check if the browser supports the Web Speech API
if ("webkitSpeechRecognition" in window) {
  recognition = new window.webkitSpeechRecognition();
  recognition.continuous = true; // Keep listening even after a pause
  recognition.lang = "en-US";     // Set the language
}

/**
 * A custom React hook to handle speech recognition.
 */
export const useSpeechRecognition = () => {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (!recognition) return;

    // This function is called whenever the API detects speech
    recognition.onresult = (event) => {
      // We build the full transcript from all the results
      const fullTranscript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      setText(fullTranscript);
    };

    // Fired when the microphone stops listening
    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };
  }, []);

  const startListening = () => {
    if (recognition && !isListening) {
      setText("");
      setIsListening(true);
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      setIsListening(false);
      recognition.stop();
    }
  };

  return {
    text,
    isListening,
    startListening,
    stopListening,
    hasRecognitionSupport: !!recognition, // A boolean to check if the browser supports this feature
  };
};