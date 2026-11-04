// What this file does: talks to GitHub. It can read a file from the main
// branch and open a pull request with file changes. It uses plain fetch, so no
// extra package is needed. The token stays on the server.
import "server-only";
import { SafeError } from "./action-result";

export class GithubError extends SafeError {}

type Config = { token: string; repo: string; base: string };

function getConfig(): Config {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  if (!token || !repo) throw new GithubError("GitHub is not set up on the server yet.");
  return { token, repo, base: process.env.GITHUB_BASE_BRANCH ?? "main" };
}

async function call(cfg: Config, path: string, init: { method?: string; body?: unknown } = {}) {
  return fetch(`https://api.github.com/repos/${cfg.repo}${path}`, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
  });
}

async function callJson<T>(cfg: Config, path: string, init: { method?: string; body?: unknown }, what: string): Promise<T> {
  const res = await call(cfg, path, init);
  // The message never includes the token.
  if (!res.ok) throw new GithubError(`GitHub refused to ${what} (status ${res.status}).`);
  return (await res.json()) as T;
}

const encodePath = (path: string) => path.split("/").map(encodeURIComponent).join("/");

// Reads one file. Returns null when the file does not exist.
async function readFile(cfg: Config, path: string, ref: string): Promise<{ text: string; sha: string } | null> {
  const res = await call(cfg, `/contents/${encodePath(path)}?ref=${encodeURIComponent(ref)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new GithubError(`GitHub refused to read a file (status ${res.status}).`);
  const data = (await res.json()) as { content?: string; encoding?: string; sha: string };
  if (!data.content || data.encoding !== "base64") {
    throw new GithubError("GitHub sent a file in a format we cannot read.");
  }
  return { text: Buffer.from(data.content, "base64").toString("utf8"), sha: data.sha };
}

// Reads a file from the main branch (the published source of truth).
export async function getRepoFile(path: string): Promise<string | null> {
  const cfg = getConfig();
  return (await readFile(cfg, path, cfg.base))?.text ?? null;
}

export type PullRequestInput = {
  branch: string;
  title: string;
  body: string;
  commitMessage: string;
  changes: { path: string; content: string }[];
};

// Makes a branch, commits every change, opens a pull request, returns its link.
// If anything fails after the branch was made, the branch is deleted again.
export async function openPullRequest(input: PullRequestInput): Promise<string> {
  const cfg = getConfig();

  const baseRef = await callJson<{ object: { sha: string } }>(
    cfg,
    `/git/ref/heads/${encodeURIComponent(cfg.base)}`,
    {},
    "read the main branch",
  );
  await callJson(
    cfg,
    "/git/refs",
    { method: "POST", body: { ref: `refs/heads/${input.branch}`, sha: baseRef.object.sha } },
    "create a branch",
  );

  try {
    for (const change of input.changes) {
      const existing = await readFile(cfg, change.path, input.branch);
      await callJson(
        cfg,
        `/contents/${encodePath(change.path)}`,
        {
          method: "PUT",
          body: {
            message: input.commitMessage,
            content: Buffer.from(change.content, "utf8").toString("base64"),
            branch: input.branch,
            sha: existing?.sha,
          },
        },
        "save a file",
      );
    }
    const pr = await callJson<{ html_url: string }>(
      cfg,
      "/pulls",
      { method: "POST", body: { title: input.title, head: input.branch, base: cfg.base, body: input.body } },
      "open the pull request",
    );
    return pr.html_url;
  } catch (error) {
    // Best effort clean up so a retry can start fresh.
    await call(cfg, `/git/refs/heads/${input.branch.split("/").map(encodeURIComponent).join("/")}`, {
      method: "DELETE",
    }).catch(() => undefined);
    throw error;
  }
}
