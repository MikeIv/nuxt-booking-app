module.exports = {
  // Основные настройки
  printWidth: 120, // Максимальная длина строки
  tabWidth: 2, // Размер отступа (2 пробела)
  useTabs: false, // Использовать пробелы вместо табов

  // Кавычки
  singleQuote: true, // Одинарные кавычки
  quoteProps: "consistent", // Стиль кавычек в объектах

  // Запятые
  trailingComma: "all", // Висячие запятые везде

  // Скобки
  bracketSpacing: true, // Пробелы между скобками { foo: bar }
  bracketSameLine: false, // Тег > переносится на новую строку
  arrowParens: "always", // Скобки вокруг аргументов стрелочных функций

  // Vue-specific
  vueIndentScriptAndStyle: true, // Отступы в <script> и <style>

  // Дополнительно
  semi: false, // Без точек с запятой
  endOfLine: "lf", // Линукс-стиль переноса строк
  htmlWhitespaceSensitivity: "css", // Поведение пробелов в HTML
};
