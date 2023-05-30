const path = require('path');

class Workspace {

  static NULL_BYTES = ["\0", "\000", "\x00", "\z", "\u0000", "%00"];

  constructor(workspaceRoot, restrictToWorkspace) {
    this._root = Workspace._sanitizePath(workspaceRoot);
    this._restrictToWorkspace = restrictToWorkspace;
  }

  get root() {
    return this._root;
  }

  get restrictToWorkspace() {
    return this._restrictToWorkspace;
  }

  static makeWorkspace(workspaceDirectory) {
    // TODO: have this make the env file and ai settings file in the directory.
    workspaceDirectory = this._sanitizePath(workspaceDirectory);
    workspaceDirectory.mkdir(exist_ok=true, parents=true);
    return workspaceDirectory;
  }

  getPath(relativePath) {
    return this._sanitizePath(
      relativePath,
      root=this.root,
      restrictToRoot=this.restrictToWorkspace,
    );
  }

  static _sanitizePath(
    relativePath,
    root = null,
    restrictToRoot = true,
  ) {
    // Posix systems disallow null bytes in paths. Windows is agnostic about it.
    // Do an explicit check here for all sorts of null byte representations.

    for (const nullByte of Workspace.NULL_BYTES) {
      if ((relativePath && relativePath.includes(nullByte)) || (root && root.includes(nullByte))) {
        throw new Error('embedded null byte');
      }
    }

    if (root === null) {
      return path.resolve(relativePath);
    }

    console.debug(`Resolving path ${relativePath} in workspace ${root}`);

    const rootPath = path.resolve(root);
    relativePath = path.resolve(relativePath);

    console.debug(`Resolved root as ${rootPath}`);

    // Allow exception for absolute paths if they are contained in your workspace directory.
    if (relativePath.isAbsolute() && !relativePath.isRelativeTo(rootPath)) {
      throw new Error(`Attempted to access absolute path ${relativePath} in workspace ${root}.`);
    }

    const fullPath = path.resolve(path.join(rootPath, relativePath));

    console.debug(`Joined paths as ${fullPath}`);

    if (restrictToRoot && !fullPath.isRelativeTo(rootPath)) {
      throw new Error(`Attempted to access path ${fullPath} outside of workspace ${root}.`);
    }

    return fullPath;
  }
}

module.exports = Workspace;
