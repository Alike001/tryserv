import {defineConfig,devices} from "@playwright/test";

export default defineConfig({
  testDir:".",
  testMatch:/production\.smoke\.spec\.mjs$/,
  fullyParallel:false,
  retries:0, // Never retry a possible paid SERV call.
  workers:1,
  timeout:90000,
  expect:{timeout:12000},
  reporter:[["list"],["html",{open:"never",outputFolder:"production-playwright-report"}]],
  use:{
    baseURL:"https://tryserv.onrender.com",
    trace:"retain-on-failure",
    screenshot:"only-on-failure",
    video:"on",
    ignoreHTTPSErrors:false
  },
  projects:[{name:"production-chromium",use:{...devices["Desktop Chrome"],viewport:{width:1440,height:900}}}]
});
