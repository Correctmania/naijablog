import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm">&copy; {new Date().getFullYear()} Naijablog. All rights reserved.</p>
        <div className="flex flex-wrap gap-6 text-sm">
          <a href="/about" className="hover:text-white transition">About Us</a>
          <a href="/contact" className="hover:text-white transition">Contact Us</a>
          <a href="/privacy-policy" className="hover:text-white transition">Privacy Policy</a>
          <a href="/terms" className="hover:text-white transition">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}