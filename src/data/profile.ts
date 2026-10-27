// Everything here comes from the approved content draft (CONTENT-DRAFT.md) and the resume.
// Do not add employers, dates or numbers that are not in those sources.

// Spread on links to other sites so they open in a new tab; pair with a visually hidden
// " (opens in a new tab)" so screen-reader users know.
export const newTab = { target: '_blank', rel: 'noopener noreferrer' } as const;

export const AGENTFORGE_REPO ='https://github.com/Kingslee1604/2026AIProjects/blob/main/agentforge/';

export const profile = {
  name: 'Kingslee Velu',
  fullName: 'Kingslee Dominic Savio Velu',
  eyebrow: 'Senior Engineer · AI Platforms · Backend',
  headline: 'Senior engineer building reliable AI platforms and the backend systems they run on.',
  subline:
    '15+ years in healthcare IT (claims, enrollment, EDI, contact centers), now focused on LLM applications, AI agents and RAG. Based in Los Angeles.',
  description:
    'Kingslee Velu: senior engineer building reliable AI platforms and backend systems. 15+ years in healthcare IT; creator of AgentForge.',
  links: {
    github: 'https://github.com/Kingslee1604',
    linkedin: 'https://www.linkedin.com/in/kingsleevelu/',
    siteRepo: 'https://github.com/Kingslee1604/Kingslee1604.github.io',
  },
};

export const proofPoints = [
  { value: '15+ years', label: 'building enterprise healthcare backends (.NET, Python, Azure, AWS)' },
  {
    value: '50/50',
    label: 'AgentForge runs completed with the worker killed 29 times',
    source: `${AGENTFORGE_REPO}bench/results/durability.json`,
  },
  { value: 'M.S. CS', label: 'CSUDH, 2026 · GPA 3.87' },
];

export const experience = [
  {
    company: 'Molina Healthcare',
    role: 'Senior Engineer',
    dates: 'Sep 2024 – Present',
    bullets: [
      'Designed AI batch applications that use LLM APIs to audit contact-center conversations and score agent performance.',
      'Built and deployed Copilot Studio AI agents in Teams and SharePoint for document Q&A and API-driven answers.',
      'Delivered enterprise apps on .NET Core, Azure, Salesforce, Data Lake, SQL and Python; mentor junior engineers.',
    ],
  },
  {
    company: 'BravoLT',
    client: 'Corewell Health',
    role: 'Senior Software Engineer',
    dates: 'Mar 2021 – Sep 2024',
    bullets: [
      'Built AWS APIs (C#, API Gateway, Lambda, SQS, DynamoDB) for Facets member-enrollment workflows.',
      'Built healthcare apps on .NET Core 6/8, Azure and SQL Server, including X12 EDI integrations (834, 837, 835, 270, 271).',
      'Set up CI/CD and Python infrastructure as code to standardize Dev, Test and Prod; led Salesforce development integrated with Oracle.',
    ],
  },
  {
    company: 'Cognizant US',
    client: 'Wellmark',
    role: 'Senior Product Specialist',
    dates: 'Dec 2016 – Mar 2021',
    bullets: [
      'Led requirements and wrote high-level and technical designs for healthcare systems.',
      'Built Facets claim-adjudication extensions and tuned SQL Server procedures and batch jobs.',
      'Delivered an ASP.NET benefit-configuration portal with NLP automation that reads benefit summary documents.',
    ],
  },
  {
    company: 'Cognizant India',
    client: 'UHG, Wellmark',
    role: 'Product Specialist',
    note: 'Promoted from contractor to junior to product specialist',
    dates: 'Oct 2010 – Dec 2016',
    bullets: [
      'Built C# Facets extensions, SQL Server/Sybase components and data-mapping tools; supported Facets upgrades.',
      'Designed X12 EDI maps with IBM WTX; led a team of 5 and automated job scheduling.',
    ],
  },
];

export const skills = [
  { group: 'AI & LLM', items: ['LLM APIs', 'AI agents', 'RAG', 'MCP', 'Copilot Studio', 'Ollama', 'pgvector'] },
  { group: 'Backend', items: ['Python', 'FastAPI', 'C#', '.NET Core 6/8', 'ASP.NET Web API', 'Java', 'C++'] },
  { group: 'Data', items: ['PostgreSQL', 'SQL Server', 'Oracle', 'DynamoDB', 'MongoDB', 'Azure SQL'] },
  {
    group: 'Cloud & DevOps',
    items: ['Azure', 'AWS (Lambda, API Gateway, SQS, DynamoDB)', 'CI/CD', 'IaC', 'Azure DevOps', 'Jenkins'],
  },
  {
    group: 'Healthcare & integration',
    items: ['TriZetto Facets', 'X12 EDI', 'HL7', 'HIPAA', 'Informatica', 'IBM WTX'],
  },
  { group: 'Frontend & Salesforce', items: ['TypeScript', 'React', 'Next.js', 'Angular', 'Apex', 'Visualforce'] },
];

export const certifications = [
  'AWS Certified Developer',
  'AWS Certified Solutions Architect – Associate',
  'Microsoft Azure Fundamentals (AZ-900)',
  'Microsoft Programming in C#',
  'Salesforce Platform Developer I',
  'Salesforce Platform App Builder',
  'Salesforce Administrator',
  'Salesforce Agentforce Specialist',
  'TriZetto Facets Technical Associate',
  'TriZetto Facets Business Associate',
];

export const education = [
  { school: 'California State University, Dominguez Hills', degree: 'M.S. Computer Science', detail: 'GPA 3.87 · 2026' },
  { school: 'IFET College of Engineering (Anna University)', degree: 'B.E. Electronics & Communication', detail: '2006 – 2010' },
];
