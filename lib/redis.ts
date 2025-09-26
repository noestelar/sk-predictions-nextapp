import Redis from 'ioredis'

declare global {
  // eslint-disable-next-line no-var
  var redis: Redis | null | undefined
}

const createRedisClient = () => {
  const url = process.env.REDIS_URL
  if (!url) return null

  return new Redis(url, {
    maxRetriesPerRequest: 2,
    enableAutoPipelining: true
  })
}

export const redis = globalThis.redis ?? createRedisClient()

if (typeof window === 'undefined' && globalThis.redis === undefined) {
  globalThis.redis = redis
}
