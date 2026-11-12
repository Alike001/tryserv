import {defineConfig,devices} from "@playwright/test";

export default defineConfig({
  testDir: "./browser",
  testMatch: /.*\.spec\.mjs$/,
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 30000,
  expect: {timeout: 10000},
  reporter: process.env.CI ? [["list"],["html",{open:"never",outputFolder:"playwright-report"}]] : "list",
  use: {
    baseURL:"http://127.0.0.1:3000",
    trace:"retain-on-failure",
    screenshot:"only-on-failure"
  },
  projects:[
    {name:"desktop-chromium",use:{...devices["Desktop Chrome"],viewport:{width:1440,height:900}}},
    {name:"mobile-chromium",use:{...devices["Desktop Chrome"],viewport:{width:375,height:812},isMobile:true,hasTouch:true}}
  ],
  webServer:{
    command:"node index.mjs",
    url:"http://127.0.0.1:3000/healthz",
    reuseExistingServer: !process.env.CI,
    timeout:30000,
    env:{PORT:"3000",PUBLIC_TUTOR_ENABLED:"false"}
  }
});
