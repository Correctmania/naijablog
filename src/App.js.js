import { useState, useEffect, useRef } from "react";

// —————————————————————————————————————————————————————————————
// SUPABASE CONFIG — replace with yours from supabase.com
// —————————————————————————————————————————————————————————————
const SUPABASE_URL = "https://szzflseeqnhjphmooqfp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6emZsc2VlcW5oanBobW9vcWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0NTY5NjIsImV4cCI6MjA2MTAzMjk2Mn0.eyJpc3MiOiJzdXBhYmFzZSJ9";
const ADMIN_PASSWORD = "naija2026";
const SITE_EMAIL = "contact@naijablog.com.ng";
const SITE_NAME = "NaijaBlog";
const SITE_DOMAIN = "naijablog.com.ng";

const sb = {
  async getArticles() {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/articles?order=created_at.desc`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    });
    return r.ok ? r.json() : [];
  },
  async insertArticle(a) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/articles`, {
      method: "POST",
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(a),
    });
    const data = await r.json();
    return data[0];
  },
  async updateArticle(id, a) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/articles?id=eq.${id}`, {
      method: "PATCH",
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(a),
    });
    const data = await r.json();
    return data[0];
  },
  async deleteArticle(id) {
    await fetch(`${SUPABASE_URL}/rest/v1/articles?id=eq.${id}`, {
      method: "DELETE",
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    });
  },
};

// ... (Rest of the helper functions and UI components remain the same)import { useState, useEffect, useRef } from "react";

// —————————————————————————————————————————————————————————————
// SUPABASE CONFIG — replace with yours from supabase.com
// —————————————————————————————————————————————————————————————
const SUPABASE_URL = "https://szzflseeqnhjphmooqfp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6emZsc2VlcW5oanBobW9vcWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0NTY5NjIsImV4cCI6MjA2MTAzMjk2Mn0.eyJpc3MiOiJzdXBhYmFzZSJ9";
const ADMIN_PASSWORD = "naija2026";
const SITE_EMAIL = "contact@naijablog.com.ng";
const SITE_NAME = "NaijaBlog";
const SITE_DOMAIN = "naijablog.com.ng";

const sb = {
  async getArticles() {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/articles?order=created_at.desc`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    });
    return r.ok ? r.json() : [];
  },
  async insertArticle(a) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/articles`, {
      method: "POST",
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(a),
    });
    const data = await r.json();
    return data[0];
  },
  async updateArticle(id, a) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/articles?id=eq.${id}`, {
      method: "PATCH",
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(a),
    });
    const data = await r.json();
    return data[0];
  },
  async deleteArticle(id) {
    await fetch(`${SUPABASE_URL}/rest/v1/articles?id=eq.${id}`, {
      method: "DELETE",
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    });
  },
};

// ... (Rest of the helper functions and UI components remain the same)