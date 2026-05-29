export interface SelectOption {
  label: string;
  value: string;
}

export const normalizeSelectOptions = (
  options: SelectOption[] | string[],
): SelectOption[] =>
  options.map((option) =>
    typeof option === "string" ? { label: option, value: option } : option,
  );

export const filterSelectOptions = (
  options: SelectOption[],
  query: string,
): SelectOption[] => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return options;

  return options.filter((option) =>
    option.label.toLowerCase().includes(normalizedQuery),
  );
};
