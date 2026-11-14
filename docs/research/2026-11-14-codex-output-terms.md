# Research: may Codex-generated assets ship in a Steam game and sit in a public repository?

Date: 2026-11-14. Status: research note (not canon; not legal advice). Everything below was read on the cited primary page on this date unless marked **(snippet)** (seen only in a search result or a secondary summary, so verify before relying on it) or **(not read)**. Items for a lawyer are collected in section 6.

Question: may images (and other output) that OpenAI Codex generates on a ChatGPT or Codex plan be used commercially in a game sold on Steam and kept in a public repository, under what terms, and what disclosure does Steam require? Context: 0048 (Codex makes the art and non-speech audio through `CODEX.md`, on the owner's plan, no API key), 0014 (PolyForm Noncommercial public repository), 0037 and 0039 (commercial; AI never in the headline), 0038 (no live AI on Steam).

## Summary

1. **Ownership and commercial use: yes, by contract.** OpenAI's consumer terms and its business agreement both say the user owns the output and OpenAI assigns whatever rights it has. The terms contain no "non-commercial" limit on images. The one non-commercial clause I found covers ChatGPT *voice* output, not images or sound effects. *Confidence: high* for the wording, *medium* for what it is worth (see 2).
2. **Copyright: the contract cannot give what the law does not.** Both OpenAI documents hedge ("to the extent permitted by applicable law", "if any"). The US Copyright Office says purely prompted output is not protected; human selection, arrangement and modification can be. So the game's Codex images may be free for anyone to copy, which matters more because the repository is public. *Confidence: high* on the Office's position, *low* on how a court would treat any given image.
3. **Steam: allowed, with a disclosure.** AI-made art and sound that ship in the game are "Pre-Generated" content: disclosed in the Content Survey, reviewed like any other content, and shown in part on the store page. Valve holds the developer to a promise that the game has no illegal or infringing content. *Confidence: high.*
4. **Three terms need a lawyer's reading before the first delivery ships:** uploading real people's photographs as references, scripted use of the image tool, and OpenAI's 2022 publication policy (section 6).

## 1. OpenAI: ownership, commercial use and limits

| Point | What the primary page says | Confidence |
|---|---|---|
| Consumer ownership | "you (a) retain your ownership rights in Input and (b) own the Output", "to the extent permitted by applicable law"; OpenAI will "assign to you all our right, title, and interest, if any" in Output. [OAI-ToU] | High |
| Business ownership | Customer "retains all ownership rights in Input; and (b) owns all Output"; OpenAI assigns its rights "if any". Same substance as the consumer terms. [OAI-OSA §4.1] | High |
| Which terms apply to Codex | Signing in to Codex with a ChatGPT account means the ChatGPT Terms of Use apply, or the online services agreement for Business, Enterprise and Edu users. [OAI-CodexPlan] | High |
| Images vs text | No separate ownership rule for images. The terms say "output may not be unique": similar images may go to other users, and the assignment excludes their output. [OAI-ToU], [OAI-OSA §4.4] | High |
| Commercial use | No non-commercial limit on images or text anywhere in the Terms of Use, Service Terms or Services Agreement. The one such limit is "ChatGPT Voice Output is for non-commercial use only" (voice conversations). [OAI-ST §8] | High (absence found on three documents; not a legal clearance) |
| Credit | The Codex image-generation page says "Credit is optional. You do not need to credit OpenAI". [OAI-CodexImg] | High |
| Indemnity | Output IP indemnity is written for API customers (Service Terms §1) and Enterprise customers (§3(b)), not consumer plans. Business is not named in §3(b) (it is named in §3(a) only for administration). The indemnity also excludes output "used in combination with products or services not provided by" OpenAI and claims of "violation of trademark or related rights". [OAI-ST §1, §3] | Medium (my reading of the clause scope; confirm) |
| Training on your content | Consumer: OpenAI may use Content to "develop, and improve" services unless the user opts out. Business, Enterprise and Edu: not used by default. [OAI-ToU], [OAI-CodexPlan] | High |
| Plans with image generation | Codex is "included across ChatGPT plans, including Free and Go" [OAI-CodexPlan], but "Image generation isn’t available on the Free plan" [OAI-CodexPricing]. Built-in generation "uses gpt-image-2"; with an API key "API pricing applies to image generation instead of included ChatGPT usage limits". [OAI-CodexImg], [OAI-CodexPricing] That matches `CODEX.md`'s rule to leave `OPENAI_API_KEY` unset. | High |
| Code output | Codex output "may be subject to third party licenses, including, without limitation, open source licenses". [OAI-ST §4] Relevant to any audio produced by generated code. | High |
| Provenance | "Images generated with ChatGPT, Codex, or the OpenAI API include both signals" (C2PA Content Credentials and SynthID watermark). Audio from ChatGPT or the API carries a SynthID watermark. Signals "do not guarantee that content is accurate, unedited, legally owned". [OAI-Prov] | High |

Consumer and business differ in training use, the administrator controls, and indemnity, not in who owns the output. I could not tell which plan the owner has; that decides the training and indemnity rows.

### Limits relevant to this game

- **Violence in a historical war.** The Usage Policies prohibit "terrorism or violence, including hate-based violence" under "Protect people", and "exposing minors to age-inappropriate content, such as graphic ... violent content". [OAI-UP] Nothing there bans depicting a historical war, and I found no war exception either. Whether the image model refuses a given battle scene is a product-level behaviour I did not test. The 2026-11-04 Images system card was not read. *(not read)*
- **Real people.** Three texts bear on this, none written for the dead:
  - The Usage Policies forbid "use of someone’s likeness, including their photorealistic image or voice" without consent "in ways that could confuse authenticity". [OAI-UP] The clause aims at deception. Illustrated portraits clearly labelled as such sit further from it than a fake "new photograph" of Lincoln would.
  - Service Terms §6 says you may not use Visual Capabilities "to reproduce the likeness of any person without express consent and all necessary rights". [OAI-ST §6] "Visual Capabilities" are image *inputs*. Uploading a public-domain photograph of Lincoln as a reference and asking for his likeness is arguably in scope. Consent cannot be had from a man who died in 1865, and whether "necessary rights" exist for a public-domain photograph is a legal question.
  - OpenAI's own Codex page advises: "confirm that you have permission to use their likeness". [OAI-CodexImg]
  `CODEX.md` currently lets Codex depict real people "only from their cited public-domain photographs", which is the route these three texts make least clear.
- **Programmatic use.** The Terms of Use bar users from "Automatically or programmatically extract data or Output" and from circumventing "rate limits or restrictions". [OAI-ToU] Using Codex's own image tool in a Codex client is the documented route ([OAI-CodexImg] describes `$imagegen`). A custom script that calls the image backend with the account's sign-in token is not described anywhere, and the clause could be read against it. *Medium.*
- **Do not claim human authorship.** The Terms of Use bar users from representing "that Output was human-generated when it was not". [OAI-ToU]
- **Publication policy.** The Sharing & Publication Policy (updated 2022-11-14, incorporated by the Terms of Use) tells users sharing generations to attribute content to their name or company and to "Indicate that the content is AI-generated in a way no user could reasonably miss". [OAI-SPP] It is written for social media, livestreams and API-written books, and refers to a "Content Policy" that has since become the Usage Policies. Whether it reaches a game's art or a public repository is unclear. The recipe files and a store-page disclosure would meet its purpose either way.
- **Terms move.** The Service Terms page reads "Updated: November 13, 2026". A new Usage Policies version is "Effective: November 20, 2026" (it adds model-training restrictions and child-safety wording; the lines quoted above are unchanged from the 2025-10-29 version). Pin the terms in force at each delivery.

## 2. Copyright status of AI-generated images

**The OpenAI documents say nothing about whether the images are copyrightable.** Both hedge ownership with "to the extent permitted by applicable law" and "if any", and §4.4 of the Services Agreement says output may repeat across users. A watermark "does not establish who authored or owns the content". [OAI-Prov] *High.*

**US Copyright Office** (public guidance; what the sources say, not advice):
- Part 2 of its AI report (29 January 2025) concludes that generative AI output is protected "only where a human author has determined sufficient expressive elements". That can include "a human-authored work ... perceptible in an AI output" or "creative arrangements or modifications of the output, but not the mere provision of prompts". Using AI to assist, or including AI material in a larger human work, "does not bar copyrightability". [CO-News1060] *High* (press release read; **the report PDF itself could not be read**, see Sources).
- The March 2023 registration guidance (88 Fed. Reg. 16190) says that with current tools "these prompts function more like instructions to a commissioned artist" and the machine decides how they are carried out. [CO-FR2023]
- The same guidance: applicants have a "duty to disclose the inclusion of AI-generated content" in a work submitted for registration. AI-generated content "more than de minimis should be explicitly excluded". A work combining human text with Midjourney images was registered as a whole, but "the individual images themselves could not be protected by copyright". [CO-FR2023]
- Court position **(snippet)**: the D.C. Circuit held that copyright needs a human author (*Thaler v. Perlmutter*), and the Supreme Court denied review on 2 March 2026 without comment, per law-firm summaries. *Allen v. Perlmutter*, a refused registration for an AI-assisted work, is reported as pending in D. Colo. I did not read the docket or the opinions. Part 3 of the Office's report (training data) is still pre-publication. [CO-AI] *(not read)*

What this means for this project, as a reading of the sources and not advice: an image Codex produces from a prompt alone probably has no copyright owner in the US, so nobody could stop copying of it. The game's selection, arrangement, layout and any human editing could be protected. A lawyer should confirm how that applies to the first deliveries.

## 3. Steam's rules for AI-generated content

| Point | What Valve's primary page says | Confidence |
|---|---|---|
| Scope | The survey is about AI "in creating content that ships with your game, and is consumed by players", including "artwork, sound, narrative, localization, etc."; "Efficiency gains through the use of these tools is not the focus". [Steam-CS] | High |
| Pre-generated | Content made with AI tools during development. It is judged "the same way we evaluate all non-AI content", against the developer's promise under the Steam Distribution Agreement that the game "will not include illegal or infringing content" and "will be consistent with your marketing materials". [Steam-CS], [Steam-2024] | High |
| Live-generated | Content created while the game runs. It adds a duty to tell Valve "what kind of guardrails you're putting on your AI". Players get an in-overlay report button. [Steam-CS], [Steam-2024] Out of scope here (0038). | High |
| Store page | Valve will "include much of your disclosure on the Steam store page". [Steam-2024] Community posts show it under a heading "AI Generated Content Disclosure" in the About-this-game area. **(snippet)** The Steamworks store-page documentation page I read (`/doc/store/page`) does not mention AI. | High (that it is shown) / low (heading and placement) |
| Editing later | Once a build and page are approved, "some questions in the survey cannot be edited without first contacting Steam Support". [Steam-CS FAQ] | High |
| Disclosure is not clearance | Products "must adhere to the content rules, regardless of whether it is disclosed". [Steam-CS FAQ] | High |
| January 2026 rewrite | Press coverage says Valve narrowed the form in January 2026 to player-consumed content, exempting behind-the-scenes tools. **(snippet)** The current Content Survey wording above is consistent with that. I did not find Valve's announcement of the change. | Medium |

Reading for this game:
- Codex-made art (and any sound) is pre-generated, player-consumed content, so it must be disclosed. This agrees with 0048 and 0039.
- Code written with Claude Code or Codex is development efficiency, not player-consumed content, so on Valve's wording it needs no disclosure. AI-drafted narrative text in packs is player-consumed (0039 already covers it).
- Valve judges the output the same as human work. Look-alike risk (a famous painting, a brand, a character) counts against the developer's promise, and OpenAI's indemnity does not cover consumer plans (section 1).

## 4. Recommendations for `CODEX.md` (to add; not edited here)

1. **Recipe fields.** Add to each `.recipe.json`: plan type (Free/Go/Plus/Pro/Business), client and version, model (`gpt-image-2`), date, whether `OPENAI_API_KEY` was unset, and a `human_edits` list (cropping, compositing, repainting, arrangement by a person). The Office counts human arrangement and modification, and the recipe is the evidence.
2. **Provenance.** Never strip C2PA or SynthID, and never describe an asset as hand-made. State that conversions (resize, PNG to WebP) may drop the C2PA metadata, so the recipe is the record.
3. **Real people.** Until a lawyer answers, request that the first batches avoid AI-rendered likenesses. Use the cited public-domain photograph itself, with ordinary non-AI cropping and restoration, for portraits. If a likeness is rendered, make it an illustration that cannot be mistaken for a photograph, and say so in the recipe.
4. **Run Codex's tool, not a script.** Generate through the built-in image tool in a Codex client. Do not script the account's sign-in token against the image backend, do not loop around a limit, and stop at the plan's limit as the file already says.
5. **Audio.** Say which tool made each sound. Codex has no documented sound-effects model; audio from code the repository runs is code output (subject to the §4 third-party-licence warning), and audio from an OpenAI audio model carries a SynthID watermark. Do not use ChatGPT or Codex voice output at all ("non-commercial use only"), and no speech.
6. **Look-alike check.** Add "no resemblance to a recognisable existing artwork, brand or character" to the acceptance criteria the reviewer applies. This is Valve's "infringing content" promise in practice.
7. **Re-check dates.** Before the first delivery ships and again before Steam submission, re-read the Terms of Use, Service Terms and Usage Policies (changes on 2026-11-13 and 2026-11-20). Save a dated PDF of each outside the repository.
8. **Repository licence note.** Put a note beside `art/`: the files are AI-assisted, the owner claims whatever rights exist, and the PolyForm licence (0014) applies only to the extent those rights exist.

## 5. Recommendations for the store page

1. Complete the Content Survey AI section as Pre-Generated: artwork from Codex (gpt-image-2), sound if any, and AI-drafted narrative text if any (0039). Live-Generated: none on Steam (0038).
2. Draft the disclosure wording in the repository beforehand, in plain, specific words: which asset categories were AI-assisted; that portraits of real people are public-domain photographs, not AI likenesses (if rec. 3 is adopted); that the game's playable content uses no live AI. Valve prints "much of" it, and later edits need Support.
3. Keep it out of the headline and the trailer text (0039), but never understate it. Valve reviews the survey against the build and the page.
4. Keep the recipe folder as a manifest of AI assets. It answers a Valve question or a DMCA complaint quickly.
5. Make marketing images match the shipped art ("consistent with your marketing materials").
6. Settle this before the store page goes up, together with 0038's question to Valve (0039 Consequences).

## 6. For a lawyer to confirm (owner's spending call, 0037; one short consultation would cover all of it)

1. What OpenAI's assignment ("if any") is worth for images with no copyright, and how to protect the game's art in practice (arrangement, editing, trade dress).
2. Whether uploading public-domain photographs of real people as references breaches Service Terms §6 or the Usage Policies' likeness line, and what the exposure is (account action).
3. Whether scripted use of the image tool falls under "programmatically extract ... Output".
4. Whether the 2022 Sharing & Publication Policy binds a game's art, a public repository or a store page.
5. Which agreement applies (consumer or Business), the absence of an output indemnity, and who bears an infringement claim against a Steam game; also Valve's Steam Distribution Agreement text, which I did not read. *(not read)*
6. How the PolyForm Noncommercial licence (0014) works over files that may have no copyright, and whether production-resolution art should stay out of the public repository.
7. Non-US law (EU, UK) for a game sold worldwide. I looked only at US sources.
8. Training-data claims against image models (Copyright Office report Part 3; pending litigation). I did not research this.

## Not done or not verified

- **Copyright Office Part 2 report text.** The browser pane turned the PDF URL into a download dialog, and the fetch tool returned a damaged copy (221 of roughly 2,600 objects). Everything attributed to Part 2 comes from the Office's press release.
- Steam store-page heading and placement (community posts only), the January 2026 Steam change (press only), the Thaler outcome and Allen status (law-firm summaries), model-level refusals for historical violence or real people (not tested), the Images system card, and the Steam Distribution Agreement.

## Sources (all read 2026-11-14)

| Tag | URL | Notes |
|---|---|---|
| [OAI-ToU] | https://openai.com/policies/terms-of-use/ | Effective 2026-01-01 |
| [OAI-OSA] | https://openai.com/policies/services-agreement/ | Updated 2025-12-01, effective 2026-01-01 |
| [OAI-ST] | https://openai.com/policies/service-terms/ | Updated 2026-11-13 |
| [OAI-UP] | https://openai.com/policies/usage-policies/ and https://openai.com/policies/usage-policies/revisions/2025-10-29/ | New version effective 2026-11-20; prior version in force until then |
| [OAI-SPP] | https://openai.com/policies/sharing-publication-policy/ | Updated 2022-11-14 |
| [OAI-CodexPlan] | https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan | "Updated: 10 days ago" |
| [OAI-CodexImg] | https://learn.chatgpt.com/docs/image-generation | Codex image generation |
| [OAI-CodexPricing] | https://learn.chatgpt.com/docs/pricing (reached from developers.openai.com/codex/pricing) | Image limits and Free-plan note |
| [OAI-Prov] | https://help.openai.com/en/articles/8912793-c2pa-and-synthid-in-openai-generated-images | "Updated: 17 days ago" |
| [CO-AI] | https://www.copyright.gov/ai/ | Index; Part 3 still pre-publication |
| [CO-News1060] | https://www.copyright.gov/newsnet/2025/1060.html | Press release for Part 2, 2025-01-29 |
| [CO-FR2023] | https://www.federalregister.gov/documents/2023/03/16/2023-05321/copyright-registration-guidance-works-containing-material-generated-by-artificial-intelligence | 88 Fed. Reg. 16190 |
| [CO-Part2] | https://www.copyright.gov/ai/Copyright-and-Artificial-Intelligence-Part-2-Copyrightability-Report.pdf | **Not read** (download only; saved copy damaged) |
| [Steam-CS] | https://partner.steamgames.com/doc/gettingstarted/contentsurvey | Content Survey, incl. FAQ |
| [Steam-2024] | https://steamcommunity.com/groups/steamworks/announcements/detail/3862463747997849619 | Valve's "AI Content on Steam", posted 2024-01-09 (body read from the page's embedded data) |
| Steam store-page doc | https://partner.steamgames.com/doc/store/page | No AI wording found |
| (snippet) community | https://steamcommunity.com/app/1601570/discussions/0/604160267118483770/ and related threads | Heading "AI Generated Content Disclosure" |
| (snippet) press | https://www.pcgamer.com/software/ai/steam-updates-ai-disclosure-form-to-specify-that-its-focused-on-ai-generated-content-that-is-consumed-by-players-not-efficiency-tools-used-behind-the-scenes/ and gamingonlinux.com coverage | January 2026 change |
| (snippet) courts | https://www.mayerbrown.com/en/insights/publications/2026/03/supreme-court-denies-review-in-ai-authorship-case and https://www.bakerdonelson.com/supreme-court-denies-certiorari-in-thaler-v-perlmutter-ai-cannot-be-an-author-under-the-copyright-act | *Thaler* cert denied 2026-03-02; *Allen* pending |

## Findings outside my scope

- **A new open question.** 0014's PolyForm Noncommercial licence over files that may have no copyright, in a public repository, is a question for `docs/OPEN_QUESTIONS.md`, with 0048's Git LFS question (production art outside the public repository).
- **Tooling.** Fetching a PDF URL in the built-in browser pane opens a save dialog for the user, and WebFetch's saved binary copy is not usable. Research lanes should use the Fetch agent or an HTML source for PDFs.
- **Steam's January 2026 narrowing** means code written with AI needs no disclosure, so 0039's "covers pre-generated text too" is the correct line for narrative text only.
