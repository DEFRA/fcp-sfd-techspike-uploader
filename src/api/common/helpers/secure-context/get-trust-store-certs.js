const getTrustStoreCerts = (envs) => {
  return Object.entries(envs)
    .map(([key, value]) => key.startsWith('TRUSTSTORE_') && value)
    .filter((envValue) => Boolean(envValue))
    .map((envValue) => Buffer.from(envValue, 'base64').toString().trim())
}

export { getTrustStoreCerts }
