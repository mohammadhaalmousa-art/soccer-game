import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Trophy, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { SoccerGameLogo } from "./SoccerGameLogo";

interface ThankYouScreenProps {
  voter: string;
  ratingsCount: number;
  onRedirectToMain: () => void;
  onViewRatings: () => void;
}

export const ThankYouScreen: React.FC<ThankYouScreenProps> = ({
  voter,
  ratingsCount,
  onRedirectToMain,
  onViewRatings,
}) => {
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onRedirectToMain();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onRedirectToMain]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-lg mx-auto bg-stone-900/90 rounded-3xl border border-cyan-900/50 p-8 sm:p-10 shadow-2xl text-center my-6 text-stone-100 glow-cyan-card"
      id="thank-you-screen"
    >
      <div className="mb-4">
        <SoccerGameLogo size="md" />
      </div>

      <div className="w-16 h-16 bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/20">
        <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-950/80 text-cyan-300 text-xs font-chakra font-bold mb-3 border border-cyan-500/30">
        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
        <span>Permanently Saved & Synced</span>
      </div>

      <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-chakra tracking-tight">
        BALLOT SUBMITTED!
      </h2>

      <p className="text-stone-300 text-sm sm:text-base mt-2 max-w-md mx-auto leading-relaxed">
        Your player performance ratings for <strong className="text-cyan-300 font-bold">Soccer Game #5</strong> have been recorded to the permanent database.
      </p>

      {/* Summary Box */}
      <div className="my-6 p-4 rounded-2xl bg-stone-950/80 border border-stone-800 text-left space-y-2 text-xs sm:text-sm font-chakra">
        <div className="flex justify-between items-center text-stone-400">
          <span>Voter:</span>
          <span className="font-bold text-white capitalize">{voter}</span>
        </div>
        <div className="flex justify-between items-center text-stone-400">
          <span>Teammates Rated:</span>
          <span className="font-bold text-cyan-300">{ratingsCount} Players</span>
        </div>
        <div className="flex justify-between items-center text-stone-400">
          <span>Match Event:</span>
          <span className="font-bold text-white">Soccer Game #5</span>
        </div>
      </div>

      {/* Auto Redirect Countdown */}
      <div className="mb-6 flex items-center justify-center gap-2 text-xs font-medium text-stone-400 font-chakra">
        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span>
          Returning to main screen in <strong className="text-cyan-300 font-bold">{countdown}</strong> seconds...
        </span>
      </div>

      {/* Manual Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={onRedirectToMain}
          id="thankyou-redirect-main-btn"
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-chakra font-bold transition-colors cursor-pointer border border-stone-700"
        >
          <span>Main Screen</span>
          <ArrowRight className="w-4 h-4 text-cyan-400" />
        </button>

        <button
          onClick={onViewRatings}
          id="thankyou-view-ratings-btn"
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 text-stone-950 text-xs font-chakra font-black transition-colors cursor-pointer shadow-md shadow-cyan-500/20"
        >
          <Trophy className="w-4 h-4 text-stone-950" />
          <span>View Leaderboard</span>
        </button>
      </div>
    </motion.div>
  );
};
