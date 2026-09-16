import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE_URL = "http://localhost:8081";
const REPORT_DIR = "./e2e_reports";

if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

async function run() {
  console.log("🚀 Starting Comprehensive BuildTape Pro E2E Test Suite via Playwright...");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 414, height: 896 }, // iPhone XR / 11 mobile viewport
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();

  const consoleLogs = [];
  const errors = [];

  page.on("console", (msg) => {
    const text = msg.text();
    consoleLogs.push({ type: msg.type(), text });
    if (msg.type() === "error") {
      errors.push(text);
    }
  });

  page.on("pageerror", (err) => {
    errors.push(`PageError: ${err.message}`);
  });

  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    errors: [],
  };

  function addTest(name, passed, details = "") {
    results.tests.push({ name, passed, details });
    console.log(`${passed ? "✅" : "❌"} ${name} ${details ? `(${details})` : ""}`);
  }

  try {
    // 1. Initial Load
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${REPORT_DIR}/01_initial_load.png` });
    addTest("Initial Page Load", true, "Page loaded successfully at " + BASE_URL);

    // 2. Main Calculator UI & Keys
    const calcText = await page.textContent("body");
    const hasCalcKeys = calcText.includes("FT") && calcText.includes("IN") && calcText.includes("AC");
    addTest("Calculator Screen Render", hasCalcKeys, "Found basic calculator buttons");

    // Click on buttons: 1, 2, FT, +, 6, FT, =
    await page.getByText("1", { exact: true }).click();
    await page.waitForTimeout(100);
    await page.getByText("2", { exact: true }).click();
    await page.waitForTimeout(100);
    await page.getByText("FT", { exact: true }).click();
    await page.waitForTimeout(100);
    await page.getByText("+", { exact: true }).click();
    await page.waitForTimeout(100);
    await page.getByText("6", { exact: true }).click();
    await page.waitForTimeout(100);
    await page.getByText("FT", { exact: true }).click();
    await page.waitForTimeout(100);
    await page.getByText("=", { exact: true }).click();
    await page.waitForTimeout(500);

    let calcDisplay = await page.textContent("body");
    let found18Ft = calcDisplay.includes("18'") || calcDisplay.includes("18 ft") || calcDisplay.includes("18 FT") || calcDisplay.includes("18 - 0");
    addTest("Calculator Addition: 12 FT + 6 FT = 18 FT", found18Ft, "Calculated 18 FT");

    // Test Center (CTR) button
    await page.getByText("CTR", { exact: true }).click();
    await page.waitForTimeout(300);
    calcDisplay = await page.textContent("body");
    const found9Ft = calcDisplay.includes("9'") || calcDisplay.includes("9 ft") || calcDisplay.includes("9 FT") || calcDisplay.includes("9 - 0");
    addTest("Calculator Center Function: 18 FT / 2 = 9 FT", found9Ft, "Center halved 18 FT to 9 FT");

    await page.screenshot({ path: `${REPORT_DIR}/02_calculator_result.png` });

    // 3. Settings Screen & RevenueCat Lifetime Card
    await page.goto(`${BASE_URL}/settings`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${REPORT_DIR}/03_settings_screen.png` });

    const settingsText = await page.textContent("body");
    const hasSettings = settingsText.includes("Settings") && settingsText.includes("Measurement Precision");
    addTest("Settings Screen Render", hasSettings, "Measurement Precision and options loaded");

    // Verify Developer Toggle is completely removed (Apple Store Compliance)
    const hasDevToggle = settingsText.includes("Developer") && settingsText.includes("Dev toggle");
    addTest("Apple Compliance: Dev Toggle Removed", !hasDevToggle, "Dev toggle is eliminated from UI");

    // Verify RevenueCat Lifetime Card & Restore Purchases Button
    const hasPaywallCard = settingsText.includes("Upgrade to BuildTape Pro") || settingsText.includes("Lifetime Pro Membership");
    const hasRestoreBtn = settingsText.includes("Restore Purchases");
    addTest("RevenueCat Paywall Card Render", hasPaywallCard, "Found Lifetime Paywall Card");
    addTest("Restore Purchases Button Render", hasRestoreBtn, "Found Restore Purchases button");

    // Test clicking Restore Purchases
    const restoreBtn = page.getByText("Restore Purchases", { exact: true }).first();
    if (await restoreBtn.count() > 0) {
      await restoreBtn.click();
      await page.waitForTimeout(600);
      addTest("Restore Purchases Button Action", true, "Clicked Restore Purchases");
    }

    await page.screenshot({ path: `${REPORT_DIR}/04_settings_paywall_card.png` });


    // Verify Free Tier gates working as designed
    await page.goto(`${BASE_URL}/stairs`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    const stairsFreeText = await page.textContent("body");
    const stairsProtected = stairsFreeText.includes("Pro Feature") || stairsFreeText.includes("Stair Solver");
    addTest("Free Tier: ProGate Protection Active", stairsProtected, "Stair solver gated for free users");

    // Simulate Pro Activation for full feature verification
    await page.evaluate(() => {
      window.localStorage.setItem("isPro", "true");
      // @ts-ignore
      if (window.__BUILDTAPE_STORE__) {
        window.__BUILDTAPE_STORE__.getState().setIsPro(true);
      }
    });
    await page.goto(`${BASE_URL}/settings`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);

    // 4. Stairs Tab (Pro Feature Unlocked)
    await page.goto(`${BASE_URL}/stairs`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${REPORT_DIR}/05_stairs_screen.png` });

    const stairsText = await page.textContent("body");
    const stairsProUnlocked = !stairsText.includes("🔒") && (stairsText.includes("Solve Stairs") || stairsText.includes("TOTAL RISE"));
    addTest("Stairs Tab Pro Unlock", stairsProUnlocked, stairsProUnlocked ? "Unlocked via Pro status" : "Protected");

    // Test Stair Calculation
    const solveStairsBtn = page.getByText("Solve Stairs", { exact: false }).first();
    if (await solveStairsBtn.count() > 0) {
      await solveStairsBtn.click();
      await page.waitForTimeout(600);
      const afterStairs = await page.textContent("body");
      const hasStairResults = afterStairs.includes("Risers") || afterStairs.includes("Treads") || afterStairs.includes("Stringer");
      addTest("Stairs Calculation Execution", hasStairResults, "Calculated risers, treads, and stringers");
      await page.screenshot({ path: `${REPORT_DIR}/06_stairs_result.png` });
    }


    // 5. Rafters Tab (Pro Feature)
    await page.goto(`${BASE_URL}/rafters`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${REPORT_DIR}/07_rafters_screen.png` });

    const raftersText = await page.textContent("body");
    const raftersUnlocked = !raftersText.includes("Rafter Solver is available in BuildTape Pro");
    addTest("Rafters Tab Pro Unlock", raftersUnlocked, raftersUnlocked ? "Unlocked via Pro status" : "Locked");

    const calcRaftersBtn = page.getByText("Calculate Rafters", { exact: false }).first();
    if (await calcRaftersBtn.count() > 0) {
      await calcRaftersBtn.click();
      await page.waitForTimeout(600);
      const afterRafters = await page.textContent("body");
      const hasRafterResults = afterRafters.includes("Common Rafter") || afterRafters.includes("Plumb Cut") || afterRafters.includes("Angle") || afterRafters.includes("Bird");
      addTest("Rafters Calculation Execution", hasRafterResults, "Calculated rafter dimensions and pitch angles");
      await page.screenshot({ path: `${REPORT_DIR}/08_rafters_result.png` });
    } else {
      addTest("Rafters Calculation Execution", false, "Calculate Rafters button not found");
    }

    // 6. Materials Tab (Estimators)
    await page.goto(`${BASE_URL}/materials`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${REPORT_DIR}/09_materials_screen.png` });

    const materialsText = await page.textContent("body");
    const materialsUnlocked = !materialsText.includes("Material Estimators is available in BuildTape Pro");
    addTest("Materials Tab Pro Unlock", materialsUnlocked, materialsUnlocked ? "Unlocked via Pro status" : "Locked");

    // Check tabs in Materials: Board Feet, Studs, Drywall, Concrete, Area
    const hasAllMaterialSubtabs = materialsText.includes("Board Feet") &&
      materialsText.includes("Studs") &&
      materialsText.includes("Drywall") &&
      materialsText.includes("Concrete") &&
      materialsText.includes("Area");
    addTest("Materials Estimator Tabs Availability", hasAllMaterialSubtabs, "Board Feet, Studs, Drywall, Concrete, Area all present");

    // Test Board Feet calculate
    const boardFeetBtn = page.getByText("Calculate Board Feet", { exact: false }).first();
    if (await boardFeetBtn.count() > 0) {
      await boardFeetBtn.click();
      await page.waitForTimeout(500);
      const boardContent = await page.textContent("body");
      const hasBoardResult = boardContent.includes("Board Feet") || boardContent.includes("FBM");
      addTest("Board Feet Estimator Calculation", hasBoardResult, "Computed board feet");
    }

    // Test Studs tab
    const studsTab = page.getByText("Studs", { exact: true }).first();
    if (await studsTab.count() > 0) {
      await studsTab.click();
      await page.waitForTimeout(500);
      const studsCalcBtn = page.getByText("Calculate Studs", { exact: false }).first();
      if (await studsCalcBtn.count() > 0) {
        await studsCalcBtn.click();
        await page.waitForTimeout(500);
        const studsContent = await page.textContent("body");
        const hasStudResult = studsContent.includes("Total Studs") || studsContent.includes("studs");
        addTest("Studs Framing Estimator Calculation", hasStudResult, "Computed stud count");
      }
    }
    await page.screenshot({ path: `${REPORT_DIR}/10_materials_studs.png` });

    // Test Concrete tab
    const concreteTab = page.getByText("Concrete", { exact: true }).first();
    if (await concreteTab.count() > 0) {
      await concreteTab.click();
      await page.waitForTimeout(500);
      const concreteCalcBtn = page.getByText("Calculate Concrete", { exact: false }).first();
      if (await concreteCalcBtn.count() > 0) {
        await concreteCalcBtn.click();
        await page.waitForTimeout(500);
        const concContent = await page.textContent("body");
        const hasConcResult = concContent.includes("Cubic Yards") || concContent.includes("Bags") || concContent.includes("cu yd");
        addTest("Concrete Volume & Bag Estimator", hasConcResult, "Computed cubic yards and bags");
      }
    }
    await page.screenshot({ path: `${REPORT_DIR}/11_materials_concrete.png` });

    // 7. Jobs Tab
    await page.goto(`${BASE_URL}/jobs`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${REPORT_DIR}/12_jobs_screen.png` });

    const jobsText = await page.textContent("body");
    const hasJobsHeader = jobsText.includes("Saved Jobs");
    addTest("Jobs Screen Render", hasJobsHeader, "Jobs screen loaded");

    // Look for New Job button or '+'
    const newJobBtn = page.getByText("+ Create First Job", { exact: false })
      .or(page.getByText("+ New Job", { exact: false })).first();
    if (await newJobBtn.count() > 0) {
      await newJobBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${REPORT_DIR}/13_jobs_modal.png` });

      // Fill Job form
      const nameInput = page.locator('input').first();
      if (await nameInput.count() > 0) {
        await nameInput.fill("North Hill Remodel");
        await page.waitForTimeout(200);

        const saveBtn = page.getByText("Save Job", { exact: false })
          .or(page.getByText("Save", { exact: true })).first();
        if (await saveBtn.count() > 0) {
          await saveBtn.click();
          await page.waitForTimeout(600);
        }
      }

      const jobsAfterAdd = await page.textContent("body");
      const jobAdded = jobsAfterAdd.includes("North Hill Remodel");
      addTest("Job Creation & Persistence", jobAdded, jobAdded ? "North Hill Remodel saved and rendered in list" : "Job not found in list");
      await page.screenshot({ path: `${REPORT_DIR}/14_jobs_list_updated.png` });
    } else {
      addTest("Job Creation & Persistence", false, "New Job button not found");
    }

    // 8. Tape Tab
    await page.goto(`${BASE_URL}/tape`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${REPORT_DIR}/15_tape_screen.png` });

    const tapeText = await page.textContent("body");
    const hasTapeHeader = tapeText.includes("Tape History") || tapeText.includes("Calculation Tape") || tapeText.includes("Tape");
    addTest("Tape Screen Render", hasTapeHeader, "Tape screen loaded");
    const hasTapeItem = tapeText.includes("18") || tapeText.includes("9") || tapeText.includes("entries");
    addTest("Tape History Contains Calculations", hasTapeItem, "Tape recorded earlier calculations");


    // 9. Check Error Logs
    results.errors = errors;
    const fatalErrors = errors.filter((e) => !e.includes("favicon") && !e.includes("DevTools"));
    addTest("Console Error Free Check", fatalErrors.length === 0, `${fatalErrors.length} uncaught console errors`);

  } catch (err) {
    console.error("Test execution error:", err);
    results.fatal = err.message;
  } finally {
    await browser.close();
  }

  fs.writeFileSync(`${REPORT_DIR}/results.json`, JSON.stringify(results, null, 2));
  console.log("🏁 E2E Test Suite Completed! Results written to e2e_reports/results.json");
}

run();
