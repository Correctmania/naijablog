import React, { useState } from 'react';

export default function ContactForm({ darkMode, handleBackToHome }) {
  const [contactResult, setContactResult] = useState("");
  const [contactStatus, setContactStatus] = useState("");

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <button 
        onClick={handleBackToHome} 
        className="text-xs font-bold text-blue-500 hover:underline mb-6 inline-flex items-center gap-1"
      >
        &larr; Back to Home
      </button>

      <div className={`p-8 rounded-3xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'}`}>
        <h1 className="text-3xl font-black mb-2">Contact Us</h1>
        <p className="text-sm text-slate-400 mb-8">Have a news tip, inquiry, or feedback? Send us a message below.</p>

        <form 
          onSubmit={async (event) => {
            event.preventDefault();
            setContactResult("Sending...");
            setContactStatus("");

            const formData = new FormData(event.target);
            formData.append("access_key", "b0833b87-0aa1-439d-8ece-add369949fe6");

            try {
              const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
              });

              const data = await response.json();

              if (data.success) {
                setContactResult("Message sent successfully! We will get back to you soon.");
                setContactStatus("success");
                event.target.reset();
              } else {
                setContactResult(data.message || "Something went wrong. Please try again.");
                setContactStatus("error");
              }
            } catch (error) {
              setContactResult("Network error. Please check your connection.");
              setContactStatus("error");
            }
          }} 
          className="space-y-5"
        >
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Your Name</label>
            <input 
              type="text" 
              name="name" 
              required 
              className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Your Email</label>
            <input 
              type="email" 
              name="email" 
              required 
              className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Message</label>
            <textarea 
              name="message" 
              rows="5" 
              required 
              className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
              placeholder="Write your message or news tip here..."
            ></textarea>
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all text-sm shadow-sm"
          >
            Send Message
          </button>

          {contactResult && (
            <p className={`text-xs mt-3 text-center font-semibold ${contactStatus === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
              {contactResult}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}