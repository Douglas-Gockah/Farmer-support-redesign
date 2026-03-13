import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, BorderStyle,
  AlignmentType, ShadingType, convertInchesToTwip,
  PageBreak, UnderlineType,
} from "docx";
import { writeFileSync } from "fs";

// ── helpers ────────────────────────────────────────────────────────────────
const GREEN  = "16A34A";
const LGRAY  = "F3F4F6";
const DGRAY  = "374151";
const WHITE  = "FFFFFF";
const AMBER  = "D97706";
const BLUE   = "2563EB";
const RED    = "DC2626";
const PURPLE = "7C3AED";
const GRAY   = "6B7280";

const h1 = (text) => new Paragraph({
  text,
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 360, after: 120 },
  border: { bottom: { color: "E5E7EB", size: 6, style: BorderStyle.SINGLE } },
});

const h2 = (text) => new Paragraph({
  text,
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 280, after: 80 },
});

const h3 = (text) => new Paragraph({
  text,
  heading: HeadingLevel.HEADING_3,
  spacing: { before: 200, after: 60 },
});

const h4 = (text) => new Paragraph({
  children: [new TextRun({ text, bold: true, size: 22, color: DGRAY })],
  spacing: { before: 160, after: 40 },
});

const body = (text, opts = {}) => new Paragraph({
  children: [new TextRun({ text, size: 21, color: opts.muted ? "6B7280" : DGRAY, ...opts })],
  spacing: { before: 40, after: 40 },
});

const bullet = (text, level = 0) => new Paragraph({
  children: [new TextRun({ text, size: 21, color: DGRAY })],
  bullet: { level },
  spacing: { before: 30, after: 30 },
});

const gap = (n = 1) => Array.from({ length: n }, () => new Paragraph({ text: "" }));

const coloured = (text, color) => new TextRun({ text, color, bold: true, size: 21 });

const badge = (label, bg, fg) => new TextRun({
  text: `  ${label}  `,
  color: fg,
  bold: true,
  size: 18,
  shading: { type: ShadingType.SOLID, fill: bg, color: bg },
});

// ── table builder ──────────────────────────────────────────────────────────
function makeTable(headers, rows, widths) {
  const headerCells = headers.map((h, i) =>
    new TableCell({
      children: [new Paragraph({
        children: [new TextRun({ text: h, bold: true, color: WHITE, size: 19 })],
        alignment: AlignmentType.LEFT,
      })],
      width: { size: widths?.[i] ?? Math.floor(9000 / headers.length), type: WidthType.DXA },
      shading: { type: ShadingType.SOLID, fill: "1F2937", color: "1F2937" },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
    })
  );

  const dataRows = rows.map((row, ri) =>
    new TableRow({
      children: row.map((cell, ci) =>
        new TableCell({
          children: [new Paragraph({
            children: [new TextRun({ text: String(cell ?? ""), size: 19, color: DGRAY })],
          })],
          width: { size: widths?.[ci] ?? Math.floor(9000 / row.length), type: WidthType.DXA },
          shading: { type: ShadingType.SOLID, fill: ri % 2 === 0 ? WHITE : "F9FAFB", color: "auto" },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
        })
      ),
    })
  );

  return new Table({
    rows: [
      new TableRow({ children: headerCells, tableHeader: true }),
      ...dataRows,
    ],
    width: { size: 9000, type: WidthType.DXA },
    borders: {
      top:          { style: BorderStyle.SINGLE, size: 4, color: "E5E7EB" },
      bottom:       { style: BorderStyle.SINGLE, size: 4, color: "E5E7EB" },
      left:         { style: BorderStyle.SINGLE, size: 4, color: "E5E7EB" },
      right:        { style: BorderStyle.SINGLE, size: 4, color: "E5E7EB" },
      insideH:      { style: BorderStyle.SINGLE, size: 4, color: "E5E7EB" },
      insideV:      { style: BorderStyle.SINGLE, size: 4, color: "E5E7EB" },
    },
  });
}

// ── stage block ────────────────────────────────────────────────────────────
function stageSection(num, title, color, purpose, cardContents, action, nextStage, extra = []) {
  return [
    h2(`Stage ${num} — ${title}`),
    new Paragraph({
      children: [
        new TextRun({ text: "Stage colour:  ", bold: true, size: 21 }),
        new TextRun({ text: `  `, shading: { type: ShadingType.SOLID, fill: color, color: color }, size: 21 }),
        new TextRun({ text: `  #${color}`, size: 21, color: "6B7280" }),
      ],
      spacing: { before: 40, after: 60 },
    }),
    body(`Purpose: ${purpose}`),
    h4("Card contents"),
    ...cardContents.map(c => bullet(c)),
    h4("Available action"),
    bullet(action),
    ...(nextStage ? [h4("Next stage"), bullet(nextStage)] : []),
    ...extra,
    ...gap(),
  ];
}

// ── document ───────────────────────────────────────────────────────────────
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: "Calibri", size: 21, color: DGRAY },
      },
    },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1",
        basedOn: "Normal", next: "Normal",
        run: { font: "Calibri", size: 32, bold: true, color: "111827" },
        paragraph: { spacing: { before: 480, after: 160 } },
      },
      {
        id: "Heading2", name: "Heading 2",
        basedOn: "Normal", next: "Normal",
        run: { font: "Calibri", size: 26, bold: true, color: "1F2937" },
        paragraph: { spacing: { before: 320, after: 100 } },
      },
      {
        id: "Heading3", name: "Heading 3",
        basedOn: "Normal", next: "Normal",
        run: { font: "Calibri", size: 23, bold: true, color: "374151" },
        paragraph: { spacing: { before: 240, after: 80 } },
      },
    ],
  },
  sections: [{
    properties: {
      page: {
        margin: {
          top: convertInchesToTwip(1),
          right: convertInchesToTwip(1),
          bottom: convertInchesToTwip(1),
          left: convertInchesToTwip(1),
        },
      },
    },
    children: [

      // ── Cover / header ────────────────────────────────────────────────
      new Paragraph({
        children: [new TextRun({ text: "Farmer Support Platform", font: "Calibri", size: 52, bold: true, color: "111827" })],
        spacing: { before: 0, after: 120 },
      }),
      new Paragraph({
        children: [new TextRun({ text: "Request & Disbursement Flow — Prototype Documentation", size: 30, color: GREEN, bold: true })],
        spacing: { before: 0, after: 200 },
        border: { bottom: { color: "D1FAE5", size: 12, style: BorderStyle.SINGLE } },
      }),

      makeTable(
        ["Field", "Detail"],
        [
          ["Document type",  "Product prototype walkthrough"],
          ["Prepared for",   "Product Team"],
          ["Scope",          "Request & Disbursement tab / pipeline flow"],
          ["Status",         "Prototype — for review and feedback"],
        ],
        [2200, 6800]
      ),

      ...gap(2),

      // ── 1. Overview ───────────────────────────────────────────────────
      h1("1. Overview"),
      body("The Farmer Support Platform is a case-management tool for processing and disbursing agricultural support (cash or ploughing services) to registered farmer groups across Ghana."),
      body("The prototype covers three top-level tabs:"),
      bullet("Requests & Disbursement  ◀  covered in this document"),
      bullet("Support Fulfilment"),
      bullet("Recoveries"),
      body("The Request & Disbursement flow manages the full lifecycle of a support application — from the moment a group's request is synced into the system, through scoring, approval, manager confirmation, and finance disbursement, all the way to a searchable records table."),
      ...gap(),

      // ── 2. Views ─────────────────────────────────────────────────────
      h1("2. Views Inside the Flow"),
      body("The tab supports two display modes, toggled from the top-right of the filter bar:"),
      ...gap(),
      makeTable(
        ["View", "Description"],
        [
          ["Pipeline", "Kanban-style board showing all active requests across 6 stages"],
          ["Records",  "Paginated table of all disbursed requests with a detail modal"],
        ],
        [2000, 7000]
      ),
      ...gap(),

      // ── 3. Pipeline board ─────────────────────────────────────────────
      h1("3. The Pipeline Board"),

      h2("Layout"),
      body("The board displays up to 6 columns side by side on desktop (≥ lg breakpoint). On mobile, a tab strip at the top lets the user switch between individual columns. Each column tab shows the stage name and item count (e.g. Pending Approval (4))."),

      h2("Column header"),
      body("Each column header chip shows:"),
      bullet("A coloured dot identifying the stage"),
      bullet("The stage label"),
      bullet("A count badge — pastel-tinted background with the stage colour as text"),
      bullet("An optional sort control (Pending Approval column only)"),

      h2("Scrolling"),
      body("Each column scrolls independently so one column with many cards does not affect the height of others. Column headers remain visible while scrolling."),
      ...gap(),

      // ── 4. Pipeline stages ─────────────────────────────────────────────
      h1("4. Pipeline Stages"),

      ...stageSection(
        1, "Synced Requests", "D97706",
        "Entry point. New farmer-group applications appear here after being synced from the field data collection system.",
        [
          "Group name (large, bold)",
          "Community · Farmer count",
          "Primary (1°) and Secondary (2°) support interest badges (e.g. Cash, Ploughing)",
          "Field agent name + submission date",
          "Reference ID (monospace)",
        ],
        "Score button — opens the Scoring Modal",
        "After scoring is confirmed → Pending Approval"
      ),

      ...stageSection(
        2, "Pending Approval", "2563EB",
        "Requests awaiting an approval officer to review the evidence and make an approval decision.",
        [
          "Group name, community, farmer count",
          "Support interest badges with rank indicators (1° / 2°)",
          "Score badge (colour-coded: red < 40, orange 40–60, green 60–80, dark green ≥ 80)",
          "Field agent + submission date",
          "Reference ID",
          "On-hold badge (amber, dashed card border) if the request has been placed on hold",
        ],
        "Review button — opens the Approval Modal",
        "Approve → Manager Confirmation  |  Reject → Rejected  |  Hold → stays here with on-hold styling",
        [
          h4("Score sorting"),
          body("The Pending Approval column header includes a sort toggle that cycles through:"),
          bullet("Default order"),
          bullet("Highest score first (↓)"),
          bullet("Lowest score first (↑)"),
          body("The active state is shown with a blue icon. A tooltip appears on hover.", { muted: true }),
        ]
      ),

      ...stageSection(
        3, "Rejected", "DC2626",
        "Terminal stage for requests that did not pass approval.",
        [
          "All standard fields",
          "Rejection reason shown in a red info box on the card",
          "Card rendered at reduced opacity (0.8)",
        ],
        "None — no CTA button",
        null
      ),

      ...stageSection(
        4, "Manager Confirmation", "16A34A",
        "The field agent / group manager confirms the approved support type and amount before the request proceeds to finance.",
        [
          "Group name, community, farmer count",
          "Approved support type badge",
          "Total approved value (e.g. GHS 12,500 for cash; 50 ac for ploughing)",
          "Score badge",
          "\"Awaiting manager confirmation\" italic note",
          "Field agent + date, Reference ID",
        ],
        "Confirm button — opens the Manager Confirmation Modal",
        "After confirmation → Pending Disbursement"
      ),

      ...stageSection(
        5, "Pending Disbursement", "7C3AED",
        "Finance team prepares and executes the mobile money (MoMo) transfer.",
        [
          "Group name, community, farmer count",
          "Score badge",
          "MoMo info box — MoMo number (monospace) and recipient name",
          "Field agent + date, Reference ID",
        ],
        "Disburse button — opens the Disbursement Modal",
        "After disbursement → Disbursed"
      ),

      ...stageSection(
        6, "Disbursed", "6B7280",
        "Completed / archive stage. All successfully disbursed requests land here and also appear in the Records table.",
        [
          "Group name, community, farmer count",
          "Score badge",
          "Disbursed amount (bold)",
          "Recipient name (MoMo name or group name)",
          "Transaction ID (green monospace)",
          "Disbursement date",
          "Field agent + date, Reference ID",
          "Card rendered at reduced opacity (0.8)",
        ],
        "None — no CTA button",
        null
      ),

      // ── 5. On-hold ─────────────────────────────────────────────────────
      h1("5. On-Hold Functionality"),
      body("Any request in Pending Approval can be placed on hold without moving it forward or backward."),

      h2("Visual indicators"),
      bullet("Card border switches from solid gray → dashed amber"),
      bullet("An \"On Hold\" pill badge (amber) with a pause icon appears on the card"),
      bullet("The CTA button changes from solid green → amber outline"),

      h2("Data stored"),
      bullet("onHold: true"),
      bullet("holdComment — reason text entered by the reviewer"),
      body("The hold can be cleared by opening the Review modal and making a different decision."),
      ...gap(),

      // ── 6. Scoring modal ──────────────────────────────────────────────
      h1("6. Scoring Modal"),
      body("Opened by clicking the Score CTA on a Synced card (or anywhere on the card body)."),

      h2("Layout"),
      body("Two-panel layout on desktop:"),
      bullet("Left panel (310 px) — Group summary: name, community, farmer count, agent avatar, reference ID, live group score widget"),
      bullet("Right panel (scrollable) — Evidence sections and scoring controls"),
      body("The left panel is hidden on mobile.", { muted: true }),

      h2("Group Score Widget"),
      body("Displays the running aggregate score as a percentage with a gradient progress bar (red → orange → green) and a label (Poor / Fair / Good / Excellent). Updates live as sliders are moved."),

      h2("Evidence Sections"),

      h3("1. Evidence of Support Requests"),
      bullet("Displays voice notes recorded during the field visit"),
      bullet("Each note shows title and duration"),
      bullet("Play/pause control with animated waveform bars filling progressively during playback"),

      h3("2. Meeting Minutes"),
      bullet("Image carousel of uploaded meeting-minutes documents"),
      bullet("Left/right navigation arrows + dot indicators"),
      bullet("Score slider (1–4): Poor → Fair → Good → Excellent"),

      h3("3. Financial Contribution"),
      bullet("Image carousel of uploaded financial records"),
      bullet("\"No financial records available\" placeholder state if no records were uploaded"),
      bullet("Score slider (1–4) — active only when records are present"),

      h2("Submission flow"),
      bullet("Reviewer sets Meeting score (required, 1–4) and Financial score (optional)"),
      bullet("Yellow warning banner: \"Scores cannot be changed after confirmation\""),
      bullet("Reviewer must tick the confirmation checkbox before the Confirm Scores button becomes active"),
      bullet("On confirm → request moves to Pending Approval with score stored"),

      h2("Score mapping"),
      ...gap(),
      makeTable(
        ["Slider value", "Percentage", "Label"],
        [["1", "25", "Poor"], ["2", "50", "Fair"], ["3", "75", "Good"], ["4", "100", "Excellent"]],
        [2000, 2000, 5000]
      ),
      ...gap(),

      // ── 7. Score badge ─────────────────────────────────────────────────
      h1("7. Score Badge"),
      body("Appears on cards from Stage 2 (Pending Approval) onward."),
      ...gap(),
      makeTable(
        ["Score range", "Label", "Colour"],
        [
          ["< 40",    "Poor",      "#DC2626 Red"],
          ["40 – 59", "Fair",      "#D97706 Orange"],
          ["60 – 79", "Good",      "#16A34A Green"],
          ["≥ 80",    "Excellent", "#059669 Dark green"],
        ],
        [2000, 2000, 5000]
      ),
      ...gap(),

      // ── 8. Filter bar ──────────────────────────────────────────────────
      h1("8. Filter Bar"),
      body("The filter bar sits above the board/table and is persistent across both Pipeline and Records views."),

      h2("Filter controls"),
      ...gap(),
      makeTable(
        ["Control", "Type", "Behaviour"],
        [
          ["Search",      "Text input",              "Searches group name and community"],
          ["Date",        "Dropdown + calendar",     "Presets: Today, Yesterday, This Week/Month/Year (and Last variants); custom day ranges also supported"],
          ["Region",      "Searchable dropdown",     "16 Ghana regions; selecting one auto-resets the District filter"],
          ["District",    "Searchable dropdown",     "Disabled until a Region is selected"],
          ["Community",   "Searchable dropdown",     "9 communities"],
          ["Agent",       "Dropdown",                "Dynamically populated from records currently in view"],
        ],
        [1800, 2200, 5000]
      ),

      h2("Filter UX details"),
      bullet("Only one dropdown popover can be open at a time"),
      bullet("Clicking outside a popover closes it"),
      bullet("Active filters highlight their button with a green border + green text"),
      bullet("A 'Clear filters' button (red styling) appears when any filter is active"),
      bullet("On mobile: filters collapse behind a 'Filters (N)' toggle button"),

      h2("View toggle"),
      body("Two buttons in the top-right of the filter bar switch between Pipeline and Records views."),
      ...gap(),

      // ── 9. Records / table view ────────────────────────────────────────
      h1("9. Records / Table View"),
      body("Shows only requests in the Disbursed stage. All active filter-bar filters continue to apply."),

      h2("Table columns"),
      ...gap(),
      makeTable(
        ["#", "Column", "Notes"],
        [
          ["1",  "Reference",       "Sticky (always visible on horizontal scroll); green monospace"],
          ["2",  "Group Name",      "Bold"],
          ["3",  "Community",       "—"],
          ["4",  "Farmers",         "Right-aligned"],
          ["5",  "Support",         "Cash / Ploughing badge"],
          ["6",  "Amt / Farmer",    "Right-aligned, GHS formatted"],
          ["7",  "Total Disbursed", "Right-aligned, bold, GHS formatted"],
          ["8",  "Transaction ID",  "Monospace"],
          ["9",  "Disbursed On",    "Date"],
          ["10", "Field Agent",     "Avatar + full name"],
          ["11", "—",               "View button (opens detail modal)"],
        ],
        [600, 2200, 6200]
      ),

      h2("Table UX"),
      bullet("Alternating row backgrounds (white / light gray)"),
      bullet("Row hover: light green highlight"),
      bullet("Minimum width 980 px with horizontal scroll on smaller viewports"),
      bullet("Column 1 (Reference) stays fixed while scrolling horizontally"),

      h2("Pagination"),
      bullet("8 records per page"),
      bullet("Shows: \"Showing X–Y of Z records\""),
      bullet("Up to 5 page-number buttons; ellipsis (…) shown for larger sets"),
      bullet("Prev / Next buttons — disabled at boundaries"),
      bullet("Mobile: \"Page X of Y\" text only"),
      bullet("Resets to page 1 whenever filters change"),

      h2("Empty state"),
      body("When no disbursed records match the current filters, a centred empty-state is shown with an icon, a heading (\"No disbursement records yet\"), and explanatory subtext."),
      ...gap(),

      // ── 10. Detail modal ───────────────────────────────────────────────
      h1("10. Disbursement Record Detail Modal"),
      body("Opens by clicking the View button on any table row. Centred dialog, max-width 560 px. Clicking the backdrop closes the modal."),

      h2("Hero section"),
      bullet("Total Amount Disbursed — large bold figure (e.g. GHS 7,200)"),
      bullet("Disbursement date + Transaction ID"),

      h2("Detail rows"),
      ...gap(),
      makeTable(
        ["Field", "Notes"],
        [
          ["Request ID",      "Green monospace"],
          ["Group Name",      "—"],
          ["Community",       "—"],
          ["No. of Farmers",  "—"],
          ["Support Type",    "Cash / Ploughing badge"],
          ["Amount / Farmer", "—"],
          ["MoMo Name",       "—"],
          ["MoMo Number",     "Monospace"],
          ["Transaction ID",  "Gray monospace"],
          ["Disbursed On",    "Date"],
          ["Submitted",       "Original submission date"],
          ["Field Agent",     "Avatar + name"],
          ["Score",           "X / 100"],
        ],
        [3000, 6000]
      ),
      ...gap(),

      // ── 11. State transition map ───────────────────────────────────────
      h1("11. State Transition Map"),
      ...gap(),
      new Paragraph({
        children: [new TextRun({
          text: [
            "synced",
            "  └─[Score]──────────────────► pending_approval",
            "                                       │",
            "                       ┌───────────────┼───────────────┐",
            "                       │               │               │",
            "                   [Approve]       [Reject]        [Hold]",
            "                       │               │               │",
            "                       ▼               ▼    (stays, onHold=true)",
            "               agent_confirmation   rejected",
            "                       │",
            "                   [Confirm]",
            "                       │",
            "                       ▼",
            "              finance_disbursement",
            "                       │",
            "                   [Disburse]",
            "                       │",
            "                       ▼",
            "                   disbursed ──────► visible in Records table",
          ].join("\n"),
          font: "Courier New",
          size: 17,
          color: DGRAY,
        })],
        spacing: { before: 80, after: 80 },
        shading: { type: ShadingType.SOLID, fill: "F9FAFB" },
      }),
      ...gap(),
      body("Constraint: Scores are immutable once confirmed. This is enforced via a UI warning banner and a required confirmation checkbox."),
      ...gap(),

      // ── 12. Card visual states ─────────────────────────────────────────
      h1("12. Card Visual States"),
      ...gap(),
      makeTable(
        ["State", "Border style", "Opacity", "Extra element"],
        [
          ["Normal",    "Solid gray",   "100%", "—"],
          ["On Hold",   "Dashed amber", "100%", "Amber 'On Hold' pill + amber CTA outline"],
          ["Rejected",  "Solid gray",   "80%",  "Red rejection comment box"],
          ["Disbursed", "Solid gray",   "80%",  "Transaction ID + disbursement date"],
        ],
        [2000, 2200, 1500, 3300]
      ),
      ...gap(),

      // ── 13. Avatars ────────────────────────────────────────────────────
      h1("13. Avatar & Agent Display"),
      bullet("All agents and farmers are represented by circular initial-based avatars"),
      bullet("Colour is deterministically assigned per name (8-colour palette) — the same person always gets the same colour"),
      bullet("On pipeline cards: agent avatar + first and last name (e.g. Kofi Mensah)"),
      bullet("In modals and the records table: full name displayed"),
      ...gap(),

      // ── 14. Notifications ──────────────────────────────────────────────
      h1("14. Toast Notifications"),
      body("After every major state transition (score confirmed, approved, rejected, held, disbursed) a toast notification briefly appears to confirm the action. Toasts auto-dismiss and can be stacked."),
      ...gap(),

      // ── 15. Responsive ─────────────────────────────────────────────────
      h1("15. Responsive Behaviour"),
      ...gap(),
      makeTable(
        ["Breakpoint", "Pipeline", "Filters"],
        [
          ["Mobile (< md)",    "Single column; stage tabs at top with counts",    "Hidden behind 'Filters (N)' toggle"],
          ["Tablet (md–lg)",   "Partial columns visible with horizontal scroll",  "Full filter bar visible"],
          ["Desktop (≥ lg)",   "All 6 columns visible",                           "Full filter bar visible"],
        ],
        [2200, 3800, 3000]
      ),
      ...gap(),

      // ── 16. Out of scope ───────────────────────────────────────────────
      h1("16. Out of Scope (This Document)"),
      body("The following flows exist in the prototype but are not covered here:"),
      bullet("Support Fulfilment tab — ploughing fulfilment board + cash opt-out management"),
      bullet("Recoveries tab — recovery tracking pipeline"),
      ...gap(2),

      new Paragraph({
        children: [new TextRun({ text: "End of document. For questions or feedback on the prototype, contact the product team.", size: 18, color: "9CA3AF", italics: true })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 240 },
        border: { top: { color: "E5E7EB", size: 6, style: BorderStyle.SINGLE } },
      }),
    ],
  }],
});

const buffer = await Packer.toBuffer(doc);
writeFileSync("Farmer-Support-Prototype-Docs.docx", buffer);
console.log("✓ Farmer-Support-Prototype-Docs.docx written");
