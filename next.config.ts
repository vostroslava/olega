import type { NextConfig } from "next";

const repositoryName = "olega";
const githubPagesBasePath = `/${repositoryName}`;
const isGithubPagesBuild = process.env.GITHUB_ACTIONS === "true";
const deploymentEnvironment = process.env.NEXT_PUBLIC_SITE_ENV || (isGithubPagesBuild ? "preview" : "production");

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
    qualities: [75, 90, 92],
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: isGithubPagesBuild ? githubPagesBasePath : "",
    NEXT_PUBLIC_SITE_ENV: deploymentEnvironment,
  },
  basePath: isGithubPagesBuild ? githubPagesBasePath : "",
  assetPrefix: isGithubPagesBuild ? githubPagesBasePath : undefined,
};

export default nextConfig;
