# Deployment Guide 🚀

Your Online Compiler is built with **Vite + React**. Since it relies on client-side execution (Pyodide) and public APIs (Piston), it is technically a **Static Site**. You do not need a dedicated backend server.

You can deploy it for free on **Render**, **Vercel**, or **Netlify**.

## Option 1: Render (Recommended)

1.  **Push your code** to a GitHub repository.
2.  Log in to [Render.com](https://render.com).
3.  Click **New +** and select **Static Site**.
4.  Connect your GitHub repository.
5.  Use the following configuration:
    *   **Build Command**: `npm install && npm run build`
    *   **Publish Directory**: `dist`
6.  Click **Create Static Site**.

## Option 2: Vercel

1.  Install Vercel CLI: `npm i -g vercel` (or use the web dashboard).
2.  Run `vercel` in your project folder.
3.  Accept the default settings (Vite is automatically detected).
4.  Your site will be live instantly.

## Options 3: Netlify

1.  Drag and drop your `dist` folder (after running `npm run build`) to the Netlify dashboard.
2.  Or connect via Git similar to Render.

## Important Note regarding Piston API
The Piston API (`emkc.org`) is public. It allows requests from any origin, so your code execution will work perfectly on your deployed site without any CORS configuration.
