# Brief Creation Snippet

JS template for `Figma:use_figma`. Creates a 480px-wide brief frame with 13 fields, placed 540px left of the target node.

**Usage:** Substitute `<TARGET_NODE_ID>` with colon-separated node ID → call `Figma:use_figma` with `fileKey` and `code` → capture `briefId`, `page` from response → build URL: `https://www.figma.com/design/{fileKey}/_?node-id={briefId-with-dashes}`

```javascript
(async () => {
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' });

  const TARGET_ID = '<TARGET_NODE_ID>';
  const targetNode = await figma.getNodeByIdAsync(TARGET_ID);
  if (!targetNode) return { error: 'Target node not found' };

  let pageNode = targetNode;
  while (pageNode && pageNode.type !== 'PAGE') pageNode = pageNode.parent;
  if (!pageNode) return { error: 'Could not resolve page' };
  await figma.setCurrentPageAsync(pageNode);

  const t = await figma.getNodeByIdAsync(TARGET_ID);
  const bbox = t.absoluteBoundingBox || { x: 0, y: 0 };
  const targetX = bbox.x, targetY = bbox.y;

  const dark = { r: 0.1, g: 0.1, b: 0.12 };
  const muted = { r: 0.42, g: 0.42, b: 0.45 };
  const placeholder = { r: 0.62, g: 0.62, b: 0.65 };
  const inputBg = { r: 0.97, g: 0.97, b: 0.975 };
  const stroke = { r: 0.88, g: 0.88, b: 0.9 };

  const mkText = (chars, opts = {}) => {
    const n = figma.createText();
    n.fontName = { family: 'Inter', style: opts.bold ? 'Semi Bold' : 'Regular' };
    n.fontSize = opts.size || 14;
    n.characters = chars;
    n.fills = [{ type: 'SOLID', color: opts.color || dark }];
    n.layoutAlign = 'STRETCH';
    n.textAutoResize = 'HEIGHT';
    if (opts.tracking) n.letterSpacing = { value: opts.tracking, unit: 'PERCENT' };
    if (opts.lineHeight) n.lineHeight = { value: opts.lineHeight, unit: 'PERCENT' };
    return n;
  };

  const brief = figma.createFrame();
  brief.name = 'Handoff Brief';
  brief.resize(480, 100);
  brief.layoutMode = 'VERTICAL';
  brief.primaryAxisSizingMode = 'AUTO';
  brief.counterAxisSizingMode = 'FIXED';
  brief.paddingTop = 36; brief.paddingBottom = 36;
  brief.paddingLeft = 32; brief.paddingRight = 32;
  brief.itemSpacing = 24;
  brief.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  brief.strokes = [{ type: 'SOLID', color: stroke }];
  brief.strokeWeight = 1;
  brief.cornerRadius = 12;
  brief.effects = [{ type: 'DROP_SHADOW', color: { r: 0, g: 0, b: 0, a: 0.06 }, offset: { x: 0, y: 4 }, radius: 16, spread: 0, visible: true, blendMode: 'NORMAL' }];

  const header = figma.createFrame();
  header.layoutMode = 'VERTICAL'; header.primaryAxisSizingMode = 'AUTO';
  header.counterAxisSizingMode = 'FIXED'; header.layoutAlign = 'STRETCH';
  header.itemSpacing = 6; header.fills = [];
  brief.appendChild(header);

  header.appendChild(mkText('FOR DEV HANDOFF', { bold: true, size: 10, color: muted, tracking: 12 }));
  header.appendChild(mkText('Handoff Brief', { bold: true, size: 26, color: dark }));
  header.appendChild(mkText('Fill this in before triggering the handoff skill. The skill reads each field as input. Empty fields are treated as open questions.', { size: 13, color: muted, lineHeight: 145 }));

  const divider = figma.createRectangle();
  divider.resize(416, 1);
  divider.fills = [{ type: 'SOLID', color: stroke }];
  divider.layoutAlign = 'STRETCH';
  brief.appendChild(divider);

  const fields = [
    { label: 'Flow name', helper: 'e.g. "Cancellation flow — refund on non-cancellable bookings"' },
    { label: 'Designer', helper: 'Name + Slack handle' },
    { label: 'Linear ticket', helper: 'Full URL — the skill will pull context from it' },
    { label: 'Goal', helper: 'One sentence: user problem → solution → expected outcome.' },
    { label: 'User trigger', helper: 'What action or context puts the user in this flow?' },
    { label: "Scope — what's new", helper: 'Bullet list of new screens, components, or states.' },
    { label: "Scope — what's changing", helper: 'Bullet list of existing things being modified.' },
    { label: 'Out of scope', helper: 'What this handoff intentionally does not cover.' },
    { label: 'Edge cases to call out', helper: 'Error / empty / loading states, max content, a11y, localization.' },
    { label: 'Custom assets', helper: 'Non-DS icons, illustrations, Lottie / Rive files.' },
    { label: 'Data & implementation context', helper: 'Optional. APIs, perf considerations, analytics.' },
    { label: 'Open questions', helper: 'Undecided items or where engineering input is needed.' },
    { label: 'Related work', helper: 'Granola meeting notes, prior designs, Slack threads.' }
  ];

  for (const f of fields) {
    const wrap = figma.createFrame();
    wrap.layoutMode = 'VERTICAL'; wrap.primaryAxisSizingMode = 'AUTO';
    wrap.counterAxisSizingMode = 'FIXED'; wrap.layoutAlign = 'STRETCH';
    wrap.itemSpacing = 6; wrap.fills = [];
    brief.appendChild(wrap);
    wrap.appendChild(mkText(f.label, { bold: true, size: 13, color: dark }));
    wrap.appendChild(mkText(f.helper, { size: 12, color: muted, lineHeight: 145 }));
    const input = figma.createFrame();
    input.layoutMode = 'VERTICAL'; input.primaryAxisSizingMode = 'AUTO';
    input.counterAxisSizingMode = 'FIXED'; input.layoutAlign = 'STRETCH';
    input.paddingTop = 14; input.paddingBottom = 14;
    input.paddingLeft = 14; input.paddingRight = 14;
    input.fills = [{ type: 'SOLID', color: inputBg }];
    input.cornerRadius = 6;
    wrap.appendChild(input);
    input.appendChild(mkText('— write here —', { size: 13, color: placeholder }));
  }

  brief.appendChild(mkText('When filled, run the handoff skill on your design section. It reads this frame, annotates the design, and generates a PRD.', { size: 11, color: muted, lineHeight: 150 }));

  brief.x = targetX - 540; brief.y = targetY;
  pageNode.appendChild(brief);
  figma.viewport.scrollAndZoomIntoView([brief]);

  return { success: true, briefId: brief.id, page: pageNode.name, targetNodeName: t.name, position: { x: brief.x, y: brief.y }, size: { width: brief.width, height: brief.height } };
})();
```

**Return value:** Keep `briefId` and `page` in conversation memory for reading the brief later via `Figma:get_design_context`.

**Tweaks:** Position → change `targetX - 540`. Width → change `brief.resize(480, 100)` + `divider.resize(416, 1)`. Fields → edit `fields` array.
