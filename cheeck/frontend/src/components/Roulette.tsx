import React, { useState, useEffect, useRef } from "react";
import { StoredManga } from "../types";
import confetti from "canvas-confetti";
import { Dices, Volume2, VolumeX } from "lucide-react";
import ImageFallback from "./ImageFallback";

let globalAudioCtx: AudioContext | null = null;
const getAudioCtx = () => {
  if (!globalAudioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      globalAudioCtx = new AudioContextClass();
    }
  }
  if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume();
  }
  return globalAudioCtx;
};

interface RouletteProps {
  mangaList: StoredManga[];
}

const Roulette: React.FC<RouletteProps> = ({ mangaList }) => {
  const [spinning, setSpinning] = useState(false);
  const [selectedManga, setSelectedManga] = useState<StoredManga | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);
  
  const playTick = () => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      
      const bufferSize = ctx.sampleRate * 0.015; 
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 1000;
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.015);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch (e) {
      console.warn("Audio context failed", e);
    }
  };

  const playWin = () => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      
      const boomTime = now; 
      
      // Part 1: The Massive Sub-Bass Core
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, boomTime);
      osc.frequency.exponentialRampToValueAtTime(10, boomTime + 1.5); 
      
      oscGain.gain.setValueAtTime(3.0, boomTime);
      oscGain.gain.exponentialRampToValueAtTime(0.01, boomTime + 1.5);
      
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(boomTime);
      osc.stop(boomTime + 1.5);

      // Part 2: The Cinematic Rumble (Low-passed noise for texture)
      const bufferSize = ctx.sampleRate * 1.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(150, boomTime); // Only let deep bass through
      filter.frequency.exponentialRampToValueAtTime(20, boomTime + 1.5);
      
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(2.0, boomTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, boomTime + 1.5);
      
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(boomTime);

    } catch (e) {
      console.warn("Audio context failed", e);
    }
  };
  
  const eligibleManga = mangaList.filter(m => m.status !== "Completed");

  const spinWheel = () => {
    if (eligibleManga.length === 0) return;
    if (spinning) return;

    setSpinning(true);
    setSelectedManga(null);
    
    const spins = 20 + Math.floor(Math.random() * 15); // 20 to 35 spins
    let currentSpin = 0;
    let delay = 50;
    let lastIndex = currentIndex;

    const spin = () => {
      let nextIndex = Math.floor(Math.random() * eligibleManga.length);
      if (eligibleManga.length > 1) {
        // Ensure the wheel actually moves every single tick to prevent "mismatched" sound/visuals
        while (nextIndex === lastIndex) {
          nextIndex = Math.floor(Math.random() * eligibleManga.length);
        }
      }
      lastIndex = nextIndex;
      setCurrentIndex(nextIndex);
      
      currentSpin++;
      playTick();
      
      if (currentSpin >= spins) {
        const winner = eligibleManga[Math.floor(Math.random() * eligibleManga.length)];
        setSelectedManga(winner);
        setCurrentIndex(eligibleManga.indexOf(winner));
        setSpinning(false);
        playWin();
        fireConfetti();
      } else {
        // Ease out: slowly increase delay to simulate wheel friction
        delay = delay + Math.floor(currentSpin * 1.5);
        timeoutRef.current = setTimeout(spin, delay);
      }
    };

    timeoutRef.current = setTimeout(spin, delay);
  };

  const fireConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#8b5cf6', '#ec4899', '#06b6d4']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#8b5cf6', '#ec4899', '#06b6d4']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  if (eligibleManga.length === 0) {
    return (
      <div className="text-center mt-5">
        <h3>No Manga to Read!</h3>
        <p className="text-muted">You have completed all your manga or your library is empty. Go find something new!</p>
      </div>
    );
  }

  const displayManga = spinning ? eligibleManga[currentIndex] : (selectedManga || null);

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out', textAlign: 'center', maxWidth: '600px', margin: '0 auto', padding: '2rem 1rem', position: 'relative' }}>
      
      <button 
        className="btn-icon" 
        onClick={() => setSoundEnabled(!soundEnabled)}
        style={{ position: 'absolute', top: '2rem', right: '1rem', color: 'var(--text-muted)' }}
        title={soundEnabled ? "Mute" : "Unmute"}
      >
        {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
      </button>

      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
        <Dices size={32} color="var(--primary)" /> Reading Roulette
      </h2>
      <p className="text-muted mb-5">Can't decide what to read next? Let fate decide for you.</p>

      <div style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
        {displayManga ? (
          <div key={spinning ? 'spinning' : displayManga.mal_id} className="glass-card" style={{ width: '220px', padding: '1rem', animation: spinning ? 'none' : 'pop 0.5s ease-out' }}>
            <ImageFallback 
              src={displayManga.image_url} 
              alt={displayManga.title} 
              style={{ width: '100%', height: '280px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}
            />
            <h5 style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0 }}>
              {displayManga.title}
            </h5>
          </div>
        ) : (
          <div className="glass-card" style={{ width: '220px', height: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <Dices size={64} opacity={0.2} />
          </div>
        )}
      </div>

      <button 
        className={`btn btn-primary btn-lg ${spinning ? 'disabled' : ''}`} 
        onClick={() => {
          getAudioCtx(); // Ensure context is resumed on click
          spinWheel();
        }}
        disabled={spinning}
        style={{ borderRadius: 'var(--radius-full)', padding: '1rem 3rem', fontSize: '1.2rem', fontWeight: 'bold', boxShadow: '0 4px 20px rgba(139, 92, 246, 0.5)' }}
      >
        {spinning ? "Spinning..." : "SPIN THE WHEEL"}
      </button>
    </div>
  );
};

export default Roulette;
