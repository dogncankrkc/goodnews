"use client";

import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";

export default function BackgroundAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioSrc, setAudioSrc] = useState("");
  const [isMobile, setIsMobile] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) {
      setAudioSrc("/audio/good-morning.mp3");
    } else if (hour >= 12 && hour < 18) {
      setAudioSrc("/audio/good-afternoon.mp3");
    } else {
      setAudioSrc("/audio/good-night.mp3");
    }
  }, [isMobile]);

  const toggleMute = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (isMobile || !audioSrc) return null;

  return (
    <div className="hidden md:flex items-center">
      <button
        onClick={toggleMute}
        className="p-2 rounded-full hover:bg-surface text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Toggle background music"
      >
        {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </button>
      <audio ref={audioRef} src={audioSrc} loop onLoadedMetadata={(e) => {
        e.currentTarget.volume = 0.5;
      }} />
    </div>
  );
}

