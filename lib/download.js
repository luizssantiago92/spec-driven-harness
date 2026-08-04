import { createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

import { removeFileSafe } from "./fs-utils.js";

export async function downloadToFile(url, destPath) {
  let response;

  try {
    response = await fetch(url);
  } catch (err) {
    throw new Error(`Download failed: unable to reach ${url} (${err.message})`);
  }

  if (!response.ok) {
    throw new Error(`Download failed: ${response.status} ${url}`);
  }

  if (!response.body) {
    throw new Error(`Download failed: empty response body from ${url}`);
  }

  const body = Readable.fromWeb(response.body);
  const fileStream = createWriteStream(destPath);

  try {
    await pipeline(body, fileStream);
  } catch (err) {
    await removeFileSafe(destPath);
    if (err.code === "EACCES" || err.code === "EPERM") {
      throw new Error(`Permission denied: cannot write ${destPath}`);
    }
    throw err;
  }
}
