import withNuxt from "./.nuxt/eslint.config.mjs";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

export default withNuxt([
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      "vue/no-v-html": "off",
      "vue/html-self-closing": [
        "warn",
        {
          html: {
            void: "never",
          },
        },
      ],
      // Запрещаем использование any
      "@typescript-eslint/no-explicit-any": "error",
      // Используем настройки из .prettierrc.cjs
      "prettier/prettier": "error",
    },
    files: ["**/*.{js,ts}"],
  },
  {
    files: ["**/*.vue"],
    // Не подключаем prettier плагин для Vue файлов, чтобы избежать конфликтов
    rules: {
      "vue/no-v-html": "off",
      "vue/html-self-closing": [
        "warn",
        {
          html: {
            void: "never",
          },
        },
      ],
      // Порядок атрибутов в Vue компонентах
      "vue/attributes-order": [
        "warn",
        {
          order: [
            "DEFINITION",
            "LIST_RENDERING",
            "CONDITIONALS",
            "RENDER_MODIFIERS",
            "GLOBAL",
            ["UNIQUE", "SLOT"],
            "TWO_WAY_BINDING",
            "OTHER_DIRECTIVES",
            "OTHER_ATTR",
            "EVENTS",
            "CONTENT",
          ],
          alphabetical: false,
        },
      ],
      // Запрещаем использование any
      "@typescript-eslint/no-explicit-any": "error",
      // Разрешаем @ts-nocheck для файлов, где Vue преобразует kebab-case в camelCase
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-nocheck": "allow-with-description",
          "ts-ignore": "allow-with-description",
        },
      ],
    },
  },
  // Отключаем правила ESLint, которые конфликтуют с Prettier
  prettierConfig,
]);
