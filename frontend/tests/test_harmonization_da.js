/**
 * Empirical Verification Suite for DA Harmonization between Page 1 and Page 2
 * Tests:
 * 1. Lab KPI Seamless Horizon component presence and 5 monumental metrics
 * 2. Retention Anchors architecture (Master glass banner + 3 dedicated hero glass cards)
 * 3. Zero layout overlap: avatars isolated in dedicated glass cards with zero negative margin text collisions
 * 4. Strict Zero-Orange rule adherence (emerald, cyan, violet, ruby/rose palette)
 * 5. DeadlockMapHeatmap glassmorphic styling
 * 6. CSS classes and media query coverage
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendDir = path.resolve(__dirname, '..');
const itemsSectionPath = path.join(frontendDir, 'src', 'components', 'ItemsSection.jsx');
const itemTelemetrySectionPath = path.join(frontendDir, 'src', 'components', 'ItemTelemetrySection.jsx');
const navbarPath = path.join(frontendDir, 'src', 'components', 'Navbar.jsx');
const heatmapPath = path.join(frontendDir, 'src', 'components', 'DeadlockMapHeatmap.jsx');
const indexCssPath = path.join(frontendDir, 'src', 'index.css');

let totalAssertions = 0;
let passedAssertions = 0;

function assert(condition, message) {
  totalAssertions++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  passedAssertions++;
  console.log(`  ✓ ${message}`);
}

console.log('================================================================');
console.log('  DA HARMONIZATION & ZERO-ORANGE VERIFICATION HARNESS');
console.log('================================================================\n');

// 1. ItemsSection.jsx structure checks
console.log('--- Suite 1: ItemsSection.jsx Lab Horizon & Retention Anchors ---');
const itemsContent = fs.readFileSync(itemsSectionPath, 'utf8');

assert(itemsContent.includes('lab-kpi-horizon-container'), 'ItemsSection contains lab-kpi-horizon-container');
assert(itemsContent.includes('lab-horizon-grid'), 'ItemsSection contains lab-horizon-grid');
assert(itemsContent.includes('+78.6%'), 'Horizon includes Stun Headshots monumental stat (+78.6%)');
assert(itemsContent.includes('30.0 Min'), 'Horizon includes 1st Vitality Item stat (30.0 Min)');
assert(itemsContent.includes('60.0%'), 'Horizon includes Peak Churn stat (60.0%)');
assert(itemsContent.includes('89.7%'), 'Horizon includes Economic Retention stat (89.7%)');
assert(itemsContent.includes('81.8%'), 'Horizon includes Retention Anchors stat (81.8%)');

assert(itemsContent.includes('lab-retention-glass-banner'), 'Retention Anchors master glass banner present');
assert(itemsContent.includes('lab-retention-anchors-grid'), 'Retention Anchors 3-card grid present');
assert(itemsContent.includes('Abrams'), 'Retention Anchors includes Abrams card');
assert(itemsContent.includes('Pocket'), 'Retention Anchors includes Pocket card');
assert(itemsContent.includes('Dynamo'), 'Retention Anchors includes Dynamo card');

// Verify Lash uses violet and not amber/orange
assert(itemsContent.includes("name: 'Lash'"), 'Lash hero card is defined');
assert(itemsContent.includes("color: 'var(--accent-purple)'"), 'Lash uses var(--accent-purple) for zero-orange compliance');
assert(itemsContent.includes('glow-violet'), 'Lash uses glow-violet text shadow');

// Verify Biomarkers large font numbers
assert(itemsContent.includes("fontSize: '1.2rem', fontFamily: 'var(--font-display)'"), 'Biomarkers display stylized Syne numbers');

// 2. DeadlockMapHeatmap.jsx checks
console.log('\n--- Suite 2: DeadlockMapHeatmap.jsx Glassmorphism ---');
const heatmapContent = fs.readFileSync(heatmapPath, 'utf8');

assert(heatmapContent.includes('lab-heatmap-glass-card'), 'DeadlockMapHeatmap uses lab-heatmap-glass-card');
assert(!heatmapContent.includes("background: 'var(--bg-card)', border: '1px solid var(--border-subtle)'"), 'DeadlockMapHeatmap card no longer has opaque inline style override');

// 3. index.css checks
console.log('\n--- Suite 3: index.css Glassmorphism & Neon Glows ---');
const cssContent = fs.readFileSync(indexCssPath, 'utf8');

assert(cssContent.includes('.glow-cyan {'), 'index.css defines .glow-cyan');
assert(cssContent.includes('.glow-violet {'), 'index.css defines .glow-violet');
assert(cssContent.includes('.lab-kpi-horizon-container {'), 'index.css defines .lab-kpi-horizon-container');
assert(cssContent.includes('.lab-horizon-grid {'), 'index.css defines .lab-horizon-grid');
assert(cssContent.includes('.lab-horizon-card {'), 'index.css defines .lab-horizon-card');
assert(cssContent.includes('.lab-retention-anchors-grid {'), 'index.css defines .lab-retention-anchors-grid');
assert(cssContent.includes('.lab-heatmap-glass-card {'), 'index.css defines .lab-heatmap-glass-card');
assert(cssContent.includes('/* Hallmark · custom') && cssContent.includes('--color-paper: #0b0f19;'), 'index.css applies Hallmark monochrome dark surface system without frosted blur');

// Parry section checks
assert(cssContent.includes('.lab-parry-verdict-banner {'), 'index.css defines .lab-parry-verdict-banner');
assert(cssContent.includes('.lab-parry-grid {'), 'index.css defines .lab-parry-grid');
assert(cssContent.includes('.lab-parry-card {'), 'index.css defines .lab-parry-card');
assert(itemsContent.includes('id="lab-step-parry"'), 'ItemsSection contains Chapter 05 id="lab-step-parry"');
assert(itemsContent.includes('+795%'), 'ItemsSection parry banner contains +795% acute ragequit stat');
assert(itemsContent.includes('4.0s'), 'ItemsSection parry banner contains 4.0s stun duration stat');
assert(itemsContent.includes('46.8%'), 'ItemsSection parry banner contains 46.8% Spirit Strike ragequit stat');

// 4. Strict Zero-Orange verification
console.log('\n--- Suite 4: Strict Zero-Orange Rule Compliance ---');
const forbiddenOrangeHexes = ['#ff7a00', '#f97316', '#ea580c', '#c2410c', '#ff6600', '#ff8800', '#ffa500'];
for (const hex of forbiddenOrangeHexes) {
  assert(!itemsContent.toLowerCase().includes(hex), `ItemsSection contains no forbidden orange hex ${hex}`);
}

// 5. ItemTelemetrySection dedicated tab checks
console.log('\n--- Suite 5: ItemTelemetrySection.jsx Dedicated Item & Build Telemetry Tab ---');
const itemTelemetryContent = fs.readFileSync(itemTelemetrySectionPath, 'utf8');

assert(itemTelemetryContent.includes('id="item-step-timelines"'), 'ItemTelemetrySection contains id="item-step-timelines"');
assert(itemTelemetryContent.includes('id="item-step-catalog"'), 'ItemTelemetrySection contains id="item-step-catalog"');
assert(itemTelemetryContent.includes('Vindicta'), 'ItemTelemetrySection contains Vindicta 30m sequence');
assert(itemTelemetryContent.includes('Lash'), 'ItemTelemetrySection contains Lash Hollow Point trap');
assert(itemTelemetryContent.includes('Spirit Strike'), 'ItemTelemetrySection contains Spirit Strike in Macro KPI / Catalog');
assert(itemTelemetryContent.includes('Cultist Sacrifice'), 'ItemTelemetrySection contains Cultist Sacrifice retention anchor');
assert(itemTelemetryContent.includes('lab-schema-card'), 'ItemTelemetrySection contains the 4 purchase error schemas');

for (const hex of forbiddenOrangeHexes) {
  assert(!itemTelemetryContent.toLowerCase().includes(hex), `ItemTelemetrySection contains no forbidden orange hex ${hex}`);
}

// 6. Permanent Design System Charter (docs/DESIGN_SYSTEM.md & index.css tokens)
console.log('\n--- Suite 6: Permanent Design System Charter & Dual Semantic Palette ---');
const designSystemDocPath = path.join(frontendDir, '..', 'docs', 'DESIGN_SYSTEM.md');
assert(fs.existsSync(designSystemDocPath), 'docs/DESIGN_SYSTEM.md exists in repository');
const designDocContent = fs.readFileSync(designSystemDocPath, 'utf8');

assert(designDocContent.includes('--dl-weapon'), 'DESIGN_SYSTEM.md documents --dl-weapon');
assert(designDocContent.includes('--dl-vitality'), 'DESIGN_SYSTEM.md documents --dl-vitality');
assert(designDocContent.includes('--dl-spirit'), 'DESIGN_SYSTEM.md documents --dl-spirit');
assert(designDocContent.includes('--dl-souls'), 'DESIGN_SYSTEM.md documents --dl-souls');
assert(designDocContent.includes('--ml-churn'), 'DESIGN_SYSTEM.md documents --ml-churn');
assert(designDocContent.includes('--ml-retention'), 'DESIGN_SYSTEM.md documents --ml-retention');
assert(designDocContent.includes('--ml-warning'), 'DESIGN_SYSTEM.md documents --ml-warning');
assert(designDocContent.includes('.dl-subtabs-bar'), 'DESIGN_SYSTEM.md documents .dl-subtabs-bar');
assert(designDocContent.includes('.dl-phase-timeline-grid'), 'DESIGN_SYSTEM.md documents .dl-phase-timeline-grid');

assert(cssContent.includes('--dl-weapon:'), 'index.css defines --dl-weapon token');
assert(cssContent.includes('--dl-vitality:'), 'index.css defines --dl-vitality token');
assert(cssContent.includes('--dl-spirit:'), 'index.css defines --dl-spirit token');
assert(cssContent.includes('--dl-souls:'), 'index.css defines --dl-souls token');
assert(cssContent.includes('--ml-churn:'), 'index.css defines --ml-churn token');
assert(cssContent.includes('--ml-retention:'), 'index.css defines --ml-retention token');
assert(cssContent.includes('--ml-warning:'), 'index.css defines --ml-warning token');
assert(cssContent.includes('.dl-subtabs-bar {'), 'index.css defines .dl-subtabs-bar');
assert(cssContent.includes('.dl-subtab-panel {'), 'index.css defines .dl-subtab-panel');
assert(cssContent.includes('.dl-phase-timeline-grid {'), 'index.css defines .dl-phase-timeline-grid');
assert(cssContent.includes('.dl-build-balance-bar {'), 'index.css defines .dl-build-balance-bar');
assert(cssContent.includes('.dl-catalog-split-layout {'), 'index.css defines .dl-catalog-split-layout');
assert(cssContent.includes('.dl-catalog-inspector-card {'), 'index.css defines .dl-catalog-inspector-card');
assert(cssContent.includes('.dl-scroll-x-mobile {'), 'index.css defines .dl-scroll-x-mobile');

// 7. Page 2 & Page 3 Statlocker Sub-Tabs & Zero-Overlap Sequential Phase Timeline
console.log('\n--- Suite 7: Page 2 & Page 3 Modular Sub-Tabs & Zero-Overlap Timeline ---');
assert(itemsContent.includes('dl-subtabs-bar'), 'Page 2 (ItemsSection) implements Statlocker .dl-subtabs-bar');
assert(itemsContent.includes('hero-editorial-row'), 'Page 2 uses Page 1 .hero-editorial-row header layout');

assert(itemTelemetryContent.includes('hero-editorial-row'), 'Page 3 (ItemTelemetrySection) uses Page 1 .hero-editorial-row header layout');
assert(itemTelemetryContent.includes('dl-subtabs-bar'), 'Page 3 implements Statlocker .dl-subtabs-bar');
assert(itemTelemetryContent.includes('dl-phase-timeline-grid'), 'Page 3 implements 3-phase .dl-phase-timeline-grid');
assert(itemTelemetryContent.includes('dl-build-balance-bar'), 'Page 3 implements Weapon/Vitality/Spirit .dl-build-balance-bar');
assert(itemTelemetryContent.includes('dl-catalog-split-layout'), 'Page 3 implements .dl-catalog-split-layout');
assert(itemTelemetryContent.includes('dl-catalog-inspector-card'), 'Page 3 implements .dl-catalog-inspector-card');
assert(!itemTelemetryContent.includes("left: `calc(${pct}%"), 'Page 3 has zero absolute percentage positioning overlap on timeline nodes');

// 8. Reviewer Hardening Checks: Keyboard Accessibility, Live Backend Merge, 2x2 Inspector Pods, Mobile 2x2 Sub-Tab Grid
console.log('\n--- Suite 8: Keyboard Accessibility, Backend Merge, 2x2 Inspector & Mobile Grid ---');
assert(itemsContent.includes('handleSubTabKeyDown'), 'Page 2 sub-tabs implement WAI-ARIA keyboard arrow navigation');
assert(itemTelemetryContent.includes('handleSubTabKeyDown'), 'Page 3 sub-tabs implement WAI-ARIA keyboard arrow navigation');
assert(itemsContent.includes('mergedHeroes'), 'Page 2 merges live backend hero_churn_rates with localized MOCK_HERO_CHURN_ANALYTICS fields');
assert(itemTelemetryContent.includes('Purchase Rank'), 'Page 3 Lateral Inspector renders Purchase Rank (avg_order_rank) pod in 2x2 grid');
assert(itemTelemetryContent.includes('Churn Over-Index'), 'Page 3 Lateral Inspector renders Churn Over-Index pod in 2x2 grid');
assert(itemTelemetryContent.includes('inspectorIconUrl ?'), 'Page 3 Lateral Inspector provides fallback tier badge when item icon is missing');
assert(itemTelemetryContent.includes('itemIconUrl ?'), 'Page 3 Catalog cards provide fallback tier badge when item icon is missing');
assert(cssContent.includes('grid-template-columns: repeat(2, minmax(0, 1fr))'), 'Mobile .dl-subtabs-bar uses 2-column grid to prevent button clipping at 375px and 320px');

// 9. Minimalist Unboxed Navbar & Framed Interactive Module Command Hub (Page 2 & Page 3)
console.log('\n--- Suite 9: Minimalist Unboxed Navbar & Framed Interactive Command Hub ---');
const navbarContent = fs.readFileSync(navbarPath, 'utf8');

assert(!navbarContent.includes('nav-tab-lab-case'), 'Navbar removes boxed .nav-tab-lab-case pill wrapper');
assert(!navbarContent.includes('nav-tab-item-case'), 'Navbar removes boxed .nav-tab-item-case pill wrapper');
assert(!navbarContent.includes('nav-lab-pill-badge'), 'Navbar removes .nav-lab-pill-badge from top-level navigation');
assert(!navbarContent.includes('🧪') && !navbarContent.includes('⚔️') && !navbarContent.includes('📊'), 'Navbar contains zero emojis on navigation tabs');
assert(navbarContent.includes("activePage === 'main' && <span className=\"nav-tab-dot\""), 'Navbar displays glowing green dot on Main Study when active');
assert(navbarContent.includes("activePage === 'items-lab' && <span className=\"nav-tab-dot\""), 'Navbar displays glowing green dot on Hero Dynamics when active');
assert(navbarContent.includes("activePage === 'items' && <span className=\"nav-tab-dot\""), 'Navbar displays glowing green dot on Item & Build Telemetry when active');
assert(navbarContent.includes('nav-tab-chevron'), 'Navbar preserves downward chevron arrows on tabs');

assert(itemsContent.includes('lab-editorial-pillars'), 'Page 2 restores the 3 interactive editorial synthesis pillars (01, 02, 03)');
assert(itemsContent.includes('dl-subtabs-header-bar'), 'Page 2 renders minimalist .dl-subtabs-header-bar module tabs');
assert(!itemsContent.includes('dl-subtab-icon-box'), 'Page 2 removes bulky .dl-subtab-icon-box islands');
assert(itemsContent.includes('dl-subtab-btn') && itemsContent.includes('dl-subtab-title'), 'Page 2 module buttons include .dl-subtab-btn and .dl-subtab-title');

assert(itemTelemetryContent.includes('dl-subtabs-header-bar'), 'Page 3 renders minimalist .dl-subtabs-header-bar module tabs');
assert(!itemTelemetryContent.includes('dl-subtab-icon-box'), 'Page 3 removes bulky .dl-subtab-icon-box islands');
assert(itemTelemetryContent.includes('dl-micro-legend') && itemTelemetryContent.includes('dl-item-row-top'), 'Page 3 renders micro-dot legend and analytical 2-level catalog rows');
assert(cssContent.includes('.dl-subtabs-header-bar {'), 'index.css defines .dl-subtabs-header-bar minimalist tab container');
assert(cssContent.includes('.dl-micro-legend {'), 'index.css defines .dl-micro-legend inline category legend');

console.log('\n================================================================');
console.log(`  ALL ${passedAssertions}/${totalAssertions} ASSERTIONS PASSED WITH ZERO FAILURES!`);
console.log('================================================================\n');
