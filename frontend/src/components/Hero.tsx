"use client";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Zap, Target, TrendingUp } from "lucide-react";

const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-black text-white">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] animate-pulse delay-700" />

      <div className="container mx-auto px-6 z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-purple-400 text-sm font-medium mb-8"
        >
          <Sparkles className="w-4 h-4" />
          <span>Next-Gen Knowvation</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-8xl font-bold tracking-tight mb-8"
        >
          Hire <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">Smarter</span>, <br />
          Not Harder.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl mb-12"
        >
          Automate your recruitment intelligence. Scrape public sources, analyze hiring trends with AI, 
          and identify the best talent before anyone else.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col md:flex-row gap-4"
        >
          <button className="px-8 py-4 bg-white text-black font-semibold rounded-2xl flex items-center gap-2 hover:scale-105 transition-all">
            Get Started Free <ArrowRight className="w-5 h-5" />
          </button>
          <button className="px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-2xl hover:bg-white/10 transition-all">
            View Live Demo
          </button>
        </motion.div>

        {/* 3D Floating Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24">
          {[
            { icon: Zap, title: "Fast Scraping", desc: "Collect data from LinkedIn, Indeed, and more in seconds." },
            { icon: Target, title: "AI Analysis", desc: "Automatically extract skills and experience using Gemini AI." },
            { icon: TrendingUp, title: "Trend Reports", desc: "Visualize hiring frequency and technology demand." },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              whileHover={{ y: -10, rotateX: 5, rotateY: 5 }}
              className="p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm text-left hover:border-purple-500/50 transition-all cursor-default"
            >
              <feature.icon className="w-10 h-10 text-purple-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;
