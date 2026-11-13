import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";
import {execFileSync} from "node:child_process";
import {fileURLToPath} from "node:url";
import path from "node:path";

const dir = path.dirname(fileURLToPath(import.meta.url));
const read = (name) => readFileSync(path.join(dir, "..", name), "utf8");
const source = read("public/serv-map.js");

test("original interactive explainer is reachable on homepage and in learning studio", () => {
  for (const filename of ["public/index.html", "public/landing.html"]) {
    const html = read(filename);
    assert.match(html, /data-serv-map/);
    assert.match(html, /src="\/serv-map\.js"/);
    assert.match(html, /href="\/brand\.css"/);
  }
  assert.match(read("public/brand.css"), /\.serv-map-body/);
  assert.match(read("public/brand.css"), /prefers-reduced-motion/);
});

test("explainer is clearly illustrative and never performs paid inference or mutates learning progress", () => {
  assert.doesNotMatch(source, /\bfetch\s*\(|XMLHttpRequest|localStorage|\/api\/mentor|\/api\/debug|\/api\/try-serv/);
  assert.match(source, /NOT A LIVE INFERENCE/);
  assert.match(source, /no API calls and earns no XP/);
  assert.match(source, /explicitly opts in/);
  assert.match(source, /raw editable JSON/);
});

test("walkthrough stages update independently, with accessible pressed state and correct destination", () => {
  const fields = Object.fromEntries(
    ["[data-serv-label]", "[data-serv-title]", "[data-serv-description]", "[data-serv-sample]", "[data-serv-position]"]
      .map(key => [key, {textContent:""}])
  );
  const link = {href:"", firstChild:{textContent:""}};
  fields["[data-serv-link]"] = link;
  const buttons = Array.from({length:4}, () => {
    const attrs = {};
    return {
      attrs,
      click:null,
      classList:{toggle(){}},
      setAttribute(key,value){attrs[key]=value;},
      addEventListener(event,callback){if(event==="click")this.click=callback;},
    };
  });
  let markup = "";
  const root = {
    set innerHTML(value){markup=value;},
    querySelectorAll(key){assert.equal(key,"[data-serv-step]"); return buttons;},
    querySelector(key){assert.ok(fields[key],key);return fields[key];},
  };
  const document = {querySelectorAll(key){assert.equal(key,"[data-serv-map]");return [root];}};
  runInNewContext(source, {document});
  assert.match(markup, /aria-label="Choose a walkthrough stage"/);
  assert.match(markup, /aria-live="polite"/);
  assert.match(markup, /docs\.openserv\.ai/);
  assert.equal(fields["[data-serv-label]"].textContent,"01 / LEARN");
  assert.equal(buttons[0].attrs["aria-pressed"],"true");
  buttons[2].click();
  assert.equal(fields["[data-serv-label]"].textContent,"03 / REASON");
  assert.equal(fields["[data-serv-title]"].textContent,"Ask SERV to explain the why.");
  assert.equal(buttons[0].attrs["aria-pressed"],"false");
  assert.equal(buttons[2].attrs["aria-pressed"],"true");
  assert.equal(link.href,"/debug");
  buttons[3].click();
  assert.equal(link.href,"/try");
  assert.match(fields["[data-serv-sample]"].textContent,/NOT EXECUTED/);
});

test("visual walkthrough JavaScript parses under Node", () => {
  const node = process.execPath;
  assert.doesNotThrow(()=>execFileSync(node, ["--check", path.join(dir,"..","public","serv-map.js")]));
});
