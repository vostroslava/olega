import type { NextConfig } from "next";

const repositoryName = "olega";
const githubPagesBasePath = `/${repositoryName}`;
const isGithubPagesBuild = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: isGithubPagesBuild ? githubPagesBasePath : "",
  },
  basePath: isGithubPagesBuild ? githubPagesBasePath : "",
  assetPrefix: isGithubPagesBuild ? githubPagesBasePath : undefined,
};

export default nextConfig;
