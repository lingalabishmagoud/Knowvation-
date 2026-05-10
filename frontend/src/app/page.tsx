import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <Hero />
      
      {/* Footer / Secondary sections can go here */}
      <footer className="py-12 border-t border-white/10 text-center text-gray-500 text-sm">
        &copy; 2026 Knowvation. All rights reserved.
      </footer>
    </main>
  );
}
