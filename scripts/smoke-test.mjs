const rawBaseUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const baseUrl = rawBaseUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
const healthUrl = `${baseUrl}/health`;

async function runSmokeTest() {
  console.log(`Checking API health at ${healthUrl}...`);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(healthUrl, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Health endpoint returned HTTP ${response.status}`);
    }

    const payload = await response.json();
    if (payload?.status !== 'ok' || payload?.service !== 'brewlite-api') {
      throw new Error(`Unexpected health payload: ${JSON.stringify(payload)}`);
    }

    console.log('Smoke test passed:', payload);
  } finally {
    clearTimeout(timeout);
  }
}

runSmokeTest().catch((error) => {
  console.error('Smoke test failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});

