/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['ddragon.leagueoflegends.com', 'raw.communitydragon.org'],
  },
  serverRuntimeConfig: {
    RIOT_API_KEY: process.env.RIOT_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  },
}

module.exports = nextConfig