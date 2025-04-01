import type { UserConfig } from "@commitlint/types";
import { RuleConfigSeverity } from "@commitlint/types";

const Configuration: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  parserPreset: "conventional-changelog-angular",
  formatter: "@commitlint/format",
  rules: {
    "type-enum": [
      RuleConfigSeverity.Error,
      "always",
      [
        "build",
        "chore",
        "ci",
        "docs",
        "feat",
        "fix",
        "perf",
        "refactor",
        "revert",
        "style",
        "test",
      ],
    ],
    "scope-enum": [
      RuleConfigSeverity.Error,
      "always",
      [
        "api",
        "infrastructure",
        "application",
        "domain",
        "interface",
        "main",
        "shared",
        "persistence",
        "config",
        "router",
        "controller",
        "docker",
        "middleware",
        "use_case",
        "util",
        "validator",
        "test",
        "deps",
      ],
    ],
    "scope-case": [
      RuleConfigSeverity.Error,
      "always",
      ["lower-case", "snake-case"],
    ],
    "subject-case": [
      RuleConfigSeverity.Error,
      "always",
      [
        "sentence-case",
        "start-case",
        "pascal-case",
        "upper-case",
        "lower-case",
        "camel-case",
        "kebab-case",
        "snake-case",
      ],
    ],
    "subject-full-stop": [RuleConfigSeverity.Error, "never", "."],
    "header-max-length": [RuleConfigSeverity.Warning, "always", 120],
    "body-max-length": [RuleConfigSeverity.Warning, "always", 100],
    "body-max-line-length": [RuleConfigSeverity.Warning, "always", 100],
    "footer-max-length": [RuleConfigSeverity.Warning, "always", 100],
  },
};

export default Configuration;
