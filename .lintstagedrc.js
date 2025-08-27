module.exports = {
  "*.{js,ts,vue}": (filenames) => {
    // Получаем только измененные файлы
    const files = filenames.join(" ");

    // Если файлов нет - пропускаем
    if (!files) return [];

    return [
      `eslint --fix --max-warnings=0 ${files}`,
      `prettier --write ${files}`,
    ];
  },
  "*.{css,scss}": (filenames) => {
    const files = filenames.join(" ");
    if (!files) return [];

    return [`prettier --write ${files}`];
  },
};
