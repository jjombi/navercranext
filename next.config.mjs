/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'image.msscdn.net',
            },
            {
                protocol: 'https',
                hostname: 'd3ha2047wt6x28.cloudfront.net',
            },
            {
                protocol: 'https',
                hostname: '4910.kr',
            },
        ],
    },
};

export default nextConfig;
