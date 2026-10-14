import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  VolumeX,
  MapPin,
  Calendar,
  Clock,
  Heart,
  Gift,
  Copy,
  Check,
  PartyPopper,
  Music,
  Send,
  Info,
  ExternalLink,
  MessageCircle
} from 'lucide-react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function App() {
  // --- Background Music State & Fallback Synth Engine ---
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showMusicPrompt, setShowMusicPrompt] = useState<boolean>(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const synthIntervalRef = useRef<number | null>(null);

  // --- Countdown State ---
  // Target: Sunday, December 13, 2026 at 11:40 AM
  const targetDate = useRef(new Date('2026-12-13T11:40:00')).current;
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // --- Copy Alias State ---
  const [copied, setCopied] = useState<boolean>(false);

  // --- RSVP Form State ---
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    restricciones: '',
    asistencia: 'si',
  });
  const [showRsvpModal, setShowRsvpModal] = useState<boolean>(false);
  const [pendingWhatsappUrl, setPendingWhatsappUrl] = useState<string>('');

  // Clean, high quality wedding photo (natural tones, rings and bridal florals - NO sepia)
  const bgImageUrl =
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=85';

  // Reliable wedding audio track URLs
  const audioTrackUrl =
    'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c2/Johann_Pachelbel_Canon_in_D_harp.ogg/Johann_Pachelbel_Canon_in_D_harp.ogg.mp3';

  // --- Web Audio Romantic Ambient Fallback ---
  // Plays a soothing romantic harp/piano sequence if external MP3 is blocked or fails
  const playRomanticSynthNotes = () => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextClass();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Gentle Canon in D chord notes (Hz)
      const notes = [
        293.66, 369.99, 440.0, 587.33, // D major
        220.0, 277.18, 329.63, 440.0,  // A major
        246.94, 293.66, 369.99, 493.88, // B minor
        185.0, 220.0, 277.18, 369.99,  // F# minor
        196.0, 246.94, 293.66, 392.0,  // G major
        293.66, 369.99, 440.0, 587.33, // D major
        196.0, 246.94, 293.66, 392.0,  // G major
        220.0, 277.18, 329.63, 440.0   // A major
      ];

      let noteIndex = 0;
      const playNext = () => {
        if (!ctx || ctx.state === 'closed') return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        const freq = notes[noteIndex % notes.length];
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Soft acoustic attack and long gentle decay
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 2.6);

        noteIndex++;
      };

      playNext();
      synthIntervalRef.current = window.setInterval(playNext, 1200);
    } catch (e) {
      console.warn('Synth playback note failed', e);
    }
  };

  const stopRomanticSynthNotes = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state === 'running') {
      audioContextRef.current.suspend();
    }
  };

  // --- Music Toggle Handler ---
  const togglePlayMusic = () => {
    setShowMusicPrompt(false);

    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      stopRomanticSynthNotes();
      setIsPlaying(false);
    } else {
      let played = false;
      if (audioRef.current) {
        audioRef.current
          .play()
          .then(() => {
            played = true;
            setIsPlaying(true);
          })
          .catch(() => {
            // If audio tag fails or is blocked by CORS/network, use Web Audio synth
            playRomanticSynthNotes();
            setIsPlaying(true);
          });
      }

      setTimeout(() => {
        if (!played && isPlaying) {
          playRomanticSynthNotes();
        }
      }, 500);
    }
  };

  // --- Countdown Calculation ---
  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (distance % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => {
      clearInterval(interval);
      stopRomanticSynthNotes();
    };
  }, [targetDate]);

  // --- Copy Alias Handler ---
  const handleCopyAlias = async () => {
    const aliasText = 'Pecanesdecazon';
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(aliasText);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = aliasText;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // --- WhatsApp RSVP Sender ---
  const handleRsvpSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const targetPhone = '5491123367254'; // +54 9 11 2336-7254
    const asistenciaTexto =
      formData.asistencia === 'si'
        ? '¡Sí, confirmo mi asistencia!'
        : 'Lamentablemente no podré asistir';
    const restriccionesTexto = formData.restricciones.trim()
      ? formData.restricciones.trim()
      : 'Ninguna';

    // Construct clear, structured WhatsApp message
    const message =
      `¡Hola Cinthia y Fernando! Les comparto mi confirmación para su boda:\n\n` +
      `• *Apellido y Nombre:* ${formData.apellido} ${formData.nombre}\n` +
      `• *Teléfono:* ${formData.telefono}\n` +
      `• *¿Asiste?:* ${asistenciaTexto}\n` +
      `• *Restricciones alimentarias:* ${restriccionesTexto}`;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(
      message
    )}`;

    setPendingWhatsappUrl(whatsappUrl);
    setShowRsvpModal(true);

    // Direct attempt to redirect/open WhatsApp
    try {
      window.location.href = whatsappUrl;
    } catch {
      // In-app modal fallback will let user click directly
    }
  };

  // Google Maps navigation link
  const mapsUrl =
    'https://www.google.com/maps/search/?api=1&query=Juan+Bautista+Alberdi+2664+Planta+Alta';

  return (
    <div
      className="relative min-h-screen text-stone-100 font-sans-wedding bg-black selection:bg-amber-400/30 selection:text-amber-100 overflow-x-hidden"
      style={{
        backgroundImage: `url(${bgImageUrl})`,
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Negro difuminado overlay (No sepia, natural photo depth and clarity) */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/80 pointer-events-none z-0 backdrop-blur-[0.5px]" />
      <div className="fixed inset-0 bg-radial from-transparent via-black/45 to-black/85 pointer-events-none z-0" />

      {/* Hidden Audio Player with multiple format sources */}
      <audio
        ref={audioRef}
        src={audioTrackUrl}
        preload="auto"
        loop
        onEnded={() => setIsPlaying(false)}
        onError={() => {
          // If native audio encounters error while playing, fallback to synth
          if (isPlaying) {
            playRomanticSynthNotes();
          }
        }}
      />

      {/* Floating Audio Controller */}
      <aside aria-label="Control de música" className="fixed top-5 right-5 z-50">
        <div className="relative flex items-center">
          <AnimatePresence>
            {showMusicPrompt && !isPlaying && (
              <motion.div
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="hidden sm:flex items-center gap-2 mr-3 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-stone-200 text-xs shadow-xl"
              >
                <Music className="w-3.5 h-3.5 text-amber-200" />
                <span>Música de fondo</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={togglePlayMusic}
            aria-label={isPlaying ? 'Pausar música' : 'Reproducir música'}
            className="group relative flex items-center justify-center w-12 h-12 rounded-full backdrop-blur-md bg-black/60 hover:bg-black/80 border border-white/25 text-amber-100 shadow-2xl transition-all duration-300 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-200/50"
          >
            {isPlaying && (
              <span className="absolute inset-0 rounded-full border border-amber-300/40 animate-ping pointer-events-none" />
            )}

            {isPlaying ? (
              <Volume2 className="w-5 h-5 text-amber-200 animate-pulse" />
            ) : (
              <VolumeX className="w-5 h-5 text-stone-400 group-hover:text-amber-100 transition-colors" />
            )}
          </button>
        </div>
      </aside>

      {/* Main Container - Mobile First */}
      <main className="relative z-10 w-full max-w-xl mx-auto px-4 sm:px-6 py-12 flex flex-col items-center">
        {/* ========================================================= */}
        {/* SECCIÓN PORTADA (HERO) */}
        {/* ========================================================= */}
        <header className="w-full min-h-[80vh] flex flex-col items-center justify-center text-center pt-6 pb-12">
          {/* Top Divider line (clean, without sparkles) */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.8 }}
            className="w-16 h-px bg-gradient-to-r from-transparent via-stone-300/40 to-transparent mb-7"
          />

          {/* Texto superior requerido */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="text-[11px] sm:text-xs tracking-[0.25em] sm:tracking-[0.3em] uppercase text-stone-200/90 font-light max-w-md leading-relaxed px-2 mb-8"
          >
            CON ALEGRÍA EN NUESTROS CORAZONES Y AMOR EN NUESTRAS ALMAS LOS INVITAMOS
            A CELEBRAR CON NOSOTROS EL DÍA DE NUESTRA BODA.
          </motion.p>

          {/* Rings Minimalist Ornament (No sparkles) */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative my-3 flex items-center justify-center"
          >
            <div className="w-14 h-14 rounded-full border border-white/30 -mr-3 backdrop-blur-xs" />
            <div className="w-14 h-14 rounded-full border border-amber-200/50 backdrop-blur-xs" />
            <Heart className="absolute w-4 h-4 text-amber-200/80 fill-amber-200/20" />
          </motion.div>

          {/* Título principal: Cinthia y Fernando */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="font-script text-6xl sm:text-7xl md:text-8xl text-stone-100 py-2 px-2 drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]"
          >
            Cinthia y Fernando
          </motion.h1>

          {/* Clean Line Divider */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="flex items-center justify-center gap-2 my-5 w-36"
          >
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-stone-300/40 to-transparent" />
            <div className="w-1 h-1 rotate-45 bg-amber-200/80" />
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-stone-300/40 to-transparent" />
          </motion.div>

          {/* Fecha destacada: Domingo 13/12/2026 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.65 }}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full backdrop-blur-md bg-white/10 border border-white/20 shadow-lg"
          >
            <Calendar className="w-4 h-4 text-amber-200" />
            <span className="font-serif-wedding text-lg sm:text-xl font-medium tracking-wide text-stone-100">
              Domingo 13/12/2026
            </span>
          </motion.div>

          {/* Subtle scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="mt-14 flex flex-col items-center gap-2 text-stone-400/80"
          >
            <span className="text-[10px] uppercase tracking-[0.2em]">Desliza hacia abajo</span>
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="w-4 h-7 rounded-full border border-white/25 flex items-start justify-center p-1"
            >
              <div className="w-1 h-1.5 rounded-full bg-amber-200" />
            </motion.div>
          </motion.div>
        </header>

        {/* ========================================================= */}
        {/* SECCIÓN CUENTA REGRESIVA (EN UNA SOLA LÍNEA EN MOBILE) */}
        {/* ========================================================= */}
        <motion.section
          aria-label="Cuenta Regresiva"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7 }}
          className="w-full my-6 text-center"
        >
          <div className="mb-4">
            <h2 className="font-serif-wedding text-xl sm:text-2xl text-stone-200">
              Cuenta Regresiva
            </h2>
          </div>

          {/* Glassmorphism Countdown Timer - strictly 1 single horizontal row in mobile (4 cols) */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-3 w-full max-w-sm mx-auto">
            {/* DÍAS */}
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl py-2 px-1 sm:py-3 sm:px-2 flex flex-col items-center justify-center shadow-lg">
              <span className="font-serif-wedding text-xl sm:text-3xl font-semibold text-stone-100 tracking-tight leading-none">
                {String(timeLeft.days).padStart(2, '0')}
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-widest uppercase text-stone-300 mt-1">
                DÍAS
              </span>
            </div>

            {/* HORAS */}
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl py-2 px-1 sm:py-3 sm:px-2 flex flex-col items-center justify-center shadow-lg">
              <span className="font-serif-wedding text-xl sm:text-3xl font-semibold text-stone-100 tracking-tight leading-none">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-widest uppercase text-stone-300 mt-1">
                HORAS
              </span>
            </div>

            {/* MINUTOS */}
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl py-2 px-1 sm:py-3 sm:px-2 flex flex-col items-center justify-center shadow-lg">
              <span className="font-serif-wedding text-xl sm:text-3xl font-semibold text-stone-100 tracking-tight leading-none">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-widest uppercase text-stone-300 mt-1">
                MIN
              </span>
            </div>

            {/* SEGUNDOS */}
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl py-2 px-1 sm:py-3 sm:px-2 flex flex-col items-center justify-center shadow-lg">
              <span className="font-serif-wedding text-xl sm:text-3xl font-semibold text-amber-200 tracking-tight leading-none">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-widest uppercase text-stone-300 mt-1">
                SEG
              </span>
            </div>
          </div>
        </motion.section>

        {/* Clean Line Divider */}
        <div className="w-20 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-8" />

        {/* ========================================================= */}
        {/* SECCIÓN CEREMONIA Y FIESTA */}
        {/* ========================================================= */}
        <motion.section
          aria-label="Ceremonia y Fiesta"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7 }}
          className="w-full my-4"
        >
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
            {/* Ícono de celebración / fiesta */}
            <div className="inline-flex items-center justify-center w-13 h-13 rounded-full bg-white/10 border border-white/25 text-amber-200 mb-4">
              <PartyPopper className="w-6 h-6" />
            </div>

            {/* Hora y Tipo de Ceremonia */}
            <div className="flex items-center justify-center gap-2 text-amber-200 font-medium mb-1.5">
              <Clock className="w-4 h-4" />
              <span className="text-sm tracking-widest uppercase">
                Ceremonia civil 11:40 hrs.
              </span>
            </div>

            {/* Lugar */}
            <h3 className="font-serif-wedding text-3xl sm:text-4xl text-stone-100 font-normal mt-2 mb-2">
              Salón Victoria Palace
            </h3>

            {/* Dirección */}
            <div className="flex items-center justify-center gap-1.5 text-stone-300 text-sm sm:text-base mb-6">
              <MapPin className="w-4 h-4 text-amber-200 shrink-0" />
              <span>Juan Bautista Alberdi 2664, Planta Alta.</span>
            </div>

            {/* Texto destacado requerido */}
            <div className="my-5 py-3 px-4 rounded-xl bg-white/10 border border-white/20">
              <p className="text-xs sm:text-sm font-semibold tracking-wider text-amber-100 uppercase">
                A CONTINUACIÓN RECEPCIÓN Y FIESTA EN EL MISMO SALÓN.
              </p>
            </div>

            {/* Botón interactivo: Ver en Google Maps */}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-2xl bg-stone-100 hover:bg-white text-stone-950 font-medium text-sm sm:text-base tracking-wide shadow-lg active:scale-98 transition-all duration-200 cursor-pointer"
            >
              <MapPin className="w-4 h-4 fill-stone-950 text-stone-950" />
              <span>📍 Ver en Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
            </a>
          </div>
        </motion.section>

        {/* Clean Line Divider */}
        <div className="w-20 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-8" />

        {/* ========================================================= */}
        {/* SECCIÓN DETALLES (TARJETAS INFORMATIVAS GLASSMORPHISM) */}
        {/* ========================================================= */}
        <motion.section
          aria-label="Detalles"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7 }}
          className="w-full my-4 space-y-5"
        >
          {/* Tarjeta 1: Dress Code (Elegante - con icono alusivo de moño de gala / corbata / tuxedo y sin aclaraciones innecesarias) */}
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl p-6 sm:p-7 shadow-xl text-center">
            {/* Ícono alusivo a elegante: Moño de Gala / Pajarita / Bow Tie */}
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 border border-white/25 text-amber-200 mb-4">
              <svg
                className="w-7 h-7 fill-current"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Elegant Bow Tie Icon */}
                <path d="M12 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm-2.5.3L2 6.5v11l7.5-4.3c.3.5.7.9 1.2 1.1L2 19h20l-8.7-4.7c.5-.2.9-.6 1.2-1.1l7.5 4.3v-11l-7.5 4.3c-.3-.5-.7-.9-1.2-1.1L22 5H2l8.7 4.7c-.5.2-.9.6-1.2 1.1z" />
              </svg>
            </div>

            <h3 className="font-serif-wedding text-xl sm:text-2xl text-stone-200 tracking-wide">
              Dress Code
            </h3>
            <p className="font-serif-wedding text-2xl sm:text-3xl text-amber-100 font-medium mt-1">
              Elegante
            </p>
          </div>

          {/* Tarjeta 2: Regalo / Alias */}
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl p-6 sm:p-7 shadow-xl text-center">
            {/* Ícono de regalo */}
            <div className="inline-flex items-center justify-center w-13 h-13 rounded-full bg-white/10 border border-white/25 text-amber-200 mb-3">
              <Gift className="w-6 h-6" />
            </div>

            <h3 className="font-serif-wedding text-2xl text-stone-100 mb-2">
              Regalos
            </h3>

            {/* Texto requerido */}
            <p className="text-xs sm:text-sm text-stone-200/90 max-w-md mx-auto leading-relaxed mb-5 font-light">
              Para nosotros tu presencia es nuestro regalo más grande. Si deseas obsequiarnos algún presente:
            </p>

            {/* Botón interactivo: Alias Pecanesdecazon */}
            <div className="max-w-xs mx-auto">
              <button
                type="button"
                onClick={handleCopyAlias}
                aria-label="Copiar alias bancario"
                className={`w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl border transition-all duration-300 cursor-pointer select-none active:scale-95 shadow-md ${
                  copied
                    ? 'bg-emerald-500/25 border-emerald-400 text-emerald-100'
                    : 'bg-white/10 hover:bg-white/15 border-white/25 text-stone-100 hover:border-amber-200/50'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span className="font-medium text-sm">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-amber-200" />
                    <span className="font-medium text-sm">
                      Alias: <strong className="text-amber-100">Pecanesdecazon</strong>
                    </span>
                  </>
                )}
              </button>

              <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-stone-300">
                <Info className="w-3.5 h-3.5 text-amber-200/80 shrink-0" />
                <span>Titular: Cinthia Gorretta</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Clean Line Divider */}
        <div className="w-20 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-8" />

        {/* ========================================================= */}
        {/* SECCIÓN RSVP (DIRECTO A WHATSAPP +54 9 11 2336-7254) */}
        {/* ========================================================= */}
        <motion.section
          aria-label="Confirmación de Asistencia"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7 }}
          className="w-full my-4"
        >
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="text-center mb-6">
              <span className="text-[11px] uppercase tracking-[0.25em] text-amber-200 font-medium">
                R.S.V.P.
              </span>
              <h2 className="font-serif-wedding text-3xl sm:text-4xl text-stone-100 mt-1 mb-2">
                Confirma tu Asistencia
              </h2>

              {/* Texto introductorio requerido */}
              <p className="text-xs sm:text-sm text-stone-300 max-w-sm mx-auto font-light leading-relaxed">
                Confirmación de asistencia hasta el 20/11/2026 inclusive.
              </p>
            </div>

            {/* Formulario que envía a WhatsApp +54 9 11 2336-7254 */}
            <form onSubmit={handleRsvpSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nombre */}
                <div>
                  <label
                    htmlFor="nombre"
                    className="block text-xs uppercase tracking-wider text-stone-300 mb-1.5 font-light"
                  >
                    Nombre *
                  </label>
                  <input
                    id="nombre"
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    placeholder="Ej: María"
                    className="w-full px-4 py-3 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 text-stone-100 placeholder-white/40 focus:outline-none focus:border-amber-200 focus:ring-1 focus:ring-amber-200 transition-all text-sm"
                  />
                </div>

                {/* Apellido */}
                <div>
                  <label
                    htmlFor="apellido"
                    className="block text-xs uppercase tracking-wider text-stone-300 mb-1.5 font-light"
                  >
                    Apellido *
                  </label>
                  <input
                    id="apellido"
                    type="text"
                    required
                    value={formData.apellido}
                    onChange={(e) =>
                      setFormData({ ...formData, apellido: e.target.value })
                    }
                    placeholder="Ej: González"
                    className="w-full px-4 py-3 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 text-stone-100 placeholder-white/40 focus:outline-none focus:border-amber-200 focus:ring-1 focus:ring-amber-200 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Teléfono de contacto */}
              <div>
                <label
                  htmlFor="telefono"
                  className="block text-xs uppercase tracking-wider text-stone-300 mb-1.5 font-light"
                >
                  Teléfono de contacto *
                </label>
                <input
                  id="telefono"
                  type="tel"
                  required
                  value={formData.telefono}
                  onChange={(e) =>
                    setFormData({ ...formData, telefono: e.target.value })
                  }
                  placeholder="Ej: +54 9 11 1234-5678"
                  className="w-full px-4 py-3 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 text-stone-100 placeholder-white/40 focus:outline-none focus:border-amber-200 focus:ring-1 focus:ring-amber-200 transition-all text-sm"
                />
              </div>

              {/* Restricciones alimentarias */}
              <div>
                <label
                  htmlFor="restricciones"
                  className="block text-xs uppercase tracking-wider text-stone-300 mb-1.5 font-light"
                >
                  Restricciones alimentarias
                </label>
                <input
                  id="restricciones"
                  type="text"
                  value={formData.restricciones}
                  onChange={(e) =>
                    setFormData({ ...formData, restricciones: e.target.value })
                  }
                  placeholder="Ej: Celíaco, vegetariano, vegano, ninguna"
                  className="w-full px-4 py-3 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 text-stone-100 placeholder-white/40 focus:outline-none focus:border-amber-200 focus:ring-1 focus:ring-amber-200 transition-all text-sm"
                />
              </div>

              {/* Selector de Asistencia */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-300 mb-1.5 font-light">
                  ¿Asistes a la boda? *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, asistencia: 'si' })}
                    className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-medium border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      formData.asistencia === 'si'
                        ? 'bg-emerald-500/25 border-emerald-400 text-emerald-100 shadow-md'
                        : 'bg-white/5 border-white/15 text-stone-300 hover:bg-white/10'
                    }`}
                  >
                    <span>¡Sí, asistiré!</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, asistencia: 'no' })}
                    className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-medium border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      formData.asistencia === 'no'
                        ? 'bg-rose-500/25 border-rose-400 text-rose-100 shadow-md'
                        : 'bg-white/5 border-white/15 text-stone-300 hover:bg-white/10'
                    }`}
                  >
                    <span>No podré asistir</span>
                  </button>
                </div>
              </div>

              {/* Botón de Submit para enviar a WhatsApp */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-stone-950 font-semibold text-sm sm:text-base tracking-wide uppercase shadow-lg shadow-[#25D366]/20 active:scale-98 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2.5"
                >
                  <MessageCircle className="w-5 h-5 fill-stone-950 text-[#25D366]" />
                  <span>Confirmar Asistencia</span>
                </button>
                <p className="text-[11px] text-stone-400/80 text-center mt-2.5">
                  Al presionar se enviará tu respuesta por WhatsApp al <strong>+54 9 11 2336-7254</strong>
                </p>
              </div>
            </form>
          </div>
        </motion.section>

        {/* Footer */}
        <footer className="w-full text-center py-12 mt-4">
          <p className="font-script text-4xl sm:text-5xl text-stone-100 mb-2">
            ¡Los esperamos!
          </p>
          <p className="font-serif-wedding text-lg sm:text-xl text-stone-300 tracking-wide">
            Cinthia &amp; Fernando
          </p>
          <p className="text-[10px] tracking-[0.25em] text-stone-400/60 uppercase mt-2">
            13 · 12 · 2026
          </p>
        </footer>
      </main>

      {/* ========================================================= */}
      {/* RSVP WHATSAPP DIRECT ACTION MODAL */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showRsvpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="relative w-full max-w-sm rounded-3xl backdrop-blur-xl bg-stone-950/95 border border-white/25 p-6 sm:p-7 text-center shadow-2xl"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] mb-4">
                <MessageCircle className="w-8 h-8 fill-current" />
              </div>

              <h3 className="font-serif-wedding text-2xl sm:text-3xl text-stone-100 mb-2">
                ¡Gracias {formData.nombre}!
              </h3>

              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-light mb-5">
                Tus datos están listos. Haz clic en el botón de abajo para enviar tu confirmación directamente por WhatsApp al <strong>+54 9 11 2336-7254</strong>:
              </p>

              <div className="text-left text-xs bg-white/5 border border-white/10 rounded-xl p-3 mb-5 space-y-1 text-stone-300">
                <p>• <strong>Invitado:</strong> {formData.apellido} {formData.nombre}</p>
                <p>• <strong>Teléfono:</strong> {formData.telefono}</p>
                <p>• <strong>Asistencia:</strong> {formData.asistencia === 'si' ? 'Asiste' : 'No asiste'}</p>
                <p>• <strong>Restricción:</strong> {formData.restricciones || 'Ninguna'}</p>
              </div>

              <div className="space-y-2">
                <a
                  href={pendingWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-stone-950 font-bold text-sm tracking-wide transition-all inline-flex items-center justify-center gap-2 shadow-lg"
                >
                  <Send className="w-4 h-4 fill-stone-950 text-stone-950" />
                  <span>Enviar por WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => setShowRsvpModal(false)}
                  className="w-full py-2.5 px-4 rounded-xl text-stone-400 hover:text-stone-200 text-xs transition-colors cursor-pointer"
                >
                  Volver a la invitación
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
