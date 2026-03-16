import json
from typing import Dict, List, Optional

from worker.ai.utils import sanitize_component_name



def extract_gradient_details(fill: Dict) -> Optional[str]:
    """Extracting detailed gradient information from Figma fill."""
    try:
        gradient_type = fill.get("type", "")
        gradient_stops = fill.get("gradientStops", [])

        if not gradient_stops:
            return None

        # Extracting color stops
        stops = []
        for stop in gradient_stops:
            color = stop.get("color", {})
            position = stop.get("position", 0) * 100
            r, g, b = (
                int(color.get("r", 0) * 255),
                int(color.get("g", 0) * 255),
                int(color.get("b", 0) * 255),
            )
            alpha = color.get("a", 1)
            hex_color = f"#{r:02x}{g:02x}{b:02x}"

            if alpha < 1:
                stops.append(f"rgba({r},{g},{b},{alpha:.2f}) {position:.0f}%")
            else:
                stops.append(f"{hex_color} {position:.0f}%")

        gradient_handles = fill.get("gradientHandlePositions", [])
        direction = "to right"  # default

        if len(gradient_handles) >= 2:
            start = gradient_handles[0]
            end = gradient_handles[1]
            dx = end.get("x", 1) - start.get("x", 0)
            dy = end.get("y", 1) - start.get("y", 0)

            # Determining direction
            if abs(dx) > abs(dy):
                direction = "to right" if dx > 0 else "to left"
            else:
                direction = "to bottom" if dy > 0 else "to top"

        gradient_css = f"linear-gradient({direction}, {', '.join(stops)})"

        return f"{gradient_type}: {gradient_css}"

    except Exception as e:
        return None


def extract_design_tokens(section_data: Dict) -> Dict:
    """Extracting design tokens from Figma JSON for prompt context"""
    tokens = {"colors": set(), "gradients": [], "fonts": set(), "effects": []}

    def traverse(node):
        if isinstance(node, dict):
            # Extracting fills (colors/gradients)
            if "fills" in node:
                for fill in node.get("fills", []):
                    if fill.get("type") == "SOLID" and "color" in fill:
                        color = fill["color"]
                        rgb = f"rgb({int(color['r']*255)}, {int(color['g']*255)}, {int(color['b']*255)})"
                        hex_color = f"#{int(color['r']*255):02x}{int(color['g']*255):02x}{int(color['b']*255):02x}"
                        tokens["colors"].add(f"{rgb} / {hex_color}")
                    elif fill.get("type") in ["GRADIENT_LINEAR", "GRADIENT_RADIAL"]:
                        gradient_info = extract_gradient_details(fill)
                        if gradient_info:
                            tokens["gradients"].append(gradient_info)

            # Extracting text styles
            if "style" in node and "fontFamily" in node.get("style", {}):
                style = node["style"]
                tokens["fonts"].add(style.get("fontFamily", ""))

            # Extracting effects (shadows, blurs)
            if "effects" in node:
                for effect in node.get("effects", []):
                    if effect.get("type") in ["DROP_SHADOW", "INNER_SHADOW"]:
                        tokens["effects"].append(effect.get("type"))

            # Traverse children
            for value in node.values():
                if isinstance(value, (dict, list)):
                    traverse(value)
        elif isinstance(node, list):
            for item in node:
                traverse(item)

    traverse(section_data)

    return {
        "colors": list(tokens["colors"]),
        "gradients": list(set(tokens["gradients"])),
        "fonts": list(tokens["fonts"]),
        "effects": list(set(tokens["effects"])),
    }


def format_image_mapping(image_data: Optional[Dict]) -> str:
    """Formating image data for prompt"""
    if not image_data:
        return "No images in this section."

    mapping = []
    for ref, data in image_data.items():
        mapping.append(f"  - imageRef: {ref} → {data['cloudUrl']}")

    return "\n".join(mapping)


def get_component_generation_prompt(
    section_name: str,
    section_data: Dict,
    # section_toon: str,
    image_data: Optional[Dict] = None,
    full_design_screenshot_url: Optional[str] = None,
) -> str:

    design_tokens = extract_design_tokens(section_data)
    image_mapping = format_image_mapping(image_data)
    component_name = sanitize_component_name(section_name)

    visual_reference_section = """### Visual Reference
**Section Screenshot**: This shows your specific section to implement. Use this as the PRIMARY reference for layout, spacing, and visual hierarchy. Extract all colors, spacing, and typography values from the Figma JSON data below."""

    prompt = f"""# ROLE
You are an expert Frontend Developer specializing in converting Figma designs to production-ready React TypeScript code.

# TASK
Convert the provided Figma design into a high-quality React component following modern best practices.

# PRIORITY #1: CODE CORRECTNESS
BEFORE anything else, your code MUST:
- Be syntactically valid TypeScript/TSX with zero syntax errors
- Compile without errors in Next.js 13+
- Have properly balanced braces, parentheses, and JSX tags
- Use correct prop syntax and attribute values
- Import all required dependencies

A syntactically correct component with minor visual differences is INFINITELY better than a broken component with perfect styling.

---

## INPUT DATA

### Section Information
- **Component Name**: {component_name}
- **Section Type**: {section_name}

{visual_reference_section}

**IMPORTANT - COLOR ACCURACY**:
1. The screenshot may show inaccurate colors due to compression. ALWAYS use colors from Figma JSON, NOT from screenshot.
2. **ALWAYS add explicit background colors to ALL top-level sections/containers**. NEVER omit background classes.
3. If `fills` array is EMPTY (`[]`) or has no background → MUST use explicit `bg-white` class (do NOT rely on parent/body defaults).
4. If `fills` has ONE solid color → extract exact RGB values and convert to hex (e.g., r:0.149, g:0.196, b:0.220 → #263238), use `bg-[#263238]`.
5. If `fills` has GRADIENT → use Tailwind gradient classes: `bg-gradient-to-r from-[#...] via-[#...] to-[#...]` with exact hex colors from JSON.
6. For dark/black backgrounds: If JSON explicitly has dark colors (r<0.1, g<0.1, b<0.1), use them as specified. Dark backgrounds are valid.
7. Every `<section>` tag MUST have a background class (bg-white, bg-[#...], bg-gradient-to-r, etc.).
8. For transparency/opacity: Use rgba in arbitrary values like `bg-[rgba(255,255,255,0.1)]` or opacity classes like `bg-white/10`.

### Figma Design Data (JSON)
The complete Figma design tree with detailed styling information:
```json
{json.dumps(section_data)}
```

### Design Tokens Extracted
- **Colors**: {', '.join(design_tokens['colors']) if design_tokens['colors'] else 'None detected'}
- **Gradients**: {', '.join(design_tokens['gradients']) if design_tokens['gradients'] else 'None'}
- **Fonts**: {', '.join(design_tokens['fonts']) if design_tokens['fonts'] else 'Default'}
- **Effects**: {', '.join(design_tokens['effects']) if design_tokens['effects'] else 'None'}

### Image Assets
{image_mapping}

**IMPORTANT**: If images are present, use the `cloudUrl` values as `src` attributes. Do NOT use placeholder URLs.

### Data Extraction Guide
Extract EXACT values from Figma JSON - do NOT estimate or approximate:

**1. Dimensions & Sizing:**
- Container: Extract `absoluteBoundingBox.width` and `.height` (e.g., 1200×600 → `max-w-[1200px]`)
- Images: Extract from `absoluteBoundingBox` (e.g., 280×192 → `width={{280}} height={{192}}`)
- Grid detection: Count children X positions to determine columns (2 unique X = 2 columns = `grid-cols-2`)

**2. Spacing:**
- Padding: `paddingLeft/Top/Right/Bottom` → `pt-[24px] pr-[16px]` etc.
- Gap: `itemSpacing` → `gap-[32px]`
- Round decimals to nearest integer

**3. Typography:**
- `style.fontSize` → `text-[42px]`
- `style.fontWeight` → `font-[400]` or `font-normal/medium/semibold/bold`
- `style.lineHeightPx` → `leading-[51.2px]`
- `style.fontFamily` → `font-['Montserrat']`

**4. Layout:**
- `layoutMode: "HORIZONTAL"` → `flex flex-row`
- `layoutMode: "VERTICAL"` → `flex flex-col`
- `primaryAxisAlignItems: CENTER` → `justify-center`
- `counterAxisAlignItems: CENTER` → `items-center`

**5. Styling:**
- `cornerRadius` → `rounded-[30px]`
- Gradient fills WITHOUT imageRef → CSS: `bg-gradient-to-r from-[#xxx] to-[#xxx]`
- Fills WITH imageRef → `<Image src={{cloudUrl}} />`
- Shadow/blur effects → `shadow-lg`, `shadow-xl`, or `shadow-[custom]` + `backdrop-blur-sm` for glass effects

**6. Positioning & Overlapping Elements:**
- Check `absoluteBoundingBox` coordinates to detect overlapping elements
- If elements overlap (child Y is negative relative to parent) → use `relative` on parent + `absolute` on child
- Use `z-index` classes: `z-0`, `z-10`, `z-20`, `z-30`, `z-40`, `z-50`
- Floating cards over hero sections: parent `relative`, card `absolute top-[X] right-[Y]` with higher z-index
- For layered effects: bottom layer `z-0`, middle `z-10`, top `z-20`

### Layout Pattern Recognition
Analyze the Figma JSON structure to determine layout type:

**Detect Grid vs Flex:**
- Grid indicators: Equal-width children arranged in rows and columns
- Flex indicators: Variable-width children or single-row/column layout
- Bento grid: Mix of different-sized children (use grid with col-span/row-span)

**Grid Column Detection:**
- Count unique X positions of children → number of columns
- Example: 4 cards with 2 unique X positions → 2 columns → `grid-cols-2`
- Example: 4 cards with 1 tall card on left + 2x2 on right → custom grid template

**Bento Layout Detection:**
- If child heights vary significantly → bento layout
- Map children to grid positions
- Example: Card 1 spans row 1-3, col 1; Cards 2-4 in 2x2 on right
- Use: `grid-cols-3 grid-rows-2` with `row-span-2`, `col-span-2` on specific items

**Center vs Full-Width:**
- If design shows content centered with margins → use `max-w-[Xpx] mx-auto`
- If design shows full-width → use `w-full`
- For full-width sections with centered content → outer container `w-full`, inner container `max-w-[Xpx] mx-auto`

### Centering Techniques
Apply correct centering method based on context:

**Horizontal Centering:**
- Block-level element (div, section): `mx-auto` with explicit `max-w-[Xpx]`
- Flex container children: `justify-center` on parent
- Grid items: `justify-items-center` on parent
- Text: `text-center`

**Vertical Centering:**
- Flex container: `items-center` on parent
- Grid container: `items-center` on parent
- Absolute positioning: `top-1/2 -translate-y-1/2`

**Common Patterns:**
- Centered section: `w-full` → `max-w-[1200px] mx-auto px-[24px]`
- Centered flex items: `flex justify-center items-center`
- Centered grid items: `grid place-items-center`
- Full-width background with centered content:
  ```tsx
  <section className="w-full bg-black">
    <div className="max-w-[1200px] mx-auto px-[24px]">
      Content here
    </div>
  </section>
  ```

---

## REQUIREMENTS

### 1. Next.js App Router Compatibility
- This component will be used in Next.js 13+ App Router
- Components are server components by default
- ⚠️ **CRITICAL**: If component uses ANY of these, add "use client" as FIRST line:
  - React hooks: useState, useRef, useEffect, useCallback, useMemo
  - Event handlers: onClick, onChange, onSubmit, onFocus, onBlur, onKeyDown, onMouseEnter, etc.
  - Browser APIs: window, document, localStorage, sessionStorage
  - Forms with user input (forms almost always need "use client")
  - Interactive elements (buttons with onClick, inputs, links with handlers)

**DEFAULT TO "use client" FOR MOST DESIGNS** - Modern web designs are usually interactive.

Example with client features:
"use client";

import React, {{ useState }} from 'react';

export default function MyComponent() {{
  const [open, setOpen] = useState(false);
  return <button onClick={{() => setOpen(!open)}}>Toggle</button>;
}}

### 2. Code Quality
- Use React 18+ functional components with TypeScript
- Use proper TypeScript interfaces for all props
- Follow React best practices (hooks, composition, semantic HTML)
- Add meaningful prop types and defaults where appropriate

### 3. VISUAL ACCURACY (CRITICAL)
⚠️ **Your code MUST match the screenshot EXACTLY**

- **Compare your mental output with the screenshot** - layout, spacing, colors must be pixel-perfect
- **Text gradients**: If text has gradients in the screenshot, use `bg-gradient-to-*`, `bg-clip-text`, `text-transparent`
- **Gradient colors**: Use the EXACT gradient CSS provided in "Design Tokens Extracted" section
- **Spacing**: Match the exact padding/margins visible in the screenshot
- **Typography**: Match font sizes, weights, and line heights from Figma JSON

### 4. Styling Approach
- Use **Tailwind CSS** exclusively for styling
- **For gradients**: Use the EXACT gradient CSS from "Design Tokens" - convert to Tailwind or use arbitrary values
  - Example: `bg-gradient-to-r from-[#ffffff] to-[#808080]`
  - For text gradients: `bg-gradient-to-r from-[#004332] to-[#04b6bf] bg-clip-text text-transparent`
- Extract colors from Figma JSON and use arbitrary values for exact matches: `text-[#1a1a1a]`
- For shadows: Use Tailwind shadow utilities or arbitrary values
- Respect exact spacing from Figma dimensions (convert px to rem if needed)

### 5. Responsiveness
- Make component fully responsive: mobile-first approach
- Use Tailwind breakpoints: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- Test breakpoints: Mobile (320px), Tablet (768px), Desktop (1024px+)
- Ensure text is readable and images scale properly

### 6. Visual Elements Handling (CRITICAL)
⚠️ **There are THREE types of visual elements in the Figma JSON**

**Type 1: EMBEDDED_SVG nodes (inline SVG code)**
- These have `"type": "EMBEDDED_SVG"`
- Contains `svgContent` field with complete SVG markup
- **Convert SVG attributes to JSX format**:
  - `stroke-width` → `strokeWidth`
  - `fill-opacity` → `fillOpacity`
  - `xmlns` → remove (React doesn't need it)
- Embed the SVG directly in your JSX
- Example:
  ```tsx
  {{/* Embedded SVG for icon */}}
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path d="M12 2L2 7..." fill="#00ffff" strokeWidth={{2}} />
  </svg>
  ```

**Type 2: EXPORTED_IMAGE nodes (PNG images from R2)**
- These have `"type": "EXPORTED_IMAGE"`
- Contains `cloudUrl` field with R2 image URL
- Use Next.js `<Image />` component
- Extract dimensions from `absoluteBoundingBox`
- Example:
  ```tsx
  <Image
    src={{node.cloudUrl}}
    width={{280}}
    height={{192}}
    alt="Complex graphic"
    loading="lazy"
  />
  ```

**Type 3: Regular imageRef nodes (photos/images)**
- Regular nodes with `imageRef` in `fills`
- Map `imageRef` to `cloudUrl` from Image Assets section
- Use Next.js `<Image />` component
- Example:
  ```tsx
  <Image
    src="https://r2.../image.png"
    width={{400}}
    height={{300}}
    alt="Photo"
    loading="lazy"
  />
  ```

**IMPORTANT Rules:**
- Use ALL visual elements provided - don't skip any
- EMBEDDED_SVG = inline SVG code (user can edit colors/paths)
- EXPORTED_IMAGE = `<Image>` with cloudUrl (complex graphics)
- imageRef = `<Image>` with cloudUrl from Image Assets (photos)

### 7. Accessibility
- Use semantic HTML5 tags (`<nav>`, `<header>`, `<section>`, `<footer>`, etc.)
- Add proper ARIA labels where needed
- Ensure sufficient color contrast (WCAG AA minimum)
- Add alt text for all images

### 8. Code Structure
```tsx
// 1. Imports (React, Next.js Image if needed)
// 2. TypeScript interface for props (if needed)
// 3. Component definition
// 4. Return statement with (.tsx)
// 5. Export default
```

---

## OUTPUT FORMAT

**CRITICAL INSTRUCTION - READ CAREFULLY**

Your response MUST be ONLY valid TypeScript code that can be directly saved to a .tsx file.

**FORBIDDEN - DO NOT INCLUDE:**
- Markdown code fences (```tsx or ``` or ```typescript)
- Any text before the first import statement
- Any text after the closing brace
- Explanatory comments outside the code
- Multiple code blocks

**REQUIRED - YOUR OUTPUT MUST:**
- Start immediately with: import React from 'react';
- End with: export default function...
- Be valid TypeScript that compiles without modification
- Include all necessary imports, types, and implementation

**Example of CORRECT format (your response should look exactly like this, starting with import):**

import React from 'react';
import Image from 'next/image';

interface {component_name}Props {{}}

export default function {component_name}(props: {component_name}Props) {{
  return <section>...</section>;
}}

---

## EXAMPLE OUTPUT STRUCTURE

import React from 'react';
import Image from 'next/image';

interface {{component_name}}Props {{
  // Add props if component needs configuration
}}

export default function {{component_name}}(props: {{component_name}}Props) {{
  return (
    <section className="...">
      {{/* Component (.tsx) */}}
    </section>
  );
}}

---

## GENERATION STRATEGY

Follow this workflow:

1. **Visual Analysis**: Count items, detect grid pattern (1 tall + 2×2, or 2 columns), identify centering, note gradient text vs solid

2. **Extract Data**: Use the "Data Extraction Guide" above to extract exact dimensions, spacing, typography, layout, and styling values from JSON

3. **Distinguish Content**: Real images (has imageRef) vs decorative gradients (CSS only)

4. **Build Layout**: Apply grid/flex with exact columns, set container width, apply centering, use semantic HTML

5. **Apply Styles**: Use extracted values for typography, colors, gradients, spacing, border radius

6. **Add Images**: Use ALL images from Image Assets with proper Next.js Image component

7. **Responsiveness & Accessibility**: Add breakpoints (md:, lg:), semantic tags, ARIA labels, alt text

8. **Code Review** (MANDATORY - Review your code mentally before outputting):
   - Read through your code line by line for syntax errors
   - Verify all braces {{}} and parentheses () are balanced
   - Ensure all JSX tags are properly closed
   - Check className attributes contain valid string values only
   - Confirm all imports (React, Image) are included
   - If you find errors, fix them before proceeding

9. **Visual Validation**: Verify layout matches screenshot (grid columns, centering, spacing, image sizes)

---

## EXAMPLES OF CORRECT vs INCORRECT IMPLEMENTATION

**CORRECT - Exact values from JSON:**
```tsx
<section className="pt-[64px] pb-[48px] px-[24px] gap-[32px]">
  <h1 className="text-[72px] font-[400] leading-[87.77px] font-['Montserrat']">
    <span className="bg-gradient-to-r from-[#ffffff] via-[#cccccc] to-[#999999] bg-clip-text text-transparent">
```

**INCORRECT - Approximated with Tailwind defaults:**
```tsx
<section className="py-16 px-6 gap-8">
  <h1 className="text-7xl font-normal">
    <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
```

**CORRECT - CSS for decorative gradients:**
```tsx
<div className="w-full h-40 rounded-[30px] bg-gradient-to-b from-[#068e8e] to-[rgba(8,52,64,0.25)]" />
```

**INCORRECT - Using Image for decorative gradient:**
```tsx
<Image src="/gradient-bg.png" width={{400}} height={{160}} />
```

**CORRECT - Actual image from Image Assets:**
```tsx
<Image
  src="https://pub-c80d1e333d3f4fb9b278062947b49bb4.r2.dev/RPrT21DMtANvlRchlFWAsp/images/abc123.png"
  width={{280}}
  height={{192}}
  alt="Feature illustration"
  loading="lazy"
/>
```

**CORRECT - Layout from JSON layoutMode:**
```tsx
<div className="flex flex-row gap-[24px] justify-center items-start">
```

**INCORRECT - Guessed layout:**
```tsx
<div className="flex gap-6 items-center">
```

**CORRECT - Grid layout detected from 2 columns:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
  <article>Card 1</article>
  <article>Card 2</article>
  <article>Card 3</article>
  <article>Card 4</article>
</div>
```

**INCORRECT - Using flex for grid layout:**
```tsx
<div className="flex flex-wrap gap-6">
  <div className="w-1/2">Card 1</div>
  <div className="w-1/2">Card 2</div>
</div>
```

**CORRECT - Bento grid (1 tall left, 2x2 right):**
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
  <article className="md:row-span-2">Tall Card</article>
  <article>Card 2</article>
  <article>Card 3</article>
  <article className="md:col-span-2">Wide Card</article>
</div>
```

**INCORRECT - Bento with hardcoded heights:**
```tsx
<div className="flex gap-6">
  <div className="h-[600px]">Tall Card</div>
  <div className="grid grid-cols-2">...</div>
</div>
```

**CORRECT - Centered content in full-width section:**
```tsx
<section className="w-full bg-black px-[24px] py-[48px]">
  <div className="max-w-[1200px] mx-auto">
    Content centered with margins
  </div>
</section>
```

**INCORRECT - Centered without max-width:**
```tsx
<section className="flex justify-center bg-black p-12">
  <div className="w-full">Content</div>
</section>
```

**CORRECT - Image sizing from JSON (280x192):**
```tsx
<Image
  src="https://..."
  width={{280}}
  height={{192}}
  className="w-[280px] h-auto object-contain"
  alt="Feature"
/>
```

**INCORRECT - Guessed image size:**
```tsx
<Image
  src="https://..."
  width={{200}}
  height={{150}}
  className="w-full h-auto"
  alt="Feature"
/>
```

**CORRECT - Container dimensions from JSON (1200px):**
```tsx
<div className="max-w-[1200px] mx-auto px-[24px]">
```

**INCORRECT - Guessed max-width:**
```tsx
<div className="max-w-6xl mx-auto px-6">
```

---

**Generate the {{component_name}} component now:**
"""
    return prompt


# def get_retry_prompt(code: str, error_message: str, component_name: str) -> str:
#     """
#     Generating a prompt for fixing TSX syntax/type errors.
#     """
#     prompt = f"""# TASK
# Fix the TypeScript/TSX syntax and type errors in the following React component.
#
# ## Component Name
# {component_name}
#
# ## Current Code
# ```tsx
# {code}
# ```
#
# ## Validation Errors
# ```
# {error_message}
# ```
#
# ## Instructions
# 1. Analyze the validation errors carefully
# 2. Fix ONLY the syntax/type errors - do NOT change the component logic or styling
# 3. Common fixes needed:
#    - Add missing imports (React, Image, etc.)
#    - Fix TypeScript type errors
#    - Fix JSX syntax issues
#    - Balance braces/parentheses
#    - Fix prop types
#
# ## Output Format
#
# ⚠️ CRITICAL: Return ONLY the fixed TypeScript code. NO markdown, NO explanations.
#
# DO NOT include: ```tsx, ```, explanatory text
# Start with: import React...
# End with: export default function...
# """
#     return prompt
#


def get_aggregator_prompt(
    component_outputs: List[Dict],
    file_key: str,
    full_design_screenshot_url: Optional[str] = None,
) -> str:
    """
    Generating prompt for combining section components into main file.
    """
    sections_summary = "\n".join(
        [f"  {i+1}. {comp['section_name']}" for i, comp in enumerate(component_outputs)]
    )

    components_code = "\n\n---\n\n".join(
        [
            f"## {comp['section_name']}\n```tsx\n{comp['code']}\n```"
            for comp in component_outputs
        ]
    )

    # Full design context for aggregator
    full_design_context = ""
    if full_design_screenshot_url:
        full_design_context = """
## FULL DESIGN REFERENCE (Image Provided)

A screenshot of the complete design is provided as visual reference. Use this to:

1. **Verify Component Order**: Arrange sections to match the top-to-bottom flow shown in the design
2. **Match Inter-Section Spacing**: Apply appropriate gaps between sections as shown
3. **Understand Layout Structure**: Observe if sections are:
   - Full-width or constrained to max-width containers
   - Have background colors that span full viewport width
   - Use consistent padding/margins
4. **Maintain Visual Rhythm**: Ensure the spacing creates the same visual flow as the design
5. **Apply Global Styles**: Add any page-level background colors or container constraints

**IMPORTANT**: The section order in the component list matches the visual order in the design. Maintain this order in your layout.

---
"""

    prompt = f"""# ROLE
You are an expert React developer creating a main layout component.

# TASK
Combine {len(component_outputs)} section components into a single cohesive page layout.

---

{full_design_context}

## SECTIONS TO COMBINE

{sections_summary}

---

## COMPONENT CODE

**IMPORTANT**: Each component below is labeled with its exact name (## ComponentName). When importing, use these EXACT names - do NOT extract names from inside the code, do NOT modify or infer different names.

{components_code}

---

## REQUIREMENTS

### 1. Next.js App Router Structure
- This is a Next.js 13+ App Router page component
- File will be placed at: app/page.tsx
- Section components are in: components/ (at root level)
- **CRITICAL**: Use the EXACT component names shown in the section headers below (## ComponentName)
- Import format: import ComponentName from '../components/ComponentName'
- **DO NOT modify or infer component names** - use them exactly as provided
- Example:
  import NavGradient from '../components/NavGradient';
  import Features from '../components/Features';

### 2. Client Component Detection (CRITICAL)

⚠️ **DEFAULT TO "use client"** - Most modern designs have interactivity.

ALWAYS add "use client" as FIRST line if:
- Any imported component might have event handlers
- The page contains forms, buttons, or interactive elements
- You see ANY of these in child components:
  - React hooks: useState, useRef, useEffect, useCallback, useMemo
  - Event handlers: onClick, onChange, onSubmit, onFocus, onBlur, etc.
  - Browser APIs: window, document, localStorage, sessionStorage
  - Forms with inputs (forms ALWAYS need "use client")

**WHEN IN DOUBT, ADD "use client"** - It's safer to be client-side than to break with server component errors.

Format when client component is needed (MOST CASES):
"use client";

import React from 'react';
import NavGradient from '../components/NavGradient';
import ContactForm from '../components/ContactForm';

export default function App() {{
  return <main>...</main>;
}}

### 3. Component Assembly
- Import all section components using correct paths
- Arrange sections in the order provided
- Export the main component as default

### 4. Layout Considerations
- Use semantic `<main>` tag as container WITHOUT background color (let sections define their own backgrounds)
- Ensure proper stacking (vertical layout by default)
- Maintain consistent spacing between sections
- Add container/wrapper if needed for width constraints
- **DO NOT add any background color to <main> tag** - each section manages its own background

### 5. Code Quality
- Clean imports (group by type: React, Next.js, components)
- Proper TypeScript typing
- Follow React best practices
- Add minimal comments for clarity

### 6. Styling
- Use Tailwind for any layout styling
- Ensure sections flow naturally
- Consider max-width containers for readability
- Maintain responsive design

---

## OUTPUT FORMAT

⚠️ **CRITICAL INSTRUCTION**

Your response MUST be ONLY valid TypeScript code. Do NOT wrap it in markdown.

FORBIDDEN: ```tsx, ```, any markdown, any explanations
REQUIRED: Start with import, end with export default

**Your response should look like this:**

import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';

export default function App() {{
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
    </main>
  );
}}

---

**Generate the main layout file now:**
"""

    return prompt
