import withNuxt from "./.nuxt/eslint.config.mjs";
import prettierPlugin from "eslint-plugin-prettier";

export default withNuxt([
  {
    plugins: {
      prettier: prettierPlugin
    },
    rules: {
      "vue/no-v-html": "off",
      "vue/html-self-closing": [
        "warn",
        {
          html: {
            void: "never"
          }
        }
      ],
      "prettier/prettier": [
        "error",
        {
          vueIndentScriptAndStyle: true,
          tabWidth: 2
        }
      ]
    },
    files: ["**/*.{js,ts}"]
  },
  {
    files: ["**/*.vue"],
    plugins: {
      prettier: prettierPlugin
    },
    rules: {
      "vue/no-v-html": "off",
      "vue/html-self-closing": [
        "warn",
        {
          html: {
            void: "never"
          }
        }
      ],
      "prettier/prettier": "off"
    }
  }
]);
