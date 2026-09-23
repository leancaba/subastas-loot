/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Las fotos y el video 360 se cargan como links externos (no se suben al hosting),
    // así que permitimos cualquier dominio remoto para las imágenes de producto.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

module.exports = nextConfig;
