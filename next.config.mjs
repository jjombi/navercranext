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
    webpack: (config, { isServer }) => {
        // Puppeteer와 관련된 모듈들을 webpack이 무시하도록 설정
        if (isServer) {
            config.externals.push('puppeteer', 'chrome-aws-lambda');
        }

        return config;
    },
};

export default nextConfig;
