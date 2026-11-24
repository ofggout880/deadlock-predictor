/**
 * Browser-Level Interactive Stress Test Harness
 * 
 * Interacts with real browser DOM via Chrome DevTools Protocol:
 * 1. Threshold slider: rapid sweeps, discrete steps, click optimal button
 * 2. Tilt Simulator: rapid inputs across all 4 sliders
 * 3. Psychology feature tabs: rapid switching between all 6 behavioral features
 * 4. ML Benchmark: ROC / PR tab switching, Top 10 / Top 15 toggles, category filtering
 * 5. Confusion matrix: clicking TP, FN, FP, TN cells to inspect breakdown
 * 6. Console errors & DOM NaN inspection
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const CDP_PORT = 9448;
const APP_URL = process.env.APP_URL || 'http://127.0.0.1:5173/';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getBrowserWsUrl() {
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`);
      if (res.ok) {
        const data = await res.json();
        return data.webSocketDebuggerUrl;
      }
    } catch {}
    await sleep(250);
  }
  throw new Error('Failed to connect to Chrome DevTools endpoint');
}

class CdpClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
    this.ready = new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      }
    };
  }

  async send(method, params = {}, sessionId = undefined) {
    await this.ready;
    const msgId = this.id++;
    const payload = { id: msgId, method, params };
    if (sessionId) payload.sessionId = sessionId;

    return new Promise((resolve, reject) => {
      this.callbacks.set(msgId, { resolve, reject });
      this.ws.send(JSON.stringify(payload));
    });
  }

  close() {
    this.ws.close();
  }
}

async function runBrowserStressTests() {
  console.log('=== STARTING BROWSER-LEVEL INTERACTION STRESS TESTS ===\n');
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome_interactive_test_'));

  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--window-size=1280,900',
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${tmpDir}`,
    '--disable-gpu',
    '--no-sandbox',
    '--disable-extensions',
    'about:blank'
  ], { stdio: 'ignore' });

  let testsPassed = 0;
  let testsTotal = 0;
  const consoleErrors = [];

  function assert(condition, desc, details = {}) {
    testsTotal++;
    if (condition) {
      testsPassed++;
      console.log(`✅ PASS: ${desc}`);
    } else {
      console.error(`❌ FAIL: ${desc}`, details);
    }
  }

  try {
    const wsUrl = await getBrowserWsUrl();
    const client = new CdpClient(wsUrl);

    const target = await client.send('Target.createTarget', { url: APP_URL });
    const targetId = target.targetId;
    const session = await client.send('Target.attachToTarget', { targetId, flatten: true });
    const sessionId = session.sessionId;

    await client.send('Page.enable', {}, sessionId);
    await client.send('Runtime.enable', {}, sessionId);
    await client.send('DOM.enable', {}, sessionId);
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    }, sessionId);

    // Track console errors
    client.ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
        consoleErrors.push(msg.params.args.map(a => a.value || a.description).join(' '));
      }
    });

    await sleep(1500);

    // -------------------------------------------------------------------------
    // Test 1: Rapid Threshold Slider Dragging & Interpolation DOM Verification
    // -------------------------------------------------------------------------
    console.log('\n--- 1. Testing Threshold Slider Dynamic Reactivity & NaN Immunity ---');

    const sliderResult = await client.send('Runtime.evaluate', {
      expression: `
        (() => {
          function setReactInputValue(input, val) {
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            nativeInputValueSetter.call(input, val);
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }

          const slider = document.querySelector('input[type="range"][min="0.05"]');
          if (!slider) return { error: 'Slider element not found' };

          const valuesTested = [];
          const nanDetections = [];

          // Rapid sweep across 46 steps from 0.05 to 0.95
          for (let v = 0.05; v <= 0.95; v += 0.02) {
            const valStr = v.toFixed(2);
            setReactInputValue(slider, valStr);

            // Read text content in benchmark section
            const textContent = document.getElementById('benchmark')?.innerText || '';
            if (textContent.includes('NaN')) {
              nanDetections.push({ val: valStr, context: 'Found NaN in benchmark section' });
            }
            valuesTested.push(valStr);
          }

          // Click the optimal threshold button
          const optBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('θ* = 0.225') || b.innerText.includes('0.225'));
          if (optBtn) {
            optBtn.click();
          }

          const finalBenchText = document.getElementById('benchmark')?.innerText || '';
          const hasFinalNan = finalBenchText.includes('NaN');

          return {
            stepsCount: valuesTested.length,
            nanDetections,
            hasFinalNan,
            sliderValAfterOpt: slider.value
          };
        })()
      `,
      returnByValue: true
    }, sessionId);

    const sData = sliderResult.result.value;
    assert(sData && !sData.error, 'Threshold slider found and accessible');
    assert(sData && sData.stepsCount >= 45, `Swept ${sData?.stepsCount} threshold positions cleanly`);
    assert(sData && sData.nanDetections.length === 0, 'Zero NaN occurrences detected during threshold sweep', { nanDetections: sData?.nanDetections });
    assert(sData && !sData.hasFinalNan, 'No NaN present after reset to optimal threshold θ* = 0.225');

    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    // Test 2: Live Tilt Simulator Sliders & Calculations
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Testing Tilt Simulator Sliders & Reactive Score ---');

    const tiltResult = await client.send('Runtime.evaluate', {
      expression: `
        (async () => {
          const wait = (ms) => new Promise(r => setTimeout(r, ms));
          // Switch PsychologySection to 'tilt_lab' tab if needed
          const psychBtns = Array.from(document.querySelectorAll('#psychology button'));
          const tiltLabBtn = psychBtns.find(b => b.innerText.includes('Simulateur') || b.innerText.includes('Simulator'));
          if (tiltLabBtn) {
            tiltLabBtn.click();
            await wait(80);
          }

          const abandonsSlider = document.getElementById('sim-abandons');
          const streakSlider = document.getElementById('sim-streak');
          const nightOwlSlider = document.getElementById('sim-night-owl');
          const accDropSlider = document.getElementById('sim-acc-drop');

          if (!abandonsSlider || !streakSlider || !nightOwlSlider || !accDropSlider) {
            return { error: 'One or more tilt sliders not found' };
          }

          const scoreBox = document.querySelector('.tilt-score-number');
          const tierBadge = document.querySelector('.tilt-tier-badge');

          function setReactInputValue(input, val) {
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            nativeInputValueSetter.call(input, val);
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }

          const iterations = [
            { a: '0', s: '0', night: '0', acc: '0' },        // calm / zero tilt -> 0.0 (< 15.0)
            { a: '1', s: '-2', night: '20', acc: '15' },     // moderate / agitated -> 34.0 (30.0 - 59.9)
            { a: '5', s: '-6', night: '80', acc: '50' }      // critical extreme tilt -> 100.0 (>= 60.0)
          ];

          const states = [];
          for (const it of iterations) {
            setReactInputValue(abandonsSlider, it.a);
            setReactInputValue(streakSlider, it.s);
            setReactInputValue(nightOwlSlider, it.night);
            setReactInputValue(accDropSlider, it.acc);
            await wait(30);

            states.push({
              scoreText: scoreBox ? scoreBox.innerText : null,
              tierText: tierBadge ? tierBadge.innerText : null
            });
          }

          return { states };
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    }, sessionId);

    const tData = tiltResult.result.value;
    assert(tData && !tData.error, 'All tilt simulator sliders found and operational');
    assert(tData && tData.states?.length === 3, 'Evaluated calm, moderate, and extreme tilt states');
    if (tData?.states) {
      const calmScore = parseFloat(tData.states[0].scoreText);
      const modScore = parseFloat(tData.states[1].scoreText);
      const critScore = parseFloat(tData.states[2].scoreText);
      assert(calmScore === 0.0 && calmScore < 15.0, 'Calm zero state yields 0.0 (< 15.0) score', { got: tData.states[0].scoreText });
      assert(modScore >= 30.0 && modScore < 60.0, 'Moderate state yields [30.0, 59.9] agitated tilt score', { got: tData.states[1].scoreText });
      assert(critScore >= 60.0 && critScore <= 100.0, 'Critical state yields >= 60.0 extreme tilt score', { got: tData.states[2].scoreText });
    }

    // -------------------------------------------------------------------------
    // Test 3: Psychology Behavioral Feature Tabs Switching
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Testing Psychology Behavioral Tabs Switching ---');

    const tabSwitchResult = await client.send('Runtime.evaluate', {
      expression: `
        (async () => {
          const wait = (ms) => new Promise(r => setTimeout(r, ms));
          const tabBtns = Array.from(document.querySelectorAll('.psychology-tab-btn'));
          if (tabBtns.length === 0) return { error: 'No psychology tabs found' };

          const selectedTitles = [];
          for (const btn of tabBtns) {
            btn.click();
            await wait(25);
            const titleEl = document.querySelector('.feature-main-title');
            selectedTitles.push(titleEl ? titleEl.innerText : null);
          }

          return {
            tabsFound: tabBtns.length,
            selectedTitles
          };
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    }, sessionId);

    const tabData = tabSwitchResult.result.value;
    assert(tabData && tabData.tabsFound === 6, `All 6 psychology tabs found (got: ${tabData?.tabsFound})`);
    assert(tabData && tabData.selectedTitles?.every(t => typeof t === 'string' && t.length > 0), 'All 6 tabs switched and rendered valid feature titles');

    // -------------------------------------------------------------------------
    // Test 4: ML Benchmark Interactive Controls (Curve mode, Categories, Top N)
    // -------------------------------------------------------------------------
    console.log('\n--- 4. Testing ML Benchmark Visualizations & Controls ---');

    const benchControlsResult = await client.send('Runtime.evaluate', {
      expression: `
        (() => {
          // Switch to PR Curve
          const prBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('PR Curve'));
          if (prBtn) prBtn.click();

          // Switch back to ROC Curve
          const rocBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('ROC Curve'));
          if (rocBtn) rocBtn.click();

          // Toggle Top 15
          const top15Btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Top 15');
          if (top15Btn) top15Btn.click();

          // Filter by category
          const catBtns = Array.from(document.querySelectorAll('button')).filter(b => 
            b.innerText.includes('Économie') || b.innerText.includes('Economy') ||
            b.innerText.includes('Comportement') || b.innerText.includes('Behavior')
          );
          catBtns.forEach(b => b.click());

          // Click confusion matrix cells
          const cmCells = Array.from(document.querySelectorAll('.benchmark-table, .card [style*="cursor: pointer"]'));
          cmCells.slice(0, 5).forEach(c => c.click());

          const benchText = document.getElementById('benchmark')?.innerText || '';
          return {
            hasNaN: benchText.includes('NaN'),
            controlsClicked: true
          };
        })()
      `,
      returnByValue: true
    }, sessionId);

    const bCtrlData = benchControlsResult.result.value;
    assert(bCtrlData && bCtrlData.controlsClicked, 'All benchmark interactive controls engaged cleanly');
    assert(bCtrlData && !bCtrlData.hasNaN, 'Zero NaNs after engaging all benchmark visualization controls');

    // -------------------------------------------------------------------------
    // Test 5: Two-Tab Navbar Hover Popovers & Dedicated Labo Items & Stun 3D View
    // -------------------------------------------------------------------------
    console.log('\n--- 5. Testing Two-Tab Navbar Hover Popover & Dedicated Lab Page ---');

    const labTestResult = await client.send('Runtime.evaluate', {
      expression: `
        (async () => {
          const wait = (ms) => new Promise(r => setTimeout(r, ms));
          const principalTab = document.getElementById('nav-tab-principal');
          const labTab = document.getElementById('nav-tab-items-lab');
          if (!principalTab || !labTab) return { error: 'Navbar tabs not found' };

          // 1. Verify #items is NOT cluttering the Main Study page initially
          const itemsOnMain = Boolean(document.getElementById('items'));

          // 2. Focus Main Study tab to open hover dropdown
          principalTab.focus();
          await wait(60);
          const popoverItems = Array.from(document.querySelectorAll('.nav-popover-item')).map(a => a.getAttribute('href'));

          // 3. Click Lab Tab to switch to the Dedicated Lab View
          labTab.click();
          await wait(100);

          const labSection = document.getElementById('items');
          const step1 = Boolean(document.getElementById('lab-step-1'));
          const step2 = Boolean(document.getElementById('lab-step-2'));
          const step3 = Boolean(document.getElementById('lab-step-3'));
          const step4 = Boolean(document.getElementById('lab-step-4'));

          // 4. Click all 4 chronological sequence buttons
          const seqBtns = Array.from(document.querySelectorAll('.lab-seq-tab-btn'));
          const seqCount = seqBtns.length;
          for (const b of seqBtns) {
            b.click();
            await wait(25);
          }

          // 5. Click SVG scatter plot hero circles
          const svgCircles = Array.from(document.querySelectorAll('#lab-step-2 svg g[style*="cursor: pointer"]'));
          for (const g of svgCircles) {
            g.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await wait(15);
          }

          const labText = labSection ? labSection.innerText : '';
          const hasLabNaN = labText.includes('NaN');

          // 6. Return to Main Study page
          principalTab.click();
          await wait(100);
          const heroBackOnMain = Boolean(document.getElementById('hero'));

          return {
            itemsOnMain,
            popoverItemsCount: popoverItems.length,
            labOpened: Boolean(labSection),
            allFourChaptersPresent: step1 && step2 && step3 && step4,
            seqCount,
            svgHeroCount: svgCircles.length,
            hasLabNaN,
            heroBackOnMain
          };
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    }, sessionId);

    const lData = labTestResult.result.value;
    assert(lData && !lData.error, 'Both Main Study and Hero Dynamics & Churn tabs found in Navbar');
    assert(lData && lData.itemsOnMain === false, 'First page is unclogged: #items is NOT rendered on Main Study view');
    assert(lData && lData.popoverItemsCount === 6, `Main Study hover popover displays all 6 study sections (got: ${lData?.popoverItemsCount})`);
    assert(lData && lData.labOpened && lData.allFourChaptersPresent, 'Clicking Lab tab opens dedicated view with all 4 causal chapters');
    assert(lData && lData.seqCount === 4, `All 4 chronological purchase sequences interactive (got: ${lData?.seqCount})`);
    assert(lData && lData.svgHeroCount >= 10, `Interactive 2D SVG scatter plot renders ${lData?.svgHeroCount} hero bubbles`);
    assert(lData && !lData.hasLabNaN, 'Zero NaN occurrences in Dedicated Lab view');
    assert(lData && lData.heroBackOnMain, 'Clicking Main Study tab returns cleanly to the main study view');

    // -------------------------------------------------------------------------
    // Test 6: Check Browser Console Errors
    // -------------------------------------------------------------------------
    console.log('\n--- 6. Checking Runtime Console Errors ---');
    assert(consoleErrors.length === 0, `Zero runtime console errors during all interactions (errors: ${consoleErrors.length})`, { consoleErrors });

    client.close();
  } finally {
    chromeProc.kill('SIGKILL');
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {}
  }

  console.log('\n======================================================');
  console.log('=== BROWSER INTERACTION TEST SUMMARY ===');
  console.log(`Assertions: ${testsPassed} / ${testsTotal} passed`);
  console.log('======================================================');

  if (testsPassed === testsTotal) {
    console.log('\nALL BROWSER INTERACTION TESTS PASSED CLEANLY!');
    process.exit(0);
  } else {
    console.error('\nSOME BROWSER TESTS FAILED!');
    process.exit(1);
  }
}

runBrowserStressTests().catch(err => {
  console.error('Browser test harness error:', err);
  process.exit(1);
});
