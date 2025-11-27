
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { HeartRateEntry } from '../types';

interface HeartRateMonitorProps {
    onClose: () => void;
}

type Context = 'Pre-workout' | 'Mid-workout' | 'Post-workout';

const HEART_RATE_LOG_KEY = 'obeCureHeartRateLog';

const HeartIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
);

const HeartRateMonitor: React.FC<HeartRateMonitorProps> = ({ onClose }) => {
    const [step, setStep] = useState<'context' | 'measuring' | 'result'>('context');
    const [context, setContext] = useState<Context>('Pre-workout');
    const [bpm, setBpm] = useState<number | null>(null);
    const [progress, setProgress] = useState(0);
    const [signalHistory, setSignalHistory] = useState<number[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [instantBpm, setInstantBpm] = useState<number | null>(null);
    const [isSaved, setIsSaved] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const frameIdRef = useRef<number | null>(null);
    
    // Algorithm refs
    const bufferRef = useRef<{value: number, time: number}[]>([]);
    const lastPeakTimeRef = useRef<number>(0);
    const startTimeRef = useRef<number>(0);

    // --- Audio Feedback ---
    const playStartChime = () => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;
            
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            // Nice chime sound
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1);
            
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.5);
        } catch (e) {
            console.error("Audio play failed", e);
        }
    };

    // --- Camera & Flash Logic ---
    const startCamera = async () => {
        setError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', frameRate: { ideal: 30 } }
            });
            streamRef.current = stream;
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }

            // Try to enable torch
            const track = stream.getVideoTracks()[0];
            const capabilities = track.getCapabilities() as any;
            if (capabilities.torch) {
                try {
                    await track.applyConstraints({ advanced: [{ torch: true }] } as any);
                } catch (e) {
                    console.warn("Could not enable torch", e);
                    setError("Could not turn on flash. Please use in good lighting or hold near a light source.");
                }
            } else {
                 setError("Flash not available. Please hold your finger against the camera near a light source.");
            }

            startTimeRef.current = Date.now();
            bufferRef.current = [];
            setSignalHistory([]);
            processFrame();

        } catch (err) {
            console.error("Camera error:", err);
            setError("Could not access camera. Please allow permissions.");
        }
    };

    const stopCamera = useCallback(() => {
        if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }, []);

    useEffect(() => {
        return () => stopCamera();
    }, [stopCamera]);

    // --- Image Processing & BPM Algorithm ---
    const processFrame = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        // Draw small center portion of video frame
        const size = 40;
        const vid = videoRef.current;
        const sx = Math.floor((vid.videoWidth - size) / 2);
        const sy = Math.floor((vid.videoHeight - size) / 2);
        
        ctx.drawImage(vid, sx, sy, size, size, 0, 0, size, size);
        
        const frame = ctx.getImageData(0, 0, size, size);
        const data = frame.data;
        let totalRed = 0;
        
        // Calculate average red intensity
        for (let i = 0; i < data.length; i += 4) {
            totalRed += data[i];
        }
        const avgRed = totalRed / (data.length / 4);

        const now = Date.now();
        bufferRef.current.push({ value: avgRed, time: now });
        
        // Keep buffer size manageable (last 5 seconds approx)
        if (bufferRef.current.length > 150) bufferRef.current.shift();

        // Visualization
        setSignalHistory(prev => {
            const next = [...prev, avgRed];
            if (next.length > 50) next.shift();
            return next;
        });

        // --- Peak Detection ---
        detectHeartRate(now);

        // Progress (measure for 15 seconds)
        const elapsed = now - startTimeRef.current;
        const duration = 15000;
        setProgress(Math.min(100, (elapsed / duration) * 100));

        if (elapsed < duration) {
            frameIdRef.current = requestAnimationFrame(processFrame);
        } else {
            finishMeasurement();
        }
    };

    const detectHeartRate = (now: number) => {
        if (bufferRef.current.length < 30) return; // Need data

        // Simple peak detection on smoothed signal
        // 1. Smooth data (moving average window of 5)
        const smooth = [];
        for(let i=2; i<bufferRef.current.length-2; i++) {
            const avg = (bufferRef.current[i-2].value + bufferRef.current[i-1].value + bufferRef.current[i].value + bufferRef.current[i+1].value + bufferRef.current[i+2].value) / 5;
            smooth.push({ value: avg, time: bufferRef.current[i].time });
        }

        // 2. Find local maximum in recent window
        const len = smooth.length;
        if (len < 5) return;
        
        const current = smooth[len - 3];
        const prev = smooth[len - 4];
        const next = smooth[len - 2];
        
        // Basic peak check: value higher than neighbors
        if (current.value > prev.value && current.value > next.value) {
            // Threshold check (dynamic)
            const recentAvg = smooth.slice(-20).reduce((acc, s) => acc + s.value, 0) / smooth.slice(-20).length;
            if (current.value > recentAvg + 0.5) { // Minimal threshold to avoid noise
                 const diff = current.time - lastPeakTimeRef.current;
                 // Debounce: Human HR < 220bpm (272ms) and > 40bpm (1500ms)
                 if (diff > 270 && diff < 1500) {
                     lastPeakTimeRef.current = current.time;
                     const newInstantBpm = Math.round(60000 / diff);
                     setInstantBpm(prev => prev ? Math.round((prev + newInstantBpm) / 2) : newInstantBpm); // Smoothing display
                 } else if (diff > 1500) {
                     // Reset if gap too long
                     lastPeakTimeRef.current = current.time;
                 }
            }
        }
    };

    const saveLog = (measuredBpm: number) => {
        try {
            const entry: HeartRateEntry = {
                date: new Date().toISOString(),
                context: context,
                bpm: measuredBpm
            };
            const existingRaw = localStorage.getItem(HEART_RATE_LOG_KEY);
            const existing: HeartRateEntry[] = existingRaw ? JSON.parse(existingRaw) : [];
            // Keep last 50 entries
            const updated = [entry, ...existing].slice(0, 50);
            localStorage.setItem(HEART_RATE_LOG_KEY, JSON.stringify(updated));
            setIsSaved(true);
        } catch (e) {
            console.error("Failed to save heart rate log", e);
        }
    };

    const finishMeasurement = () => {
        stopCamera();
        // Final calculation based on all detected peaks would be better, 
        // but instant BPM averaged at the end is acceptable for a basic implementation.
        if (instantBpm && instantBpm > 40 && instantBpm < 200) {
            setBpm(instantBpm);
            saveLog(instantBpm);
            setStep('result');
        } else {
            setError("Reading failed. Please hold steady and try again.");
            setStep('context'); // Reset to start
        }
    };

    const handleStart = () => {
        playStartChime();
        setStep('measuring');
        startCamera();
    };

    const renderSignalGraph = () => {
        if (signalHistory.length < 2) return null;
        const min = Math.min(...signalHistory);
        const max = Math.max(...signalHistory);
        const height = 60;
        const width = 200;
        const range = max - min || 1;
        
        const points = signalHistory.map((val, i) => {
            const x = (i / (signalHistory.length - 1)) * width;
            const y = height - ((val - min) / range) * height;
            return `${x},${y}`;
        }).join(' ');

        return (
            <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
                <polyline points={points} fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse" />
            </svg>
        );
    };

    const isHighBpm = () => {
        if (!bpm) return false;
        if (context === 'Pre-workout' && bpm > 100) return true;
        if (context === 'Mid-workout' && bpm > 180) return true;
        if (context === 'Post-workout' && bpm > 140) return true;
        return false;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-[70] flex flex-col items-center justify-center p-4 animate-fade-in text-white">
            <canvas ref={canvasRef} width="40" height="40" className="hidden" />
            
            <div className="w-full max-w-sm relative">
                <button onClick={onClose} className="absolute top-0 right-0 text-gray-400 hover:text-white p-2 text-2xl">&times;</button>
                
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-4">
                        <HeartIcon className="w-8 h-8 text-red-500 animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-bold">Heart Rate Monitor</h2>
                </div>

                {step === 'context' && (
                    <div className="bg-gray-800 rounded-xl p-6 animate-fade-in-up">
                        <p className="text-gray-300 mb-6 text-center">When are you checking your heart rate?</p>
                        <div className="space-y-3">
                            {['Pre-workout', 'Mid-workout', 'Post-workout'].map((ctx) => (
                                <button
                                    key={ctx}
                                    onClick={() => setContext(ctx as Context)}
                                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${context === ctx ? 'border-red-500 bg-red-500/20' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}
                                >
                                    <span className="font-bold">{ctx}</span>
                                </button>
                            ))}
                        </div>
                        <button onClick={handleStart} className="w-full mt-8 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-all active:scale-95">
                            Start Measurement
                        </button>
                        <p className="text-xs text-gray-500 mt-4 text-center">
                            Note: This uses your camera flash. It may get warm. This is not a medical device.
                        </p>
                    </div>
                )}

                {step === 'measuring' && (
                    <div className="flex flex-col items-center animate-fade-in">
                        {/* Camera Preview Circle */}
                        <div className="relative w-48 h-48 rounded-full border-4 border-red-500 overflow-hidden shadow-[0_0_30px_rgba(239,68,68,0.5)] mb-8">
                            <video 
                                ref={videoRef} 
                                muted 
                                playsInline 
                                className="w-full h-full object-cover"
                                style={{ filter: 'contrast(1.5) brightness(1.5)' }} // Enhance visibility of blood flow changes
                            />
                            <div className="absolute inset-0 bg-red-500/20 pointer-events-none"></div>
                        </div>

                        <div className="h-16 w-64 mb-4">
                            {renderSignalGraph()}
                        </div>

                        <p className="text-4xl font-bold font-mono mb-2">
                            {instantBpm ? instantBpm : '--'} <span className="text-xl text-gray-400">BPM</span>
                        </p>
                        
                        <p className="text-sm text-gray-300 text-center max-w-xs mb-6">
                            {error || "Gently place your finger over the camera lens and flash. Hold steady."}
                        </p>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
                            <div className="bg-red-500 h-2 rounded-full transition-all duration-100" style={{ width: `${progress}%` }}></div>
                        </div>

                        <button onClick={stopCamera} className="text-gray-400 hover:text-white text-sm border border-gray-600 px-4 py-2 rounded-full">
                            Cancel
                        </button>
                    </div>
                )}

                {step === 'result' && bpm && (
                    <div className="bg-gray-800 rounded-xl p-8 text-center animate-bounce-in">
                        <p className="text-gray-400 uppercase tracking-wider text-sm font-bold mb-2">{context}</p>
                        <h3 className="text-6xl font-bold text-white mb-2">{bpm}</h3>
                        <p className="text-xl text-red-500 font-medium mb-4">BPM</p>
                        
                        {isSaved && (
                            <div className="inline-block px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full mb-6 border border-green-500/50">
                                ✓ Log Saved
                            </div>
                        )}
                        
                        {isHighBpm() ? (
                            <div className="p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg mb-8 text-left">
                                <p className="font-bold text-yellow-500 mb-1">Reading seems high?</p>
                                <p className="text-sm text-gray-300 mb-2">Ensure accuracy for next time:</p>
                                <ul className="text-xs text-gray-400 list-disc list-inside space-y-1">
                                    <li>Cover <b>both</b> the camera lens and the flash completely.</li>
                                    <li>Place finger <b>gently</b>. Pressing too hard stops blood flow.</li>
                                    <li>Remain still and silent during measurement.</li>
                                </ul>
                            </div>
                        ) : (
                            <div className="p-4 bg-gray-700/50 rounded-lg mb-8">
                                <p className="text-sm text-gray-300">
                                    {context === 'Pre-workout' && "Great baseline. Let's get moving!"}
                                    {context === 'Mid-workout' && (bpm > 140 ? "You're in the zone! 🔥" : "Good pace, keep it up.")}
                                    {context === 'Post-workout' && "Nicely done. Time to cool down."}
                                </p>
                            </div>
                        )}

                        <button onClick={onClose} className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-all active:scale-95">
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HeartRateMonitor;
