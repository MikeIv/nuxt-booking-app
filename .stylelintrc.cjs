module.exports = {
  customSyntax: "postcss-html",
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


