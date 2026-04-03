const en = {
  locale: {
    switchTo: "Deutsch",
    current: "EN",
  },
  nav: {
    dashboard: "Dashboard",
    learning: "Learning",
    roadmap: "Roadmap",
    courses: "Courses",
    projects: "Projects",
    progress: "Progress",
    settings: "Settings",
    tour: "Take a Tour",
    impressum: "Legal Notice",
    datenschutz: "Privacy Policy",
    backToApp: "Back to App",
  },
  mobileNav: {
    home: "Home",
    learn: "Learn",
    courses: "Courses",
    progress: "Progress",
    settings: "Settings",
  },
  offline: {
    title: "You're offline",
    description:
      "No internet connection. Pages you've visited recently are still available — go back and keep learning.",
    back: "Back to app",
  },
  error: {
    dashboard: {
      title: "Something went wrong",
      description: "An unexpected error occurred. Please try refreshing the page.",
      retry: "Try again",
    },
  },
  learning: {
    pageTitle: "Learning Path",
    pageSubtitle: "12-month curriculum — click a month to start studying",
    monthLabel: "Month",
    current: "Current",
    done: "Done",
    blocks: "blocks",
  },
  settings: {
    pageTitle: "Settings",
    pageSubtitle: "Manage your account preferences",
  },
  demo: {
    banner: {
      text: "Demo mode is read-only. Your progress is not saved.",
      cta: "Create an account",
      ctaSuffix: "to keep your streak and XP.",
    },
    button: "Try demo mode (no sign-up)",
    guestLabel: "Demo Guest",
    leaveDemo: "Leave demo",
    readOnlyMessage: "Demo mode is read-only. Create an account to save your progress.",
  },
  landing: {
    signIn: "Sign In",
    hero: {
      badge: "⚡ Built for ADHD minds",
      headline1: "Learn to code.",
      headline2: "Actually finish.",
      subheadline:
        "A 12-month structured curriculum with XP, streaks, and body-double mode — designed for the way ADHD brains actually work.",
      cta: "Start Learning Free",
      trust: ["12-month curriculum", "XP & achievement system", "Free to use"],
    },
    problem: {
      headline: "Traditional courses weren't built for you",
      items: [
        { bad: "Endless video playlists", good: "Bite-sized learning blocks" },
        { bad: "No feedback loop", good: "XP, streaks & achievements" },
        { bad: "Easy to quit alone", good: "Body-double & accountability partner" },
      ],
    },
    features: {
      headline: "Everything you need to stay on track",
      items: [
        { title: "XP & Levels", desc: "Earn XP for every block completed. Level up as you progress." },
        { title: "Pomodoro Focus", desc: "Built-in focus timer with ambient sounds to stay in the zone." },
        { title: "12-Month Curriculum", desc: "A structured path from JavaScript basics to job-ready projects." },
        { title: "AI Coaching", desc: "Personalised recommendations based on your quiz scores and pace." },
        { title: "GitHub Sync", desc: "Earn XP for real commits and pull requests. Code counts." },
        { title: "Body-Double Mode", desc: "See how many others are studying right now. Focus together." },
      ],
    },
    gamification: {
      headline: "Progress that keeps you coming back",
      level: "Level 7",
      xpLabel: "2,840 / 3,000 XP to Level 8",
      streak: "🔥 23-day streak",
      achievement: "🏆 Quiz Master — 10 perfect scores",
    },
    curriculum: {
      headline: "A clear path from beginner to job-ready",
      subheadline: "12 structured months. No guesswork.",
      months: [
        "JS Basics", "Functions & DOM", "Async & APIs", "Projects I",
        "Month 5", "Month 6", "Month 7", "Month 8",
        "Month 9", "Month 10", "Month 11", "Month 12",
      ],
      monthLabel: "Month",
      cta: "Start with Month 1 →",
    },
    testimonials: {
      headline: "What developers are saying",
      items: [
        {
          quote: "Finally a curriculum that doesn't assume I'll watch 40 hours of video. The XP system keeps me coming back every day.",
          name: "Alex M.",
          role: "Career-switcher, 3 months in",
        },
        {
          quote: "I've tried Udemy, freeCodeCamp, The Odin Project. Nothing stuck. This is the first thing that feels like it was made for my brain.",
          name: "Sam R.",
          role: "Self-taught developer",
        },
        {
          quote: "The body-double mode is surprisingly effective. Knowing others are online at the same time helps me actually open the app.",
          name: "Jordan K.",
          role: "ADHD developer, 6 months in",
        },
      ],
    },
    cta: {
      headline: "Ready to start your dev journey?",
      subheadline: "Join developers learning with a system built for focus.",
      button: "Create free account",
    },
    footer: {
      tagline: "— Built for ADHD minds",
    },
  },
  impressum: {
    title: "Legal Notice",
    subtitle: "Information according to § 5 TMG (German Telemedia Act)",
    provider: {
      heading: "Provider",
    },
    contact: {
      heading: "Contact",
      emailLabel: "Email",
    },
    responsible: {
      heading: "Responsible for Content (§ 18 para. 2 MStV)",
    },
    dispute: {
      heading: "Dispute Resolution (§ 36 VSBG)",
      odrText:
        "The European Commission provides a platform for online dispute resolution (ODR):",
      noParticipation:
        "We are neither willing nor obligated to participate in dispute resolution proceedings before a consumer arbitration board.",
    },
    liability: {
      heading: "Disclaimer",
      contentHeading: "Liability for Content",
      contentText:
        "As a service provider, we are responsible for our own content on these pages in accordance with general laws (§ 7 para. 1 TMG). According to §§ 8 to 10 TMG, we are not obligated as a service provider to monitor transmitted or stored third-party information or to investigate circumstances that indicate illegal activity.",
      linksHeading: "Liability for Links",
      linksText:
        "Our website contains links to external third-party websites, the content of which we have no influence over. Therefore, we cannot accept any liability for this external content. The respective provider or operator of the linked pages is always responsible for the content of those pages.",
      copyrightHeading: "Copyright",
      copyrightText:
        "The content and works on these pages created by the site operator are subject to German copyright law. Duplication, processing, distribution, or any form of exploitation beyond the scope of copyright law requires the written consent of the respective author or creator.",
    },
  },
  datenschutz: {
    title: "Privacy Policy",
    subtitle: "Last updated: March 2026",
    sections: {
      s1: {
        title: "1. Controller",
        p1: "The controller within the meaning of the General Data Protection Regulation (GDPR) is:",
      },
      s2: {
        title: "2. Data Collected and Purpose of Processing",
        p1: "We process personal data only to the extent necessary to provide the platform. Specifically:",
        authHeading: "a) Registration and Authentication",
        authText:
          "An account is required to use Devfluent. Your email address is processed for this purpose. Authentication is provided via magic link (email OTP), password, or GitHub OAuth (via Supabase Auth).",
        authBasis: "Legal basis: Art. 6(1)(b) GDPR (performance of contract).",
        usageHeading: "b) Usage Data and Learning Progress",
        usageText:
          "To provide core features (learning tracking, XP system, streaks, achievements), we store:",
        usageItems: [
          "Learning block progress and completions",
          "Quiz results",
          "XP points, level, and streak counter",
          "Unlocked achievements",
          "Course and project entries",
          "Last login timestamp (for streak calculation)",
        ],
        usageBasis: "Legal basis: Art. 6(1)(b) GDPR (performance of contract).",
        logsHeading: "c) Server Logs",
        logsText:
          "When the web application is accessed, the hosting provider automatically stores server log files (IP address, timestamp, URL accessed, HTTP status, data volume transferred). These data are not personally accessible to us and are automatically deleted after 7 days.",
        logsBasis:
          "Legal basis: Art. 6(1)(f) GDPR (legitimate interest in operational security).",
      },
      s3: {
        title: "3. Processors and Third-Party Services",
        supabaseHeading: "Supabase",
        supabaseText:
          "We use Supabase (Supabase Inc., 970 Trestle Glen Rd, Oakland, CA 94610, USA) as our database and authentication service provider. Supabase processes personal data on our behalf based on a Data Processing Agreement (DPA) pursuant to Art. 28 GDPR. The database is located in the eu-west-1 (Ireland) region, so no transfer of data to third countries takes place.",
        supabaseMore: "Further information:",
        netcupHeading: "Netcup (Hosting)",
        netcupText:
          "Our server is operated by netcup GmbH (Daimlerstraße 25, 76185 Karlsruhe, Germany). As hosting provider, Netcup processes technical connection data (including IP addresses) on our behalf based on a Data Processing Agreement (DPA) pursuant to Art. 28 GDPR. Server log files are deleted within 7 days.",
        netcupMore: "Further information:",
        githubHeading: "GitHub OAuth (optional)",
        githubText:
          "If you sign in with GitHub, your GitHub account data (email address, username) will be used to create your account. The privacy policy of GitHub applies.",
      },
      s4: {
        title: "4. Cookies and Local Storage",
        p1: "The application uses functional cookies to maintain the login session (session token from Supabase Auth) and to store your language preference (NEXT_LOCALE). These cookies are technically necessary or serve a functional preference purpose and do not require separate consent under § 25(2) TTDSG.",
        p2: "No tracking cookies, advertising cookies, or third-party analytics cookies are set.",
      },
      s5: {
        title: "5. Retention Period",
        p1: "Personal data is stored for as long as your account is active. After deletion of your account, all associated data will be deleted from our systems within 30 days, provided no statutory retention obligations apply.",
      },
      s6: {
        title: "6. Your Rights (Art. 15–20, 22 GDPR)",
        p1: "You have the right at any time to:",
        rights: [
          "Access the data stored about you (Art. 15)",
          "Rectification of inaccurate data (Art. 16)",
          "Erasure of your data (\u201cright to be forgotten\u201d) (Art. 17)",
          "Restriction of processing (Art. 18)",
          "Data portability in a machine-readable format (Art. 20)",
        ],
        contact: "To exercise your rights, please contact us by email:",
        supervisory:
          "You also have the right to lodge a complaint with a data protection supervisory authority. The competent authority depends on your place of residence or the location of our company.",
      },
      objection: {
        heading: "Right to Object (Art. 21 GDPR)",
        p1: "You have the right at any time to object to the processing of personal data concerning you that is carried out on the basis of Art. 6(1)(f) GDPR (legitimate interest).",
        p2: "In the event of an objection, we will no longer process the relevant data unless we can demonstrate compelling legitimate grounds for the processing that override your interests, rights and freedoms, or the processing serves to assert, exercise or defend legal claims.",
        p3: "You can submit your objection informally by email:",
      },
      s7: {
        title: "7. No Automated Decision-Making (Art. 22 GDPR)",
        p1: "We do not use automated decision-making processes including profiling within the meaning of Art. 22 GDPR. No decisions are made that are based solely on automated processing and that have legal effects or similarly significantly affect you.",
      },
      s9: {
        title: "9. Data Security",
        p1: "Data transmission between your browser and our servers is exclusively via HTTPS (TLS encryption). Passwords are never stored in plain text. Database connections are authenticated and encrypted.",
      },
      s10: {
        title: "10. Changes to this Privacy Policy",
        p1: "We reserve the right to update this privacy policy if the legal situation or data processing practices change. The current version is always available at /datenschutz. Registered users will be notified by email of any material changes.",
      },
    },
  },
}

export default en
export type Dictionary = typeof en
