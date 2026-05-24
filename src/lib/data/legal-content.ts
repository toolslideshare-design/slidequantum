export const legalPages = {
  privacy: {
    title: "Privacy Policy",
    description:
      "Read how SlideQuantum collects, uses, and protects your data when you convert and download SlideShare presentations.",
    path: "/privacy",
    lastUpdated: "2026-05-24",
    sections: [
      {
        heading: "Overview",
        body: "SlideQuantum helps users preview and download public SlideShare presentations as PPT or PDF files. This Privacy Policy explains what information we process, why we process it, and the choices available to you.",
      },
      {
        heading: "Information We Collect",
        body: "We may process account details such as your name and email address when you create an account. When you submit a SlideShare URL, we process that link to generate previews and downloadable files. We also collect basic technical data such as browser type and request logs for security and performance monitoring.",
      },
      {
        heading: "How We Use Information",
        body: "We use submitted presentation links solely to fetch public SlideShare content, generate previews, create downloadable files, and power optional AI tools such as summaries, notes, quizzes, and explainers. Account information is used to provide dashboard features including download history and saved presentations.",
      },
      {
        heading: "Cookies and Local Storage",
        body: "We use cookies and similar technologies for authentication, session management, and site functionality. Some AI explainer responses may be saved locally in your browser if you choose to save them on your device.",
      },
      {
        heading: "Third-Party Services",
        body: "SlideShare content is retrieved from public SlideShare pages. If AI features are enabled, presentation text may be sent to configured AI providers to generate summaries, notes, quizzes, or explanations. We do not sell personal information.",
      },
      {
        heading: "Data Retention",
        body: "Account-related records are retained while your account remains active or as needed to provide the service. Download history and saved presentation metadata are stored to support dashboard functionality and can be deleted through your account where available.",
      },
      {
        heading: "Your Rights",
        body: "Depending on your location, you may have rights to access, correct, or delete personal information associated with your account. Contact us if you want to request account deletion or data access.",
      },
      {
        heading: "Contact",
        body: "If you have privacy questions, contact us through the Contact page on this website.",
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    description:
      "Review the terms for using SlideQuantum, including acceptable use, service limitations, and user responsibilities.",
    path: "/terms",
    lastUpdated: "2026-05-24",
    sections: [
      {
        heading: "Acceptance of Terms",
        body: "By accessing or using SlideQuantum, you agree to these Terms of Service. If you do not agree, do not use the service.",
      },
      {
        heading: "Service Description",
        body: "SlideQuantum provides tools to preview and download public SlideShare presentations in PPT or PDF format. Optional AI features may generate summaries, study notes, quizzes, and explanations from presentation content.",
      },
      {
        heading: "Acceptable Use",
        body: "You may use the service for lawful personal, educational, and professional purposes. You must only download or convert presentations you have the right to access and use. Do not use the service to infringe copyright, distribute malware, abuse rate limits, or attempt unauthorized access to private content.",
      },
      {
        heading: "Public Content Only",
        body: "The service supports publicly accessible SlideShare URLs. Private, login-protected, or restricted presentations may not be available for conversion.",
      },
      {
        heading: "Accounts",
        body: "If you create an account, you are responsible for maintaining the confidentiality of your credentials and for activity under your account.",
      },
      {
        heading: "Disclaimer",
        body: "The service is provided on an as-is and as-available basis. We do not guarantee uninterrupted availability, error-free conversion, or compatibility with every SlideShare presentation.",
      },
      {
        heading: "Limitation of Liability",
        body: "To the maximum extent permitted by law, SlideQuantum is not liable for indirect, incidental, or consequential damages arising from use of the service.",
      },
      {
        heading: "Changes",
        body: "We may update these Terms from time to time. Continued use of the service after changes are posted constitutes acceptance of the updated Terms.",
      },
    ],
  },
  about: {
    title: "About SlideQuantum",
    description:
      "Learn what SlideQuantum is, who it is for, and how it helps you download SlideShare presentations as PPT and PDF files online.",
    path: "/about",
    lastUpdated: "2026-05-24",
    sections: [
      {
        heading: "What is SlideQuantum?",
        body: "SlideQuantum is a free online tool that lets users download public SlideShare presentations as PPT or PDF files. It includes live preview, fast conversion, and AI-powered study tools.",
      },
      {
        heading: "Who is it for?",
        body: "The service is built for students, teachers, professionals, and teams who need offline access to SlideShare presentations for study, reporting, training, and collaboration.",
      },
      {
        heading: "Key Features",
        body: "Users can paste a SlideShare URL, preview slides, download PPT or PDF files, generate AI summaries, create study notes, build quizzes, and ask follow-up questions with the AI presentation explainer.",
      },
      {
        heading: "Why use this tool?",
        body: "It saves time, works in the browser without installing software, and combines downloading with AI learning tools in one place.",
      },
    ],
  },
  contact: {
    title: "Contact",
    description:
      "Contact SlideQuantum for support, privacy requests, and general questions about downloading SlideShare presentations.",
    path: "/contact",
    lastUpdated: "2026-05-24",
    sections: [
      {
        heading: "Support",
        body: "For help using the downloader, preview gallery, or AI tools, include the SlideShare URL and a short description of the issue when contacting us.",
      },
      {
        heading: "Privacy Requests",
        body: "For privacy-related requests such as account deletion or data access, mention Privacy Request in your message.",
      },
      {
        heading: "Business Inquiries",
        body: "For partnerships, feedback, or feature requests, send a brief message describing your request and we will respond when possible.",
      },
      {
        heading: "Response Time",
        body: "We aim to review messages within a reasonable timeframe. Response times may vary depending on request volume.",
      },
    ],
  },
} as const;

export type LegalPageKey = keyof typeof legalPages;
