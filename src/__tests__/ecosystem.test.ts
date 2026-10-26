import { describe, it, expect } from "vitest";
import { detectEcosystemAndCommands } from "../lib/ecosystem";

describe("Ecosystem and Command Detection", () => {
  it("detects TypeScript / Node.js with package.json scripts and pnpm", () => {
    const pkg = JSON.stringify({
      scripts: {
        test: "jest",
        lint: "eslint .",
        build: "tsc",
        typecheck: "tsc --noEmit",
      },
    });

    const res = detectEcosystemAndCommands({
      treePaths: ["package.json", "tsconfig.json", "pnpm-lock.yaml", "src/index.ts"],
      packageJsonContent: pkg,
    });

    expect(res.ecosystem).toBe("TypeScript / Node.js");
    expect(res.packageManager).toBe("pnpm");
    expect(res.testCommands).toContain("pnpm test");
    expect(res.lintCommands).toContain("pnpm lint");
    expect(res.buildCommands).toContain("pnpm build");
    expect(res.typecheckCommands).toContain("pnpm typecheck");
  });

  it("detects Rust project from Cargo.toml", () => {
    const res = detectEcosystemAndCommands({
      treePaths: ["Cargo.toml", "src/main.rs"],
    });

    expect(res.ecosystem).toBe("Rust");
    expect(res.testCommands).toContain("cargo test");
    expect(res.lintCommands).toContain("cargo clippy -- -D warnings");
    expect(res.buildCommands).toContain("cargo build");
  });

  it("detects Go project from go.mod", () => {
    const res = detectEcosystemAndCommands({
      treePaths: ["go.mod", "main.go"],
    });

    expect(res.ecosystem).toBe("Go");
    expect(res.testCommands).toContain("go test ./...");
    expect(res.lintCommands).toContain("go vet ./...");
  });

  it("detects Python project from pyproject.toml", () => {
    const res = detectEcosystemAndCommands({
      treePaths: ["pyproject.toml", "app/main.py"],
    });

    expect(res.ecosystem).toBe("Python");
    expect(res.testCommands).toContain("pytest");
  });

  it("detects monorepos like refinedev/refine with biome and lerna lint scripts", () => {
    const pkg = JSON.stringify({
      scripts: {
        lint: "biome check .",
        "lint:ci": "biome ci .",
        test: "lerna run test --stream",
        build: "lerna run build",
      },
    });

    const res = detectEcosystemAndCommands({
      treePaths: [
        "package.json",
        "pnpm-lock.yaml",
        "biome.json",
        "lerna.json",
        "packages/core/src/index.ts",
      ],
      packageJsonContent: pkg,
    });

    expect(res.packageManager).toBe("pnpm");
    expect(res.lintCommands).toContain("pnpm lint");
    expect(res.testCommands).toContain("pnpm test");
  });

  it("detects monorepos using turbo.json fallback", () => {
    const res = detectEcosystemAndCommands({
      treePaths: ["package.json", "pnpm-lock.yaml", "turbo.json", "apps/web/src/page.tsx"],
      packageJsonContent: JSON.stringify({ scripts: { build: "turbo build" } }),
    });

    expect(res.lintCommands).toContain("pnpm turbo lint");
  });

  it("returns 'Not found in repo' when test commands are missing", () => {
    const res = detectEcosystemAndCommands({
      treePaths: ["notes.txt", "doc.pdf"],
    });

    expect(res.testCommands).toEqual(["Not found in repo"]);
    expect(res.lintCommands).toEqual(["Not found in repo"]);
  });
});
