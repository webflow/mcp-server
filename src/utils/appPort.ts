import net from "net";

/**
 * Checks if a given port is free (not currently in use).
 * @param port - The port number to check.
 * @returns A Promise that resolves to `true` if the port is free, `false` if it's in use.
 */
export function isPortFree(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const tester = net
      .createServer()
      .once("error", (err: NodeJS.ErrnoException) => {
        if (err.code === "EADDRINUSE") {
          resolve(false); // Port is in use
        } else {
          resolve(false); // Unexpected error
        }
      })
      .once("listening", () => {
        tester.close(() => resolve(true)); // Port is free
      })
      .listen(port);
  });
}

/**
 * Finds the first available port in the given range.
 * @param startPort - The starting port number to check.
 * @param endPort - The ending port number to check.
 * @returns A Promise that resolves to the first free port number.
 * @throws Error if no free port is found in the range.
 */
export async function getFreePort(
  startPort: number,
  endPort: number
): Promise<number> {
  if (startPort > endPort) {
    throw new Error(
      `Invalid port range: startPort (${startPort}) must be <= endPort (${endPort})`
    );
  }

  if (startPort < 1 || endPort > 65535) {
    throw new Error(
      `Port numbers must be between 1 and 65535`
    );
  }

  for (let port = startPort; port <= endPort; port++) {
    if (await isPortFree(port)) {
      return port;
    }
  }

  throw new Error(
    `No free port found in range ${startPort}-${endPort}`
  );
}
