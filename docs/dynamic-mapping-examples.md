# Dynamic Mapping Examples

Dynamic mapping allows attribute values to change based on other selections, enabling complex product
configurations with dependencies.

**Prerequisites**: This guide builds on the [Static Mapping Examples](./static-mapping-examples.md).
We'll use the same city bicycle but add realistic dependencies between options. If you haven't read
the static mapping guide yet, please start there.

## What makes mapping "dynamic"

In dynamic mapping, any property can be computed at runtime using a function:

```typescript
{
  name: 'Wheel Size',
  // Dynamic values based on frame size
  values: (context) => {
    const frameSize = context.getValue('Frame Size');
    if (frameSize === 'small') {
      return [{ value: '26-inch', nodeIds: ['wheels_26'], isSelected: true }];
    }
    return [{ value: '28-inch', nodeIds: ['wheels_28'], isSelected: true }];
  }
}
```

## City bicycle with dependencies

Let's enhance our city bicycle from the static example. The key insight: frame size affects almost
everything else on the bicycle. This is where dynamic mapping shines - without it, you'd need
separate configurations for each frame size.

### Frame size as the central driver

When you select a frame size, it cascades through the entire configuration:

**Small frame (150-165cm riders)**:

- Uses 26" wheels positioned for smaller geometry
- Components positioned closer together (brakes, gears, lights)
- Basket mounted at lower position
- Limited gear options suitable for smaller frame

**Medium frame (165-180cm riders)**:

- Uses 28" wheels with standard positioning
- Components at standard positions
- Full range of gear and accessory options

**Large frame (180-195cm riders)**:

- Uses 28" wheels with extended positioning
- Components spread wider (matching frame geometry)
- Accessories positioned for larger frame
- May include frame-specific components

**The key insight**: Components don't just change type - they also move to match the frame geometry.
The basket is always "basket" from the user's perspective, but the 3D model shows `basket_small`,
`basket_medium`, or `basket_large` nodes positioned appropriately for each frame.

Without dynamic mapping, you'd need 3 separate product configurations!

### Implementation

```typescript
// Helper functions for business logic
// Tire types - same options but positioned for different wheel sizes
function getTireOptions(frameSize: string) {
  const wheelSize = frameSize === 'small' ? '26' : '28';
  
  const options = [
    { value: 'city', nodeIds: [`tires_${wheelSize}_city`], isSelected: true },
    { value: 'comfort', nodeIds: [`tires_${wheelSize}_comfort`] }
  ];
  
  // Sport tires only available for larger wheels
  if (frameSize !== 'small') {
    options.push({ value: 'sport', nodeIds: [`tires_${wheelSize}_sport`] });
  }
  
  return options;
}

// Brake types - positioned for different wheel sizes
function getBrakeOptions(frameSize: string) {
  const wheelSize = frameSize === 'small' ? '26' : '28';
  const defaultBrake = frameSize === 'small' ? 'rim' : 'disc';
  
  return [
    { 
      value: 'rim', 
      nodeIds: [`brakes_rim_${wheelSize}`], 
      isSelected: defaultBrake === 'rim' 
    },
    { 
      value: 'disc', 
      nodeIds: [`brakes_disc_${wheelSize}`], 
      isSelected: defaultBrake === 'disc' 
    }
  ];
}

function getBasketOptions(frameSize: string) {
  // User always sees same options, but nodeIds change based on frame size
  return [
    { value: 'none', nodeIds: [], isSelected: true },
    { 
      value: 'basket', 
      nodeIds: [`basket_${frameSize}`], // basket_small, basket_medium, basket_large
      isSelected: false 
    }
  ];
}

function getGripOptions(saddleType: string) {
  // Sport saddle requires sport grips
  if (saddleType === 'sport') {
    return [
      {
        value: 'sport-black',
        nodeIds: ['grips_sport_black'],
        isSelected: true,
      },
    ];
  }

  // Comfort saddle allows choice of grips
  return [
    { value: 'brown', nodeIds: ['grips_brown'], isSelected: true },
    { value: 'black', nodeIds: ['grips_black'] },
  ];
}

// The complete dynamic mapping
client.setMapping({
  attributes: [
    {
      // Frame size is our primary driver - it affects almost everything else
      name: 'Frame Size',
      values: [
        { value: 'small', nodeIds: ['frame_small', 'wheels_26'], isSelected: false },
        { value: 'medium', nodeIds: ['frame_medium', 'wheels_28'], isSelected: true },
        { value: 'large', nodeIds: ['frame_large', 'wheels_28'], isSelected: false },
      ],
    },
    {
      name: 'Frame Color',
      // Even colors can depend on frame size!
      values: (context) => {
        const frameSize = context.getValue('Frame Size');
        const colors = [
          { value: 'blue', nodeIds: ['paint_blue'], isSelected: true },
          { value: 'black', nodeIds: ['paint_black'] },
        ];
        
        // Red is a premium color only available on medium/large frames
        if (frameSize !== 'small') {
          colors.push({ value: 'red', nodeIds: ['paint_red'] });
        }
        
        return colors;
      },
    },
    {
      name: 'Tires',
      values: (context) => {
        const frameSize = context.getValue('Frame Size');
        return getTireOptions(frameSize);
      },
    },
    {
      name: 'Brakes',
      values: (context) => {
        const frameSize = context.getValue('Frame Size');
        return getBrakeOptions(frameSize);
      },
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
      values: (context) => {
        const saddleType = context.getValue('Saddle Type');
        return getGripOptions(saddleType);
      },
    },
    {
      name: 'Basket',
      values: (context) => {
        const frameSize = context.getValue('Frame Size');
        return getBasketOptions(frameSize);
      },
    },
    {
      name: 'Gear System',
      values: (context) => {
        const frameSize = context.getValue('Frame Size');
        
        // Small frames get simpler gearing
        if (frameSize === 'small') {
          return [
            { value: '3-speed', nodeIds: ['gears_3speed'], isSelected: true },
            { value: '7-speed', nodeIds: ['gears_7speed'] },
          ];
        }
        
        // Larger frames can handle more complex gearing
        return [
          { value: '7-speed', nodeIds: ['gears_7speed'], isSelected: true },
          { value: '21-speed', nodeIds: ['gears_21speed'] },
        ];
      },
    },
    {
      name: 'Lights',
      values: (context) => {
        const frameSize = context.getValue('Frame Size');
        const wheelSize = frameSize === 'small' ? '26' : '28';
        
        return [
          { value: 'none', nodeIds: [], isSelected: true },
          { 
            value: 'standard', 
            nodeIds: [`lights_front_${frameSize}`, `lights_rear_${frameSize}`],
            isSelected: false 
          },
          {
            value: 'premium',
            nodeIds: [
              `lights_premium_front_${frameSize}`,
              `lights_premium_rear_${frameSize}`,
              `dynamo_${wheelSize}`
            ],
            isSelected: false
          }
        ];
      },
    },
  ],
});
```

### What happens during re-evaluation

Look at the cascade effect when changing frame size:

**User selects "small" frame size**:

1. Frame and wheels change to small geometry: `frame_small`, `wheels_26`
2. Frame Color re-evaluates → red option disappears (not available for small frames)
3. Tires re-evaluates → 26" tire positioning, sport option disappears
4. Brakes re-evaluates → positioned for 26" wheels, rim brakes default
5. Basket re-evaluates → positioned for small frame geometry
6. Gear System re-evaluates → positioned for small frame, 21-speed disappears
7. Lights re-evaluates → positioned for small frame, uses 26" dynamo

**Key insight**: The user still sees the same options ("basket", "disc brakes", "standard lights")
but the 3D model automatically uses the correct nodes for the frame size (`basket_small` vs
`basket_large`, `brakes_disc_26` vs `brakes_disc_28`).

That's 7 attributes affected by one change! With static mapping, you'd need:

- 3 frame sizes × all color options × all tire options × all brake options × all gear options =
  massive configuration complexity

**The exponential advantage**:

- Static mapping: 3 frame sizes × 3 colors × 2 tire types × 2 brake types × 2 gear systems ×
  2 light options = 144 separate configurations to define
- Dynamic mapping: Just define the positioning rules once, system handles all valid combinations
  automatically

## Testing dynamic mappings

Extract the logic functions and test them independently:

```typescript
// bicycle-config-logic.test.ts
import { describe, it, expect } from 'vitest';
import {
  getWheelSize,
  getBasketOptions,
  getGripOptions,
} from './bicycle-config-logic';

describe('Bicycle Configuration Logic', () => {
  describe('Wheel size dependencies', () => {
    it('should assign 26-inch wheels to small frames', () => {
      const wheels = getWheelSize('small');
      expect(wheels).toHaveLength(1);
      expect(wheels[0].value).toBe('26-inch');
    });

    it('should assign 28-inch wheels to medium and large frames', () => {
      expect(getWheelSize('medium')[0].value).toBe('28-inch');
      expect(getWheelSize('large')[0].value).toBe('28-inch');
    });
  });

  describe('Saddle and grip compatibility', () => {
    it('should limit sport saddle to sport grips only', () => {
      const grips = getGripOptions('sport');
      expect(grips).toHaveLength(1);
      expect(grips[0].value).toBe('sport-black');
    });

    it('should allow grip choice with comfort saddle', () => {
      const grips = getGripOptions('comfort');
      expect(grips).toHaveLength(2);
      expect(grips.map((g) => g.value)).toContain('brown');
      expect(grips.map((g) => g.value)).toContain('black');
    });
  });

  describe('Frame-specific accessories', () => {
    it('should offer size-appropriate baskets', () => {
      const smallBasket = getBasketOptions('small');
      const largeBasket = getBasketOptions('large');

      expect(smallBasket.find((b) => b.value === 'basket')?.nodeIds).toContain(
        'basket_small'
      );
      expect(largeBasket.find((b) => b.value === 'basket')?.nodeIds).toContain(
        'basket_large'
      );
    });
  });
});
```

## Re-evaluation behavior

When using dynamic mapping, the entire configuration re-evaluates on each selection change:

1. User selects new value
2. Context updates with new selection
3. All dynamic functions run again
4. Available options may change
5. Invalid selections are handled by the server

**Important**: If a currently selected value disappears (like "brown grips" when switching to sport
saddle), the server will handle the state update appropriately.

## Best practices

1. **Keep functions pure**: Avoid side effects in mapping functions
2. **Handle missing dependencies**: Always provide defaults when context values are undefined
3. **Extract complex logic**: Move business rules to separate, testable functions
4. **Test your logic**: Unit test the extracted functions independently
5. **Document dependencies**: Make it clear which attributes depend on others
6. **Consider user experience**: Ensure logical defaults when options change

## When to use dynamic vs static

Use **static mapping** when:

- All options are always available
- Combinations don't affect each other
- Simple product with few variants

Use **dynamic mapping** when:

- Options depend on other selections
- Not all combinations are valid
- Complex business rules apply
- You need conditional visibility

## Next steps

- Return to [Static Mapping Examples](./static-mapping-examples.md) for simpler cases
- Review [Mapping Concepts](./mapping-concept.md) for the fundamentals
- Check the main [README](../README.md) for API reference
