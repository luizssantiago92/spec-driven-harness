import fs from "node:fs/promises";

function isPermissionError(err) {
  return err && (err.code === "EACCES" || err.code === "EPERM");
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
  try {
    await fs.access(filePath);
    return false;
  } catch (err) {
    if (err.code !== "ENOENT") {
      if (isPermissionError(err)) {
        throw new Error(`Permission denied: cannot access ${filePath}`);
      }
      throw err;
    }
  }

  try {
    await fs.writeFile(filePath, content, "utf8");
    return true;
  } catch (err) {
    if (isPermissionError(err)) {
      throw new Error(`Permission denied: cannot write ${filePath}`);
    }
    throw err;
  }
}

export async function appendFileSafe(filePath, content) {
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
