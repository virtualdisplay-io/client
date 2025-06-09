import { tops, topVariants, legs, legVariants, ConfigOption } from './config';

/**
 * Creates a select dropdown with the given options and proper label.
 */
export const createDropdown = (
  id: string,
  labelText: string,
  options: { value: string; label: string }[]
): HTMLDivElement => {
  const container = document.createElement('div');
  container.className = 'form-group';

  const label = document.createElement('label');
  label.htmlFor = id;
  label.textContent = labelText;
  label.className = 'block text-sm font-medium text-gray-700 mb-1';

  const select = document.createElement('select');
  select.id = id;
  select.name = id;
  select.className =
    'w-full rounded border-gray-300 p-2 focus:ring-indigo-500 focus:border-indigo-500';
  select.setAttribute('aria-label', labelText);

  options.forEach(({ value, label }) => {
    const option = document.createElement('option');
    option.value = value;
    option.text = label;
    select.appendChild(option);
  });

  container.appendChild(label);
  container.appendChild(select);
  return container;
};

/**
 * Sets up the form, creates and appends all dropdowns, and returns references.
 */
export const setupConfiguratorForm = (): Record<string, HTMLSelectElement> => {
  const form = document.getElementById('config-form') as HTMLFormElement;
  form.setAttribute('aria-label', 'Product configuration options');

  const dropdowns = {
    top: createDropdown(
      'top-select',
      'Table Top Material',
      tops.map((top: ConfigOption) => ({ value: top.id, label: top.name }))
    ),
    topVariant: createDropdown(
      'top-variant-select',
      'Table Top Color',
      topVariants.map((variant: string) => ({ value: variant, label: variant }))
    ),
    leg: createDropdown(
      'leg-select',
      'Table Leg Style',
      legs.map((leg: ConfigOption) => ({ value: leg.id, label: leg.name }))
    ),
    legVariant: createDropdown(
      'leg-variant-select',
      'Table Leg Color',
      legVariants.map((variant: string) => ({ value: variant, label: variant }))
    ),
  };

  // Append containers to form and extract select elements
  const selects: Record<string, HTMLSelectElement> = {};
  Object.entries(dropdowns).forEach(([key, container]) => {
    form.appendChild(container);
    const select = container.querySelector('select');
    if (select) selects[key] = select;
  });

  return selects;
};
