export function gracefulShutdown(shutdown: () => Promise<void>) {
  let isShuttingDown = false;

  async function listener() {
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;

    await shutdown();

    process.exit();
  }

  process.on('SIGINT', listener);
  process.on('SIGTERM', listener);
}
