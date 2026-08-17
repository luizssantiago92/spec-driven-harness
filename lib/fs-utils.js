import fs from "node:fs/promises";

function isPermissionError(err) {
  return err && (err.code === "EACCES" || err.code === "EPERM");
}

/**
 * Refuse to overwrite through a symlink (install must not clobber .env etc.).
 * Used for packaged copies, remote downloads, memory files, and `.cursorrules`.
 *
 * @param {string} destPath
 */
export async function assertSafeWriteTarget(destPath) {
  let st;
  try {
    st = await fs.lstat(destPath);
  } catch (err) {
    if (err.code === "ENOENT") {
      return;
    }
    if (isPermissionError(err)) {
      throw new Error(`Permission denied: cannot access ${destPath}`);
    }
    throw err;
  }

  if (st.isSymbolicLink()) {
    throw new Error(
      `Refusing to write through symlink: ${destPath} — ` +
        "remove the link or choose another destination before installing.",
    );
  }
}

export async function ensureDir(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (err) {
    if (isPermissionError(err)) {
      throw new Error(`Permission denied: cannot create ${dirPath}`);
    }
    throw err;
  }
}

export async function writeFileIfMissing(filePath, content) {
  await assertSafeWriteTarget(filePath);

  try {
    await fs.writeFile(filePath, content, { encoding: "utf8", flag: "wx" });
    return true;
  } catch (err) {
    if (err.code === "EEXIST") {
      return false;
    }
    if (isPermissionError(err)) {
      throw new Error(`Permission denied: cannot write ${filePath}`);
    }
    throw err;
  }
}

export async function appendFileSafe(filePath, content) {
  await assertSafeWriteTarget(filePath);

  try {
    await fs.appendFile(filePath, content, "utf8");
  } catch (err) {
    if (isPermissionError(err)) {
      throw new Error(`Permission denied: cannot write ${filePath}`);
    }
    throw err;
  }
}

export async function writeFileSafe(filePath, content) {
  await assertSafeWriteTarget(filePath);

  try {
    await fs.writeFile(filePath, content, "utf8");
  } catch (err) {
    if (isPermissionError(err)) {
      throw new Error(`Permission denied: cannot write ${filePath}`);
    }
    throw err;
  }
}

export async function readFileSafe(filePath) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (err) {
    if (isPermissionError(err)) {
      throw new Error(`Permission denied: cannot read ${filePath}`);
    }
    throw err;
  }
}

export async function removeFileSafe(filePath) {
  try {
    await fs.unlink(filePath);
  } catch (err) {
    if (err.code === "ENOENT") {
      return;
    }
    if (isPermissionError(err)) {
      throw new Error(`Permission denied: cannot remove ${filePath}`);
    }
    throw err;
  }
}

export { isPermissionError };
