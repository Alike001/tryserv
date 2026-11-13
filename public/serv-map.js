/**
 * Original TrySERV visual walkthrough.
 * Purely local UI: no network requests, grading, XP, or inference calls.
 */
const scenes = [
  {
    label: "01 / LEARN",
    title: "Start with an actual question.",
    description: "A new developer needs to understand why SERV requests have instructions and tasks. TrySERV starts with source-linked concepts instead of an unexplained API form.",
    sample: 'Question: "Why does a SERV request need a system instruction?"\nSource: official OpenServ documentation\nAction: complete a checkable lesson',
    link: "/learn",
    action: "Start the four lessons",
  },
  {
    label: "02 / VALIDATE",
    title: "Let code catch what code can prove.",
    description: "The free checker catches structural mistakes—like a missing system instruction—before any real SERV request is considered. It gives concrete, repeatable feedback.",
    sample: 'POST /v1/chat/completions\nmessages: [{ role: "user", content: "Help" }]\n\n✕ Missing system instruction · repair required',
    link: "/debug",
    action: "Try a free debugging mission",
  },
  {
    label: "03 / REASON",
    title: "Ask SERV to explain the why.",
    description: "When a learner explicitly opts in, the protected backend can ask real SERV Reasoning about a known lesson or validated error. It does not pass raw editable JSON or spend credits automatically.",
    sample: 'Optional: Ask SERV tutor\nContext: known lesson + checked feedback\nResult: explanation + official source\nStatus: real call only after your click',
    link: "/debug",
    action: "Explore optional SERV help",
  },
  {
    label: "04 / VERIFY",
    title: "Fix it, then check it again.",
    description: "The developer applies the correction and revalidates the request with deterministic rules. A valid preview is not an executed API call; the learner decides what to do next.",
    sample: '✓ Supported model\n✓ System instruction present\n✓ User task present\n\nVALID REQUEST PREVIEW · NOT EXECUTED',
    link: "/try",
    action: "Build a valid request",
  },
];

const steps = [
  ["book-open", "Learn", "Understand the idea"],
  ["scan", "Validate", "Check the shape"],
  ["sparkles", "Reason", "Explain the mistake"],
  ["check-circle", "Verify", "Re-check the fix"],
];

function icon(name) {
  const paths = {
    "book-open": '<path d="M12 6.5c-2.1-1.7-4.6-2.3-8-2.2v13c3.2-.1 5.8.6 8 2.1m0-12.9c2.1-1.7 4.6-2.3 8-2.2v13c-3.2-.1-5.8.6-8 2.1m0-12.9v12.9"/>',
    scan: '<path d="M4 9V5a1 1 0 0 1 1-1h4m6 0h4a1 1 0 0 1 1 1v4m0 6v4a1 1 0 0 1-1 1h-4m-6 0H5a1 1 0 0 1-1-1v-4"/><path d="M8 12h8m-5-3 3 3-3 3"/>',
    sparkles: '<path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Zm7 14 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z"/>',
    "check-circle": '<circle cx="12" cy="12" r="9"/><path d="m7.5 12 3 3 6-6"/>',
  };
  return '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths[name] + "</svg>";
}

document.querySelectorAll("[data-serv-map]").forEach((root, index) => {
  const titleId = "serv-map-title-" + index;
  const noteId = "serv-map-note-" + index;
  root.innerHTML = `
    <section class="serv-map" aria-labelledby="${titleId}">
      <div class="serv-map-heading">
        <div><span class="serv-map-kicker"><span class="serv-map-dot" aria-hidden="true"></span> INTERACTIVE OPENSERV WALKTHROUGH</span>
        <h2 id="${titleId}">Don't just read the docs. <em>See how the pieces connect.</em></h2>
        <p>Follow a realistic TrySERV integration journey. Choose a stage to see what happens, what is checked, and exactly where SERV Reasoning helps.</p></div>
        <span class="serv-map-label">4 STAGES · EXPLORE FREELY</span>
      </div>
      <div class="serv-map-body">
        <div class="serv-map-steps" role="group" aria-label="Choose a walkthrough stage">
          ${steps.map(([glyph, name, hint], i) => `
            <button type="button" class="serv-map-step" data-serv-step="${i}" aria-pressed="false">
              <span class="serv-step-symbol">${icon(glyph)}</span>
              <span class="serv-step-copy"><small>STEP 0${i + 1}</small><strong>${name}</strong><span>${hint}</span></span>
              <span class="serv-step-chevron" aria-hidden="true">→</span>
            </button>`).join("")}
        </div>
        <div class="serv-map-art">
          <div class="serv-map-orbit serv-orbit-one" aria-hidden="true"></div>
          <div class="serv-map-orbit serv-orbit-two" aria-hidden="true"></div>
          <div class="serv-map-window">
            <div class="serv-map-window-top"><span class="serv-window-dots" aria-hidden="true">● ● ●</span><strong>tryserv / explorer</strong><span class="serv-window-tag">GUIDED EXAMPLE</span></div>
            <div class="serv-map-window-main" aria-live="polite" aria-atomic="true">
              <span class="serv-scene-index" data-serv-label></span>
              <h3 data-serv-title></h3>
              <p data-serv-description></p>
              <div class="serv-code-label"><span>EXAMPLE VIEW</span><span>NOT A LIVE INFERENCE</span></div>
              <pre class="serv-map-code"><code data-serv-sample></code></pre>
            </div>
            <div class="serv-map-window-bottom"><a data-serv-link href="/learn">Explore the step <span aria-hidden="true">→</span></a><span data-serv-position>01 / 04</span></div>
          </div>
        </div>
      </div>
      <div class="serv-map-footer">
        <p id="${noteId}"><strong>What's real?</strong> TrySERV's graded lessons, deterministic checker, and opt-in SERV explanations are separate working features. This visual is an illustration only: it makes no API calls and earns no XP.</p>
        <a href="https://docs.openserv.ai/serv-reasoning/introduction" target="_blank" rel="noopener noreferrer">Read the official SERV docs ↗</a>
      </div>
    </section>`;
  const buttons = Array.from(root.querySelectorAll("[data-serv-step]"));
  const show = (step) => {
    const scene = scenes[step];
    buttons.forEach((button, i) => {
      button.classList.toggle("is-active", i === step);
      button.setAttribute("aria-pressed", String(i === step));
    });
    root.querySelector("[data-serv-label]").textContent = scene.label;
    root.querySelector("[data-serv-title]").textContent = scene.title;
    root.querySelector("[data-serv-description]").textContent = scene.description;
    root.querySelector("[data-serv-sample]").textContent = scene.sample;
    const link = root.querySelector("[data-serv-link]");
    link.href = scene.link;
    link.firstChild.textContent = scene.action + " ";
    root.querySelector("[data-serv-position]").textContent = String(step + 1).padStart(2, "0") + " / 04";
  };
  buttons.forEach((button, step) => button.addEventListener("click", () => show(step)));
  show(0);
});


// Homepage illustration controls update only explanatory copy and destinations.
// They neither call APIs nor grade exercises or consume SERV credits.
const hero = document.querySelector("[data-hero-explorer]");
if (hero) {
  const scenes = [
    {
      copy: "A short, source-linked lesson helps a new builder understand OpenServ before a server-graded exercise.",
      href: "/learn",
      label: "Open a real lesson"
    },
    {
      copy: "After a free request check, learners may explicitly ask genuine SERV Reasoning to explain a known problem. Preparing this example never calls a model.",
      href: "/debug",
      label: "Explore optional SERV guidance"
    },
    {
      copy: "The learner repairs the request and rechecks its shape with deterministic code. A validated preview is not executed inference.",
      href: "/try",
      label: "Build a validated request"
    }
  ];
  const buttons = [...hero.querySelectorAll("[data-hero-stage]")];
  const description = hero.querySelector("[data-hero-description]");
  const link = hero.querySelector("[data-hero-link]");
  const select = (index) => {
    const scene = scenes[index];
    if (!scene) return;
    buttons.forEach((button, i) => {
      const active = i === index;
      button.setAttribute("aria-pressed", String(active));
      button.classList.toggle("is-active", active);
    });
    description.textContent = scene.copy;
    link.href = scene.href;
    link.firstChild.textContent = scene.label + " ";
    hero.dataset.heroCurrent = String(index);
  };
  buttons.forEach((button, index) => button.addEventListener("click", () => select(index)));
  select(0);
}
