import js from "@eslint/js";
import globals from "globals";
import json from "@eslint/json";
import { defineConfig, globalIgnores } from "eslint/config";


export default defineConfig([
  globalIgnores([
    "node_modules/",
    "package-lock.json"
  ]),
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        ...globals.node,    
        ...globals.es2021,   
        data: "readonly", // or "writable" if you modify it
      }
    },
    rules: {
      "no-useless-escape": "off",
    },

  },

  { 
    files: ["**/*.{js,mjs,cjs}"], 
    plugins: { js }, 
    extends: ["js/recommended"] 
  },
  { 
    files: ["**/*.{js,mjs,cjs}"], 
    languageOptions: { globals: globals.browser } 
  },
  { 
    files: ["**/*.json"], 
    plugins: { json }, 
    language: "json/json", 
    extends: ["json/recommended"] 
  },
]);
