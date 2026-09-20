/** AI category → department label shown in the inbox. */
export const DEPARTMENT_OPTIONS = [
  { value: "vehicle_purchase", label: "Vehicle purchase" },
  { value: "vehicle_search", label: "Vehicle search" },
  { value: "test_drive", label: "Test drive" },
  { value: "financing", label: "Financing" },
  { value: "trade_in", label: "Trade-in" },
  { value: "vehicle_sale", label: "Vehicle sale" },
  { value: "general_sales_question", label: "General sales" },
  { value: "spam", label: "Spam / junk" },
] as const;

const LABEL_BY_VALUE = Object.fromEntries(
  DEPARTMENT_OPTIONS.map((d) => [d.value, d.label]),
) as Record<string, string>;

export function departmentLabel(category: string | null | undefined): string {
  if (!category) return "—";
  return LABEL_BY_VALUE[category] ?? category.replace(/_/g, " ");
}
