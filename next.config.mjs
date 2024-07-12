/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "shiny-space-meme-v9r7vxj9q74hxx4-3000.app.github.dev",
        "localhost:3000",
      ],
      missingSuspenseWithCSRBailout: true,
    },
  }
};

export default nextConfig;
