/**
 * Shared terminal helper: reads a secret with echo disabled.
 * Used by the local scripts so no password has to be stored in .env.local
 * or typed into shell history.
 *
 * Handles backspace, Ctrl+C and bracketed-paste escape sequences, so pasting
 * from a password manager works too.
 */

export function askHidden(question, envFallback) {
  if (!process.stdin.isTTY) {
    const injected = envFallback ? process.env[envFallback] : undefined;
    if (!injected) {
      console.error(
        `No interactive terminal. Set ${envFallback ?? "the password"} in the environment for this run.`
      );
      process.exit(1);
    }
    return Promise.resolve(injected);
  }

  return new Promise((resolvePromise) => {
    process.stdout.write(question);
    const stdin = process.stdin;
    stdin.resume();
    stdin.setRawMode(true);
    stdin.setEncoding("utf8");
    let value = "";
    // 0 = normal, 1 = saw ESC, 2 = inside CSI/SS3 sequence (skip until final byte)
    let escapeState = 0;

    const cleanup = () => {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.removeListener("data", onData);
    };

    const onData = (chunk) => {
      for (const char of chunk) {
        // Skip terminal escape sequences, e.g. bracketed paste markers
        // \x1b[200~ … \x1b[201~ emitted when pasting from a password manager.
        if (escapeState === 1) {
          escapeState = char === "[" || char === "O" ? 2 : 0;
          continue;
        }
        if (escapeState === 2) {
          if (char >= "@" && char <= "~") escapeState = 0;
          continue;
        }
        if (char === "\u001b") {
          escapeState = 1;
          continue;
        }

        if (char === "\r" || char === "\n" || char === "\u0004") {
          cleanup();
          process.stdout.write("\n");
          resolvePromise(value);
          return;
        }
        if (char === "\u0003") {
          cleanup();
          process.stdout.write("\n");
          process.exit(130);
        }
        if (char === "\u007f" || char === "\b") {
          value = value.slice(0, -1);
          continue;
        }
        if (char >= " ") value += char;
      }
    };

    stdin.on("data", onData);
  });
}
