# Animation Extraction Snippet

JS template for `Figma:use_figma` that extracts **every** prototype reaction from a screen frame. This is the only reliable method — `get_design_context` often omits transition details.

**Usage:** Substitute `<SCREEN_NODE_ID>` → call `Figma:use_figma` with `fileKey` and `code`. Returns a complete array of all interactions with full animation specs.

```javascript
(async () => {
  const screenId = '<SCREEN_NODE_ID>';
  const screen = await figma.getNodeByIdAsync(screenId);
  if (!screen) return { error: 'Screen node not found' };

  const results = [];

  const traverse = async (node, path) => {
    const nodePath = path ? `${path} > ${node.name}` : node.name;

    // Check for prototype reactions on this node
    if (node.reactions && node.reactions.length > 0) {
      for (const reaction of node.reactions) {
        const trigger = reaction.trigger;
        const action = reaction.action;
        if (!action) continue;

        const entry = {
          sourceNodeId: node.id,
          sourceNodeName: node.name,
          sourcePath: nodePath,
          sourceY: node.absoluteBoundingBox ? node.absoluteBoundingBox.y : null,
          sourceX: node.absoluteBoundingBox ? node.absoluteBoundingBox.x : null,
          triggerType: trigger ? trigger.type : 'UNKNOWN',
          triggerDelay: trigger && trigger.delay ? trigger.delay : null,
          actionType: action.type,
          destinationId: action.destinationId || null,
          navigation: action.navigation || null,
          overlayRelativePosition: action.overlayRelativePosition || null,
        };

        // Extract transition/animation details
        if (action.transition) {
          const t = action.transition;
          entry.animate = t.type; // SMART_ANIMATE, DISSOLVE, PUSH, SLIDE_IN, etc.
          entry.direction = t.direction || null;
          entry.matchLayers = t.matchLayers || false;

          if (t.easing) {
            entry.easingType = t.easing.type; // EASE_IN, EASE_OUT, EASE_IN_AND_OUT, CUSTOM_CUBIC_BEZIER, etc.
            if (t.easing.type === 'CUSTOM_CUBIC_BEZIER' && t.easing.easingFunctionCubicBezier) {
              const cb = t.easing.easingFunctionCubicBezier;
              entry.easingCurve = `${cb.x1}, ${cb.y1}, ${cb.x2}, ${cb.y2}`;
            } else if (t.easing.type === 'CUSTOM_SPRING' && t.easing.easingFunctionSpring) {
              const sp = t.easing.easingFunctionSpring;
              entry.easingCurve = `spring(mass:${sp.mass}, stiffness:${sp.stiffness}, damping:${sp.damping})`;
            }
          }

          entry.durationMs = t.duration != null ? Math.round(t.duration * 1000) : null;
        }

        // Resolve destination node name
        if (action.destinationId) {
          try {
            const dest = await figma.getNodeByIdAsync(action.destinationId);
            entry.destinationName = dest ? dest.name : null;
          } catch { entry.destinationName = null; }
        }

        results.push(entry);
      }
    }

    // Recurse into children
    if ('children' in node) {
      for (const child of node.children) {
        await traverse(child, nodePath);
      }
    }
  };

  await traverse(screen, '');

  return {
    screenId,
    screenName: screen.name,
    totalInteractions: results.length,
    interactions: results
  };
})();
```

## Return format

Each interaction in the `interactions` array:

| Field | Example | Maps to |
|-------|---------|---------|
| `triggerType` | `ON_CLICK`, `AFTER_TIMEOUT`, `ON_HOVER`, `ON_DRAG` | Trigger label |
| `triggerDelay` | `1.2` (seconds) | "After 1200ms" |
| `actionType` | `NAVIGATE`, `OPEN_OVERLAY`, `CLOSE_OVERLAY`, `BACK` | Action description |
| `animate` | `SMART_ANIMATE`, `DISSOLVE`, `PUSH`, `SLIDE_IN`, `MOVE_IN` | `animate:` spec |
| `easingType` | `EASE_IN_AND_OUT`, `CUSTOM_CUBIC_BEZIER`, `LINEAR` | `animation-curve:` spec |
| `easingCurve` | `0.7, 0, 0.3, 1` | Custom bezier values |
| `durationMs` | `300` | `animation-duration:` spec |
| `destinationName` | `"Refund details"` | Flow connector label |

## Mapping to annotation spec block

```
animate: {animate → friendly name};
animation-curve: {easingType or easingCurve};
animation-duration: {durationMs}ms;
```

Type mapping:
- `SMART_ANIMATE` → `Smart animate`
- `DISSOLVE` → `Cross-fade`
- `PUSH` → `Push {direction}`
- `SLIDE_IN` → `Slide in {direction}`
- `MOVE_IN` → `Move in {direction}`
- `INSTANT` → `Instant (no animation)`

Easing mapping:
- `EASE_IN` → `ease-in`
- `EASE_OUT` → `ease-out`
- `EASE_IN_AND_OUT` → `ease-in-out`
- `LINEAR` → `linear`
- `CUSTOM_CUBIC_BEZIER` → use `easingCurve` value directly
- `CUSTOM_SPRING` → use `easingCurve` value directly

## When a reaction truly has no animation

If `action.transition` is null or `animate` is `INSTANT`, that's a real "no animation" — write `animate: Instant (no transition);` in the spec card. This is different from missing data.

Only if the Plugin API call itself fails or returns an error should you fall back to asking the user. Never write TBD when the data is available via Plugin API.
