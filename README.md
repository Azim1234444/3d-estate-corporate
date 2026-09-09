# Corporate Estates · Alam Impian

A responsive property marketing website with a real-time Three.js estate tour. Scroll down to drive the gold car and move the camera; scroll up to retrace the same journey. The tour covers two complete laps, then releases into the property information.

## Run locally

Requires Node.js 22.12+ (tested with Node 24) and npm.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. The current working session uses `http://127.0.0.1:5174/` because port 5173 was already occupied.

```sh
npm run build
npm run preview
npm test
```

`dist/` is the production output. No backend, environment variables, external fonts, or API keys are required. The WhatsApp links open a prefilled enquiry to Syafiqah Zaim at 018-242 5963; the website does not send messages automatically.

## Editing

- `src/content.ts`: property specifications, unit comparison, distances, terms and agent contact.
- `src/tour-config.ts`: camera keyframes, two-lap scroll mapping, route dimensions and wheel radius.
- `src/EstateScene.tsx`: model, lighting and rendering. Static geometry is merged by material; the moving vehicle has independent wheel pivots.
- `src/styles.css`: responsive layout and the ivory, charcoal and gold theme.

The source model contained 1,035 meshes. `public/assets/estate-web.glb` reduces this to 23 meshes, including nine animated car parts. The original source had no animation clips; the browser computes motion deterministically from scroll progress. Rendering occurs on demand and pauses when the page or tour is inactive. Pixel density is capped at 1.5.

The master plan uses a native modal dialog, including keyboard dismissal and zoom. Specifications use native disclosure controls. The scroll-driven 3D tour starts automatically when visible, including with reduced motion enabled, and has a manual pause control. Reduced motion still disables decorative transitions and smooth chapter navigation. Browsers that cannot render the model receive a static poster and all property content.

## Assets and provenance

Property text and four images were supplied through `https://corporateestatesalamimpian.netlify.app/`, accessed 9 September 2026. The model comes from the user's `corporate_estate_blender_package.zip`. It is an approximate exterior visualization, not a measured representation of the listed units. Tenants, current availability, approvals and commercial claims are not independently verified. The site labels illustrations and avoids the source's generated inventory numbers.

Optimized runtime assets are included in `public/assets/`. The local `.source-assets/` directory retains extracted originals and is excluded from Git and the production build. To regenerate assets locally:

```sh
node scripts/prepare-assets.mjs
node scripts/prepare-model.mjs
node scripts/render-poster.mjs
```

The poster renderer requires the running development server on port 5174 and Microsoft Edge. `prepare-model.mjs` also generates the world-space obstacle bounds used by route-clearance tests. If supplying a different GLB, revise the extraction script and car mesh selection to match its hierarchy before regenerating.

## Verification

`npm test` checks lap closure, reversible positioning, seam continuity, consistent travel distance, camera continuity, and the car's oriented footprint against source building, parked-car, planter and boundary geometry at 2,000 route samples.

```sh
node scripts/verify-browser.mjs
```

The browser suite uses installed Microsoft Edge through Playwright. It checks deterministic rendered scroll poses, stationary and reverse movement, pause/resume, disclosures, master-plan zoom and Escape dismissal, contact URLs, five viewport widths, mobile navigation, reduced motion, model failure and WebGL failure. Set `TEST_URL` to test a production preview. Screenshots go to the ignored `test-results/` directory. No test opens or sends a WhatsApp enquiry.

This project is delivered locally. No deployment or changes to the source Netlify website have been made.

Final validation: production build and all five route/camera tests passed. The production browser suite passed, including both failure fallbacks. Axe reported zero WCAG A/AA violations. A local, unthrottled desktop Lighthouse run scored 100 for performance, accessibility, best practices and SEO; these local measurements are not a mobile/network performance guarantee. Run `node scripts/quality-check.mjs` with the production preview on port 4180 to repeat the audit.
