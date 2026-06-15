# Brand Identity & UI Design System Guidelines

**Project:** Band of Agents Web Application
**Version:** 1.0.0
**Date:** June 2026

---

## 1. Executive Summary & Brand Essence

The **Band of Agents** web application is an enterprise-grade platform built to enable, manage, and scale multi-agent AI ecosystems.

### Brand Archetype

- **The Creator / The Innovator:** Empowering builders with systematic, predictable, and highly collaborative tools.
- **The Technical Collaborator:** Friendly yet deeply competent, breaking down advanced multi-agent system execution into logical, clean, and interactive workflows.

### Visual Philosophy

The aesthetic bridges **retro-futuristic computing** with **modern developer productivity**. By blending an organic, friendly cream canvas with high-contrast technical typography and a vibrant robot-green glowing accent, the system balances accessibility with professional developer tooling.

---

## 2. Color Palette & Applied Theme

Derived from the visual identity of the global developer ecosystem (`image_56b7e4.jpg`), the color palette utilizes high-contrast tech tones softened by a warm foundational background.

### Primary Canvas & Neutrals

- **Cream Base (`#F5EFE1` / `#FAF8F5`)**
  - **Role:** Global body background, light mode workspace panels, layout containers. Emulates high-end matte print/terminal finishes.
- **Band Black (`#1F2937` / `#111827`)**
  - **Role:** High-contrast structural headers, primary text, dark UI panels, and main branding elements.
- **Grid Gray (`#C7C7C7` / `#E5E7EB`)**
  - **Role:** Subtle layout borders, decorative grid crosshairs (`+`), structural dividing rules, and disabled states.

### Accent & Functional Colors

- **Robot Green (`#76E1A7`)**
  - **Role:** Primary actionable highlight, terminal text glows, interactive buttons, positive statuses, active agent states.
- **Accent Blue (`#A1DFF5`)**
  - **Role:** Informational callouts, secondary metrics, data visualization pathways, and secondary agent attributes.
- **Primary Code (`#38B0E8`)**
  - **Role:** IDE elements, hyperlinks, token selections, and API response highlights.

---

## 3. Typography & Hierarchy

To project authority and technical structure, typography relies on a clean, structural sans-serif font scale optimized for both dense data panels and bold marketing layout interfaces.

### Typography Rules

- **Headers (Display & H1):** _Avenir Heavy_ or _Inter Bold_, geometric weight, tracking set tightly (`-0.02em`) for maximum punch. Always uppercase or sentence-case in high weights.
- **Body Text:** _Inter Regular_ or _System Sans-Serif_, crisp rendering across data-heavy dashboards.
- **Code & Metrics:** _Monospace_ (e.g., _Fira Code_, _SF Mono_), tracking standard, used for terminal layouts, data payloads, and event logs.

### Typographic Scale

| Element               | Font Family            | Weight        | Size             | Line Height | Usage                                           |
| :-------------------- | :--------------------- | :------------ | :--------------- | :---------- | :---------------------------------------------- |
| **Title / H1**        | Sans-Serif (Geometric) | Heavy (800)   | `28pt` / `36px`  | `1.1`       | Main Page Titles, Dashboard Hero headers        |
| **Section Head / H2** | Sans-Serif (Geometric) | Bold (700)    | `16pt` / `22px`  | `1.3`       | Widget titles, major panel headers              |
| **Subhead / H3**      | Sans-Serif             | Medium (500)  | `12pt` / `16px`  | `1.4`       | Input groupings, metadata categorizations       |
| **Body Copy**         | Sans-Serif             | Regular (400) | `10pt` / `14px`  | `1.5`       | System logs, descriptive elements, instructions |
| **Code Display**      | Monospace              | Regular (400) | `9.5pt` / `13px` | `1.4`       | Code blocks, terminal logs, token text          |

---

## 4. UI Components & Grid Layout System

### The Crosshair Grid (`+`)

To replicate the developer hackathon environment seen in `image_56b7e4.jpg`, a continuous layout grid must anchor the web application.

- **Design Pattern:** A thin border margin (`1px solid #C7C7C7`) intersected by light gray crosshairs (`+`) spaced evenly along layout margins.
- **Application:** Use on the outer layout frame of the viewport, separating the global navigation from the core content panels.

### Component Styling Specs

#### 1. Primary Action Button (`Key Button`)

- **Background Color:** `#76E1A7` (Robot Green)
- **Text Color:** `#1F2937` (Band Black, Bold)
- **Border Radius:** `20px` (Pill shaped)
- **Hover State:** Background brightens to `#8BF5BD`, adding a soft outer glow shadow (`0 0 12px rgba(118, 225, 167, 0.4)`).

#### 2. Code Block Container

- **Background Color:** `#1F2937` (Band Black)
- **Border Radius:** `8px`
- **Header Bar:** Include a terminal control style bar with minimal close/minimize icons, displaying the active script or agent payload filename in a crisp monospace font.

#### 3. Metric Info Grid

- **Layout:** Asymmetrical block borders with explicit padding (`20px`).
- **Styling:** Vertical lines dividing parameters (`Dates`, `Location`, `Prize Pool`) must use a clean `#C7C7C7` solid stroke without rounding, emulating a blueprints layout.

---

## 5. Co-Branding & Ecosystem Placement

When positioning partner logos alongside the core **Band of Agents** product family, a clean clear-space grid must be maintained to uphold structural readability.

```
       [ 1x Clear Space ]
+------------------------------------+
|  (O) BAND  x  [Partner]  x  [Lab]  |
|                                    |
|   [Sub-brand]  x  [API Partner]    |
+------------------------------------+
       [ 1x Clear Space ]
```

- **Clear Space Rule:** Maintain an equivalent of `1x` the main brand mark height (`(O)`) as padding around the entire co-branding banner.
- **Divider Mark:** Partner alignments are linked via a clean, light gray algebraic cross (`×`) styled in `#C7C7C7`.

---

## 6. Illustration & Iconography Language

### Agent Representation

- **Style:** Organic, glossy 3D/vector hybrid characters representing the "AI Agents." Use soft curved, neon-lit capsule bodies (`Agent Avatars`).
- **Visual Trailing (`Agent Tendrils`):** Flows of code logic must be represented visually as streaming fluid paths in gradient variations of `#76E1A7` and `#A1DFF5`, signifying multi-threaded parallel data processing.

### Utility Icons

- All utility icons (`Date/Calendar`, `Location Pin`, `Prize/Trophy`) must be outlined in vector form using a consistent line weight matching the typography stroke (`1.5px`), finished with no fills to keep dashboard interfaces clutter-free.
