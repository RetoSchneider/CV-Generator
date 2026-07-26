import type { CV } from "../types";
import type { Locale } from "../i18n/translations";

const id = () => Math.random().toString(36).slice(2, 10);

/* ---- localised strings ----------------------------------------------- */

interface SampleStrings {
  title: string;
  summary: string;
  currentCompany: string;
  firstEmployer: string;
  bootcampProvider: string;
  bootcampProgram: string;
  bootcampNotes: string;
  schoolDiploma: string;
  schoolNotes: string;
  juniorRole: string;
  bootcampRole: string;
  resetRole: string;
  resetCompany: string;
  resetBullet1: string;
  resetBullet2: string;
  preItRole: string;
  preItCompany: string;
  preItBullet1: string;
  preItBullet2: string;
  breakRole: string;
  breakCompany: string;
  breakBullet: string;
  skill_languages: string;
  skill_frontend: string;
  skill_backend: string;
  skill_testing: string;
  skill_devops: string;
  skill_ways: string;
  skill_ways_items: string[];
  interest_keyboards: string;
  interest_homelab: string;
  interest_rpg: string;
  interest_scifi: string;
  gamer_headline: string;
  gamer_blurb: string;
  gamer_bullet1: string;
  gamer_bullet2: string;
  gamer_bullet3: string;
  language_native: string;
  language_native_label: string;
  language_english_label: string;
  highlight_current_1: string;
  highlight_current_2: string;
  highlight_current_3: string;
  highlight_current_4: string;
  highlight_first_1: string;
  highlight_first_2: string;
  highlight_first_3: string;
  highlight_bootcamp_1: string;
  highlight_bootcamp_2: string;
  highlight_bootcamp_3: string;
}

const STRINGS: Record<Locale, SampleStrings> = {
  en: {
    title: "Software Engineer · QA / Test Automation",
    summary:
      "Self-taught software engineer with 4+ years of production experience after a full-stack bootcamp. I ship pragmatic features end-to-end and treat quality as a first-class concern — I write the tests I wish my past self had written. Comfortable across the stack, sharper on the test-automation and reliability side. Career-changer; the years before IT taught me to communicate with humans, not just compilers.",
    currentCompany: "Current Company",
    firstEmployer: "First IT Employer",
    bootcampProvider: "Bootcamp Provider",
    bootcampProgram: "Full-Stack Web Development Bootcamp",
    bootcampNotes: "JavaScript, React, Node, SQL/NoSQL, Git, deployment, agile basics.",
    schoolDiploma: "Secondary School Diploma",
    schoolNotes: "No university degree — entered tech through bootcamp + portfolio.",
    juniorRole: "Junior Software Developer",
    bootcampRole: "Full-Stack Web Development Bootcamp",
    resetRole: "Career Reset · Self-Directed Study",
    resetCompany: "Pivot into Tech",
    resetBullet1: "Decided to leave the previous industry behind and commit to software full-time.",
    resetBullet2: "~6 months of focused self-study before bootcamp: 100 Days of Code, Odin Project, freeCodeCamp.",
    preItRole: "Pre-IT Career (consolidated)",
    preItCompany: "Various roles · retail, hospitality, logistics",
    preItBullet1: "Worked across customer-facing and operational roles before pivoting to tech.",
    preItBullet2: "What I took from it: clear communication under pressure, comfort with ambiguity, and zero ego when something needs fixing.",
    breakRole: "Career Break",
    breakCompany: "Personal time",
    breakBullet:
      "Took deliberate time out for personal reasons. Came back with a clearer head and a habit of building small things on the side.",
    skill_languages: "Languages",
    skill_frontend: "Frontend",
    skill_backend: "Backend",
    skill_testing: "Testing & QA",
    skill_devops: "DevOps & Tooling",
    skill_ways: "Ways of working",
    skill_ways_items: ["Agile / Scrum", "Code review", "Mentoring juniors", "Writing docs"],
    interest_keyboards: "Mechanical keyboards",
    interest_homelab: "Home-lab tinkering",
    interest_rpg: "Tabletop RPGs",
    interest_scifi: "Long-form sci-fi",
    gamer_headline: "Gaming, unironically.",
    gamer_blurb:
      "I've spent serious hours in MMOs, strategy and indie titles — gaming taught me systems thinking, patience with bad UX, and how to lead a group of 20 strangers toward a goal at 11pm on a Wednesday. I bring that to standups.",
    gamer_bullet1: "Guild officer / raid lead — coordinated weekly progression for a 25-person team.",
    gamer_bullet2: "Tournament admin for a local indie-game community (~150 players).",
    gamer_bullet3: "Built and maintain a few small mods / quality-of-life tools for games I love.",
    language_native: "Native",
    language_native_label: "Native Language",
    language_english_label: "English",
    highlight_current_1:
      "Owned the migration of a flaky Selenium suite to Playwright, cutting CI runtime from 38 → 9 minutes and false-failure rate by ~80%.",
    highlight_current_2:
      "Designed a reusable test-data factory used across 4 product teams, removing ~600 lines of duplicated setup per repo.",
    highlight_current_3:
      "Pair-built features with backend devs from ticket to release; shipped roughly 1 feature/week with zero rollback in the last 9 months.",
    highlight_current_4:
      "Run the team's onboarding for new hires — wrote the internal 'first 30 days' guide that 6 engineers now use.",
    highlight_first_1: "First role out of bootcamp — moved from ticket-fixer to feature-owner inside 6 months.",
    highlight_first_2: "Built a customer-facing reporting dashboard (React + Recharts) used by ~200 daily users.",
    highlight_first_3: "Introduced unit-test discipline to a legacy Express service; coverage grew from 12% → 64%.",
    highlight_bootcamp_1: "Intensive 6-month program: HTML/CSS/JS → React → Node/Express → SQL/NoSQL → deployment.",
    highlight_bootcamp_2: "Capstone: a full-stack inventory app with auth, role-based access, and a CI pipeline.",
    highlight_bootcamp_3: "Graduated top 10% of cohort; mentored two later cohorts on Git/PR hygiene.",
  },

  de: {
    title: "Software Engineer · QA / Test-Automation",
    summary:
      "Quereinsteiger mit 4+ Jahren Produktionserfahrung nach einem Full-Stack-Bootcamp — ohne Studium, dafür mit Portfolio. Ich liefere Features pragmatisch von Anfang bis Ende und behandle Qualität als First-Class-Thema; ich schreibe die Tests, die ich mir früher gewünscht hätte. Bin im ganzen Stack zu Hause, am stärksten im Bereich Testautomatisierung und Reliability. Die Jahre vor der IT haben mich gelehrt, mit Menschen zu sprechen, nicht nur mit Compilern.",
    currentCompany: "Aktueller Arbeitgeber",
    firstEmployer: "Erster IT-Arbeitgeber",
    bootcampProvider: "Bootcamp-Anbieter",
    bootcampProgram: "Full-Stack Web Development Bootcamp",
    bootcampNotes: "JavaScript, React, Node, SQL/NoSQL, Git, Deployment, Agile-Grundlagen.",
    schoolDiploma: "Mittlere Reife / Abitur",
    schoolNotes: "Kein Studium — Einstieg in die IT über Bootcamp + Portfolio.",
    juniorRole: "Junior Software Developer",
    bootcampRole: "Full-Stack Web Development Bootcamp",
    resetRole: "Karriere-Neustart · Eigenstudium",
    resetCompany: "Wechsel in die Tech-Branche",
    resetBullet1: "Bewusste Entscheidung, die alte Branche zu verlassen und Vollzeit in Software einzusteigen.",
    resetBullet2: "~6 Monate fokussiertes Eigenstudium vor dem Bootcamp: 100 Days of Code, Odin Project, freeCodeCamp.",
    preItRole: "Berufslaufbahn vor der IT (zusammengefasst)",
    preItCompany: "Verschiedene Rollen · Einzelhandel, Gastronomie, Logistik",
    preItBullet1: "Vor dem Wechsel in die IT in kundennahen und operativen Rollen gearbeitet.",
    preItBullet2:
      "Was geblieben ist: klare Kommunikation unter Druck, Umgang mit Unklarheit und null Ego, wenn etwas zu reparieren ist.",
    breakRole: "Auszeit",
    breakCompany: "Privat",
    breakBullet:
      "Bewusst aus persönlichen Gründen pausiert. Zurückgekommen mit klarem Kopf und der Gewohnheit, nebenbei kleine Dinge zu bauen.",
    skill_languages: "Sprachen",
    skill_frontend: "Frontend",
    skill_backend: "Backend",
    skill_testing: "Testing & QA",
    skill_devops: "DevOps & Tools",
    skill_ways: "Arbeitsweise",
    skill_ways_items: ["Agile / Scrum", "Code Reviews", "Mentoring von Junioren", "Doku schreiben"],
    interest_keyboards: "Mechanische Tastaturen",
    interest_homelab: "Homelab basteln",
    interest_rpg: "Pen-and-Paper-Rollenspiele",
    interest_scifi: "Lange Sci-Fi-Romane",
    gamer_headline: "Gaming, ohne Ironie.",
    gamer_blurb:
      "Ich habe ernsthafte Stunden in MMOs, Strategie- und Indie-Titeln verbracht — Gaming hat mir Systemdenken beigebracht, Geduld mit schlechter UX und wie man 20 Fremde an einem Mittwochabend um 23 Uhr auf ein Ziel ausrichtet. Das nehme ich ins Daily mit.",
    gamer_bullet1: "Gilden-Offizier / Raid Lead — wöchentliche Progression für ein 25-Personen-Team koordiniert.",
    gamer_bullet2: "Turnier-Admin für eine lokale Indie-Game-Community (~150 Spieler:innen).",
    gamer_bullet3: "Kleine Mods und Quality-of-Life-Tools für Lieblingsspiele gebaut und gepflegt.",
    language_native: "Muttersprache",
    language_native_label: "Deutsch",
    language_english_label: "Englisch",
    highlight_current_1:
      "Migration einer instabilen Selenium-Suite zu Playwright verantwortet — CI-Laufzeit von 38 → 9 Min., False-Failure-Rate ~80 % gesenkt.",
    highlight_current_2:
      "Wiederverwendbare Test-Data-Factory entworfen, eingesetzt in 4 Produktteams; ~600 Zeilen Duplikat-Setup pro Repo entfernt.",
    highlight_current_3:
      "Features im Pair-Programming mit Backend-Devs vom Ticket bis Release ausgeliefert; ca. 1 Feature/Woche, in den letzten 9 Monaten kein Rollback.",
    highlight_current_4:
      "Onboarding für neue Mitarbeitende verantwortet — internes „erste 30 Tage“-Handbuch verfasst, das heute 6 Engineers nutzen.",
    highlight_first_1: "Erste Stelle nach dem Bootcamp — innerhalb von 6 Monaten vom Ticket-Fixer zum Feature-Owner gewachsen.",
    highlight_first_2: "Kunden-Reporting-Dashboard gebaut (React + Recharts), ~200 tägliche Nutzer:innen.",
    highlight_first_3: "Unit-Test-Disziplin in einem Legacy-Express-Service eingeführt; Coverage von 12 % → 64 % gehoben.",
    highlight_bootcamp_1: "Intensives 6-monatiges Programm: HTML/CSS/JS → React → Node/Express → SQL/NoSQL → Deployment.",
    highlight_bootcamp_2: "Capstone: Full-Stack-Inventar-App mit Auth, Rollen-Rechten und CI-Pipeline.",
    highlight_bootcamp_3: "Top 10 % der Kohorte; zwei nachfolgende Kohorten in Git/PR-Hygiene gementored.",
  },

  fr: {
    title: "Software Engineer · QA / Automatisation des tests",
    summary:
      "Ingénieur logiciel autodidacte avec 4+ ans d'expérience en production après un bootcamp full-stack. Je livre des fonctionnalités de bout en bout, pragmatiquement, et je traite la qualité comme un sujet de premier plan — j'écris les tests que mon moi passé aurait aimé avoir. À l'aise sur tout le stack, plus pointu en automatisation des tests et fiabilité. Reconverti ; les années pré-IT m'ont appris à parler aux humains, pas seulement aux compilateurs.",
    currentCompany: "Entreprise actuelle",
    firstEmployer: "Premier employeur IT",
    bootcampProvider: "Organisme de bootcamp",
    bootcampProgram: "Bootcamp développement web full-stack",
    bootcampNotes: "JavaScript, React, Node, SQL/NoSQL, Git, déploiement, bases de l'agile.",
    schoolDiploma: "Diplôme du secondaire",
    schoolNotes: "Pas de diplôme universitaire — entrée dans la tech via bootcamp + portfolio.",
    juniorRole: "Développeur logiciel junior",
    bootcampRole: "Bootcamp développement web full-stack",
    resetRole: "Reconversion · Étude autonome",
    resetCompany: "Pivot vers la tech",
    resetBullet1: "Décision assumée de quitter mon ancien secteur pour me consacrer au développement à plein temps.",
    resetBullet2: "~6 mois d'auto-formation ciblée avant le bootcamp : 100 Days of Code, Odin Project, freeCodeCamp.",
    preItRole: "Carrière pré-IT (consolidée)",
    preItCompany: "Postes variés · commerce, hôtellerie, logistique",
    preItBullet1: "Postes en contact client et opérationnels avant ma reconversion vers la tech.",
    preItBullet2:
      "Ce que j'en garde : communication claire sous pression, à l'aise avec l'ambiguïté, zéro ego quand il faut réparer.",
    breakRole: "Pause de carrière",
    breakCompany: "Temps personnel",
    breakBullet:
      "Pause assumée pour raisons personnelles. Revenu avec la tête plus claire et l'habitude de bricoler de petits projets à côté.",
    skill_languages: "Langages",
    skill_frontend: "Frontend",
    skill_backend: "Backend",
    skill_testing: "Tests & QA",
    skill_devops: "DevOps & outils",
    skill_ways: "Façons de travailler",
    skill_ways_items: ["Agile / Scrum", "Revue de code", "Mentorat juniors", "Rédaction de docs"],
    interest_keyboards: "Claviers mécaniques",
    interest_homelab: "Home-lab et bricolage",
    interest_rpg: "JdR sur table",
    interest_scifi: "Romans SF longs",
    gamer_headline: "Gaming, sans ironie.",
    gamer_blurb:
      "J'ai passé de vraies heures sur des MMO, des jeux de stratégie et des indés — le gaming m'a appris la pensée systémique, la patience face aux mauvaises UX et à conduire 20 inconnus vers un objectif un mercredi à 23 h. Je l'amène en daily.",
    gamer_bullet1: "Officier de guilde / raid lead — progression hebdo coordonnée pour une équipe de 25 personnes.",
    gamer_bullet2: "Admin de tournois pour une communauté indé locale (~150 joueurs).",
    gamer_bullet3: "Petits mods et outils de confort maintenus pour des jeux que j'aime.",
    language_native: "Langue maternelle",
    language_native_label: "Français",
    language_english_label: "Anglais",
    highlight_current_1:
      "Migration d'une suite Selenium instable vers Playwright pilotée — temps CI 38 → 9 min, taux de faux échecs réduit d'environ 80 %.",
    highlight_current_2:
      "Conception d'une test-data factory réutilisable adoptée par 4 équipes produit — ~600 lignes de setup dupliqué retirées par dépôt.",
    highlight_current_3:
      "Features livrées en pair avec le backend, du ticket à la mise en prod ; ~1 feature/semaine, zéro rollback sur les 9 derniers mois.",
    highlight_current_4:
      "Onboarding des nouveaux pilotés ; rédaction du guide interne « 30 premiers jours », utilisé par 6 ingénieurs aujourd'hui.",
    highlight_first_1: "Premier poste post-bootcamp — passé de fix-de-tickets à propriétaire de features en 6 mois.",
    highlight_first_2: "Dashboard de reporting client (React + Recharts) utilisé par ~200 personnes par jour.",
    highlight_first_3: "Discipline de tests unitaires installée sur un service Express legacy ; couverture 12 % → 64 %.",
    highlight_bootcamp_1: "Programme intensif de 6 mois : HTML/CSS/JS → React → Node/Express → SQL/NoSQL → déploiement.",
    highlight_bootcamp_2: "Projet final : appli inventaire full-stack avec auth, rôles et pipeline CI.",
    highlight_bootcamp_3: "Diplômé dans le top 10 % de la promo ; mentorat de deux promos suivantes sur l'hygiène Git/PR.",
  },

  it: {
    title: "Software Engineer · QA / Test Automation",
    summary:
      "Ingegnere software autodidatta con 4+ anni di esperienza in produzione dopo un bootcamp full-stack. Rilascio feature pragmatiche end-to-end e tratto la qualità come tema di prima fascia — scrivo i test che il mio io passato avrebbe voluto avere. Mi muovo su tutto lo stack, più a fondo su test automation e reliability. Ho cambiato carriera; gli anni pre-IT mi hanno insegnato a parlare con le persone, non solo con i compilatori.",
    currentCompany: "Azienda attuale",
    firstEmployer: "Primo datore di lavoro IT",
    bootcampProvider: "Provider del bootcamp",
    bootcampProgram: "Bootcamp di sviluppo web full-stack",
    bootcampNotes: "JavaScript, React, Node, SQL/NoSQL, Git, deployment, basi di agile.",
    schoolDiploma: "Diploma di scuola superiore",
    schoolNotes: "Nessuna laurea — ingresso nel tech tramite bootcamp + portfolio.",
    juniorRole: "Junior Software Developer",
    bootcampRole: "Bootcamp di sviluppo web full-stack",
    resetRole: "Riconversione · Studio autonomo",
    resetCompany: "Passaggio nel tech",
    resetBullet1: "Decisione consapevole di lasciare il vecchio settore e dedicarmi al software a tempo pieno.",
    resetBullet2: "~6 mesi di studio autonomo focalizzato prima del bootcamp: 100 Days of Code, Odin Project, freeCodeCamp.",
    preItRole: "Carriera pre-IT (consolidata)",
    preItCompany: "Ruoli vari · retail, ristorazione, logistica",
    preItBullet1: "Ruoli a contatto col cliente e operativi prima del passaggio al tech.",
    preItBullet2:
      "Cosa mi è rimasto: comunicazione chiara sotto pressione, dimestichezza con l'ambiguità ed ego zero quando c'è da sistemare qualcosa.",
    breakRole: "Pausa di carriera",
    breakCompany: "Tempo personale",
    breakBullet:
      "Pausa consapevole per motivi personali. Tornato con la testa più lucida e l'abitudine di costruire piccole cose nel tempo libero.",
    skill_languages: "Linguaggi",
    skill_frontend: "Frontend",
    skill_backend: "Backend",
    skill_testing: "Testing & QA",
    skill_devops: "DevOps & strumenti",
    skill_ways: "Modi di lavorare",
    skill_ways_items: ["Agile / Scrum", "Code review", "Mentoring junior", "Scrittura di doc"],
    interest_keyboards: "Tastiere meccaniche",
    interest_homelab: "Home-lab fai-da-te",
    interest_rpg: "GdR da tavolo",
    interest_scifi: "Romanzi sci-fi lunghi",
    gamer_headline: "Gaming, senza ironia.",
    gamer_blurb:
      "Ho passato ore vere su MMO, strategici e titoli indie — il gaming mi ha insegnato il pensiero sistemico, la pazienza con UX pessime e a guidare 20 sconosciuti verso un obiettivo un mercoledì alle 23. Lo porto nello standup.",
    gamer_bullet1: "Ufficiale di gilda / raid lead — progressione settimanale coordinata per un team di 25 persone.",
    gamer_bullet2: "Admin di tornei per una community indie locale (~150 giocatori).",
    gamer_bullet3: "Costruisco e mantengo piccoli mod e tool di quality-of-life per giochi che mi piacciono.",
    language_native: "Madrelingua",
    language_native_label: "Italiano",
    language_english_label: "Inglese",
    highlight_current_1:
      "Migrazione di una suite Selenium instabile verso Playwright — tempo CI 38 → 9 min, tasso di falsi fallimenti ~80 % in meno.",
    highlight_current_2:
      "Test-data factory riutilizzabile adottata da 4 team di prodotto — ~600 righe di setup duplicato rimosse per repo.",
    highlight_current_3:
      "Feature realizzate in pair con il backend, dal ticket al rilascio; ~1 feature/settimana, zero rollback negli ultimi 9 mesi.",
    highlight_current_4:
      "Onboarding dei nuovi inserimenti curato — redatta la guida interna „primi 30 giorni“, ora usata da 6 ingegneri.",
    highlight_first_1: "Primo ruolo post-bootcamp — da fix di ticket a feature owner in 6 mesi.",
    highlight_first_2: "Dashboard di reporting per i clienti (React + Recharts) usata da ~200 utenti al giorno.",
    highlight_first_3: "Disciplina di unit test introdotta in un servizio Express legacy; copertura 12 % → 64 %.",
    highlight_bootcamp_1: "Programma intensivo di 6 mesi: HTML/CSS/JS → React → Node/Express → SQL/NoSQL → deployment.",
    highlight_bootcamp_2: "Progetto finale: app inventario full-stack con auth, ruoli e pipeline CI.",
    highlight_bootcamp_3: "Diplomato nel top 10 % della classe; mentor di due classi successive su igiene Git/PR.",
  },
};

/* ---- builder --------------------------------------------------------- */

export function buildSampleCV(locale: Locale = "en"): CV {
  const s = STRINGS[locale];

  return {
    personal: {
      fullName: "Your Name",
      title: s.title,
      location: "City, Country",
      email: "you@domain.dev",
      phone: "+00 000 000 0000",
      website: "yourname.dev",
      github: "github.com/yourname",
      linkedin: "linkedin.com/in/yourname",
      pronouns: "",
      photoShape: "circle",
    },

    summary: s.summary,

    experience: [
      {
        id: id(),
        role: "Software Engineer / QA Automation",
        company: s.currentCompany,
        location: "City, Country",
        start: "2022-08",
        end: "Present",
        stack: ["TypeScript", "React", "Node", "Playwright", "Cypress", "Docker", "GitHub Actions"],
        highlights: [
          s.highlight_current_1,
          s.highlight_current_2,
          s.highlight_current_3,
          s.highlight_current_4,
        ],
      },
      {
        id: id(),
        role: s.juniorRole,
        company: s.firstEmployer,
        location: "City, Country",
        start: "2021-09",
        end: "2022-07",
        stack: ["JavaScript", "React", "Express", "PostgreSQL", "Jest"],
        highlights: [s.highlight_first_1, s.highlight_first_2, s.highlight_first_3],
      },
      {
        id: id(),
        role: s.bootcampRole,
        company: s.bootcampProvider,
        location: "City / Remote",
        start: "2021-03",
        end: "2021-08",
        stack: ["JavaScript", "React", "Node", "MongoDB", "Git"],
        highlights: [s.highlight_bootcamp_1, s.highlight_bootcamp_2, s.highlight_bootcamp_3],
      },
      {
        id: id(),
        role: s.resetRole,
        company: s.resetCompany,
        location: "—",
        start: "2020-09",
        end: "2021-02",
        stack: ["HTML", "CSS", "JavaScript", "Git"],
        isBreak: true,
        highlights: [s.resetBullet1, s.resetBullet2],
      },
      {
        id: id(),
        role: s.preItRole,
        company: s.preItCompany,
        location: "—",
        start: "2014",
        end: "2020",
        stack: [],
        highlights: [s.preItBullet1, s.preItBullet2],
      },
      {
        id: id(),
        role: s.breakRole,
        company: s.breakCompany,
        location: "—",
        start: "2017",
        end: "2018",
        stack: [],
        isBreak: true,
        highlights: [s.breakBullet],
      },
    ],

    education: [
      {
        id: id(),
        credential: s.bootcampProgram,
        institution: s.bootcampProvider,
        location: "City / Remote",
        start: "2021-03",
        end: "2021-08",
        notes: s.bootcampNotes,
      },
      {
        id: id(),
        credential: s.schoolDiploma,
        institution: "School Name",
        location: "City, Country",
        start: "—",
        end: "—",
        notes: s.schoolNotes,
      },
    ],

    skills: [
      { id: id(), label: s.skill_languages, items: ["TypeScript", "JavaScript", "Python", "SQL", "HTML/CSS"] },
      { id: id(), label: s.skill_frontend, items: ["React", "Vite", "Tailwind", "Zustand", "Vitest", "Storybook"] },
      { id: id(), label: s.skill_backend, items: ["Node.js", "Express", "REST", "PostgreSQL", "MongoDB", "Redis"] },
      {
        id: id(),
        label: s.skill_testing,
        items: ["Playwright", "Cypress", "Jest / Vitest", "Postman", "Test design", "Bug triage", "Exploratory testing"],
      },
      { id: id(), label: s.skill_devops, items: ["Git", "GitHub Actions", "Docker", "Linux/CLI", "Vercel", "Sentry"] },
      { id: id(), label: s.skill_ways, items: s.skill_ways_items },
    ],

    projects: [
      {
        id: id(),
        name: "cv-forge",
        tagline: "Local-first CV generator with PDF + DOCX export.",
        link: "github.com/yourname/cv-forge",
        stack: ["React", "TypeScript", "Tailwind", "jsPDF", "docx"],
        highlights: [
          "Three print-ready templates, live preview, no backend — runs entirely in the browser.",
          "Custom DOCX renderer that mirrors the on-screen layout for ATS-friendly Word output.",
        ],
      },
      {
        id: id(),
        name: "raid-planner",
        tagline: "Lightweight scheduler for guild raids with role-balancing.",
        link: "github.com/yourname/raid-planner",
        stack: ["Next.js", "Prisma", "Postgres"],
        highlights: [
          "Side project that started as a Discord bot, now ~40 weekly active users from my guild.",
          "Forced me to actually learn auth, rate-limiting, and 'people will misuse this' edge cases.",
        ],
      },
    ],

    certifications: [
      { id: id(), name: "ISTQB Foundation Level", issuer: "ISTQB", year: "2023" },
      { id: id(), name: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services", year: "2024" },
    ],

    languages: [
      { id: id(), name: s.language_english_label, level: "Fluent", certificate: "Cambridge C1 Advanced" },
      { id: id(), name: s.language_native_label, level: "Native" },
    ],

    interests: [
      { id: id(), label: s.interest_keyboards },
      { id: id(), label: s.interest_homelab },
      { id: id(), label: s.interest_rpg },
      { id: id(), label: s.interest_scifi },
    ],

    meta: {
      template: "modern",
      accent: "cyan",
      showPhotoMonogram: true,
      density: "compact",
      locale,
    },
  };
}

/** Default sample (English) — kept for compatibility with the old import. */
export const sampleCV = buildSampleCV("en");
