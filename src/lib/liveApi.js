/**
 * liveApi.js
 * 
 * Clean client for talking to the distributed blog-api backend.
 * All calls are authenticated using a PocketBase-issued token (or our orchestrator JWT later).
 */

export const DEFAULT_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api/v1";

function getHeaders(token) {
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function request(path, { method = "GET", body, token, base = DEFAULT_BASE } = {}) {
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  
  const res = await fetch(url, {
    method,
    headers: getHeaders(token),
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let errorMessage = `Request failed with status ${res.status}`;
    try {
      const err = await res.json();
      errorMessage = err.detail || err.message || errorMessage;
    } catch {}
    throw new Error(errorMessage);
  }

  // Some endpoints return no content
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return null;
}

// ==================== Public API ====================

export const liveApi = {
  // --- Auth / Health ---
  async health(base) {
    return request("/health", { base });
  },

  async getMe(token, base) {
    return request("/me", { token, base });
  },

  // --- Core Generation ---
  async generate({ rawInput, tone, model, token, base }) {
    return request("/generate", {
      method: "POST",
      body: { raw_input: rawInput, tone, model },
      token,
      base,
    });
  },

  async refine({ currentMarkdown, instruction, model, token, base }) {
    return request("/refine", {
      method: "POST",
      body: { current_markdown: currentMarkdown, instruction, model },
      token,
      base,
    });
  },

  // --- Structured Intelligence (strongly recommended over the legacy /structured) ---
  async generateQuiz(blogContent, token, base, model = null) {
    return request("/quiz", {
      method: "POST",
      body: { blog_content: blogContent, model },
      token,
      base,
    });
  },

  async generateVideoStoryboard(blogContent, style = "cyberpunk", token, base, model = null) {
    return request(`/video-storyboard?style=${style}`, {
      method: "POST",
      body: { blog_content: blogContent, model },
      token,
      base,
    });
  },

  async generateSeo(blogContent, token, base, model = null) {
    return request("/seo", {
      method: "POST",
      body: { blog_content: blogContent, model },
      token,
      base,
    });
  },

  async generateSocialKit(blogContent, platforms, token, base, model = null) {
    return request("/social-kit", {
      method: "POST",
      body: { blog_content: blogContent, platforms, model },
      token,
      base,
    });
  },

  // --- Media ---
  async synthesizeAudio({ blogTitle, blogContent, voice = "Kore", speed = 1.0, token, base }) {
    return request("/audio", {
      method: "POST",
      body: { blog_title: blogTitle, blog_content: blogContent, voice, speed },
      token,
      base,
    });
  },

  async generateCover({ title, stylePrompt, token, base }) {
    return request("/cover", {
      method: "POST",
      body: { title, style_prompt: stylePrompt },
      token,
      base,
    });
  },

  // --- Real Persistence (the big upgrade) ---
  async listDrafts(token, base) {
    return request("/drafts", { token, base });
  },

  async saveDraft({ title, markdown, tone, tags = [], token, base }) {
    return request("/drafts", {
      method: "POST",
      body: { title, markdown, tone, tags },
      token,
      base,
    });
  },

  async getDraft(draftId, token, base) {
    return request(`/drafts/${draftId}`, { token, base });
  },

  // --- PocketBase Auth (for nice login modal) ---
  async loginWithPassword(email, password, pocketbaseRoot) {
    const root = pocketbaseRoot || "http://localhost:8090";
    const url = `${root.replace(/\/$/, '')}/api/collections/users/auth-with-password`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identity: email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Login failed");
    }
    return res.json(); // { token, record }
  },

  // --- Publishing ---
  async publish({ title, markdown, targets, metaDescription, tags, token, base }) {
    return request("/publish", {
      method: "POST",
      body: {
        title,
        markdown,
        targets,
        meta_description: metaDescription,
        tags,
      },
      token,
      base,
    });
  },

  // === NEW: Metrics endpoints ===
  async getMetricsOverview(token, base) {
    return request("/metrics/overview", { token, base });
  },

  async getMetricsEvents(limit = 20, token, base) {
    return request(`/metrics/events?limit=${limit}`, { token, base });
  },

  async getMetricsLatency(token, base) {
    return request("/metrics/latency", { token, base });
  },

  async getMetricsLLMUsage(token, base) {
    return request("/metrics/llm-usage", { token, base });
  },

  async getMetricsPublishingJobs(limit = 10, token, base) {
    return request(`/metrics/publishing-jobs?limit=${limit}`, { token, base });
  },
};

export default liveApi;
