import { ProjectType, TechCategory, LaneKey } from "../types";

const en = {
  brand: "Stack Architect",
  common: {
    docs: "Docs",
  },

  header: {
    editStack: "Edit Stack",
    editStackTitle: "Reopen the guided stack builder",
    templates: "Templates",
    export: "Export",
    exportTitle: "Export Diagram & ADR",
    stackValid: "Stack Valid",
    stackReviewable: "Suggestions Available",
    errors: "Errors",
    warnings: "Warnings",
    components: "components",
    lightTheme: "Switch to light theme",
    darkTheme: "Switch to dark theme",
    language: "Language",
    moreOptions: "More options",
  },

  wizard: {
    backToDiagram: "Back to diagram",
    stepOf: "Step {current} of {total}",
    back: "Back",
    continueLabel: "Continue",
    skip: "Skip",
    generate: "Generate Architecture",
    extrasRailLabel: "Extras",
    projectRailLabel: "Project",
    selectAtLeastOne: "Select at least one option to continue.",
  },

  projectType: {
    heading: "What are you building?",
    subheading: "Pick the closest match — we'll ask about the right layers next, one at a time.",
    nameLabel: "Project name",
    namePlaceholder: "e.g. Orbit",
    startFromTemplate: "Start from a template",
  },

  layer: {
    optional: "Optional",
    required: "Required",
  },

  extras: {
    heading: "Anything else?",
    subheading: "Optional building blocks — caching, search, monitoring, and more. Add only what your project needs.",
  },

  stackPicker: {
    title: "Add components",
    searchPlaceholder: "Search technologies...",
    all: "All",
    clearLayer: "Clear this layer",
    noResults: "No components found",
    closeLabel: "Close component library",
  },

  diagram: {
    empty: "Add components from the panel to see your architecture diagram.",
    zoomIn: "Zoom In",
    zoomOut: "Zoom Out",
    resetView: "Center & Reset",
    components: "technical components",
    actorSingular: "actor",
    actorPlural: "actors",
    nodeSelected: "Selected: {title} — {subtitle}",
  },

  lanes: {
    actors: "Actors",
    client: "Client / Frontend",
    backend: "Backend & APIs",
    data: "Data & Queues",
    external: "External Services",
    infrastructure: "Infrastructure",
  } satisfies Record<LaneKey, string>,

  inspector: {
    panelTitle: "Inspector",
    closeLabel: "Close inspector",
    about: "About",
    connections: "Connections",
    role: "Role",
    category: "Category",
    pricing: "Pricing",
    bestFor: "Best for",
    viewDocs: "View Documentation",
    removeFromStack: "Remove from Stack",
    inbound: "Inbound",
    outbound: "Outbound",
    noInbound: "No incoming connections.",
    noOutbound: "No outbound connections.",
  },

  validation: {
    passedTitle: "Validation passed",
    passedDetail: "all component interfaces and protocol pipelines are valid.",
    diagnostics: "Architecture Diagnostics",
    error: "Error",
    errors: "Errors",
    warning: "Warning",
    warnings: "Warnings",
    suggestion: "Suggestion",
    suggestions: "Suggestions",
    expand: "Expand Details",
    collapse: "Collapse",
    recommendation: "Recommendation:",
  },

  projectConfigModal: {
    title: "Project Profile",
    subtitle: "Fine-tune the context used to validate your architecture.",
    nameLabel: "Project Name",
    namePlaceholder: "e.g. Orbit",
    descriptionLabel: "Description",
    descriptionPlaceholder: "What does this project do?",
    trafficLabel: "Expected Traffic",
    budgetLabel: "Budget",
    cancel: "Cancel",
    save: "Save",
    traffic: {
      low: "Low (< 10k req/day)",
      medium: "Medium (100k req/day)",
      high: "High (1M+ req/day)",
      enterprise: "Enterprise scale",
    },
    budget: {
      free_tier: "Free tier / cost efficiency",
      moderate: "Balanced production",
      scale_ready: "Scale-ready priority",
    },
  },

  presetsModal: {
    title: "Battle-Tested Architecture Templates",
    subtitle: "Instantly load proven, production-ready stack topologies.",
    loadBlueprint: "Load Blueprint",
    more: "+{count} more",
  },

  exportModal: {
    title: "Export Architecture & Definitions",
    subtitle: "Generate diagrams, C4 DSL models, and Architecture Decision Records.",
    copy: "Copy Code",
    copied: "Copied!",
    download: "Download File",
    hints: {
      mermaid: "Render directly in GitHub, Notion, or Mermaid Live Editor.",
      markdown: "Production-ready RFC / Technical Architecture Document.",
      c4: "Compliant with Structurizr and C4 model tooling.",
      json: "Machine-readable graph topology (nodes, edges, zones).",
      svg: "Scalable vector image — crisp at any size, easy to edit.",
      png: "Raster image — ready to drop into docs, slides, or chat.",
    },
    copyImage: "Copy Image",
  },

  pricingModel: {
    "Open Source": "Open Source",
    "Freemium": "Freemium",
    "Managed SaaS": "Managed SaaS",
    "Cloud Resource": "Cloud Resource",
  } as Record<string, string>,

  complexity: {
    "Simple": "Simple",
    "Moderate": "Moderate",
    "Complex": "Complex",
    "Enterprise Distributed": "Enterprise Distributed",
  } as Record<string, string>,

  categories: {
    frontend: { label: "Frontend & Web UI", description: "User interfaces, client-side rendering, and web frameworks" },
    backend: { label: "Backend & APIs", description: "Server logic, REST/GraphQL endpoints, and business services" },
    mobile: { label: "Mobile Apps", description: "iOS, Android, and cross-platform native frameworks" },
    database: { label: "Databases & Data Stores", description: "Relational, document, key-value, and distributed storage" },
    auth: { label: "Authentication & Identity", description: "User authentication, OAuth, session management, and RBAC" },
    cache: { label: "Cache & In-Memory", description: "High-speed caching, session stores, and rate limiting" },
    storage: { label: "Object & Blob Storage", description: "Asset hosting, media files, document storage, and backups" },
    payments: { label: "Payments & Billing", description: "Checkout flows, recurring subscriptions, and merchant payouts" },
    messaging: { label: "Messaging & Event Bus", description: "Asynchronous task queues, pub/sub, and streaming pipelines" },
    ai_llm: { label: "AI, LLMs & Vector Search", description: "Foundation models, generative AI pipelines, and embeddings" },
    search: { label: "Full-Text & Instant Search", description: "Search indexes, typo tolerance, and faceted querying" },
    monitoring: { label: "Monitoring & Observability", description: "Error tracking, application performance (APM), and metrics" },
    deployment: { label: "Hosting & Cloud Compute", description: "Containers, serverless functions, and infrastructure providers" },
    cicd: { label: "CI/CD & DevOps", description: "Automated testing, build pipelines, and Infrastructure as Code" },
    communication: { label: "Email & Communications", description: "Transactional emails, SMS, push notifications, and webhooks" },
  } satisfies Record<TechCategory, { label: string; description: string }>,

  projectTypes: {
    saas: { label: "SaaS / B2B App", tagline: "Subscriptions, workspaces, team accounts" },
    ai_app: { label: "AI / LLM App", tagline: "RAG, embeddings, model inference" },
    mobile: { label: "Mobile App", tagline: "iOS, Android, cross-platform" },
    ecommerce: { label: "E-Commerce", tagline: "Checkout, catalog, instant search" },
    marketplace: { label: "Marketplace", tagline: "Two-sided buyers, sellers, payouts" },
    realtime: { label: "Real-Time App", tagline: "Live sync, sockets, collaboration" },
    microservices: { label: "Microservices", tagline: "Decoupled services, event bus" },
    api: { label: "API / Backend", tagline: "REST or GraphQL service, no UI" },
    web: { label: "Website", tagline: "Content site or simple web app" },
  } satisfies Record<ProjectType, { label: string; tagline: string }>,
};

const fr: typeof en = {
  brand: "Stack Architect",
  common: {
    docs: "Doc",
  },

  header: {
    editStack: "Modifier la stack",
    editStackTitle: "Rouvrir l'assistant de configuration",
    templates: "Modèles",
    export: "Exporter",
    exportTitle: "Exporter le diagramme et l'ADR",
    stackValid: "Stack valide",
    stackReviewable: "Suggestions disponibles",
    errors: "Erreurs",
    warnings: "Avertissements",
    components: "composants",
    lightTheme: "Passer au thème clair",
    darkTheme: "Passer au thème sombre",
    language: "Langue",
    moreOptions: "Plus d'options",
  },

  wizard: {
    backToDiagram: "Retour au diagramme",
    stepOf: "Étape {current} sur {total}",
    back: "Retour",
    continueLabel: "Continuer",
    skip: "Passer",
    generate: "Générer l'architecture",
    extrasRailLabel: "Options",
    projectRailLabel: "Projet",
    selectAtLeastOne: "Sélectionnez au moins une option pour continuer.",
  },

  projectType: {
    heading: "Que construisez-vous ?",
    subheading: "Choisissez le plus proche — on vous proposera ensuite les bonnes couches, une par une.",
    nameLabel: "Nom du projet",
    namePlaceholder: "ex. Orbit",
    startFromTemplate: "Partir d'un modèle",
  },

  layer: {
    optional: "Optionnel",
    required: "Obligatoire",
  },

  extras: {
    heading: "Autre chose ?",
    subheading: "Briques optionnelles — cache, recherche, supervision, et plus. N'ajoutez que ce dont votre projet a besoin.",
  },

  stackPicker: {
    title: "Ajouter des composants",
    searchPlaceholder: "Rechercher une technologie...",
    all: "Tout",
    clearLayer: "Vider cette couche",
    noResults: "Aucun composant trouvé",
    closeLabel: "Fermer la bibliothèque de composants",
  },

  diagram: {
    empty: "Ajoutez des composants depuis le panneau pour voir votre diagramme d'architecture.",
    zoomIn: "Zoomer",
    zoomOut: "Dézoomer",
    resetView: "Centrer et réinitialiser",
    components: "composants techniques",
    actorSingular: "acteur",
    actorPlural: "acteurs",
    nodeSelected: "Sélectionné : {title} — {subtitle}",
  },

  lanes: {
    actors: "Acteurs",
    client: "Client / Frontend",
    backend: "Backend & API",
    data: "Données & files",
    external: "Services externes",
    infrastructure: "Infrastructure",
  } satisfies Record<LaneKey, string>,

  inspector: {
    panelTitle: "Inspecteur",
    closeLabel: "Fermer l'inspecteur",
    about: "Détails",
    connections: "Connexions",
    role: "Rôle",
    category: "Catégorie",
    pricing: "Tarification",
    bestFor: "Idéal pour",
    viewDocs: "Voir la documentation",
    removeFromStack: "Retirer de la stack",
    inbound: "Entrantes",
    outbound: "Sortantes",
    noInbound: "Aucune connexion entrante.",
    noOutbound: "Aucune connexion sortante.",
  },

  validation: {
    passedTitle: "Validation réussie",
    passedDetail: "toutes les interfaces de composants et pipelines de protocole sont valides.",
    diagnostics: "Diagnostic d'architecture",
    error: "Erreur",
    errors: "Erreurs",
    warning: "Avertissement",
    warnings: "Avertissements",
    suggestion: "Suggestion",
    suggestions: "Suggestions",
    expand: "Voir les détails",
    collapse: "Réduire",
    recommendation: "Recommandation :",
  },

  projectConfigModal: {
    title: "Profil du projet",
    subtitle: "Ajustez le contexte utilisé pour valider votre architecture.",
    nameLabel: "Nom du projet",
    namePlaceholder: "ex. Orbit",
    descriptionLabel: "Description",
    descriptionPlaceholder: "Que fait ce projet ?",
    trafficLabel: "Trafic attendu",
    budgetLabel: "Budget",
    cancel: "Annuler",
    save: "Enregistrer",
    traffic: {
      low: "Faible (< 10k req/jour)",
      medium: "Moyen (100k req/jour)",
      high: "Élevé (1M+ req/jour)",
      enterprise: "Échelle entreprise",
    },
    budget: {
      free_tier: "Offre gratuite / économe",
      moderate: "Production équilibrée",
      scale_ready: "Priorité à la scalabilité",
    },
  },

  presetsModal: {
    title: "Modèles d'architecture éprouvés",
    subtitle: "Chargez instantanément des topologies de stack prêtes pour la production.",
    loadBlueprint: "Charger ce modèle",
    more: "+{count} de plus",
  },

  exportModal: {
    title: "Exporter l'architecture",
    subtitle: "Générez des diagrammes, des modèles C4 DSL et des fiches de décision d'architecture.",
    copy: "Copier le code",
    copied: "Copié !",
    download: "Télécharger le fichier",
    hints: {
      mermaid: "À afficher directement dans GitHub, Notion ou Mermaid Live Editor.",
      markdown: "Document d'architecture technique prêt pour la production.",
      c4: "Compatible avec Structurizr et les outils du modèle C4.",
      json: "Topologie de graphe exploitable par machine (nœuds, liens, zones).",
      svg: "Image vectorielle — nette à toute taille, facile à modifier.",
      png: "Image matricielle — prête pour vos docs, slides ou messages.",
    },
    copyImage: "Copier l'image",
  },

  pricingModel: {
    "Open Source": "Open source",
    "Freemium": "Freemium",
    "Managed SaaS": "SaaS managé",
    "Cloud Resource": "Ressource cloud",
  } as Record<string, string>,

  complexity: {
    "Simple": "Simple",
    "Moderate": "Modérée",
    "Complex": "Complexe",
    "Enterprise Distributed": "Distribuée entreprise",
  } as Record<string, string>,

  categories: {
    frontend: { label: "Frontend & interface web", description: "Interfaces utilisateur, rendu côté client et frameworks web" },
    backend: { label: "Backend & API", description: "Logique serveur, points d'accès REST/GraphQL et services métier" },
    mobile: { label: "Applications mobiles", description: "Frameworks natifs et cross-platform iOS, Android" },
    database: { label: "Bases de données", description: "Stockage relationnel, document, clé-valeur et distribué" },
    auth: { label: "Authentification & identité", description: "Authentification utilisateur, OAuth, sessions et RBAC" },
    cache: { label: "Cache & mémoire", description: "Cache haute vitesse, stockage de session et limitation de débit" },
    storage: { label: "Stockage d'objets", description: "Hébergement de médias, fichiers, documents et sauvegardes" },
    payments: { label: "Paiements & facturation", description: "Parcours de paiement, abonnements récurrents et reversements" },
    messaging: { label: "Messagerie & bus d'événements", description: "Files d'attente asynchrones, pub/sub et flux de streaming" },
    ai_llm: { label: "IA, LLM & recherche vectorielle", description: "Modèles fondation, pipelines d'IA générative et embeddings" },
    search: { label: "Recherche plein texte", description: "Index de recherche, tolérance aux fautes et filtres à facettes" },
    monitoring: { label: "Supervision & observabilité", description: "Suivi des erreurs, performance applicative (APM) et métriques" },
    deployment: { label: "Hébergement & cloud", description: "Conteneurs, fonctions serverless et fournisseurs d'infrastructure" },
    cicd: { label: "CI/CD & DevOps", description: "Tests automatisés, pipelines de build et infrastructure as code" },
    communication: { label: "Email & communications", description: "Emails transactionnels, SMS, notifications push et webhooks" },
  } satisfies Record<TechCategory, { label: string; description: string }>,

  projectTypes: {
    saas: { label: "SaaS / App B2B", tagline: "Abonnements, espaces de travail, comptes d'équipe" },
    ai_app: { label: "Application IA / LLM", tagline: "RAG, embeddings, inférence de modèle" },
    mobile: { label: "Application mobile", tagline: "iOS, Android, cross-platform" },
    ecommerce: { label: "E-commerce", tagline: "Paiement, catalogue, recherche instantanée" },
    marketplace: { label: "Marketplace", tagline: "Acheteurs, vendeurs, reversements" },
    realtime: { label: "App temps réel", tagline: "Synchronisation live, sockets, collaboration" },
    microservices: { label: "Microservices", tagline: "Services découplés, bus d'événements" },
    api: { label: "API / Backend", tagline: "Service REST ou GraphQL, sans interface" },
    web: { label: "Site web", tagline: "Site de contenu ou application web simple" },
  } satisfies Record<ProjectType, { label: string; tagline: string }>,
};

export type Locale = "en" | "fr";
export type Translations = typeof en;

export const translations: Record<Locale, Translations> = { en, fr };

export function formatTemplate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));
}
