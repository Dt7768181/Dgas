import type {NextConfig} from 'next';
import fs from 'fs';
import path from 'path';

// Function to copy directory
const copyDir = (src: string, dest: string) => {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

// Copy assets from src/assets to public/assets
const srcAssetsDir = path.join(process.cwd(), 'src/assets');
const publicAssetsDir = path.join(process.cwd(), 'public/assets');
if (fs.existsSync(srcAssetsDir)) {
  copyDir(srcAssetsDir, publicAssetsDir);
}


const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
