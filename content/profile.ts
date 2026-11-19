// Everything on the page that isn't a project lives here. Edit and push to update.
export const profile = {
  name: 'Haris Ahmed Khan',
  shortName: 'Haris',
  role: 'Senior Full-Stack Engineer',
  headline: 'Senior full-stack engineer building AI-driven products in Python, TypeScript and React on AWS, GCP and Azure.',
  intro:
    '4+ years shipping production web apps end to end: database schema and APIs in Django, interfaces in React and Next.js, and the CI/CD and cloud infrastructure underneath. Lately that means LLM features: RAG pipelines, Azure AI Foundry and Microsoft Fabric integrations.',
  location: 'Lahore, Pakistan',
  availability: 'Open to senior full-stack roles',
  email: 'hak173129@gmail.com',
  links: {
    github: 'https://github.com/Haklifesavr',
    linkedin: 'https://www.linkedin.com/in/haris-ahmed-khan-819309192/',
    resume: 'https://drive.google.com/file/d/1D8KqcnBBgsEV8rRTpBiSy-wfHoMUo7f-/view?usp=sharing',
  },
  stats: [
    { value: '4+', label: 'years building production web apps' },
    { value: '5+', label: 'client projects led to production' },
    { value: '50%', label: 'shorter release cycles with CI/CD' },
    { value: '3', label: 'clouds: AWS, GCP and Azure' },
  ],
  experience: [
    {
      company: 'DevDimensions',
      title: 'Senior Software Engineer',
      period: 'Nov 2024 – Present',
      points: [
        'Led 5+ client projects from inception to production across Django, Next.js and React.',
        'Delivered AI platform work for Daivio: Microsoft Fabric LLM workflow integrations, RAG capabilities and Azure AI Foundry models.',
        'Designed AWS-based ETL pipelines for enterprise-scale data transformation.',
        'Ran CI/CD on GitHub Actions and GitLab CI/CD, cutting release cycles by 50%.',
      ],
    },
    {
      company: 'Mslm',
      title: 'Software Engineer',
      period: 'Sep 2023 – Oct 2024',
      points: [
        'Built cloud-native Python microservices and REST APIs for a high-traffic production environment.',
        'Developed and published Python SDKs for third-party developers.',
        'Integrated Stripe subscription billing and fine-grained authorisation with AuthZed SpiceDB.',
      ],
    },
    {
      company: 'ML Sense Solutions',
      title: 'Software Engineer',
      period: 'May 2022 – Aug 2023',
      points: [
        'Built full-stack apps in Next.js, React and Django, plus real-time BI dashboards.',
        'Cut infrastructure costs by ~25% with auto-scaling on AWS and GCP, and deployment incidents by 60% with Docker and CI/CD.',
        'Built Elasticsearch search across millions of documents with sub-100ms responses, and RAG pipelines on vector databases.',
      ],
    },
  ],
  skills: [
    { group: 'Languages', items: ['Python', 'TypeScript', 'JavaScript'] },
    { group: 'Backend', items: ['Django', 'Django REST Framework', 'Flask', 'Node.js', 'GraphQL'] },
    { group: 'Frontend', items: ['React', 'Next.js', 'React Native', 'Meteor.js'] },
    { group: 'AI / LLM', items: ['RAG pipelines', 'Vector databases', 'Prompt engineering', 'Azure AI Foundry', 'Microsoft Fabric', 'OpenAI API'] },
    { group: 'Data', items: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'BigQuery', 'Elasticsearch', 'Apache Airflow'] },
    { group: 'Cloud & DevOps', items: ['AWS', 'GCP', 'Azure (AKS)', 'Docker', 'GitHub Actions', 'GitLab CI/CD'] },
  ],
  education: 'B.Sc. Computer Science, Government College University Lahore (2017–2021)',
}
