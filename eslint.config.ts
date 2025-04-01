import stylisticTs from "@stylistic/eslint-plugin-ts";
import tsEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettierConfig from "eslint-config-prettier";
import * as importPlugin from "eslint-plugin-import";
import nodeJs from "eslint-plugin-n";
import prettierPlugin from "eslint-plugin-prettier";
import promises from "eslint-plugin-promise";
import sortImports from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";

export default [
  {
    ignores: ["node_modules/**", "dist/**", "eslint.config.mjs"],
  },
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "tsconfig.json",
        tsconfigRootDir: process.cwd(),
        sourceType: "module",
        ecmaVersion: "latest",
      },
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      "@typescript-eslint": tsEslint,
      prettier: prettierPlugin,
      import: importPlugin,
      "@stylistic/ts": stylisticTs,
      n: nodeJs,
      promise: promises,
      "unused-imports": unusedImports,
      "simple-import-sort": sortImports,
    },
    rules: {
      ...tsEslint.configs["recommended"].rules,
      ...prettierConfig.rules,
      "unused-imports/no-unused-imports": [
        "error",
        {
          varsIgnorePattern: "^_",
        },
      ],
      "simple-import-sort/imports": [
        "error",
        { groups: [["^\\u0000", "^node:", "^@?\\w", "^", "^\\."]] },
      ],
      "simple-import-sort/exports": "error",
      "import/no-duplicates": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "import/group-exports": "off",
      "import/no-unresolved": "error",
      "import/no-unused-modules": "error",
      "@typescript-eslint/no-unused-expressions": "warn",
      "@typescript-eslint/switch-exhaustiveness-check": "warn",
      "no-dupe-else-if": "warn",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/adjacent-overload-signatures": "error",
      "@typescript-eslint/no-dupe-class-members": "error",
      "@stylistic/ts/lines-between-class-members": [
        "error",
        {
          enforce: [
            { blankLine: "always", prev: "method", next: "field" },
            { blankLine: "always", prev: "field", next: "method" },
            { blankLine: "always", prev: "method", next: "method" },
          ],
        },
        { exceptAfterOverload: true },
      ],
    },
    settings: {
      "import/resolver": {
        typescript: true,
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
      "import/parsers": {
        "@typescript-eslint/parser": [".ts"],
      },
    },
  },
  {
    files: ["test/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "tsconfig.test.json",
        tsconfigRootDir: process.cwd(),
        sourceType: "module",
        ecmaVersion: "latest",
      },
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: {
      "@typescript-eslint": tsEslint,
      prettier: prettierPlugin,
      import: importPlugin,
      "@stylistic/ts": stylisticTs,
      n: nodeJs,
      promise: promises,
      "unused-imports": unusedImports,
      "simple-import-sort": sortImports,
    },
    rules: {
      ...tsEslint.configs["recommended"].rules,
      ...prettierConfig.rules,
      "unused-imports/no-unused-imports": [
        "error",
        {
          varsIgnorePattern: "^_",
        },
      ],
      "simple-import-sort/imports": [
        "error",
        { groups: [["^\\u0000", "^node:", "^@?\\w", "^", "^\\."]] },
      ],
      "simple-import-sort/exports": "error",
      "import/no-duplicates": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "import/group-exports": "off",
      "import/no-unresolved": "error",
      "import/no-unused-modules": "error",
      "@typescript-eslint/no-unused-expressions": "warn",
      "@typescript-eslint/switch-exhaustiveness-check": "warn",
      "no-dupe-else-if": "warn",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/adjacent-overload-signatures": "error",
      "@typescript-eslint/no-dupe-class-members": "error",
      "@stylistic/ts/lines-between-class-members": [
        "error",
        {
          enforce: [
            { blankLine: "always", prev: "method", next: "field" },
            { blankLine: "always", prev: "field", next: "method" },
            { blankLine: "always", prev: "method", next: "method" },
          ],
        },
        { exceptAfterOverload: true },
      ],
    },
    settings: {
      "import/resolver": {
        typescript: true,
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
      "import/parsers": {
        "@typescript-eslint/parser": [".ts"],
      },
    },
  },
];
