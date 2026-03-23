// Devfluent curriculum — 12 months, weekly granularity
// Each block has a stable ID used for progress tracking

export interface QuizQuestion {
  question: string
  options: string[]   // 4 options
  correctIndex: number // 0-3
  explanation: string  // why this answer is correct
}

export interface LearningBlock {
  id: string
  title: string
  description: string
  durationMinutes: number
  type: "theory" | "practice" | "project" | "review"
  resources?: { label: string; url: string }[]
  quiz?: QuizQuestion[]       // 3-5 questions per block
  practicalExample?: string   // code or practical tip (markdown)
}

export interface Week {
  week: number
  theme: string
  blocks: LearningBlock[]
}

export interface AlternativeProject {
  title: string
  description: string
}

export interface Month {
  month: number
  title: string
  description: string
  projectTitle: string
  projectDescription: string
  alternativeProjects: AlternativeProject[]
  weeks: Week[]
}

export const CURRICULUM: Month[] = [
  // ── Month 1: Web Foundations ──────────────────────────────────────────────
  {
    month: 1,
    title: "Web Foundations",
    description: "HTML, CSS basics, and how the internet works",
    projectTitle: "Personal Portfolio Page",
    projectDescription: "Build a single-page portfolio with semantic HTML and CSS — no frameworks",
    alternativeProjects: [
      {
        title: "Landing Page Clone",
        description: "Pick any popular website and recreate its landing page with HTML and CSS only — focus on layout fidelity and semantic markup",
      },
      {
        title: "Recipe Card Collection",
        description: "A static multi-page site with recipe cards using CSS Grid and Flexbox, including a print stylesheet",
      },
    ],
    weeks: [
      {
        week: 1,
        theme: "How the Internet Works",
        blocks: [
          {
            id: "m1w1-b1",
            title: "HTTP & DNS",
            description: "How browsers fetch pages, what DNS resolves, request/response cycle",
            durationMinutes: 45,
            type: "theory",
            practicalExample: "Open DevTools → Network tab, reload any page, click the first request.\nLook at:\n- **Status**: `200 OK` means success; `301` means redirect\n- **Method**: `GET` fetches, `POST` sends data\n- **Headers**: `Content-Type: text/html` tells the browser what it received\n- **Timing**: see how long DNS lookup, TCP connect, and server response each took",
            quiz: [
              {
                question: "What is the primary role of DNS in a web request?",
                options: [
                  "Translating domain names into IP addresses",
                  "Encrypting data sent between browser and server",
                  "Compressing HTML before it is sent",
                  "Caching images on the client machine",
                ],
                correctIndex: 0,
                explanation: "DNS (Domain Name System) acts like a phone book for the internet, converting human-readable hostnames like example.com into numeric IP addresses that routers can use to direct traffic.",
              },
              {
                question: "Which HTTP status code indicates a permanent redirect?",
                options: [
                  "200",
                  "301",
                  "404",
                  "500",
                ],
                correctIndex: 1,
                explanation: "301 Moved Permanently tells clients and search engines that the resource has moved to a new URL for good. Browsers will cache this redirect and skip contacting the old URL in future.",
              },
              {
                question: "In the HTTP request/response cycle, which part does the client send first?",
                options: [
                  "The HTTP response with status code",
                  "A TCP SYN-ACK packet containing the HTML",
                  "An HTTP request with method, path, and headers",
                  "A DNS response mapping the URL to an IP",
                ],
                correctIndex: 2,
                explanation: "After DNS resolves the IP and a TCP connection is established, the client (browser) sends an HTTP request containing the method (e.g. GET), the path (/index.html), and request headers. The server then replies with a response.",
              },
              {
                question: "What does the HTTP verb POST conventionally signal to a server?",
                options: [
                  "Retrieve a resource without side effects",
                  "Delete an existing resource",
                  "Submit data to be processed, often creating a resource",
                  "Replace an existing resource entirely",
                ],
                correctIndex: 2,
                explanation: "POST is used to submit data (forms, JSON payloads) that the server processes — typically creating a new record. Unlike GET, POST requests can have a body and are not considered idempotent.",
              },
            ],
          },
          {
            id: "m1w1-b2",
            title: "Browser DevTools",
            description: "Network tab, Elements panel, Console — your daily tools",
            durationMinutes: 30,
            type: "practice",
            practicalExample: "```js\n// In the DevTools Console, try these one-liners:\ndocument.title                         // read the page title\ndocument.querySelectorAll('a').length  // count all links on the page\nconsole.table(performance.getEntriesByType('navigation')) // timing breakdown\n```\nThe Elements panel lets you double-click any text to edit it live — great for prototyping copy changes without touching the source.",
            quiz: [
              {
                question: "Which DevTools panel shows you every HTTP request the page makes, including images and API calls?",
                options: [
                  "Elements",
                  "Console",
                  "Network",
                  "Sources",
                ],
                correctIndex: 2,
                explanation: "The Network panel records every resource the browser fetches — HTML, CSS, JS, images, and XHR/fetch calls — along with status codes, size, and timing, making it indispensable for debugging performance and API issues.",
              },
              {
                question: "What happens when you edit an element's HTML directly in the DevTools Elements panel?",
                options: [
                  "The change is saved permanently to the server file",
                  "The page crashes and must be reloaded",
                  "The change is live in the browser only and lost on reload",
                  "DevTools opens the source file in a text editor",
                ],
                correctIndex: 2,
                explanation: "DevTools edits are in-memory only — they let you experiment instantly without touching real files. A page reload discards all changes, which is why DevTools is useful for prototyping, not permanent editing.",
              },
              {
                question: "What does `console.error()` do differently from `console.log()`?",
                options: [
                  "It stops script execution immediately",
                  "It writes to the server log instead of the browser",
                  "It outputs in red and includes a stack trace in the Console",
                  "It is only available in Node.js, not the browser",
                ],
                correctIndex: 2,
                explanation: "console.error() renders the message in red and, crucially, attaches a stack trace so you can see exactly which function called it. Filtering the Console to 'Errors' shows only these messages, helping you focus during debugging.",
              },
            ],
          },
          {
            id: "m1w1-b3",
            title: "HTML Document Structure",
            description: "DOCTYPE, head, body, semantic tags (header, main, footer)",
            durationMinutes: 45,
            type: "theory",
            practicalExample: "```html\n<!DOCTYPE html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>My Page</title>\n  </head>\n  <body>\n    <header>\n      <nav>...</nav>\n    </header>\n    <main>\n      <h1>Welcome</h1>\n    </main>\n    <footer>© 2024</footer>\n  </body>\n</html>\n```\nAlways add `lang` to `<html>` — screen readers use it to select the correct voice/accent.",
            quiz: [
              {
                question: "What is the purpose of `<!DOCTYPE html>` at the top of an HTML file?",
                options: [
                  "It links the HTML file to its CSS stylesheet",
                  "It tells the browser to render the page in standards mode",
                  "It sets the character encoding to UTF-8",
                  "It declares the document as an XHTML file",
                ],
                correctIndex: 1,
                explanation: "<!DOCTYPE html> is a declaration (not a tag) that instructs the browser to use the modern HTML5 standards-compliant rendering mode, avoiding the old 'quirks mode' where browsers emulated historical bugs.",
              },
              {
                question: "Which element should contain the primary content unique to a page, appearing only once?",
                options: [
                  "<section>",
                  "<article>",
                  "<main>",
                  "<div>",
                ],
                correctIndex: 2,
                explanation: "<main> marks the dominant content of the <body> that is directly related to the page's central topic. It should appear exactly once per page and excludes repeated content like navigation, headers, and footers.",
              },
              {
                question: "Where should a <script src=\"app.js\"> tag be placed for best page load performance?",
                options: [
                  "Inside <head> before any CSS",
                  "As the first child of <body>",
                  "Just before the closing </body> tag",
                  "Inside <header>",
                ],
                correctIndex: 2,
                explanation: "Placing scripts just before </body> lets the browser parse and display the HTML first, so users see content sooner. Scripts in <head> block rendering unless they use the `defer` or `async` attribute.",
              },
              {
                question: "What does the `<head>` element contain?",
                options: [
                  "The visible headings and navigation of the page",
                  "Metadata about the document such as title, charset, and linked CSS",
                  "The first section of the page body",
                  "Only the <title> tag and nothing else",
                ],
                correctIndex: 1,
                explanation: "The <head> contains machine-readable metadata: the document title (shown in browser tabs), character encoding, viewport settings, linked stylesheets, and scripts. None of this content is rendered directly on the page.",
              },
            ],
          },
        ],
      },
      {
        week: 2,
        theme: "HTML Deep Dive",
        blocks: [
          {
            id: "m1w2-b1",
            title: "Semantic HTML",
            description: "nav, article, section, aside — what they mean and why it matters",
            durationMinutes: 45,
            type: "theory",
            practicalExample: "```html\n<!-- Non-semantic (avoid) -->\n<div class=\"sidebar\"><div class=\"widget\">...</div></div>\n\n<!-- Semantic (preferred) -->\n<aside aria-label=\"Related links\">\n  <section>\n    <h2>Related articles</h2>\n    <ul>...</ul>\n  </section>\n</aside>\n```\nSemantic elements give free accessibility: screen readers announce `<nav>` as \"navigation\" and `<main>` as \"main\" without any extra ARIA needed.",
            quiz: [
              {
                question: "What distinguishes <article> from <section>?",
                options: [
                  "<article> is for lists; <section> is for individual items",
                  "<article> represents self-contained, independently distributable content; <section> groups thematically related content",
                  "<article> can only appear inside <main>; <section> can appear anywhere",
                  "They are synonyms — use whichever you prefer",
                ],
                correctIndex: 1,
                explanation: "<article> is meant for content that makes sense on its own if extracted (a blog post, a comment, a news story). <section> groups related content within a larger document and should have a heading — it is not self-contained.",
              },
              {
                question: "Which element is most appropriate for a site-wide navigation menu?",
                options: [
                  "<menu>",
                  "<ul> inside a <div>",
                  "<nav>",
                  "<header>",
                ],
                correctIndex: 2,
                explanation: "<nav> semantically marks a block of navigation links. Screen readers can identify it and let users jump to or skip it. A bare <div> or <ul> does not communicate navigation intent to assistive technology.",
              },
              {
                question: "Why does using semantic HTML benefit SEO?",
                options: [
                  "Search engines load pages faster when semantic tags are used",
                  "Semantic markup signals content structure and importance, helping crawlers understand page hierarchy",
                  "Google adds bonus ranking points for every <section> tag used",
                  "Semantic HTML is ignored by crawlers — only meta tags affect SEO",
                ],
                correctIndex: 1,
                explanation: "Search engine crawlers parse HTML to understand content meaning. Semantic elements like <h1>, <article>, and <nav> communicate hierarchy and relationships, helping crawlers classify and rank content more accurately than generic <div> soup.",
              },
              {
                question: "What is the correct use of the <aside> element?",
                options: [
                  "Any content placed to the right of the main column",
                  "Content tangentially related to surrounding content, such as a sidebar or pull quote",
                  "A footnote that must appear at the bottom of the page",
                  "An element that hides content from screen readers",
                ],
                correctIndex: 1,
                explanation: "<aside> represents content that is related to but not essential to the surrounding content — sidebars, related links, or pull quotes. Its position on screen is a CSS concern; the semantic meaning is about content relationship, not visual placement.",
              },
            ],
          },
          {
            id: "m1w2-b2",
            title: "Forms & Inputs",
            description: "input types, labels, validation attributes, accessibility basics — aria-label, required, fieldset",
            durationMinutes: 60,
            type: "practice",
            practicalExample: "```html\n<form>\n  <fieldset>\n    <legend>Contact details</legend>\n\n    <label for=\"email\">Email address</label>\n    <input\n      id=\"email\"\n      type=\"email\"\n      name=\"email\"\n      required\n      autocomplete=\"email\"\n      placeholder=\"you@example.com\"\n    />\n\n    <label for=\"phone\">Phone (optional)</label>\n    <input id=\"phone\" type=\"tel\" name=\"phone\" autocomplete=\"tel\" />\n  </fieldset>\n\n  <button type=\"submit\">Send</button>\n</form>\n```\nAlways link `<label for=\"id\">` to the matching input `id` — clicking the label then focuses the input, which is a requirement for accessibility.",
            quiz: [
              {
                question: "Why should every <input> have an associated <label>?",
                options: [
                  "Labels make the form submit faster",
                  "Labels provide a visible, clickable target and tell screen readers what the field is",
                  "Browsers require labels or they refuse to validate the form",
                  "Labels are only needed for <select> and <textarea>, not <input>",
                ],
                correctIndex: 1,
                explanation: "A properly associated <label> (via `for`/`id` or wrapping) gives screen reader users an audible field description and also gives all users a larger click target — clicking the label focuses the input, which is especially helpful on mobile.",
              },
              {
                question: "What does the `required` attribute on an <input> do?",
                options: [
                  "Submits the form automatically when the field is filled",
                  "Prevents form submission and shows a browser validation message if the field is empty",
                  "Makes the field's background turn red",
                  "Locks the field so the user cannot leave it empty at any time",
                ],
                correctIndex: 1,
                explanation: "The `required` attribute triggers built-in browser validation on form submit — if the field is empty, the browser blocks submission and shows a native error tooltip. This is client-side only; always also validate on the server.",
              },
              {
                question: "What is the purpose of <fieldset> and <legend> in a form?",
                options: [
                  "To add a border around inputs for styling purposes",
                  "To group related inputs and give them a shared label, improving accessibility",
                  "To prevent inputs inside from being submitted",
                  "To replace <form> when a page has multiple forms",
                ],
                correctIndex: 1,
                explanation: "<fieldset> groups logically related controls (e.g. shipping address fields), and <legend> provides a group label. Screen readers announce the legend text before each field in the group, giving essential context like 'Shipping address: Street'.",
              },
              {
                question: "Which input type causes the browser to show a numeric keypad on mobile?",
                options: [
                  "type=\"number\"",
                  "type=\"digits\"",
                  "type=\"tel\"",
                  "type=\"text\" with inputmode=\"numeric\"",
                ],
                correctIndex: 2,
                explanation: "type=\"tel\" triggers the telephone numeric keypad on iOS and Android, which includes symbols like +, *, and # alongside digits — useful for phone fields. type=\"number\" shows a numeric spinner but adds unwanted increment/decrement controls.",
              },
            ],
          },
          {
            id: "m1w2-b3",
            title: "SEO Fundamentals",
            description: "meta tags, Open Graph, title and description best practices",
            durationMinutes: 30,
            type: "theory",
            practicalExample: "```html\n<head>\n  <title>Buy Running Shoes | SportShop</title>\n  <meta name=\"description\" content=\"Shop 500+ running shoes with free next-day delivery. Expert advice from real runners.\" />\n\n  <!-- Open Graph (social sharing) -->\n  <meta property=\"og:title\" content=\"Buy Running Shoes | SportShop\" />\n  <meta property=\"og:description\" content=\"500+ running shoes, free next-day delivery.\" />\n  <meta property=\"og:image\" content=\"https://sportshop.com/og-shoes.jpg\" />\n  <meta property=\"og:url\" content=\"https://sportshop.com/shoes\" />\n</head>\n```\nMeta descriptions do not directly affect ranking, but a compelling 150–160 character description increases click-through rate from search results.",
            quiz: [
              {
                question: "What is the recommended maximum character length for a meta description?",
                options: [
                  "60 characters",
                  "100 characters",
                  "155–160 characters",
                  "300 characters",
                ],
                correctIndex: 2,
                explanation: "Google typically truncates meta descriptions around 155–160 characters in search results. Writing within this limit ensures your full value proposition appears without being cut off with '...'.",
              },
              {
                question: "Which Open Graph property controls the image shown when a URL is shared on social media?",
                options: [
                  "og:thumbnail",
                  "og:image",
                  "og:cover",
                  "og:photo",
                ],
                correctIndex: 1,
                explanation: "The og:image property specifies the URL of the image that platforms like Twitter, Facebook, and LinkedIn display as a card preview when someone shares your link. Without it, these platforms pick any image from the page — often incorrectly.",
              },
              {
                question: "Does having a meta description directly improve a page's Google ranking position?",
                options: [
                  "Yes — Google uses it as a major ranking signal",
                  "Yes, but only for image search",
                  "No — it affects click-through rate from search results, not ranking itself",
                  "No — Google ignores meta descriptions entirely",
                ],
                correctIndex: 2,
                explanation: "Google confirmed that meta descriptions are not a ranking factor. However, a well-written description increases the click-through rate (CTR) from search results, which indirectly signals user interest and can influence ranking over time.",
              },
              {
                question: "Where should the primary keyword for a page ideally appear?",
                options: [
                  "Only in the meta description",
                  "In the <title> tag and early in the <h1> heading",
                  "In a hidden <div> with visibility: hidden",
                  "In as many <meta> tags as possible",
                ],
                correctIndex: 1,
                explanation: "The <title> tag and <h1> heading are the strongest on-page signals for the page topic. Placing the primary keyword in both — naturally — helps crawlers and users immediately understand what the page is about. Keyword stuffing or hiding text violates Google's guidelines.",
              },
            ],
          },
        ],
      },
      {
        week: 3,
        theme: "CSS Foundations",
        blocks: [
          {
            id: "m1w3-b1",
            title: "The Box Model",
            description: "margin, padding, border, content — understanding layout math",
            durationMinutes: 45,
            type: "theory",
            practicalExample: "```css\n/* Without box-sizing, adding padding GROWS the element:\n   width: 200px + padding: 20px = rendered 240px wide */\n.broken { width: 200px; padding: 20px; }\n\n/* With box-sizing: border-box, padding is INSIDE the width */\n*, *::before, *::after { box-sizing: border-box; }\n.fixed { width: 200px; padding: 20px; } /* still 200px wide */\n```\nAlways add `box-sizing: border-box` globally — it is how most developers expect the box model to work.",
            quiz: [
              {
                question: "By default (box-sizing: content-box), if you set an element to width: 300px with padding: 20px, what is its actual rendered width?",
                options: [
                  "300px",
                  "280px",
                  "340px",
                  "320px",
                ],
                correctIndex: 2,
                explanation: "In the default content-box model, padding is added outside the declared width. 300px content + 20px left padding + 20px right padding = 340px total rendered width.",
              },
              {
                question: "What is the difference between margin and padding?",
                options: [
                  "Margin is inside the element; padding is outside",
                  "Margin creates space outside the element's border; padding creates space between the content and the border",
                  "They are identical — only the property name differs",
                  "Padding affects background colour area; margin does not, but they both push other elements away",
                ],
                correctIndex: 1,
                explanation: "Padding is the space between an element's content and its border — it inherits the background colour. Margin is the transparent space outside the border that pushes other elements away. Background colour does not extend into the margin.",
              },
              {
                question: "What does `box-sizing: border-box` change?",
                options: [
                  "It removes the element's border entirely",
                  "It makes width and height include padding and border, not just content",
                  "It makes all margins collapse to zero",
                  "It forces the element to display as a block",
                ],
                correctIndex: 1,
                explanation: "With border-box, the declared width becomes the total rendered width — padding and border are subtracted from inside rather than added outside. This makes layout arithmetic far more predictable and is why most modern CSS resets apply it globally.",
              },
              {
                question: "Margin collapsing occurs in which situation?",
                options: [
                  "When two elements have the same background colour",
                  "When two vertical margins of adjacent block elements meet, combining into the larger single margin",
                  "When you apply `overflow: hidden` to a parent",
                  "When an element's margin is larger than its parent's padding",
                ],
                correctIndex: 1,
                explanation: "Vertical margins between adjacent block-level siblings (and sometimes parent-child) collapse into one margin equal to the larger of the two. This is intentional CSS behaviour, not a bug — it avoids double spacing between paragraphs.",
              },
            ],
          },
          {
            id: "m1w3-b2",
            title: "Selectors & Specificity",
            description: "class, id, pseudo-selectors, how specificity is calculated",
            durationMinutes: 45,
            type: "practice",
            practicalExample: "```css\n/* Specificity is calculated as (id, class, element) */\np               { color: black; }   /* 0,0,1 */\n.intro          { color: blue; }    /* 0,1,0 — wins over p */\n#hero           { color: red; }     /* 1,0,0 — wins over .intro */\n\n/* Pseudo-classes add to class weight */\na:hover         { color: green; }   /* 0,1,1 */\n.nav a:hover    { color: purple; }  /* 0,2,1 — wins */\n\n/* Tip: avoid !important — it breaks the cascade everywhere */\n```",
            quiz: [
              {
                question: "Given these three rules targeting the same element, which colour wins?\n`p { color: red; }` `#title { color: blue; }` `.hero p { color: green; }`",
                options: [
                  "red — element selectors take priority",
                  "green — descendant selectors win",
                  "blue — ID selectors have the highest specificity",
                  "The colour declared last always wins",
                ],
                correctIndex: 2,
                explanation: "Specificity is calculated as (IDs, classes, elements). An ID selector scores (1,0,0) — higher than any combination of class (0,1,0) or element (0,0,1) selectors — so `#title { color: blue }` wins regardless of order.",
              },
              {
                question: "What does the `:nth-child(2n+1)` pseudo-class select?",
                options: [
                  "Every second child element",
                  "Only the second child",
                  "Every odd-numbered child element",
                  "The first two children",
                ],
                correctIndex: 2,
                explanation: "The expression 2n+1 generates 1, 3, 5, 7, … — every odd position. This is equivalent to :nth-child(odd). You can use any `an+b` formula: 3n selects every third child, 3n+2 starts at the second and takes every third after that.",
              },
              {
                question: "When does the `!important` declaration win over an ID selector?",
                options: [
                  "Never — IDs always win",
                  "Always — !important overrides everything including inline styles",
                  "Only when the !important rule appears after the ID rule",
                  "Only in external stylesheets, not inline styles",
                ],
                correctIndex: 1,
                explanation: "!important creates a separate specificity layer that beats all normal specificity, including inline styles. The only thing that can override !important is another !important with higher or equal specificity. Overusing it makes debugging a cascade nightmare.",
              },
              {
                question: "What does the CSS combininator `>` do in the selector `.parent > .child`?",
                options: [
                  "Selects .child anywhere inside .parent, at any depth",
                  "Selects only .child elements that are direct children of .parent",
                  "Selects .parent only when it immediately follows .child",
                  "Selects .parent and .child together (both elements)",
                ],
                correctIndex: 1,
                explanation: "The child combinator `>` selects only direct (immediate) children. `.parent > .child` matches a .child whose parent element is exactly .parent, skipping any nested deeper descendants — unlike the descendant combinator (a space) which matches at any depth.",
              },
            ],
          },
          {
            id: "m1w3-b3",
            title: "Flexbox",
            description: "flex container, flex items, alignment and spacing patterns",
            durationMinutes: 60,
            type: "practice",
            practicalExample: "```css\n/* Classic navbar: logo left, links right */\n.navbar {\n  display: flex;\n  justify-content: space-between; /* pushes children apart */\n  align-items: center;            /* vertical centre */\n  padding: 0 1rem;\n}\n\n/* Centring a card perfectly */\n.page {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n}\n```\nRemember: `justify-content` works along the **main axis** (row = horizontal by default) and `align-items` works on the **cross axis** (row = vertical).",
            quiz: [
              {
                question: "In a flex container with `flex-direction: row`, which property controls vertical alignment of items?",
                options: [
                  "justify-content",
                  "align-items",
                  "flex-wrap",
                  "align-content",
                ],
                correctIndex: 1,
                explanation: "align-items controls alignment on the cross axis. When flex-direction is row, the main axis is horizontal and the cross axis is vertical, so align-items: center vertically centres all flex children within the container.",
              },
              {
                question: "What does `flex: 1` on a flex item do?",
                options: [
                  "Sets the item's width to 1px",
                  "Makes the item take up 1% of the container",
                  "Allows the item to grow and shrink to fill available space equally",
                  "Pins the item to the first position in the container",
                ],
                correctIndex: 2,
                explanation: "`flex: 1` is shorthand for `flex-grow: 1; flex-shrink: 1; flex-basis: 0`. The item will grow to fill remaining space proportionally. If multiple siblings all have `flex: 1`, they share the container width equally.",
              },
              {
                question: "What does `flex-wrap: wrap` enable?",
                options: [
                  "Flex items to overlap each other",
                  "Flex items to flow onto multiple lines when they do not fit in one row",
                  "The container to expand horizontally beyond the viewport",
                  "Text inside flex items to wrap at word boundaries",
                ],
                correctIndex: 1,
                explanation: "By default flex items are forced onto one line (flex-wrap: nowrap) and may overflow or shrink below their natural size. flex-wrap: wrap allows items to flow to a new row (or column) when there is insufficient space.",
              },
              {
                question: "Which value of `justify-content` places equal space between items but no space at the start or end?",
                options: [
                  "space-around",
                  "space-evenly",
                  "space-between",
                  "flex-start",
                ],
                correctIndex: 2,
                explanation: "space-between distributes items so that the space is only between them — the first item is flush to the start and the last is flush to the end. space-around adds equal space on each side of every item (so there is half-space at the edges), and space-evenly makes all gaps identical including edges.",
              },
            ],
          },
        ],
      },
      {
        week: 4,
        theme: "Responsive CSS, Animations & Project",
        blocks: [
          {
            id: "m1w4-b1",
            title: "CSS Grid & Responsive Design",
            description: "grid-template-columns, areas, auto-fill; media queries, mobile-first, viewport units, fluid typography",
            durationMinutes: 75,
            type: "practice",
            practicalExample: "```css\n/* Auto-responsive card grid — no media query needed */\n.cards {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));\n  gap: 1rem;\n}\n\n/* Named grid areas for a classic layout */\n.layout {\n  display: grid;\n  grid-template-areas:\n    \"header header\"\n    \"sidebar main\"\n    \"footer footer\";\n  grid-template-columns: 200px 1fr;\n}\n.header  { grid-area: header; }\n.sidebar { grid-area: sidebar; }\n.main    { grid-area: main; }\n```\n`minmax(250px, 1fr)` means: each column is at least 250px wide, but expands to fill available space — the browser adds or removes columns automatically.",
            quiz: [
              {
                question: "What does `grid-template-columns: repeat(3, 1fr)` create?",
                options: [
                  "A single column that is 3 times the viewport width",
                  "Three equal-width columns that share available space",
                  "Three columns each 1 pixel wide",
                  "Three rows of equal height",
                ],
                correctIndex: 1,
                explanation: "The `fr` unit represents a fraction of the remaining available space. `repeat(3, 1fr)` creates 3 columns that each get one equal share of the container width. If the container is 900px, each column is 300px (minus gaps).",
              },
              {
                question: "What is the 'mobile-first' approach to media queries?",
                options: [
                  "Designing only for phones and ignoring desktop",
                  "Writing base styles for small screens, then using `min-width` queries to add styles for wider screens",
                  "Writing desktop styles first, then using `max-width` queries to override them for mobile",
                  "Using JavaScript to detect mobile devices and serve different CSS files",
                ],
                correctIndex: 1,
                explanation: "Mobile-first starts with the smallest viewport styles as the default, then progressively enhances with min-width breakpoints for larger screens. This typically produces leaner CSS and ensures core content works on constrained devices before adding complexity.",
              },
              {
                question: "What does `auto-fill` do in `grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))`?",
                options: [
                  "Creates exactly as many columns as there are grid items",
                  "Fills the row with as many tracks as will fit, creating empty tracks if needed",
                  "Stretches existing columns to fill unused space",
                  "Applies only to the first row of the grid",
                ],
                correctIndex: 1,
                explanation: "auto-fill creates as many column tracks as will fit the container at the minimum size. Empty tracks are preserved (useful with explicit grid items). auto-fit is similar but collapses empty tracks — often more useful for flexible card layouts.",
              },
              {
                question: "What does the `vh` unit represent in CSS?",
                options: [
                  "Vertical height of the nearest positioned ancestor",
                  "1% of the viewport's height",
                  "The height of the tallest visible element",
                  "Virtual height — an abstract unit for animations",
                ],
                correctIndex: 1,
                explanation: "1vh equals 1% of the viewport height (the browser window's visible area). `height: 100vh` makes an element exactly as tall as the screen, which is ideal for full-screen hero sections. On mobile, be aware that `100vh` can include the address bar area.",
              },
              {
                question: "Which CSS function enables fluid typography that scales smoothly between two sizes?",
                options: [
                  "calc()",
                  "min()",
                  "clamp()",
                  "max()",
                ],
                correctIndex: 2,
                explanation: "clamp(min, preferred, max) lets a value grow with the viewport within a capped range. `font-size: clamp(1rem, 2.5vw, 2rem)` will never be smaller than 1rem or larger than 2rem, scaling smoothly in between — no media query needed.",
              },
            ],
          },
          {
            id: "m1w4-b2",
            title: "CSS Animations & Transitions",
            description: "transition, animation, @keyframes, transform — building hover effects and micro-interactions",
            durationMinutes: 45,
            type: "practice",
            practicalExample: "```css\n/* Smooth button hover with transition */\n.btn {\n  background: #3b82f6;\n  transform: translateY(0);\n  transition: background 200ms ease, transform 200ms ease;\n}\n.btn:hover {\n  background: #2563eb;\n  transform: translateY(-2px); /* subtle lift */\n}\n\n/* Skeleton loading animation */\n@keyframes shimmer {\n  from { background-position: -200% 0; }\n  to   { background-position:  200% 0; }\n}\n.skeleton {\n  background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);\n  background-size: 200% 100%;\n  animation: shimmer 1.5s infinite;\n}\n```\nPrefer `transform` and `opacity` for animations — they run on the GPU compositor and do not trigger layout recalculation, keeping animations at 60 fps.",
            quiz: [
              {
                question: "Why should you prefer animating `transform` and `opacity` over properties like `width` or `margin`?",
                options: [
                  "transform and opacity are the only properties browsers can animate",
                  "transform and opacity are composited on the GPU and do not trigger layout recalculation, giving smoother 60fps animations",
                  "Browsers ignore width and margin in @keyframes",
                  "transform animations always loop automatically",
                ],
                correctIndex: 1,
                explanation: "Animating layout-affecting properties (width, height, margin, padding) forces the browser to recalculate element positions for every frame — an expensive 'layout' step. `transform` and `opacity` are handled by the GPU compositor separately, skipping layout entirely and enabling smooth, jank-free animations.",
              },
              {
                question: "In `transition: all 300ms ease-in-out`, what does `ease-in-out` describe?",
                options: [
                  "The transition should run both on hover and on mouse-leave",
                  "The animation timing function — starts slow, speeds up in the middle, slows down at the end",
                  "The transition should play in both forward and reverse directions",
                  "The element should fade in at the start and fade out at the end",
                ],
                correctIndex: 1,
                explanation: "ease-in-out is a timing function (easing curve) that describes how the animated value progresses over time — slowly at the start, faster through the middle, and decelerating at the end. This mirrors natural physical motion and feels less robotic than a linear transition.",
              },
              {
                question: "What does `animation-fill-mode: forwards` do?",
                options: [
                  "Makes the animation play forward instead of in reverse",
                  "Keeps the element in the state defined by the last keyframe after the animation ends",
                  "Applies the first keyframe styles before the animation delay starts",
                  "Loops the animation indefinitely",
                ],
                correctIndex: 1,
                explanation: "By default, an element snaps back to its original styles when an animation completes. fill-mode: forwards retains the final keyframe styles after the animation finishes, which is essential for one-shot animations like slide-in entrances.",
              },
              {
                question: "What does `transform: translateX(100%)` do to an element?",
                options: [
                  "Moves the element 100 pixels to the right",
                  "Moves the element rightward by 100% of its own width",
                  "Scales the element to twice its width",
                  "Rotates the element 100 degrees around the X axis",
                ],
                correctIndex: 1,
                explanation: "Percentage values in translateX() are relative to the element's own width, not the parent. So translateX(100%) shifts the element exactly one full element-width to the right, making it useful for off-screen slide-in animations regardless of the element's actual pixel size.",
              },
            ],
          },
          {
            id: "m1w4-b3",
            title: "Portfolio Project",
            description: "Build your personal portfolio page — HTML + CSS, no framework, include at least one animated element",
            durationMinutes: 120,
            type: "project",
            practicalExample: "**Project checklist:**\n- [ ] Valid HTML5 with semantic structure (`<header>`, `<main>`, `<section>`, `<footer>`)\n- [ ] CSS Grid or Flexbox for layout (not floats)\n- [ ] At least one CSS transition or @keyframes animation\n- [ ] Responsive: readable on 375px mobile and 1280px desktop\n- [ ] Meta description and Open Graph tags\n- [ ] Passes W3C HTML validator with no errors\n\n**Quick wins for polish:**\n```css\n/* Smooth scroll for anchor links */\nhtml { scroll-behavior: smooth; }\n\n/* System font stack — no external request needed */\nbody { font-family: system-ui, -apple-system, sans-serif; }\n```",
            quiz: [
              {
                question: "When validating your HTML with the W3C validator, which error is most critical to fix first?",
                options: [
                  "Warnings about optional closing tags",
                  "Missing alt attributes on images — an accessibility and validation error",
                  "Informational messages about obsolete but supported attributes",
                  "Suggestions to use ARIA roles on already-semantic elements",
                ],
                correctIndex: 1,
                explanation: "Missing alt attributes on <img> elements are both a WCAG accessibility failure and a validation error. Screen reader users cannot understand the image, and search engines cannot index it. It is the highest-priority fix in a real portfolio or production site.",
              },
              {
                question: "What CSS property makes all internal anchor links (#section) scroll smoothly?",
                options: [
                  "overflow: smooth",
                  "scroll-snap-type: smooth",
                  "html { scroll-behavior: smooth; }",
                  "a { transition: scroll 300ms; }",
                ],
                correctIndex: 2,
                explanation: "Setting `scroll-behavior: smooth` on the `html` element instructs the browser to animate scrolling for all in-page anchor navigation. It requires no JavaScript and has broad browser support. Users who prefer reduced motion should be respected with a `@media (prefers-reduced-motion)` override.",
              },
              {
                question: "Which approach best ensures your portfolio looks good without external CSS frameworks?",
                options: [
                  "Use inline styles for every element to avoid class conflicts",
                  "Write a CSS reset or normalization, then use custom properties (variables) for consistent spacing and colour",
                  "Copy Bootstrap's CDN link to get a solid base",
                  "Set all elements to `display: flex` at the top of the stylesheet",
                ],
                correctIndex: 1,
                explanation: "A CSS reset eliminates inconsistent browser defaults, and custom properties (--color-primary, --spacing-md) create a design token system that keeps your styles consistent and easy to tweak. This is how professional design systems are built, at any scale.",
              },
            ],
          },
        ],
      },
    ],
  },

  // ── Month 2: JavaScript Fundamentals ─────────────────────────────────────
  {
    month: 2,
    title: "JavaScript Fundamentals",
    description: "Core JS: variables, functions, DOM, async basics — plus Git from day one",
    projectTitle: "Interactive To-Do App",
    projectDescription: "A to-do list with add/remove/complete — vanilla JS, no libraries, tracked in Git",
    alternativeProjects: [
      {
        title: "Quiz Game",
        description: "Multiple-choice quiz with a timer, score tracking, and a results screen — all vanilla JS with DOM manipulation",
      },
      {
        title: "Weather Dashboard",
        description: "Fetch from the Open-Meteo API and display current conditions and a 5-day forecast with animated weather icons",
      },
    ],
    weeks: [
      {
        week: 1,
        theme: "Git & JS Basics",
        blocks: [
          {
            id: "m2w1-b1",
            title: "Git Basics",
            description: "init, add, commit, status, log — set up version control before writing a single line of JS",
            durationMinutes: 45,
            type: "practice",
            practicalExample: "```bash\n# Start a new project with Git from day one\nmkdir my-project && cd my-project\ngit init\n\n# Stage specific files (never use `git add .` blindly)\ngit add index.html style.css\ngit commit -m \"feat: add initial HTML and CSS structure\"\n\n# Check what changed before staging\ngit diff          # unstaged changes\ngit diff --staged # what is about to be committed\n\n# View history\ngit log --oneline --graph\n```\nWrite commit messages in the imperative mood: **\"Add login form\"** not **\"Added login form\"** — it reads like a recipe step applied to the repo.",
            quiz: [
              {
                question: "What does `git add` do?",
                options: [
                  "Saves changes permanently to the repository history",
                  "Moves changed files to the staging area (index) in preparation for a commit",
                  "Downloads changes from a remote repository",
                  "Creates a new branch",
                ],
                correctIndex: 1,
                explanation: "git add moves changes into Git's staging area (also called the index). Only staged changes are included in the next commit. This two-step (add then commit) workflow lets you craft precise commits even when multiple files have changed.",
              },
              {
                question: "What information does `git status` show?",
                options: [
                  "The full diff of every changed file",
                  "The history of all commits on the current branch",
                  "Which files are staged, unstaged, or untracked in the working directory",
                  "The network connectivity to the remote repository",
                ],
                correctIndex: 2,
                explanation: "git status gives a summary of your working directory state: files staged for the next commit (green), files changed but not yet staged (red), and files Git has never tracked (untracked). It is the most useful command to run before any other git operation.",
              },
              {
                question: "Which command shows the history of commits on the current branch?",
                options: [
                  "git status",
                  "git log",
                  "git diff",
                  "git show",
                ],
                correctIndex: 1,
                explanation: "git log lists commits in reverse chronological order with author, date, and message. `git log --oneline --graph` gives a compact visual view. `git show <hash>` shows the diff of one specific commit.",
              },
              {
                question: "What is the correct order of operations to save work in Git?",
                options: [
                  "commit → add → push",
                  "add → push → commit",
                  "add → commit → (optionally push)",
                  "commit → push → add",
                ],
                correctIndex: 2,
                explanation: "The workflow is: modify files → `git add` to stage → `git commit` to save to local history → `git push` to share with a remote. Committing before pushing lets you build up a series of meaningful local commits before sharing them.",
              },
            ],
          },
          {
            id: "m2w1-b2",
            title: "Variables & Data Types",
            description: "let, const, var — primitives, objects, arrays, typeof",
            durationMinutes: 45,
            type: "theory",
            practicalExample: "```js\n// Prefer const by default; use let when you need to reassign\nconst PI = 3.14159\nlet score = 0\nscore += 10  // OK — let allows reassignment\n\n// typeof for runtime type checking\nconsole.log(typeof 42)          // \"number\"\nconsole.log(typeof \"hello\")     // \"string\"\nconsole.log(typeof undefined)   // \"undefined\"\nconsole.log(typeof null)        // \"object\" ← famous JS bug, not a real object\nconsole.log(typeof [])          // \"object\" ← arrays are objects too!\nconsole.log(Array.isArray([]))  // true ← use this to check for arrays\n```",
            quiz: [
              {
                question: "What is the key difference between `let` and `const`?",
                options: [
                  "const is block-scoped; let is function-scoped",
                  "let allows reassignment; const does not allow the variable binding to be reassigned",
                  "const prevents any mutations to the value; let allows all mutations",
                  "let is for primitives; const is for objects and arrays",
                ],
                correctIndex: 1,
                explanation: "const prevents the variable binding from being reassigned (you cannot do `const x = 1; x = 2`). However, const does not make objects or arrays immutable — you can still push to a const array or modify a const object's properties.",
              },
              {
                question: "What does `typeof null` return in JavaScript?",
                options: [
                  "\"null\"",
                  "\"undefined\"",
                  "\"object\"",
                  "\"boolean\"",
                ],
                correctIndex: 2,
                explanation: "typeof null returns \"object\" — this is a well-known JavaScript bug from its initial implementation that was never fixed to avoid breaking existing code. To check for null, use strict equality: `value === null`.",
              },
              {
                question: "Which of these values is falsy in JavaScript?",
                options: [
                  "\"0\" (a string containing zero)",
                  "[] (an empty array)",
                  "0 (the number zero)",
                  "{} (an empty object)",
                ],
                correctIndex: 2,
                explanation: "JavaScript has exactly six falsy values: false, 0, 0n (BigInt zero), \"\" (empty string), null, undefined, and NaN. The string \"0\" is truthy because it is a non-empty string. Empty arrays and objects are always truthy.",
              },
              {
                question: "Why is using `var` generally discouraged in modern JavaScript?",
                options: [
                  "var cannot hold objects or arrays",
                  "var is slower than let and const",
                  "var is function-scoped and hoisted as undefined, leading to confusing bugs in block structures",
                  "var triggers strict mode automatically",
                ],
                correctIndex: 2,
                explanation: "var declarations are function-scoped (not block-scoped) and are hoisted to the top of their function with value `undefined`. This means a var declared inside an if block is accessible outside it, which causes subtle bugs. let and const are block-scoped and behave more predictably.",
              },
            ],
          },
          {
            id: "m2w1-b3",
            title: "Functions & Scope",
            description: "declaration vs expression, arrow functions, closures, hoisting",
            durationMinutes: 60,
            type: "theory",
            practicalExample: "```js\n// Function declaration — hoisted, can be called before definition\nfunction greet(name) {\n  return `Hello, ${name}!`\n}\n\n// Arrow function — shorter, no own `this`\nconst double = (n) => n * 2\n\n// Closure — inner function remembers outer scope\nfunction makeCounter(start = 0) {\n  let count = start  // enclosed variable\n  return {\n    increment: () => ++count,\n    decrement: () => --count,\n    value: () => count,\n  }\n}\nconst counter = makeCounter(10)\nconsole.log(counter.increment()) // 11\nconsole.log(counter.value())     // 11\n```\nClosures are the mechanism behind React hooks like `useState` — the state value is a closed-over variable inside the React internals.",
            quiz: [
              {
                question: "What is 'hoisting' in JavaScript?",
                options: [
                  "Moving slow code to run after the page loads",
                  "The browser process of compiling JavaScript before running it",
                  "The behaviour where declarations are moved to the top of their scope before execution",
                  "Automatically importing modules at the start of a script",
                ],
                correctIndex: 2,
                explanation: "Hoisting means JavaScript processes declarations (function declarations and var) before executing code. Function declarations are fully hoisted (body included), so you can call them before they appear in the file. var declarations are hoisted but initialised to undefined, not their assigned value.",
              },
              {
                question: "What is a closure?",
                options: [
                  "A function that calls itself recursively",
                  "A function that retains access to variables from its outer (enclosing) scope even after that scope has returned",
                  "A method for closing browser windows via JavaScript",
                  "A private class method in JavaScript",
                ],
                correctIndex: 1,
                explanation: "A closure forms when a function 'closes over' variables from its enclosing scope. Those variables remain alive as long as the inner function exists, even after the outer function has returned. This enables patterns like factory functions, memoisation, and encapsulated state.",
              },
              {
                question: "What is a key difference between arrow functions and regular functions regarding `this`?",
                options: [
                  "Arrow functions cannot use `this` at all",
                  "Arrow functions have their own `this` that changes with each caller",
                  "Arrow functions do not have their own `this` — they inherit it from the enclosing lexical scope",
                  "Regular functions always have `this === undefined` in strict mode",
                ],
                correctIndex: 2,
                explanation: "Arrow functions lack their own `this` binding. They inherit `this` from the surrounding lexical context (the scope where they were defined). This makes them ideal for callbacks inside class methods or React components where you want `this` to refer to the outer context, not the callback's caller.",
              },
              {
                question: "What is the output of this code?\n```js\nconsole.log(typeof greet)\nfunction greet() { return 'hi' }\n```",
                options: [
                  "\"undefined\" — greet is not defined yet",
                  "\"function\" — function declarations are hoisted with their body",
                  "ReferenceError: greet is not defined",
                  "\"object\"",
                ],
                correctIndex: 1,
                explanation: "Function declarations are fully hoisted — the entire function definition is available at the start of the scope, before any code runs. So even though `console.log` appears before the function declaration in the source, it correctly sees greet as a 'function'.",
              },
            ],
          },
        ],
      },
      {
        week: 2,
        theme: "Arrays, DOM & Events",
        blocks: [
          { id: "m2w2-b1", title: "Arrays & Objects", description: "map, filter, reduce, spread, destructuring — modern patterns", durationMinutes: 60, type: "practice" },
          { id: "m2w2-b2", title: "DOM API", description: "querySelector, createElement, appendChild, innerHTML vs textContent", durationMinutes: 45, type: "theory" },
          { id: "m2w2-b3", title: "Events", description: "addEventListener, event delegation, preventDefault, bubbling", durationMinutes: 60, type: "practice" },
        ],
      },
      {
        week: 3,
        theme: "Async JavaScript",
        blocks: [
          { id: "m2w3-b1", title: "Callbacks & the Event Loop", description: "call stack, web APIs, task queue — how async JS actually works", durationMinutes: 60, type: "theory" },
          { id: "m2w3-b2", title: "Promises & async/await", description: "promise chaining, async/await, error handling with try/catch", durationMinutes: 60, type: "practice" },
          { id: "m2w3-b3", title: "Fetch API", description: "GET and POST requests, JSON parsing, error states", durationMinutes: 45, type: "practice" },
        ],
      },
      {
        week: 4,
        theme: "Modern JS & Project",
        blocks: [
          { id: "m2w4-b1", title: "Forms & Validation", description: "reading form values, custom validation, FormData API", durationMinutes: 45, type: "practice" },
          { id: "m2w4-b2", title: "ES Modules & Browser Storage", description: "import/export, default vs named, module bundler concepts; localStorage, sessionStorage, cookies — when to use each", durationMinutes: 45, type: "theory" },
          { id: "m2w4-b3", title: "To-Do App Project", description: "Build an interactive to-do list with vanilla JS — CRUD operations, localStorage persistence, committed to a Git repo", durationMinutes: 120, type: "project" },
        ],
      },
    ],
  },

  // ── Month 3: TypeScript & Tooling ─────────────────────────────────────────
  {
    month: 3,
    title: "TypeScript & Tooling",
    description: "TypeScript, advanced Git, Node.js runtime, npm/bun, ESLint, Prettier",
    projectTitle: "TypeScript CLI Quiz App",
    projectDescription: "A command-line quiz that reads questions from JSON — typed with TypeScript",
    alternativeProjects: [
      {
        title: "Markdown Parser CLI",
        description: "Read .md files and output structured JSON representing headings, links, and code blocks — fully typed with TypeScript",
      },
      {
        title: "Budget Calculator CLI",
        description: "An interactive REPL for tracking income and expenses with file-based persistence and typed data models",
      },
    ],
    weeks: [
      {
        week: 1,
        theme: "Advanced Git & Node.js Runtime",
        blocks: [
          { id: "m3w1-b1", title: "Branching & Merging", description: "branch, checkout, merge, rebase — when to use each; resolving conflicts", durationMinutes: 60, type: "practice" },
          { id: "m3w1-b2", title: "GitHub Workflow", description: "push, pull, fork, PR, code review — team collaboration basics", durationMinutes: 45, type: "theory" },
          { id: "m3w1-b3", title: "Node.js Runtime", description: "event loop, CommonJS vs ESM modules, streams overview — how Next.js uses Node under the hood", durationMinutes: 45, type: "theory" },
        ],
      },
      {
        week: 2,
        theme: "TypeScript Basics",
        blocks: [
          { id: "m3w2-b1", title: "Types & Interfaces", description: "primitive types, union, intersection, interface vs type", durationMinutes: 60, type: "theory" },
          { id: "m3w2-b2", title: "Generics", description: "generic functions, generic interfaces, utility types (Partial, Pick)", durationMinutes: 60, type: "practice" },
          { id: "m3w2-b3", title: "TypeScript Config", description: "tsconfig.json, strict mode, module resolution, path aliases", durationMinutes: 30, type: "theory" },
        ],
      },
      {
        week: 3,
        theme: "Tooling",
        blocks: [
          { id: "m3w3-b1", title: "Package Managers", description: "npm, bun — packages, scripts, semantic versioning, lock files", durationMinutes: 30, type: "theory" },
          { id: "m3w3-b2", title: "ESLint & Prettier", description: "linting rules, auto-format on save, shared configs", durationMinutes: 30, type: "practice" },
          { id: "m3w3-b3", title: "Vite & Bundlers", description: "what bundlers do, Vite config, dev vs prod builds", durationMinutes: 45, type: "theory" },
        ],
      },
      {
        week: 4,
        theme: "Project",
        blocks: [
          { id: "m3w4-b1", title: "TypeScript Advanced Patterns", description: "discriminated unions, type guards, as const, satisfies", durationMinutes: 60, type: "theory" },
          { id: "m3w4-b2", title: "CLI Quiz Project", description: "Build a typed CLI quiz app — file I/O, JSON schema, TypeScript strict", durationMinutes: 120, type: "project" },
          { id: "m3w4-b3", title: "Month 3 Review", description: "Revisit gaps, fill in any skipped blocks", durationMinutes: 45, type: "review" },
        ],
      },
    ],
  },

  // ── Month 4: React Fundamentals ───────────────────────────────────────────
  {
    month: 4,
    title: "React Fundamentals",
    description: "Components, hooks, state, props, state management, and a testing first look",
    projectTitle: "Recipe App",
    projectDescription: "A recipe browser with filtering — React + TypeScript, no framework",
    alternativeProjects: [
      {
        title: "Habit Tracker",
        description: "Mark daily habits, visualize streaks, persist to localStorage — Context API for global state and Zustand for comparison",
      },
      {
        title: "Movie Search App",
        description: "Search the TMDB API, display results with filtering, and save favourites — demonstrates Context, custom hooks, and async data",
      },
    ],
    weeks: [
      {
        week: 1,
        theme: "React Core Concepts",
        blocks: [
          { id: "m4w1-b1", title: "JSX & Components", description: "JSX syntax, functional components, props, children", durationMinutes: 60, type: "theory" },
          { id: "m4w1-b2", title: "useState & Events", description: "useState hook, event handlers, controlled vs uncontrolled inputs", durationMinutes: 60, type: "practice" },
          { id: "m4w1-b3", title: "Lists & Conditional Rendering", description: "map with keys, ternary patterns, short-circuit rendering", durationMinutes: 45, type: "practice" },
        ],
      },
      {
        week: 2,
        theme: "React Hooks",
        blocks: [
          { id: "m4w2-b1", title: "useEffect", description: "side effects, dependency array, cleanup functions", durationMinutes: 60, type: "theory" },
          { id: "m4w2-b2", title: "useRef & useMemo", description: "DOM refs, persisting values, memoizing expensive computations", durationMinutes: 45, type: "practice" },
          { id: "m4w2-b3", title: "Custom Hooks", description: "extracting logic into reusable hooks, useFetch pattern", durationMinutes: 60, type: "practice" },
        ],
      },
      {
        week: 3,
        theme: "State Management",
        blocks: [
          { id: "m4w3-b1", title: "Context API", description: "createContext, useContext, avoiding prop drilling", durationMinutes: 60, type: "theory" },
          { id: "m4w3-b2", title: "useReducer", description: "reducer pattern, actions, when to prefer over useState", durationMinutes: 60, type: "practice" },
          { id: "m4w3-b3", title: "External State Management — Zustand", description: "when Context isn't enough; Zustand store, slices, devtools — compare with Context for different scales", durationMinutes: 60, type: "practice" },
        ],
      },
      {
        week: 4,
        theme: "Project & Testing First Look",
        blocks: [
          { id: "m4w4-b1", title: "React Performance", description: "memo, useCallback, profiler — avoiding unnecessary re-renders", durationMinutes: 45, type: "theory" },
          { id: "m4w4-b2", title: "Recipe App Project", description: "Build a recipe browser with search/filter — React + TypeScript", durationMinutes: 120, type: "project" },
          { id: "m4w4-b3", title: "Testing First Look", description: "Why test, what to test — write your first Vitest unit test and one React Testing Library smoke test for the Recipe App", durationMinutes: 45, type: "practice" },
        ],
      },
    ],
  },

  // ── Month 5: Next.js & Full-Stack Basics ──────────────────────────────────
  {
    month: 5,
    title: "Next.js & Full-Stack Basics",
    description: "App Router, Server Components, data fetching, API routes",
    projectTitle: "Public Blog",
    projectDescription: "A statically generated blog with MDX posts and dynamic routes",
    alternativeProjects: [
      {
        title: "Developer Portfolio v2",
        description: "Rebuild your Month 1 portfolio as a Next.js static site with MDX project case studies, animated page transitions, and a working contact form via Route Handlers",
      },
      {
        title: "Link-in-Bio Page",
        description: "A styled link aggregator with analytics tracking — page views stored via a Route Handler and displayed on an admin dashboard",
      },
    ],
    weeks: [
      {
        week: 1,
        theme: "Next.js App Router",
        blocks: [
          { id: "m5w1-b1", title: "App Router Concepts", description: "file-based routing, layouts, pages, loading/error files", durationMinutes: 60, type: "theory" },
          { id: "m5w1-b2", title: "Server vs Client Components", description: "when to use each, the client boundary, serialization rules", durationMinutes: 60, type: "theory" },
          { id: "m5w1-b3", title: "Dynamic Routes", description: "params, generateStaticParams, catch-all segments", durationMinutes: 45, type: "practice" },
        ],
      },
      {
        week: 2,
        theme: "Data Fetching",
        blocks: [
          { id: "m5w2-b1", title: "Async Server Components", description: "fetch in components, caching, revalidation strategies", durationMinutes: 60, type: "theory" },
          { id: "m5w2-b2", title: "Route Handlers", description: "GET/POST API routes, NextRequest/NextResponse, middleware", durationMinutes: 60, type: "practice" },
          { id: "m5w2-b3", title: "Server Actions", description: "form actions, mutation patterns, optimistic updates", durationMinutes: 60, type: "practice" },
        ],
      },
      {
        week: 3,
        theme: "Styling & Auth",
        blocks: [
          { id: "m5w3-b1", title: "CSS Modules & Styling Approaches", description: "CSS Modules vs CSS-in-JS (styled-components/emotion) vs Tailwind — trade-offs, DX, bundle impact; how Tailwind v4 JIT works and when to reach for each approach", durationMinutes: 60, type: "theory" },
          { id: "m5w3-b2", title: "Authentication Concepts", description: "sessions, JWTs, cookies, OAuth flow overview", durationMinutes: 45, type: "theory" },
          { id: "m5w3-b3", title: "Supabase Auth", description: "magic link, session management, SSR client setup", durationMinutes: 60, type: "practice" },
        ],
      },
      {
        week: 4,
        theme: "Project",
        blocks: [
          { id: "m5w4-b1", title: "MDX & Content", description: "next-mdx-remote, frontmatter, code highlighting", durationMinutes: 45, type: "practice" },
          { id: "m5w4-b2", title: "Blog Project", description: "Build a public blog with MDX posts, tags, and dynamic routes", durationMinutes: 120, type: "project" },
          { id: "m5w4-b3", title: "Month 5 Review", description: "Revisit gaps, fill in any skipped blocks", durationMinutes: 45, type: "review" },
        ],
      },
    ],
  },

  // ── Month 6: Databases & APIs ─────────────────────────────────────────────
  {
    month: 6,
    title: "Databases & APIs",
    description: "PostgreSQL, Prisma ORM, REST design, Supabase",
    projectTitle: "Expense Tracker API",
    projectDescription: "Full CRUD REST API with PostgreSQL, Prisma, auth-protected routes",
    alternativeProjects: [
      {
        title: "Bookmark Manager API",
        description: "CRUD API for saving, tagging, and full-text searching URLs — user-scoped with Supabase auth and Zod-validated inputs",
      },
      {
        title: "Recipe Database",
        description: "Store, search, and rate recipes — full REST API with auth, paginated queries, and Prisma relations between recipes, ingredients, and tags",
      },
    ],
    weeks: [
      {
        week: 1,
        theme: "PostgreSQL & SQL",
        blocks: [
          { id: "m6w1-b1", title: "Relational Database Concepts", description: "tables, rows, primary keys, foreign keys, normalization", durationMinutes: 60, type: "theory" },
          { id: "m6w1-b2", title: "SQL Queries", description: "SELECT, WHERE, JOIN, GROUP BY, ORDER BY — practical queries", durationMinutes: 60, type: "practice" },
          { id: "m6w1-b3", title: "Indexes & Performance", description: "what indexes are, when to add them, EXPLAIN ANALYZE", durationMinutes: 45, type: "theory" },
        ],
      },
      {
        week: 2,
        theme: "Prisma ORM",
        blocks: [
          { id: "m6w2-b1", title: "Prisma Schema", description: "models, relations, enums, migrations, prisma generate", durationMinutes: 60, type: "practice" },
          { id: "m6w2-b2", title: "Prisma Client Queries", description: "findMany, create, update, upsert, delete, transactions", durationMinutes: 60, type: "practice" },
          { id: "m6w2-b3", title: "Supabase as Database Host", description: "connection strings, row-level security, Supabase dashboard", durationMinutes: 45, type: "practice" },
        ],
      },
      {
        week: 3,
        theme: "REST API Design",
        blocks: [
          { id: "m6w3-b1", title: "REST Principles", description: "resources, HTTP verbs, status codes, idempotency", durationMinutes: 45, type: "theory" },
          { id: "m6w3-b2", title: "Input Validation", description: "Zod schemas, error messages, type-safe API boundaries", durationMinutes: 60, type: "practice" },
          { id: "m6w3-b3", title: "Auth Middleware", description: "protecting routes with JWT, role checks, RLS policies", durationMinutes: 60, type: "practice" },
        ],
      },
      {
        week: 4,
        theme: "Project",
        blocks: [
          { id: "m6w4-b1", title: "Error Handling Patterns", description: "global error handlers, typed errors, API error envelopes", durationMinutes: 45, type: "theory" },
          { id: "m6w4-b2", title: "Expense Tracker API Project", description: "Full CRUD API — categories, transactions, auth, validation", durationMinutes: 120, type: "project" },
          { id: "m6w4-b3", title: "Month 6 Review", description: "Revisit gaps, fill in any skipped blocks", durationMinutes: 45, type: "review" },
        ],
      },
    ],
  },

  // ── Month 7: Advanced React & Patterns ───────────────────────────────────
  {
    month: 7,
    title: "Advanced React & Patterns",
    description: "Advanced hooks, forms, data tables, component composition, accessibility",
    projectTitle: "Admin Dashboard",
    projectDescription: "An admin panel with a data table, filters, modals, form validation, and full keyboard accessibility",
    alternativeProjects: [
      {
        title: "SaaS Settings Panel",
        description: "User profile, mock billing plan, team member management, and notification preferences — complex multi-step forms with React Hook Form and Zod",
      },
      {
        title: "Issue Tracker",
        description: "A GitHub Issues-inspired mini app with filters, labels, status board, and drag-to-reorder — focus on compound components and accessible interactions",
      },
    ],
    weeks: [
      {
        week: 1,
        theme: "Advanced Patterns",
        blocks: [
          { id: "m7w1-b1", title: "Advanced Custom Hooks", description: "useDebounce, useLocalStorage, useIntersectionObserver", durationMinutes: 60, type: "practice" },
          { id: "m7w1-b2", title: "Error Boundaries", description: "class-based error boundaries, react-error-boundary library", durationMinutes: 45, type: "practice" },
          { id: "m7w1-b3", title: "Component Composition", description: "compound components, render props, slot patterns — building flexible, reusable UI primitives", durationMinutes: 45, type: "theory" },
        ],
      },
      {
        week: 2,
        theme: "Forms",
        blocks: [
          { id: "m7w2-b1", title: "React Hook Form", description: "register, handleSubmit, errors, validation with Zod", durationMinutes: 60, type: "practice" },
          { id: "m7w2-b2", title: "Complex Form Patterns", description: "field arrays, conditional fields, multi-step forms", durationMinutes: 60, type: "practice" },
          { id: "m7w2-b3", title: "Optimistic UI", description: "optimistic updates, rollback on error, useOptimistic hook", durationMinutes: 45, type: "theory" },
        ],
      },
      {
        week: 3,
        theme: "Accessibility",
        blocks: [
          { id: "m7w3-b1", title: "TanStack Query", description: "useQuery, useMutation, cache invalidation, stale-while-revalidate", durationMinutes: 60, type: "practice" },
          { id: "m7w3-b2", title: "A11y Fundamentals", description: "WCAG 2.1 AA, ARIA roles and properties, semantic landmarks, colour contrast — what the spec actually requires", durationMinutes: 60, type: "theory" },
          { id: "m7w3-b3", title: "A11y in Practice", description: "keyboard navigation, focus traps in modals, skip links, axe DevTools audit — make an existing component fully accessible", durationMinutes: 60, type: "practice" },
        ],
      },
      {
        week: 4,
        theme: "Project",
        blocks: [
          { id: "m7w4-b1", title: "Data Tables & Component Library", description: "TanStack Table — sorting, filtering, pagination; Shadcn/ui and Radix primitives, theming with CSS variables", durationMinutes: 60, type: "practice" },
          { id: "m7w4-b2", title: "Admin Dashboard Project", description: "Data table with sorting/filtering, modal forms, dashboard stats — pass an axe audit before submitting", durationMinutes: 120, type: "project" },
          { id: "m7w4-b3", title: "Month 7 Review", description: "Revisit gaps, fill in any skipped blocks", durationMinutes: 45, type: "review" },
        ],
      },
    ],
  },

  // ── Month 8: DevOps & Deployment ──────────────────────────────────────────
  {
    month: 8,
    title: "DevOps & Deployment",
    description: "CI/CD, Docker, Vercel, monitoring, environment management",
    projectTitle: "Production-Ready Deployment",
    projectDescription: "Deploy your Month 6 API with Docker, CI/CD pipeline, and monitoring",
    alternativeProjects: [
      {
        title: "Multi-Environment CI/CD",
        description: "Set up dev, staging, and production deployments for a previous project — automated tests gate merges and Vercel preview URLs appear on every PR",
      },
      {
        title: "Docker Compose Dev Stack",
        description: "Containerize a full-stack Next.js app with a Postgres DB and Nginx reverse proxy — include a hot-reload dev mode and a hardened production image",
      },
    ],
    weeks: [
      {
        week: 1,
        theme: "Deployment Basics",
        blocks: [
          { id: "m8w1-b1", title: "Environment Variables & Secrets", description: "env management, .env files, secrets in CI, Vercel env", durationMinutes: 30, type: "theory" },
          { id: "m8w1-b2", title: "Vercel Deployment", description: "git-based deploys, preview deployments, custom domains", durationMinutes: 45, type: "practice" },
          { id: "m8w1-b3", title: "DNS & Custom Domains", description: "A records, CNAME, SSL certificates, Vercel domain config", durationMinutes: 30, type: "theory" },
        ],
      },
      {
        week: 2,
        theme: "Docker",
        blocks: [
          { id: "m8w2-b1", title: "Docker Basics", description: "images, containers, Dockerfile, docker build/run/ps", durationMinutes: 60, type: "practice" },
          { id: "m8w2-b2", title: "Docker Compose", description: "multi-container apps, networking, volumes, compose up/down", durationMinutes: 60, type: "practice" },
          { id: "m8w2-b3", title: "Containerizing a Next.js App", description: "standalone output, multi-stage builds, production image", durationMinutes: 60, type: "practice" },
        ],
      },
      {
        week: 3,
        theme: "CI/CD",
        blocks: [
          { id: "m8w3-b1", title: "GitHub Actions", description: "workflows, jobs, steps, triggers — lint/test/deploy pipeline", durationMinutes: 60, type: "practice" },
          { id: "m8w3-b2", title: "Automated Testing in CI", description: "running Vitest in CI, test coverage, failing PRs on test failures", durationMinutes: 45, type: "practice" },
          { id: "m8w3-b3", title: "Database Migrations in CI", description: "prisma migrate deploy, migration safety, rollback strategies", durationMinutes: 45, type: "theory" },
        ],
      },
      {
        week: 4,
        theme: "Project",
        blocks: [
          { id: "m8w4-b1", title: "Monitoring & Logging", description: "Sentry error tracking, Vercel Analytics, structured logging", durationMinutes: 45, type: "theory" },
          { id: "m8w4-b2", title: "Production Deployment Project", description: "Full deployment pipeline — Docker, CI, Vercel, monitoring", durationMinutes: 120, type: "project" },
          { id: "m8w4-b3", title: "Month 8 Review", description: "Revisit gaps, fill in any skipped blocks", durationMinutes: 45, type: "review" },
        ],
      },
    ],
  },

  // ── Month 9: Testing ──────────────────────────────────────────────────────
  {
    month: 9,
    title: "Testing",
    description: "Unit, integration, and E2E testing with Vitest and Playwright",
    projectTitle: "Tested Feature",
    projectDescription: "Add full test coverage (unit + integration + E2E) to a previous project",
    alternativeProjects: [
      {
        title: "Bug Hunt & Fix (TDD-style)",
        description: "Take an intentionally buggy codebase, write failing tests to expose each bug, then fix them — experience the TDD red-green-refactor loop",
      },
      {
        title: "E2E Test Suite for the Admin Dashboard",
        description: "Write comprehensive Playwright tests for the Month 7 Admin Dashboard — auth flows, table interactions, form submissions, and accessibility checks",
      },
    ],
    weeks: [
      {
        week: 1,
        theme: "Unit Testing",
        blocks: [
          { id: "m9w1-b1", title: "Testing Concepts", description: "unit vs integration vs E2E, what to test, test pyramid", durationMinutes: 30, type: "theory" },
          { id: "m9w1-b2", title: "Vitest Basics", description: "describe, it, expect, beforeEach — writing your first tests", durationMinutes: 60, type: "practice" },
          { id: "m9w1-b3", title: "Mocking", description: "vi.mock, spies, stubs — isolating dependencies", durationMinutes: 60, type: "practice" },
        ],
      },
      {
        week: 2,
        theme: "React Testing",
        blocks: [
          { id: "m9w2-b1", title: "React Testing Library", description: "render, screen, userEvent — testing from the user's perspective", durationMinutes: 60, type: "practice" },
          { id: "m9w2-b2", title: "Testing Hooks & Context", description: "renderHook, custom provider wrappers, async queries", durationMinutes: 60, type: "practice" },
          { id: "m9w2-b3", title: "Snapshot Testing", description: "when snapshots help, when they hurt, keeping them useful", durationMinutes: 30, type: "theory" },
        ],
      },
      {
        week: 3,
        theme: "E2E Testing",
        blocks: [
          { id: "m9w3-b1", title: "Playwright Basics", description: "page.goto, locators, assertions, screenshot on fail", durationMinutes: 60, type: "practice" },
          { id: "m9w3-b2", title: "Auth in E2E Tests", description: "storageState, login fixtures, authenticated test suites", durationMinutes: 60, type: "practice" },
          { id: "m9w3-b3", title: "Test Data Management", description: "factories, seeders, database cleanup between tests", durationMinutes: 45, type: "theory" },
        ],
      },
      {
        week: 4,
        theme: "Project",
        blocks: [
          { id: "m9w4-b1", title: "Test Coverage & CI", description: "coverage reports, enforcing minimums in CI, coverage badges", durationMinutes: 30, type: "practice" },
          { id: "m9w4-b2", title: "Testing Project", description: "Write unit + integration + E2E tests for a previous project", durationMinutes: 120, type: "project" },
          { id: "m9w4-b3", title: "Month 9 Review", description: "Revisit gaps, fill in any skipped blocks", durationMinutes: 45, type: "review" },
        ],
      },
    ],
  },

  // ── Month 10: Performance & Security ──────────────────────────────────────
  {
    month: 10,
    title: "Performance & Security",
    description: "Web vitals, caching, CSP, OWASP top 10, rate limiting",
    projectTitle: "Performance Audit",
    projectDescription: "Audit and optimize a previous project to score 90+ on Lighthouse",
    alternativeProjects: [
      {
        title: "Security-Hardened API",
        description: "Audit the Month 6 Expense Tracker API — add rate limiting, strict CSP headers, input sanitization, and OWASP-aligned security checks; document each finding",
      },
      {
        title: "Core Web Vitals Optimization",
        description: "Take any previous project from a baseline Lighthouse score to 95+ on all metrics — document what changed and why it helped",
      },
    ],
    weeks: [
      {
        week: 1,
        theme: "Web Performance",
        blocks: [
          { id: "m10w1-b1", title: "Core Web Vitals", description: "LCP, FID/INP, CLS — what they measure and why Google cares", durationMinutes: 45, type: "theory" },
          { id: "m10w1-b2", title: "Image Optimization", description: "next/image, WebP, lazy loading, srcset, placeholder blur", durationMinutes: 45, type: "practice" },
          { id: "m10w1-b3", title: "Code Splitting & Lazy Loading", description: "dynamic imports, React.lazy, Suspense, route-level splitting", durationMinutes: 45, type: "practice" },
        ],
      },
      {
        week: 2,
        theme: "Caching",
        blocks: [
          { id: "m10w2-b1", title: "HTTP Caching", description: "Cache-Control, ETags, stale-while-revalidate, CDN caching", durationMinutes: 45, type: "theory" },
          { id: "m10w2-b2", title: "Next.js Caching Strategies", description: "unstable_cache, revalidatePath, revalidateTag, full-route cache", durationMinutes: 60, type: "practice" },
          { id: "m10w2-b3", title: "Database & Server-Side Caching", description: "N+1 problem and eager loading with Prisma include; Redis cache-aside pattern — when to reach for Redis vs Next.js built-in cache", durationMinutes: 60, type: "practice" },
        ],
      },
      {
        week: 3,
        theme: "Security",
        blocks: [
          { id: "m10w3-b1", title: "OWASP Top 10", description: "injection, broken auth, XSS, IDOR — what each means for web devs", durationMinutes: 60, type: "theory" },
          { id: "m10w3-b2", title: "Content Security Policy", description: "CSP headers, nonces, report-uri — defending against XSS", durationMinutes: 45, type: "practice" },
          { id: "m10w3-b3", title: "Rate Limiting & Input Sanitization", description: "rate limiting APIs, DOMPurify, SQL injection prevention with Prisma", durationMinutes: 45, type: "practice" },
        ],
      },
      {
        week: 4,
        theme: "Project",
        blocks: [
          { id: "m10w4-b1", title: "Lighthouse & Performance Tooling", description: "running Lighthouse, reading waterfall charts, PageSpeed Insights", durationMinutes: 30, type: "practice" },
          { id: "m10w4-b2", title: "Performance Audit Project", description: "Audit and optimize a previous project — target 90+ Lighthouse score", durationMinutes: 120, type: "project" },
          { id: "m10w4-b3", title: "Month 10 Review", description: "Revisit gaps, fill in any skipped blocks", durationMinutes: 45, type: "review" },
        ],
      },
    ],
  },

  // ── Month 11: Real-Time & Advanced Features ───────────────────────────────
  {
    month: 11,
    title: "Real-Time & Advanced Features",
    description: "WebSockets, Supabase Realtime, background jobs, file uploads, tRPC",
    projectTitle: "Real-Time Chat",
    projectDescription: "A real-time chat room with Supabase Realtime, auth, and file attachments",
    alternativeProjects: [
      {
        title: "Collaborative Whiteboard",
        description: "Shared canvas with Supabase Realtime broadcast for stroke sync and Presence for showing who's online — export to PNG via Canvas API",
      },
      {
        title: "Live Auction App",
        description: "Real-time bidding with a countdown timer, instant bid updates via Supabase Realtime, and a winner announcement — tRPC for the REST of the API",
      },
    ],
    weeks: [
      {
        week: 1,
        theme: "Real-Time",
        blocks: [
          { id: "m11w1-b1", title: "WebSockets", description: "WebSocket protocol, ws library, connection lifecycle, reconnection", durationMinutes: 45, type: "theory" },
          { id: "m11w1-b2", title: "Supabase Realtime", description: "Realtime channels, broadcast, presence, postgres changes", durationMinutes: 60, type: "practice" },
          { id: "m11w1-b3", title: "Optimistic UI with Realtime", description: "local state + server sync, conflict resolution", durationMinutes: 45, type: "practice" },
        ],
      },
      {
        week: 2,
        theme: "File Uploads & Storage",
        blocks: [
          { id: "m11w2-b1", title: "Supabase Storage", description: "buckets, policies, upload/download, signed URLs", durationMinutes: 60, type: "practice" },
          { id: "m11w2-b2", title: "Image Upload UI", description: "drag-and-drop, progress indicators, preview, validation", durationMinutes: 60, type: "practice" },
          { id: "m11w2-b3", title: "Background Jobs", description: "Vercel cron jobs, queue concepts, deferred work patterns", durationMinutes: 45, type: "theory" },
        ],
      },
      {
        week: 3,
        theme: "Advanced Next.js",
        blocks: [
          { id: "m11w3-b1", title: "Edge Runtime", description: "Edge vs Node.js runtime, middleware patterns, geolocation", durationMinutes: 45, type: "theory" },
          { id: "m11w3-b2", title: "Streaming & Suspense", description: "streaming SSR, Suspense boundaries, progressive loading", durationMinutes: 60, type: "practice" },
          { id: "m11w3-b3", title: "tRPC & Type-Safe APIs", description: "end-to-end type safety without code generation — routers, procedures, React Query integration; when tRPC beats REST in a Next.js monorepo", durationMinutes: 60, type: "practice" },
        ],
      },
      {
        week: 4,
        theme: "Project",
        blocks: [
          { id: "m11w4-b1", title: "Push Notifications", description: "Web Push API, service workers, notification permissions", durationMinutes: 45, type: "theory" },
          { id: "m11w4-b2", title: "Real-Time Chat Project", description: "Chat with Supabase Realtime, auth, file uploads, presence", durationMinutes: 120, type: "project" },
          { id: "m11w4-b3", title: "Month 11 Review", description: "Revisit gaps, fill in any skipped blocks", durationMinutes: 45, type: "review" },
        ],
      },
    ],
  },

  // ── Month 12: Capstone & Career ────────────────────────────────────────────
  {
    month: 12,
    title: "Capstone & Career",
    description: "Portfolio capstone project, interview prep, job search strategy",
    projectTitle: "Capstone Project",
    projectDescription: "A full-stack application of your choice — built, tested, documented, and deployed",
    alternativeProjects: [
      {
        title: "SaaS MVP",
        description: "A subscription-based app with mock Stripe billing, user auth, a feature-gated dashboard, and a public marketing page — the complete SaaS skeleton",
      },
      {
        title: "Open Source Contribution Sprint",
        description: "Land meaningful PRs on 3 open source projects over the month — document your process, what you learned, and what impact each contribution had",
      },
    ],
    weeks: [
      {
        week: 1,
        theme: "Capstone Planning",
        blocks: [
          { id: "m12w1-b1", title: "Project Architecture", description: "scope definition, data model, tech stack decisions, timeline", durationMinutes: 60, type: "theory" },
          { id: "m12w1-b2", title: "Capstone Build Sprint 1", description: "Core data model, auth, basic pages — foundation complete", durationMinutes: 120, type: "project" },
          { id: "m12w1-b3", title: "Interview Prep: CS Fundamentals", description: "Big O, data structures overview, sorting algorithms", durationMinutes: 60, type: "theory" },
        ],
      },
      {
        week: 2,
        theme: "Capstone Build",
        blocks: [
          { id: "m12w2-b1", title: "Capstone Build Sprint 2", description: "Main features, API routes, database queries", durationMinutes: 120, type: "project" },
          { id: "m12w2-b2", title: "Interview Prep: JavaScript Specifics", description: "closures, event loop, prototype chain, common gotchas", durationMinutes: 60, type: "theory" },
          { id: "m12w2-b3", title: "Writing a Technical README", description: "project overview, setup instructions, architecture decisions", durationMinutes: 30, type: "practice" },
        ],
      },
      {
        week: 3,
        theme: "Polish & Deploy",
        blocks: [
          { id: "m12w3-b1", title: "Capstone Build Sprint 3", description: "Polish, edge cases, error handling, mobile responsive", durationMinutes: 120, type: "project" },
          { id: "m12w3-b2", title: "Interview Prep: React & Next.js", description: "hooks rules, rendering strategies, common interview questions", durationMinutes: 60, type: "theory" },
          { id: "m12w3-b3", title: "Portfolio Review", description: "Review all projects, write case studies, update portfolio page", durationMinutes: 60, type: "practice" },
        ],
      },
      {
        week: 4,
        theme: "Career Launch",
        blocks: [
          { id: "m12w4-b1", title: "Capstone Final Deployment", description: "Production deploy, CI/CD, monitoring — your capstone is live", durationMinutes: 60, type: "project" },
          { id: "m12w4-b2", title: "Job Search Strategy", description: "resume, LinkedIn, cold outreach, how to find junior roles", durationMinutes: 60, type: "theory" },
          { id: "m12w4-b3", title: "Open Source & Community", description: "finding good first issues, PR etiquette, why OSS contributions stand out on a junior portfolio — make your first contribution today", durationMinutes: 45, type: "practice" },
        ],
      },
    ],
  },
]

export function getMonth(month: number): Month | undefined {
  return CURRICULUM.find((m) => m.month === month)
}

export function getWeek(month: number, week: number): Week | undefined {
  return getMonth(month)?.weeks.find((w) => w.week === week)
}

export function getAllBlocks(): LearningBlock[] {
  return CURRICULUM.flatMap((m) => m.weeks.flatMap((w) => w.blocks))
}

export function getBlock(blockId: string): LearningBlock | undefined {
  return getAllBlocks().find((b) => b.id === blockId)
}

export const BLOCK_TYPE_COLORS: Record<LearningBlock["type"], string> = {
  theory: "bg-blue-100 text-blue-800",
  practice: "bg-green-100 text-green-800",
  project: "bg-purple-100 text-purple-800",
  review: "bg-orange-100 text-orange-800",
}

export const BLOCK_TYPE_LABELS: Record<LearningBlock["type"], string> = {
  theory: "Theory",
  practice: "Practice",
  project: "Project",
  review: "Review",
}
