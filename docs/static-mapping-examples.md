# Static Mapping Examples

Static mapping is the simplest approach for product configurators where all options are predetermined and
independent of each other.

## What makes mapping "static"

In static mapping:

- All attribute values are defined upfront
- Options don't change based on other selections
- Every combination is valid (from the mapping perspective)
- The configuration structure remains constant

## When to use static mapping

Static mapping is ideal for:

- **Simple products**: Limited options without dependencies
- **Color/material variants**: Different finishes of the same product
- **Independent features**: Where options don't affect each other
- **Small product catalogs**: When managing all combinations is feasible

## City bicycle example

Let's configure a city bicycle with simple, independent options. Each option can be selected without affecting the others:

```typescript
client.setMapping({
  attributes: [
    {
      name: 'Frame Color',
      values: [
        { value: 'blue', nodeIds: ['frame_blue'], isSelected: true },
        { value: 'red', nodeIds: ['frame_red'] },
        { value: 'black', nodeIds: ['frame_black'] },
      ],
    },
    {
      name: 'Saddle Type',
      values: [
        {
          value: 'comfort',
          nodeIds: ['saddle_comfort_brown'],
          isSelected: true,
        },
        { value: 'sport', nodeIds: ['saddle_sport_black'] },
      ],
    },
    {
      name: 'Bell',
      values: [
        { value: 'none', nodeIds: [], isSelected: true },
        { value: 'chrome', nodeIds: ['bell_chrome'] },
        { value: 'black', nodeIds: ['bell_black'] },
      ],
    },
  ],
});
```

With this static mapping:

- You can choose any frame color
- You can choose any saddle type
- You can add or remove a bell
- All 3 × 2 × 3 = 18 combinations are valid

## Common patterns

### Single attribute configuration

The most basic pattern - one customizable aspect:

```typescript
client.setMapping({
  attributes: [
    {
      name: 'Frame Color',
      values: [
        { value: 'blue', nodeIds: ['frame_blue'], isSelected: true },
        { value: 'red', nodeIds: ['frame_red'] },
        { value: 'black', nodeIds: ['frame_black'] },
      ],
    },
  ],
});
```

### Multi-part grouping

When one selection controls multiple 3D elements. For our bicycle, selecting a color might change multiple parts:

```typescript
{
  value: 'red',
  nodeIds: [
    'frame_red',        // Main frame
    'fenders_red',      // Matching fenders
    'chain_guard_red',  // Chain guard
    'grips_red'         // Handle grips
  ]
}
```

**Important**: All nodeIds must exist in the 3D model. Adding new elements requires updating the mapping
configuration.

### Optional accessories

For add-ons or optional components like lights or basket:

```typescript
{
  name: 'Accessories',
  values: [
    { value: 'none', nodeIds: [], isSelected: true },
    { value: 'basket', nodeIds: ['basket_front'] },
    { value: 'lights', nodeIds: ['lights_front', 'lights_rear'] },
    { value: 'both', nodeIds: ['basket_front', 'lights_front', 'lights_rear'] }
  ]
}
```

## Creating UI from mapping

A powerful aspect of attribute mapping is that it contains all the information needed to generate a user
interface. The mapping can drive your UI directly:

```typescript
// Get frame color options from the mapping
const colorAttribute = client.getAttribute('Frame Color');
const colors = colorAttribute.getValues();

// Generate color swatches
colors.forEach((colorValue) => {
  const swatch = document.createElement('button');
  swatch.className = 'color-swatch';
  swatch.style.backgroundColor = colorValue.value; // 'blue', 'red', 'black'
  swatch.title = `${colorValue.value} frame`;
  swatch.onclick = () => colorAttribute.select(colorValue.value);

  // Update swatch state when 3D model changes
  colorValue.onChange = () => {
    swatch.classList.toggle('selected', colorValue.isSelected);
  };
});
```

See the [color configurator example](../examples/color-configurator/index.html) for a complete implementation
that generates its entire UI from the mapping configuration.

## Complete bicycle configurator

Here's a full static mapping for our city bicycle with all independent options:

```typescript
client.setMapping({
  attributes: [
    {
      name: 'Frame Color',
      values: [
        { value: 'blue', nodeIds: ['frame_blue'], isSelected: true },
        { value: 'red', nodeIds: ['frame_red'] },
        { value: 'black', nodeIds: ['frame_black'] },
      ],
    },
    {
      name: 'Saddle Type',
      values: [
        {
          value: 'comfort',
          nodeIds: ['saddle_comfort_brown'],
          isSelected: true,
        },
        { value: 'sport', nodeIds: ['saddle_sport_black'] },
      ],
    },
    {
      name: 'Grips',
      values: [
        { value: 'brown', nodeIds: ['grips_brown'], isSelected: true },
        { value: 'black', nodeIds: ['grips_black'] },
      ],
    },
    {
      name: 'Basket',
      values: [
        { value: 'none', nodeIds: [], isSelected: true },
        { value: 'wicker', nodeIds: ['basket_wicker'] },
        { value: 'metal', nodeIds: ['basket_metal'] },
      ],
    },
    {
      name: 'Bell',
      values: [
        { value: 'none', nodeIds: [], isSelected: false },
        { value: 'chrome', nodeIds: ['bell_chrome'], isSelected: true },
      ],
    },
  ],
});
```

## Limitations of static mapping

Static mapping works great for our simple bicycle configurator, but consider dynamic mapping when:

- **Frame size affects wheel size**: Small frame needs 26" wheels, large frame needs 28" wheels
- **Accessories depend on frame type**: Racing saddle only available with sport frame
- **Complex compatibility rules**: Certain colors only available in certain sizes
- **Price calculations**: Different combinations have different pricing logic

## Best practices

### 1. Keep it simple

Static mapping works best for straightforward products:

- Few attributes (1-5)
- Limited values per attribute (2-5)
- No interdependencies

### 2. Match the 3D model structure

Your nodeIds must exactly match what's in the 3D file:

- Coordinate with 3D artists on naming conventions
- Document the expected node structure
- Test all combinations during development

### 3. Use meaningful defaults

Set `isSelected: true` on sensible defaults:

- Most popular color (blue frame)
- Standard configuration (comfort saddle)
- Essential accessories (bell included)

## When to upgrade to dynamic mapping

You've outgrown static mapping when:

- You need conditional logic ("26-inch wheels only available with small frame")
- Options affect available choices ("sport package includes racing saddle")
- You're duplicating similar configurations with small variations
- Business rules become complex to express statically

## Next steps

- See [Dynamic Mapping Examples](./dynamic-mapping-examples.md) for the same bicycle with dependencies
- Return to [Mapping Concepts](./mapping-concept.md) for the overview
- Explore the [color configurator example](../examples/color-configurator/) for a working implementation
