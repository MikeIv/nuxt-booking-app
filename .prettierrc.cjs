module.exports = {
  printWidth: 120,
  tabWidth: 2,
  useTabs: false,

  singleQuote: true,
  quoteProps: "consistent",

  trailingComma: "all",

  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: "always",

  semi: false,
  endOfLine: "auto",
  htmlWhitespaceSensitivity: "css",

  singleAttributePerLine: false,

  proseWrap: "preserve",

  // Vue файлы полностью исключены через .prettierignore
  // Vue файлы форматируются только через ESLint и Stylelint
  // Не добавляем overrides для Vue файлов, чтобы избежать конфликтов
};
