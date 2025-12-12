import React, { useState, useEffect, useRef } from 'react';
import WAVES from 'vanta/dist/vanta.waves.min';
import * as THREE from 'three';
import toast, { Toaster } from 'react-hot-toast';


import {
  Activity, BarChart2, Bookmark, ChevronsDown, Cpu, Home, Loader,
  Menu, Mic, MicOff, Search, Zap, AlertTriangle, Heart, Shield
} from 'react-feather';


import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ResourcesModal } from './components/ResourcesModal';
import { HighlightedText } from './components/HighlightedText';
import { VideoAnalysis } from './components/VideoAnalysis';


import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useMicrophoneVisualizer } from './hooks/useMicrophoneVisualizer';

function App() {
  
  const [activeTab, setActiveTab] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState(null);

  
  const {
    text: transcribedText,
    isListening,
    startListening,
    stopListening,
    hasRecognitionSupport
  } = useSpeechRecognition();

  const { volume, startVisualizing, stopVisualizing } = useMicrophoneVisualizer();

  useEffect(() => {
    if (transcribedText) {
      setText(transcribedText);
    }
  }, [transcribedText]);

  const handleStartRecording = () => { startListening(); startVisualizing(); };
  const handleStopRecording = () => { stopListening(); stopVisualizing(); };

  
  const [vantaEffect, setVantaEffect] = useState(null);
  const vantaRef = useRef(null);

  useEffect(() => {
    if (!vantaEffect && vantaRef.current) {
      setVantaEffect(WAVES({
        el: vantaRef.current,
        THREE: THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: 0x6366f1,
        shininess: 50.00,
        waveHeight: 10.00,
        waveSpeed: 0.75,
      }));
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    try {
      const response = await fetch("https://nayanhello-mindscope-backend.hf.space/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text, emotion: detectedEmotion }),
      });
      if (!response.ok) { throw new Error("Prediction request failed."); }
      const data = await response.json();
      setResult(data);
      setActiveTab('detect');
    } catch (error) {
      console.error("An error occurred:", error);
      toast.error("An error occurred during analysis. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  
  const getResultStyle = (level) => {
    switch (level) {
      case 2: return { bgColor: 'bg-red-50', borderColor: 'border-red-200', textColor: 'text-red-700', icon: <AlertTriangle className="w-6 h-6 text-red-600" /> };
      case 1: return { bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', textColor: 'text-yellow-700', icon: <Heart className="w-6 h-6 text-yellow-600" /> };
      default: return { bgColor: 'bg-green-50', borderColor: 'border-green-200', textColor: 'text-green-700', icon: <Shield className="w-6 h-6 text-green-600" /> };
    }
  };

  const dynamicGlowStyle = {
    boxShadow: isListening ? `0 0 ${8 + volume * 40}px rgba(239, 68, 68, 0.75)` : 'none',
    borderColor: isListening ? `rgba(239, 68, 68, 0.9)` : '',
    transition: 'box-shadow 0.2s ease-out, border-color 0.2s ease-out'
  };

  
  return (
    <div className="relative min-h-screen overflow-hidden font-sans bg-gray-50">
      <Toaster position="top-center" />
      <div id="vanta-bg" ref={vantaRef} className="absolute top-0 left-0 z-0 w-full h-full opacity-30"></div>

      <Navbar onResourcesClick={() => setIsModalOpen(true)} activeTab={activeTab} setActiveTab={setActiveTab} />
      <ResourcesModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <main className="relative z-10 px-4 pt-24 pb-12 mx-auto sm:px-6 lg:px-8 max-w-7xl">
        {activeTab === 'home' && (
          <div>
            <section className="max-w-3xl mx-auto text-center">
              <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl animate-fadeIn">
                Discover Your <span className="text-transparent text-indigo-500 bg-clip-text bg-gradient-to-r from-indigo-500 to-emerald-500">Emotional Patterns</span> Instantly
              </h1>
              <p className="mb-8 text-xl text-gray-600 delay-100 animate-fadeIn">
                MindScope's AI companion helps you understand your feelings through private, secure text analysis.
              </p>
              <div className="mt-12 animate-bounce">
                <ChevronsDown className="w-12 h-12 mx-auto text-indigo-500"/>
              </div>
              <div className="flex justify-center mt-8 space-x-4">
                {}
                <button 
                  type="button" 
                  onClick={() => setActiveTab('detect')} 
                  className="px-8 py-4 text-base font-medium text-white transition-all duration-300 transform border border-transparent rounded-full shadow-lg hero-cta bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Start Free Analysis →
                </button>
                {}
              </div>
            </section>
            
            <div id="how-it-works" className="mt-20 text-center">
              <h2 className="text-3xl font-bold">How It Works</h2>
              <p className="mt-2 text-slate-500">A simple, secure, and insightful process.</p>
              <div className="grid grid-cols-1 gap-8 mt-12 md:grid-cols-3">
                <div className="p-6 transition-shadow rounded-lg shadow-md bg-white/80 backdrop-blur-md hover:shadow-xl">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto text-indigo-600 bg-indigo-100 rounded-full"><Zap /></div>
                  <h3 className="mt-4 text-xl font-semibold">1. You Write or Speak</h3>
                  <p className="mt-2 text-slate-500">Describe your thoughts in the text box or use the mic. Your data is never saved.</p>
                </div>
                <div className="p-6 transition-shadow rounded-lg shadow-md bg-white/80 backdrop-blur-md hover:shadow-xl">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto text-indigo-600 bg-indigo-100 rounded-full"><Cpu /></div>
                  <h3 className="mt-4 text-xl font-semibold">2. We Analyze</h3>
                  <p className="mt-2 text-slate-500">Our hybrid AI system analyzes the text for underlying patterns without storing it.</p>
                </div>
                <div className="p-6 transition-shadow rounded-lg shadow-md bg-white/80 backdrop-blur-md hover:shadow-xl">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto text-indigo-600 bg-indigo-100 rounded-full"><BarChart2 /></div>
                  <h3 className="mt-4 text-xl font-semibold">3. You Get Insight</h3>
                  <p className="mt-2 text-slate-500">Receive a preliminary, confidential result to aid your self-reflection journey.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'detect' && (
          <div className="max-w-3xl mx-auto">
            <div className="p-6 overflow-hidden shadow-lg bg-white/80 backdrop-blur-md rounded-xl">
              <h2 className="mb-4 text-2xl font-bold text-center text-gray-900">Analysis Tool</h2>
              <form onSubmit={handleSubmit}>
                <div className="relative">
                  <textarea
                    placeholder={isListening ? "Listening..." : "Describe how you're feeling today..."}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full min-h-[150px] p-4 border border-gray-300 rounded-md resize-none"
                    style={dynamicGlowStyle}
                  />
                  {hasRecognitionSupport && (
                    <button
                      type="button"
                      className={`absolute bottom-3 right-3 p-2 rounded-full ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 text-gray-600'}`}
                      onClick={isListening ? handleStopRecording : handleStartRecording}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  )}
                </div>
                
                <VideoAnalysis onEmotionChange={setDetectedEmotion} />

                <button type="submit" disabled={isLoading || !text} className="flex justify-center w-full px-4 py-3 mt-4 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-gray-400">
                  {isLoading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {isLoading ? 'Analyzing...' : 'Analyze Text & Emotion'}
                </button>
              </form>

              {!isLoading && result && (
                <div className={`mt-6 rounded-lg border ${getResultStyle(result.level).borderColor} ${getResultStyle(result.level).bgColor} p-4`}>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">{getResultStyle(result.level).icon}</div>
                    <div>
                      <h3 className={`text-lg font-semibold ${getResultStyle(result.level).textColor}`}>{result.title}</h3>
                      <p className="mt-1 text-slate-600">{result.description}</p>
                      
                      {result.explanation_keywords && result.explanation_keywords.length > 0 && (
                        <>
                          <h4 className="mt-4 font-semibold text-slate-700">Key Words Influencing This Result:</h4>
                          <HighlightedText text={text} keywords={result.explanation_keywords} />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
