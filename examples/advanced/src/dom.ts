import { tops, topVariants, legs, legVariants, ConfigOption } from './config';

/**
 * Creates a select dropdown with the given options.
 */
export const createDropdown = (
  id: string,
  options: { value: string; label: string }[]
): HTMLSelectElement => {
  const select = document.createElement('select');
  select.id = id;
  select.className =
    'w-full rounded border-gray-300 p-2 focus:ring-indigo-500 focus:border-indigo-500';
  options.forEach(({ value, label }) => {
    const option = document.createElement('option');
    option.value = value;
    option.text = label;
    select.appendChild(option);
  });
  return select;
};

/**
 * Sets up the form, creates and appends all dropdowns, and returns references.
 */
export const setupConfiguratorForm = (): Record<string, HTMLSelectElement> => {
  const form = document.getElementById('config-form') as HTMLFormElement;

  const selects = {
    top: createDropdown(
      'top-select',
      tops.map((top: ConfigOption) => ({ value: top.id, label: top.name }))
    ),
    topVariant: createDropdown(
      'top-variant-select',
      topVariants.map((variant: string) => ({ value: variant, label: variant }))
    ),
    leg: createDropdown(
      'leg-select',
      legs.map((leg: ConfigOption) => ({ value: leg.id, label: leg.name }))
    ),
    legVariant: createDropdown(
      'leg-variant-select',
      legVariants.map((variant: string) => ({ value: variant, label: variant }))
    ),
  };

  Object.values(selects).forEach((sel: HTMLSelectElement) =>
    form.appendChild(sel)
  );
  return selects;
};
