#!/usr/bin/env node
import { execSync } from "child_process";


function run(cmd) {
  return execSync(cmd, { encoding: "utf8" }).trim();
}

function hasCommits() {
  try {
    run("git rev-parse --verify HEAD");
    return true;
  } catch {
    return false;
  }
}

function getLastTag() {
  try {
    return run("git describe --tags --abbrev=0");
  } catch {
    return "v0.0.0";
  }
}

function bumpVersion(lastTag, commitMsg) {
  const version = lastTag.replace(/^v/, "");
  let [major, minor, patch] = version.split(".").map(Number);

  const msg = commitMsg.trim();

const isMajor = /^\s*BREAKING/i.test(msg) || /^[a-z]+!:/i.test(msg);

  if (isMajor) {
	major++;
	minor = 0;
    patch = 0;
  } else if (/^feat/i.test(msg)) {
	minor++;
    patch = 0;
  } else if (/^fix|refactor/i.test(msg)) {
	patch++;
  } else {
	return null;
  }

  return `v${major}.${minor}.${patch}`;
}


function createTag(tag) {
  run(`git tag ${tag}`);
}


function main() {
  if (!hasCommits()) {
  	process.exit(0);
  }
  const lastTag = getLastTag();
  const commitMsg = run("git log -1 --pretty=%B");

  console.log("Last tag:", lastTag);
  console.log("Commit message:", JSON.stringify(commitMsg));

  const newTag = bumpVersion(lastTag, commitMsg);
  if (newTag) {
    createTag(newTag);
  }
}

main();
