/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["xnxnxnxnxnxn.supabase.co"], // substitua pelo seu domínio do Supabase
    formats: ["image/webp"],
  },
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
    responseLimit: false,
  },
};

export default nextConfig;
