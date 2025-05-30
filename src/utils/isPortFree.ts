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
