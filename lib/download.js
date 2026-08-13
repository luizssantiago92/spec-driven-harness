import { createWriteStream } from "node:fs";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

import { removeFileSafe } from "./fs-utils.js";

/** A stalled mirror should fail the install instead of hanging it. */
const REQUEST_TIMEOUT_MS = 30_000;

/** Harness assets are markdown and small scripts; anything larger is suspect. */
const MAX_ASSET_BYTES = 2 * 1024 * 1024;

function limitSize(url, limit) {
  let received = 0;

  return new Transform({
    transform(chunk, _encoding, callback) {
      received += chunk.length;

      if (received > limit) {
        callback(
          new Error(
            `Download failed: ${url} exceeds the ${limit}-byte asset limit`,
          ),
        );
        return;
      }

      callback(null, chunk);
    },
  });
}

export async function downloadToFile(url, destPath) {
  let response;

  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      redirect: "follow",
    });
  } catch (err) {
    if (err.name === "TimeoutError" || err.name === "AbortError") {
      throw new Error(
        `Download failed: ${url} timed out after ${REQUEST_TIMEOUT_MS}ms`,
      );
    }
    throw new Error(`Download failed: unable to reach ${url} (${err.message})`);
  }

  if (!response.ok) {
    throw new Error(`Download failed: ${response.status} ${url}`);
  }

  if (!response.body) {
    throw new Error(`Download failed: empty response body from ${url}`);
  }

  const declaredLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_ASSET_BYTES) {
    throw new Error(
      `Download failed: ${url} exceeds the ${MAX_ASSET_BYTES}-byte asset limit`,
    );
  }

  const body = Readable.fromWeb(response.body);
  const fileStream = createWriteStream(destPath);

  try {
    await pipeline(body, limitSize(url, MAX_ASSET_BYTES), fileStream);
  } catch (err) {
    await removeFileSafe(destPath);
    if (err.code === "EACCES" || err.code === "EPERM") {
      throw new Error(`Permission denied: cannot write ${destPath}`);
    }
    throw err;
  }
}
