# Deployment Guide 🚀

Your Online Compiler (**CodeVerse**) is ready to go live!

## ⚡ Quick Start: Deploy to Render (Recommended)

Since I have added a `render.yaml` file to your code, deployment is automatic.

1.  **Go to Render Dashboard**: [https://dashboard.render.com](https://dashboard.render.com)
2.  Click **New +** -> **Blueprint**.
3.  Connect your GitHub repository: `CodeVerse`.
4.  Render will auto-detect the configuration:
    -   **Name**: `CodeVerse`
    -   **Build Command**: `npm install && npm run build`
    -   **Publish Directory**: `./dist`
5.  Click **Apply** (or "Create Service").

That's it! Your site will be online in ~1-2 minutes.

---

## 🛠 Manual Setup (If Blueprint fails)

If you prefer to set it up manually without the blueprint:

1.  Click **New +** -> **Static Site**.
2.  Connect your repo.
3.  Fill in these details:
    *   **Name**: `codeverse-compiler` (or any unique name)
    *   **Branch**: `main`
    *   **Root Directory**: (Leave blank / `.`)
    *   **Build Command**: `npm install && npm run build`
    *   **Publish Directory**: `dist`
4.  Click **Create Static Site**.

## 🌐 Other Platforms

**Vercel / Netlify**:
Simply import the repository. They will auto-detect it is a **Vite/React** app and set the build command to `npm run build` and output directory to `dist` automatically.
