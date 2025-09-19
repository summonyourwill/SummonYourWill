import js from "@eslint/js";
import globals from "globals";
import pluginImport from "eslint-plugin-import";

export default [
  {
    files: ["**/*.js", "**/*.cjs"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      ecmaVersion: "latest",
      sourceType: "module",
    },
    plugins: {
      import: pluginImport,
    },
    rules: {
      // Ajusta estas reglas a tu estilo/proyecto:
      "no-unused-vars": "warn",
      "no-undef": "error",
      "no-unreachable": "error",
      "no-redeclare": "error",
      "import/no-duplicates": "error",
    },
  },
  {
    files: ["src/examples/**/*.js"],
    rules: {
      "no-unused-vars": "off",
      "no-undef": "off",
    },
  },
  // Si usas TS, añade un bloque para *.ts con @typescript-eslint
];
