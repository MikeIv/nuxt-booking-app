module.exports = {
  overrides: [
    {
      files: ["**/*.vue"],
      customSyntax: "postcss-html",
    },
    {
      files: ["**/*.scss"],
      customSyntax: "postcss-scss",
    },
  ],
  extends: [
    "stylelint-config-standard-scss",
    "stylelint-config-recommended-vue",
  ],
  rules: {
    indentation: null,
    "custom-property-pattern": null,
    "rule-empty-line-before": [
      "always",
      {
        except: ["first-nested"],
        ignore: ["after-comment"]
      }
    ],
  }
};


