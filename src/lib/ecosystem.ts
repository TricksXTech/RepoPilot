/**
 * Ecosystem and Command Detector
 * Detects test, lint, build, and typecheck commands across diverse tech stacks
 * (JavaScript, TypeScript, Python, Rust, Go, Java, Kotlin, Ruby, PHP, C#/.NET, Makefile).
 */
import { EcosystemCommands } from "./types";

interface EcosystemContext {
  treePaths: string[];
  packageJsonContent?: string | null;
  cargoTomlContent?: string | null;
  pyprojectContent?: string | null;
  makefileContent?: string | null;
  composerJsonContent?: string | null;
}

export function detectEcosystemAndCommands(ctx: EcosystemContext): EcosystemCommands {
  const { treePaths, packageJsonContent, makefileContent } = ctx;
  const pathsSet = new Set(treePaths.map((p) => p.toLowerCase()));

  const testCommands: string[] = [];
  const lintCommands: string[] = [];
  const buildCommands: string[] = [];
  const typecheckCommands: string[] = [];
  const detectedFiles: string[] = [];
  let ecosystem = "Unknown";
  let packageManager: string | undefined;

  // 1. JavaScript / TypeScript Detection
  const hasPackageJson = pathsSet.has("package.json") || treePaths.some((p) => p.endsWith("/package.json"));
  if (hasPackageJson) {
    ecosystem = pathsSet.has("tsconfig.json") || treePaths.some((p) => p.endsWith(".ts") || p.endsWith(".tsx"))
      ? "TypeScript / Node.js"
      : "JavaScript / Node.js";

    detectedFiles.push("package.json");

    // Package manager detection
    if (pathsSet.has("pnpm-lock.yaml")) {
      packageManager = "pnpm";
      detectedFiles.push("pnpm-lock.yaml");
    } else if (pathsSet.has("yarn.lock")) {
      packageManager = "yarn";
      detectedFiles.push("yarn.lock");
    } else if (pathsSet.has("bun.lockb") || pathsSet.has("bun.lock")) {
      packageManager = "bun";
      detectedFiles.push("bun.lockb");
    } else {
      packageManager = "npm";
      if (pathsSet.has("package-lock.json")) detectedFiles.push("package-lock.json");
    }

    const pmRun = packageManager === "npm" ? "npm run" : packageManager;

    if (packageJsonContent) {
      try {
        const pkg = JSON.parse(packageJsonContent);
        const scripts = pkg.scripts || {};
        const scriptKeys = Object.keys(scripts);

        // Test command detection
        const testKey = scriptKeys.find((k) =>
          ["test", "test:all", "test:unit", "test:ci"].includes(k.toLowerCase())
        );
        if (testKey && scripts[testKey] !== 'echo "Error: no test specified" && exit 1') {
          testCommands.push(packageManager === "npm" ? `npm test` : `${packageManager} ${testKey}`);
        }

        // Lint command detection (covers "lint", "lint:ci", "lint:all", "lint:check", "check:lint", "biome", "eslint")
        const lintKey = scriptKeys.find((k) =>
          ["lint", "lint:ci", "lint:all", "lint:check", "lint:error", "check:lint", "check"].includes(k.toLowerCase())
        );
        if (lintKey) {
          lintCommands.push(`${pmRun} ${lintKey}`);
        } else if (scripts.biome) {
          lintCommands.push(`${pmRun} biome`);
        }

        // Build command detection
        const buildKey = scriptKeys.find((k) =>
          ["build", "build:all", "build:core"].includes(k.toLowerCase())
        );
        if (buildKey) {
          buildCommands.push(`${pmRun} ${buildKey}`);
        }

        // Typecheck command detection
        const tcKey = scriptKeys.find((k) =>
          ["typecheck", "type-check", "check:types", "check"].includes(k.toLowerCase())
        );
        if (tcKey) {
          typecheckCommands.push(`${pmRun} ${tcKey}`);
        }
      } catch {
        testCommands.push(`${packageManager} test`);
      }
    } else {
      testCommands.push(`${packageManager} test`);
    }

    // Monorepo & Tooling Fallbacks (Turbo, Nx, Biome, Lerna)
    if (lintCommands.length === 0) {
      if (pathsSet.has("turbo.json")) {
        lintCommands.push(packageManager === "npm" ? "npx turbo run lint" : `${packageManager} turbo lint`);
      } else if (pathsSet.has("biome.json") || pathsSet.has("biome.jsonc")) {
        lintCommands.push("npx @biomejs/biome check .");
      } else if (pathsSet.has("lerna.json")) {
        lintCommands.push(packageManager === "npm" ? "npx lerna run lint" : `${packageManager} lerna run lint`);
      }
    }
  }

  // 2. Rust
  const hasCargo = pathsSet.has("cargo.toml") || treePaths.some((p) => p.endsWith("/cargo.toml"));
  if (hasCargo) {
    ecosystem = ecosystem === "Unknown" ? "Rust" : `${ecosystem} + Rust`;
    detectedFiles.push("Cargo.toml");
    testCommands.push("cargo test");
    lintCommands.push("cargo clippy -- -D warnings");
    buildCommands.push("cargo build");
    typecheckCommands.push("cargo check");
  }

  // 3. Go
  const hasGoMod = pathsSet.has("go.mod") || treePaths.some((p) => p.endsWith(".go"));
  if (hasGoMod) {
    ecosystem = ecosystem === "Unknown" ? "Go" : `${ecosystem} + Go`;
    if (pathsSet.has("go.mod")) detectedFiles.push("go.mod");
    testCommands.push("go test ./...");
    lintCommands.push("go vet ./...");
    buildCommands.push("go build ./...");
  }

  // 4. Python
  const hasPy =
    pathsSet.has("pyproject.toml") ||
    pathsSet.has("setup.py") ||
    pathsSet.has("requirements.txt") ||
    pathsSet.has("pipfile") ||
    treePaths.some((p) => p.endsWith(".py"));

  if (hasPy) {
    ecosystem = ecosystem === "Unknown" ? "Python" : `${ecosystem} + Python`;
    if (pathsSet.has("pyproject.toml")) detectedFiles.push("pyproject.toml");
    if (pathsSet.has("setup.py")) detectedFiles.push("setup.py");
    if (pathsSet.has("pytest.ini")) detectedFiles.push("pytest.ini");

    if (pathsSet.has("poetry.lock")) {
      testCommands.push("poetry run pytest");
      lintCommands.push("poetry run ruff check .");
    } else if (pathsSet.has("tox.ini")) {
      testCommands.push("tox");
    } else {
      testCommands.push("pytest");
      lintCommands.push("ruff check . || flake8");
    }
  }

  // 5. Java / Kotlin
  const hasPom = pathsSet.has("pom.xml");
  const hasGradle = pathsSet.has("build.gradle") || pathsSet.has("build.gradle.kts");
  if (hasPom) {
    ecosystem = ecosystem === "Unknown" ? "Java (Maven)" : `${ecosystem} + Java`;
    detectedFiles.push("pom.xml");
    testCommands.push("mvn test");
    buildCommands.push("mvn package -DskipTests");
  } else if (hasGradle) {
    ecosystem = ecosystem === "Unknown" ? "Java / Kotlin (Gradle)" : `${ecosystem} + Gradle`;
    detectedFiles.push(pathsSet.has("build.gradle.kts") ? "build.gradle.kts" : "build.gradle");
    const gradlewCmd = pathsSet.has("gradlew") ? "./gradlew" : "gradle";
    testCommands.push(`${gradlewCmd} test`);
    buildCommands.push(`${gradlewCmd} build`);
  }

  // 6. Ruby
  if (pathsSet.has("gemfile") || pathsSet.has("rakefile")) {
    ecosystem = ecosystem === "Unknown" ? "Ruby" : `${ecosystem} + Ruby`;
    if (pathsSet.has("gemfile")) detectedFiles.push("Gemfile");
    testCommands.push("bundle exec rake test");
    lintCommands.push("bundle exec rubocop");
  }

  // 7. PHP
  if (pathsSet.has("composer.json")) {
    ecosystem = ecosystem === "Unknown" ? "PHP" : `${ecosystem} + PHP`;
    detectedFiles.push("composer.json");
    testCommands.push("composer test || ./vendor/bin/phpunit");
  }

  // 8. C# / .NET
  const hasDotnet = treePaths.some((p) => p.endsWith(".sln") || p.endsWith(".csproj"));
  if (hasDotnet) {
    ecosystem = ecosystem === "Unknown" ? ".NET / C#" : `${ecosystem} + .NET`;
    testCommands.push("dotnet test");
    buildCommands.push("dotnet build");
    lintCommands.push("dotnet format --verify-no-changes");
  }

  // 9. Makefile Inspect
  if (makefileContent && (pathsSet.has("makefile") || pathsSet.has("gnumakefile"))) {
    detectedFiles.push("Makefile");
    if (/\btest\s*:/i.test(makefileContent) && !testCommands.includes("make test")) {
      testCommands.unshift("make test");
    }
    if (/\blint\s*:/i.test(makefileContent) && !lintCommands.includes("make lint")) {
      lintCommands.unshift("make lint");
    }
    if (/\bcheck\s*:/i.test(makefileContent)) {
      typecheckCommands.unshift("make check");
    }
    if (/\bbuild\s*:/i.test(makefileContent) && !buildCommands.includes("make build")) {
      buildCommands.unshift("make build");
    }
  }

  // CI Workflows
  const ciWorkflows = treePaths
    .filter((p) => p.startsWith(".github/workflows/") && (p.endsWith(".yml") || p.endsWith(".yaml")))
    .map((p) => ({
      name: p.replace(".github/workflows/", "").replace(/\.(yml|yaml)$/, ""),
      path: p,
      url: `https://github.com/blob/main/${p}`,
    }));

  return {
    ecosystem: ecosystem === "Unknown" ? "General / Polyglot" : ecosystem,
    packageManager,
    testCommands: testCommands.length > 0 ? Array.from(new Set(testCommands)) : ["Not found in repo"],
    lintCommands: lintCommands.length > 0 ? Array.from(new Set(lintCommands)) : ["Not found in repo"],
    buildCommands: buildCommands.length > 0 ? Array.from(new Set(buildCommands)) : ["Not found in repo"],
    typecheckCommands: typecheckCommands.length > 0 ? Array.from(new Set(typecheckCommands)) : undefined,
    detectedFiles: Array.from(new Set(detectedFiles)),
    ciWorkflows,
  };
}
