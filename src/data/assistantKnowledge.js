// What the in-browser assistant knows about Deep, shared by the main route
// (src/pages/v2/AskSection.jsx) and the classic one (src/components/Ask.jsx).
//
// The model behind this chat has 1.5 billion parameters and runs on the
// visitor's own GPU, which rules out the usual answer to a model that drifts,
// a bigger model. What it is sensitive to is how much it has to read. Handed
// the whole brief at once it answered a question about Deep's roles by moving
// facts between employers and inventing figures that were never in front of
// it. Handed only the blocks the question is actually about, it quotes them
// back accurately.
//
// So the brief is stored in labelled blocks and assembled per question. Every
// number here also appears on the page, so the two can never disagree.

const IDENTITY = `You are Erevna, the assistant on Deep Shahane's portfolio. Visitors come here to ask about Deep. You are not Deep, and no question is ever about you. Answer from the facts below, always writing about Deep in the third person. Keep answers short, concrete and professional.

HOW TO READ A QUESTION
Every question is about Deep, including the ones that say "you" or "your". Read "your experience" as "Deep's experience", "your publications" as "Deep's publications", "your education" as "Deep's education".
Never answer that you have no experience, no education, no publications or no projects, and never describe yourself as a language model. You are not the subject of the question. Deep is, and his record is below.`;

const WHO = `WHO
Deep Shahane, Production AI Engineer. 3+ years across agents, document AI, evals, model serving and full-stack SaaS. What he cares about most: AI output a customer can trust and check.`;

const CURRENT = `CURRENT ROLE
Founding Engineer, NILA Solutions Inc., May 2026 to present, remote. He is an engineer there, he did not found the company.
- An AI-native tax platform, live with real CPA firms.
- Owns the full stack: frontend, backend, AI infrastructure and multi-tenant SaaS with row-level security across 25 tables.
- Built agentic document intelligence with rule-based parsers and a 5-check validator that catches errors as small as a $15 taxable income.
- Built an offline eval harness of 555 tests over 34 real documents, pinning 152 known failures.
- Improved agent accuracy 22% and cut latency from 4.5 seconds to 900 milliseconds with Claude model routing, at under 1 cent per turn.
- Hybrid RAG with Voyage embeddings, pgvector and reciprocal rank fusion.
- Nothing exports until a CPA approves it.`;

const RESEARCH = `RESEARCH
Research Assistant, SAIR Lab, University at Buffalo, Aug 2024 to present, hybrid.
- Built a 2D Gaussian Splatting SLAM system, 16x faster than a 3DGS baseline (39 vs 2.4 FPS), with analytical SE(3) Jacobians and custom CUDA backward kernels.
- Prototyped VLM inference with Florence and InstructBLIP2.
- Serves models with vLLM and TensorRT-LLM at 2.4x throughput and 38% less memory.`;

const EARLIER = `EARLIER ROLES
AI Engineer, Niti Pharma, May 2025 to Apr 2026, remote.
- Sole engineer on the company's first AI platform.
- Cut daily manual work from 8 hours to under 2 hours.
- Cut error rate from 20% to 4%.
AI Engineer, Bragr, Aug 2024 to Jan 2025.
- Cut response latency from 30 seconds to 10 seconds.
- Built a reusable eval and monitoring service.
- Added role-based access control.
Software Engineer, Niti Pharma, Dec 2021 to Feb 2023.
- Improved demand forecasting 18% across more than 10,000 SKUs with MLflow.
- Built Airflow pipelines.
- Shipped OCR over more than 4,000 documents, which cut manual data entry by 70%.`;

const PROJECTS = `PROJECTS
Dresser: AI outfit recommender with retrieval and evals. CLIP top-3 accuracy 73% to 96%, MRR 0.690 to 0.905, backed by 551 tests.
WarDream: behaviour-cloning game agent. 67.2% win rate vs 57.2% baseline.
Agent Guard Memory: MCP memory server for AI agents, published on PyPI.
PARS Simulator: cross-entropy method search, +28% over baseline.
2DGS SLAM: real-time 3D reconstruction, 16x faster than a 3DGS baseline (39 vs 2.4 FPS).`;

const PUBLICATIONS = `PUBLICATIONS
Car Sales Forecasting Using ML Time Series Algorithm. Springer LNNS, 2023.
Music Fiesta the Recommendation System. IEEE Xplore, 2022.
Gaussian Splatting for Advanced Rendering. University at Buffalo Technical Report 2025-09, 2025.
All three are papers. None of them is a book.`;

const EDUCATION = `EDUCATION
MS Computer Science, University at Buffalo.
BE Computer Engineering, Vidyalankar Institute of Technology, Mumbai University.`;

const SKILLS = `SKILLS
AI and LLMs: agentic AI, multi-agent systems, RAG, LLM evaluation, prompt engineering, model routing, MCP, LangGraph, Anthropic Claude, vLLM, TensorRT-LLM, LoRA.
ML and vision: PyTorch, computer vision, 3D reconstruction, SLAM, Gaussian Splatting, VLMs, CLIP, MLflow.
Backend and infra: Python, FastAPI, PostgreSQL, pgvector, Docker, Airflow, C++, CUDA.
Frontend: Next.js, TypeScript, React.`;

const RULES = `RULES
Everything in the blocks above is available to you. Answer from them whenever the question is about Deep's education, experience, roles, projects, publications or skills.
If, and only if, the answer is not written above, do not guess it. Reply exactly: "I do not have that detail. You can reach Deep at esotericdeep@gmail.com." That reply is for personal questions, such as a favourite film, an age, a salary, a location or an opinion.
Write about Deep, never about yourself.
Use only the facts above. Never add anything that is not written here.
Quote every number and title exactly as written above. Reuse the wording rather than rephrasing it: rephrasing is how numbers get corrupted.
Each fact above belongs to the role or project it is listed under. Never move a fact from one to another.
List every item in a block you are asked about, no more and no fewer.
Asked about Deep's experience, name the current role at NILA Solutions first and work backwards from there.
Never invent papers, co-authors, companies, dates, numbers or job titles.
Answer in at most four sentences. When the answer covers more than two roles, projects or papers, give a bullet list of one short line each and nothing else.
Do not close with a comment on how significant or impressive the work is. State the facts and stop.`;

// Which blocks a question needs. Order here is the order they appear in the
// assembled prompt, so a question about work history reads the current role
// first. A question matching nothing gets everything, which is the old
// behaviour and the safe default.
const PUBLICATIONS_TOPIC = {
  blocks: [PUBLICATIONS],
  test: /\b(publication|publications|paper|papers|publish\w*|journal|conference|ieee|springer|cite|citation\w*)\b/i,
};

// The lab block earns its place only when the question is about the lab work
// itself. "Research publications" is a question about the papers.
const LAB_WORDS = /\b(lab|sair|slam|splatting|gaussian|cuda|vlms?|phd|florence|instructblip2)\b/i;

const TOPICS = [
  {
    blocks: [CURRENT, RESEARCH, EARLIER],
    test: /\b(experien\w*|work\w*|job|jobs|role|roles|career|employ\w*|compan\w*|position|nila|bragr|niti|founding)\b/i,
  },
  {
    blocks: [RESEARCH, PUBLICATIONS],
    test: /\b(research\w*|lab|sair|academic|phd|slam|splatting|gaussian|cuda|vlm|vlms)\b/i,
  },
  PUBLICATIONS_TOPIC,
  {
    blocks: [PROJECTS],
    test: /\b(project|projects|built|build|portfolio|dresser|wardream|pars|demo|ship|shipped)\b/i,
  },
  {
    blocks: [EDUCATION],
    test: /\b(education\w*|degree|degrees|study|studied|studies|universit\w*|college|school|graduate\w*|masters?|bachelors?|buffalo|vidyalankar|coursework)\b/i,
  },
  {
    blocks: [SKILLS],
    test: /\b(skill|skills|tech|technolog\w*|stack|languages?|framework\w*|tools?|proficien\w*|expert\w*|know|familiar|python|react|pytorch)\b/i,
  },
];

const EVERYTHING = [CURRENT, RESEARCH, EARLIER, PROJECTS, PUBLICATIONS, EDUCATION, SKILLS];

/**
 * Assemble the system prompt for one question, carrying only the blocks that
 * question is about. See the note at the top of this file for why.
 */
export function buildSystemPrompt(question) {
  const asked = question || '';
  const matched = TOPICS.filter((topic) => topic.test.test(asked));
  const blocks = [];
  for (const topic of matched) {
    for (const block of topic.blocks) if (!blocks.includes(block)) blocks.push(block);
  }
  // Asked about "research publications" the model was handed the lab block
  // as well, and answered with two of the three papers instead of three.
  // Every extra block costs accuracy, so the word research only earns the
  // lab block when the question is about the lab work itself.
  if (matched.includes(PUBLICATIONS_TOPIC) && blocks.includes(RESEARCH) && !LAB_WORDS.test(asked)) {
    blocks.splice(blocks.indexOf(RESEARCH), 1);
  }
  const body = blocks.length ? blocks : EVERYTHING;
  return [IDENTITY, WHO, ...body, RULES].join('\n\n');
}

// Polite request frames aimed at the assistant rather than at Deep. Stripped
// first so "can you tell me about your projects" does not come out as
// "can Deep tell me about Deep's projects".
const REQUEST_FRAME = /^\s*(?:can|could|would|will)\s+you\s+(?:please\s+)?/i;

// Auxiliaries come before the bare pronouns so "are you" resolves to "is Deep"
// rather than "are Deep".
const SECOND_PERSON = [
  [/\bare\s+you\b/gi, 'is Deep'],
  [/\bwere\s+you\b/gi, 'was Deep'],
  [/\bdo\s+you\b/gi, 'does Deep'],
  [/\bdid\s+you\b/gi, 'did Deep'],
  [/\bhave\s+you\b/gi, 'has Deep'],
  [/\baren'?t\s+you\b/gi, "isn't Deep"],
  [/\bhaven'?t\s+you\b/gi, "hasn't Deep"],
  [/\byou'?re\b/gi, 'Deep is'],
  [/\byou'?ve\b/gi, 'Deep has'],
  [/\byourself\b/gi, 'Deep'],
  [/\byours\b/gi, "Deep's"],
  [/\byour\b/gi, "Deep's"],
  [/\byou\b/gi, 'Deep'],
];

/**
 * Name Deep in a question instead of addressing him.
 *
 * Asked "tell me about your publications" the model resolves "your" to
 * itself, reasons that an assistant has no publications, and says so, which
 * is how the chat came to deny work listed further down the same page.
 * Stating the rule in the system prompt is not enough at this size, so the
 * pronouns are resolved before the question reaches the model.
 *
 * Only the copy sent to the model changes. The transcript still shows exactly
 * what the visitor typed.
 */
export function asThirdPerson(question) {
  if (!question) return question;
  const stripped = question.replace(REQUEST_FRAME, '');
  const named = SECOND_PERSON.reduce((text, [pattern, name]) => text.replace(pattern, name), stripped);
  // Dropping a leading "can you" or swapping in "is Deep" can leave the
  // sentence starting lower case. Put the capital back.
  return named.charAt(0).toUpperCase() + named.slice(1);
}

/* ==========================================================================
   Reading the answer back
   ========================================================================== */

// The names worth picking out of a sentence: where Deep did the work, and
// what he built. Sorted longest first so "NILA Solutions Inc." wins over
// "NILA Solutions".
const NAMES = [
  'NILA Solutions Inc.',
  'NILA Solutions',
  'Niti Pharma',
  'Bragr',
  'SAIR Lab',
  'University at Buffalo',
  'Vidyalankar Institute of Technology',
  'Mumbai University',
  'Agent Guard Memory',
  'PARS Simulator',
  '2DGS SLAM',
  'WarDream',
  'Dresser',
  'Springer LNNS',
  'IEEE Xplore',
  'PyPI',
].sort((a, b) => b.length - a.length);

// Anything measured. Order matters: a pattern that can be a prefix of
// another goes second, so "May 2026" is matched before the bare year and
// "2.4 FPS" before anything that would take the number alone.
const FIGURES = [
  /\$\d[\d,]*(?:\.\d+)?/,
  /[+-]?\d+(?:\.\d+)?\s?%/,
  /\b\d+(?:\.\d+)?\s?x\b/,
  /\b\d+(?:\.\d+)?\s?(?:FPS|fps)\b/,
  /\b\d[\d,]*(?:\.\d+)?\s(?:seconds?|milliseconds?|hours?|minutes?)\b/,
  /\b\d[\d,]*\s(?:tests?|tables?|documents?|SKUs|failures?)\b/,
  /\b\d+\+\s?years?\b/,
  /\b\d{1,3}(?:,\d{3})+\b/,
  /\b0\.\d+\b/,
  /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s\d{4}\b/,
  /\b(?:19|20)\d{2}\b/,
];

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const NAME_RE = new RegExp(`(${NAMES.map(escapeRe).join('|')})`, 'g');
const FIGURE_RE = new RegExp(`(${FIGURES.map((r) => r.source).join('|')})`, 'g');

/**
 * Mark up the facts in a finished answer so it can be read at a glance.
 *
 * The model writes flat prose, and the whole point of this portfolio is the
 * evidence, so the figures and the places the work happened are the parts
 * worth seeing first. Doing it here rather than asking the model for
 * markdown keeps a one-and-a-half billion parameter model out of a job it
 * would do inconsistently, and it marks the hosted fallback's answers too.
 *
 * Names become bold, figures become code spans, and the terminal gives each
 * its own colour. Anything the model emphasised itself is left alone.
 *
 * @param {string} text
 * @returns {string} the same text with markdown emphasis added
 */
export function highlightFacts(text) {
  if (!text) return text;
  return text
    // Split on what is already marked up: odd indices are those spans, and
    // they pass through untouched so nothing is ever wrapped twice.
    .split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]*\]\([^)]*\))/g)
    .map((part, i) => {
      if (i % 2) return part;
      return part.replace(FIGURE_RE, '`$1`').replace(NAME_RE, '**$1**');
    })
    .join('');
}
