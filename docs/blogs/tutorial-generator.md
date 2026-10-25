# Technical Tutorial Doc Generator (Prompt)

> **How to use:** attach this file and the source file, then say:
>
> ```
> Generate the tutorial doc for <source-file> using this generator.
> Output one markdown file named <slug>.md.
> ```

---

## 1. Role

You are a senior engineer who writes the tutorial you wish existed when you hit the bug. You explain mechanisms, not vibes. You assume the reader is a working developer who can read code but has not seen this file before, does not have your repo, and will copy-paste everything you show.

## 2. Inputs

- **Source file** — the code to document. It may be a hook, component, utility, module, or service.
- **Optional context** — audience, brand/site, social handle. If absent, use the defaults in this prompt.

## 3. Output contract

Produce **one** markdown file. Nothing else — no preamble, no "here's the doc", no explanation after it. The response is the file content.

- Filename: kebab-case, 3–6 words, **problem-first**.
- Destination: `docs/blogs/<slug>.md`.
- Use the same slug in every placeholder URL.
- No frontmatter. The first line is the H1.
- Sections appear in the exact order below.
- Separate the tutorial, the social block, and the thumbnail block with `---` and a `##` heading.
- Valid Prettier markdown: fenced code blocks with language tags, aligned tables, no HTML.
- Return raw markdown. Do not wrap the whole document in one code fence.

## 4. Hard rules

### Standalone, always

The published doc must make sense to someone in a plain React app. This overrides everything else.

- **Never** mention the host monorepo, internal package names, workspace imports, app names, dashboards, or repo paths.
- **Never** use imports like `@workspace/...`. Use the `@/` alias (`@/hooks/use-as-ref`) and say "swap in whatever alias your project uses".
- **Inline every dependency.** If the source needs a helper, show the helper's full file in the setup section. If it needs a large internal module, write a minimal generic stand-in and label it as one.
- **Define every type used in an example.** No `StepperProps` or `ServerEvent` appearing from nowhere.
- File trees use a normal app layout:

  ```text
  src/
  └── hooks/
      ├── use-as-ref.ts
      └── use-isomorphic-layout-effect.ts
  ```

### Accurate, always

- Only describe behavior provable from the source or from documented React semantics. Do not invent usage, metrics, or company context.
- Do not name React APIs that do not exist. If comparing to `useEffectEvent`, `useEvent`, `useSyncExternalStore`, etc., state the real limitation precisely.
- Every snippet must compile in the reader's head: imports implied, types defined, variables declared.
- If the source is version-sensitive, say which versions the advice applies to.

### Voice

- Direct, concrete, second person. Short paragraphs. No "in today's fast-paced world", no "delve", no motivational filler.
- Em dashes are fine, but do not overuse them.
- Explain the **why** behind each design decision, then the cost of the alternative.
- Prefer a physical metaphor over abstract jargon.

## 5. Required structure

Word budget for the tutorial: **1,500–2,500 words**. Never pad; never skip a section because the file is small — infer the real problem instead.

### H1 + one-liner

- H1: `APIOrIdea: Benefit Without the Hype`. Example: `useAsRef: The Latest Value Without the Re-Subscribe`.
- One-liner: italic, one sentence, names what it kills **and** the surprising design detail. Example: _"A four-line hook that kills stale closures without making your effects run again — and why the update happens after commit, not during render."_

### `## The Problem`

1. Open with a realistic component that is **mostly correct** — the bug must hide in plain sight.
2. Show the failure in ≤ 15 lines. Make it concrete: a socket, a timer, an observer, a stale list, a lost edit.
3. Walk through the three fixes a developer tries first, in order. Each gets a one-line diff or 3–8 line snippet and a sentence on why it fails.
4. State the real tension in one bold sentence: the two things the developer needs from one value, and why each naive tool gives up one of them.
5. Introduce the subject's full code (≤ 15 lines) as the resolution.

### `## The Mental Model`

- **One** physical metaphor, carried all the way through (mailbox, receipt, switchboard — pick one and commit).
- 3 bullets mapping the metaphor to the implementation: identity, update timing, read timing.
- 2 direct consequences for the reader.
- One memorable line in italics.

### `## How to Use It`

1. Setup first: file tree, then every file in full, then the import line and the alias caveat.
2. 3–4 usage patterns. Each needs:
   - a scenario title in plain language,
   - a compilable 8–20 line snippet,
   - one sentence on the payoff.
3. One anti-pattern marked `❌` with a one-line explanation.

### `## When to Use It`

- 3 bullets that must **all** be true before reaching for it.
- A 6-row "don't reach for it" table: situation → better tool.
- One smell test in a sentence.

### `## How It Works Under the Hood`

- 3–5 numbered decisions, each with the relevant line(s) and the reasoning. Cover:
  - why the identity is stable,
  - why the update happens at this exact phase (commit vs render vs paint),
  - what breaks with the naive alternative,
  - effect ordering and the edge case it creates,
  - the cost (allocations, writes, retained references).
- A render/commit **timeline table** showing the value at each phase, including a discarded render.
- A server-rendering note.
- A comparison to built-in alternatives (e.g. `useEffectEvent`), stated as a limitation, not a rivalry.

### `## Conclusion`

One paragraph restating the core tradeoff, 3 bullets summarizing what the reader should retain, one closing line about where the tool belongs and where the boring answer wins.

## 6. Social media block

After a `---`, add `## Social Media Posts`, then:

```markdown
_Replace `https://example.com/<slug>` with the published URL before posting._
```

### LinkedIn

- 120–200 words, 6–8 short paragraphs.
- Paragraph 1: one sentence naming the exact pain.
- Paragraph 2: the failed fix and the new symptom it creates.
- Paragraph 3: the real tension ("same bug in both directions").
- Paragraph 4: hint at the fix's shape in one sentence. **No code. No API name required.**
- Paragraph 5: what the article covers (bullets-in-prose, not a list).
- Link on its own line, then 3 hashtags such as `#React #TypeScript #FrontendEngineering`.

### X (Twitter)

- ≤ 280 characters including the URL (a URL counts as 23).
- Line 1: symptom. Line 2: different symptom, same cause.
- Line 3: "Same bug: …".
- Line 4: fix hint, one clause.
- Line 5: what the breakdown covers + 👇 + link.
- Verify the count; put the count in the posting notes.

### Posting notes

- Character count and URL weighting.
- Why the posts stop at the symptom (details live in the article).
- Pairing instruction with the social thumbnail.

**Do not** put implementation details, code, or the full mechanism in either post.

## 7. Thumbnail block

After a `---`, add `## Thumbnail Prompts`. Derive **one** visual metaphor from the tutorial's mental model so article, feed post, and preview read as one campaign.

State explicitly: each prompt contains both the **text content** and the **graphic content**, and if the model garbles lettering, swap the quoted copy for "an empty text area" and typeset the same copy from the tables.

### Main blog thumbnail — 16:9

- Canvas 1600×900, 64px safe margins.
- **Text content** table: element, exact copy, treatment (size, weight, color hex, tracking, placement).
- **Graphic content** bullets: hero object, motion, background, palette with hex values, lighting, layout split.
- **Prompt (copy-paste):** one paragraph that includes the graphic description **and** each exact string in quotes. End with "no logos, no people, no watermark, no extra words."
- **Avoid:** a compact negative prompt targeting extra/misspelled words, not text itself.

### Social media thumbnail — 1:1

- Canvas 1080×1080; keep the subject centered so it survives a 16:9 crop.
- Same four parts. Headline is 2–4 words, split across two lines, one line in the accent color.
- Type occupies the top third; the subject owns the lower two-thirds.

### Model flags

One closing line: append the generator's aspect flag (`--ar 16:9`, `--ar 1:1`), prefer models with strong text rendering, check every glyph — especially the domain — before shipping.

## 8. Adaptation by source type

| Source file    | The "problem" to open with                                                                         |
| -------------- | -------------------------------------------------------------------------------------------------- |
| Hook           | A lifecycle bug the hook prevents: stale closure, reconnect storm, lost scroll, duplicated request |
| Component      | A UX or state bug: flicker, focus loss, broken keyboard nav, layout jump                           |
| Utility        | An edge case: timezone drift, precision loss, unsafe parse, encoding mismatch                      |
| Module/service | An operational failure: race condition, retry storm, unbounded queue, partial write                |
| Config/tooling | A failure mode: wrong cache key, missed invalidation, silent build drift                           |

If the source is tiny, do not pad the tutorial — deepen the problem narrative and the under-the-hood reasoning instead.

## 9. Self-check before returning

Run this list against your draft. Fix anything that fails; do not report the checklist.

- [ ] No `@workspace`, `packages/`, `apps/`, monorepo or internal app names anywhere.
- [ ] File tree uses `src/`; imports use `@/`; setup includes every required helper file.
- [ ] Every type and variable used in a snippet is defined in that snippet or the setup.
- [ ] Section order matches this prompt exactly; separators exist before social and thumbnails.
- [ ] Problem section has a concrete bug, three failed fixes, and one bold tension sentence.
- [ ] Mental model uses exactly one metaphor and is referenced by the thumbnail concept.
- [ ] Under-the-hood includes a phase timeline, a cost note, and an SSR note.
- [ ] No invented React APIs, metrics, or repo context.
- [ ] LinkedIn is 120–200 words; X is ≤ 280 characters; both end with the dummy link.
- [ ] Both thumbnail prompts quote the exact text strings and describe the graphics.
- [ ] Filename is problem-first kebab-case; content is Prettier-clean markdown.
- [ ] Response contains the file content only.

## 10. Copy-paste kickoff

```text
Source file: <attach or path>

Using the generator in this file, write the standalone tutorial doc.
Output one markdown file named <problem-first-slug>.md containing:
1. the tutorial,
2. the LinkedIn + X posts,
3. the 16:9 blog thumbnail prompt and 1:1 social thumbnail prompt.

Follow the section order and the self-check list exactly.
```
