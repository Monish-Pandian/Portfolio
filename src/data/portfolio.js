// All portfolio content lives here. Every value is a placeholder: replace it with your own.
// Add a project / certificate / skill group / role by adding one object to the right `items` array.
// The coins on the board and the detail overlay are generated from this file.
//
// Optional media on ANY item (leave out what you do not need):
//   images: ['/media/certificates/aws.jpg']      certificate / intern-letter photos (one or several)
//   video:  '/media/projects/demo.mp4'           a file in /public, or a YouTube link
//   poster: '/media/projects/demo.jpg'           thumbnail shown before an mp4 plays
//   logos:  [{ name: 'Python', src: '/media/logos/python.svg' }, ...]   skill logos
// Put the files under /public/media/... and refer to them with a path starting with /media/.


export const profile = {
  name: 'Monish Pandian D',

  role: 'IT Student | Developer | AI/ML Enthusiast',

  tagline: 'Building intelligent solutions through code, creativity, and continuous learning.',
  images:[""],
  intro:
    'I am an Information Technology student passionate about software development, problem-solving, and Artificial Intelligence. I build full-stack applications using React, Node.js, and MongoDB, while exploring Machine Learning, AI agents, and intelligent systems to solve real-world problems. I enjoy turning ideas into practical projects and continuously strengthening my skills through hands-on development and competitive programming.',
  
  location: 'Madurai,Tamil Nadu, India',

  email: 'monishpandian.25@gmail.com',

  resume: '/resume.pdf',

  links: [
    {
      label: 'LinkedIn',
      url: 'https://www.linkedin.com/in/monish-pandian-234a93333'
    },
    {
      label: 'GitHub',
      url: 'https://github.com/Monish-Pandian'
    },
    {
      label: 'LeetCode',
      url: 'https://leetcode.com/u/MONISH_PANDIAN/'
    },
  ],
};


// Muted accents, one per side of the board.
export const sections = [
  {
    key: 'projects',
    label: 'Projects',
    accent: '#c58a3a',
    blurb: 'Things I have built',
    items: [
      {
        id: 'proj-portfolio',
        short: 'P1',
        title: 'Carrom Portfolio',
        subtitle: 'This site',
        date: '2026',
        summary: 'An interactive 3D carrom board used as a portfolio, built with React, Three.js and Matter.js.',
        details: [
          'The board is rendered in 3D while the physics runs in 2D, which keeps collisions accurate and cheap.',
          'Navigation is a normal navbar as well as the game, so nobody is forced to play.',
        ],
        highlights: ['2D physics with Matter.js, 3D rendering with Three.js', 'Keyboard-accessible overlay and list view fallback'],
        tags: ['React', 'Three.js', 'Matter.js', 'Vite', 'Bootstrap'],
        links: [
          { label: 'Live', url: '' },
          { label: 'GitHub', url: 'https://github.com/your-handle/carrom-portfolio' },
        ],
      },
      {
        id: 'proj-tasks',
        short: 'P2',
        title: 'Task Manager',
        subtitle: 'Full-stack app',
        date: '2026',
        summary: 'A kanban-style task manager with authentication, drag and drop and real-time sync.',
        details: ['Describe the problem, your role, the decisions you made and what you learned.'],
        highlights: ['JWT authentication', 'Optimistic UI updates', 'Responsive down to 320px'],
        tags: ['React', 'Node.js', 'PostgreSQL'],
        links: [
          { label: 'Live', url: '' },
          { label: 'GitHub', url: 'https://github.com/your-handle/task-manager' },
        ],
      },
      {
        id: 'proj-weather',
        short: 'P3',
        title: 'Weather Dashboard',
        subtitle: 'API-driven frontend',
        date: '2025',
        summary: 'A dashboard that combines forecast, air quality and a seven-day trend chart.',
        details: ['Describe what data you used, how you handled loading and error states, and how you tested it.'],
        highlights: ['Caches API responses', 'Accessible charts'],
        tags: ['JavaScript', 'REST APIs', 'Chart.js'],
        links: [{ label: 'GitHub', url: 'https://github.com/your-handle/weather-dashboard' }],
      },
      {
        id: 'proj-chat',
        short: 'P4',
        title: 'Realtime Chat',
        subtitle: 'WebSockets',
        date: '2025',
        summary: 'A multi-room chat app with presence indicators and message history.',
        details: ['Describe the architecture, how you scaled it and what broke along the way.'],
        highlights: ['WebSocket reconnection logic', 'Message pagination'],
        tags: ['Node.js', 'Socket.IO', 'MongoDB'],
        links: [{ label: 'GitHub', url: 'https://github.com/your-handle/chat' }],
      },
    ],
  },
  {
    key: 'certificates',
    label: 'Certificates',
    accent: '#4f8f8b',
    blurb: 'Courses and credentials',
    items: [
      
        {
          id: 'cert-oracle-agentic-ai',
          short: 'C1',
          title: 'Agentic AI Certified Foundations Associate',
          subtitle: 'Oracle University',
          images: ['/media/certificates/AI_Agent.png'],
          date: 'October 28, 2026',

          summary: 'Completed Oracle University’s Agentic AI Foundations learning path, gaining foundational and practical knowledge of AI agent architecture, reasoning patterns, agent orchestration, tool integration, and enterprise AI applications using LangChain, OpenAI Agents SDK, Model Context Protocol (MCP), and Oracle Cloud Infrastructure.',

          details: [
            'AI Agent Fundamentals: Understanding AI agent architecture, LLMs, tools, execution loops, reasoning patterns, and safety guardrails.',
            
            'LangChain: Exploring LangChain building blocks, agent development, tool execution, and internal agent workflows.',
            
            'Model Context Protocol (MCP): Learning MCP architecture, core components, server-client communication, and connecting external tools and services to AI agents.',
            
            'OpenAI Agent Development: Exploring the OpenAI Responses API, Agents SDK, function calling, multi-agent systems, handoffs, and guardrails.',
            
            'OCI Enterprise AI Agents: Understanding enterprise agent architecture, agent lifecycle, platform building blocks, deployment, and scaling.',
            
            'Oracle AI Database: Exploring Oracle AI Vector Search, vector embeddings, similarity search workflows, Private Agent Factory, and Autonomous AI Database MCP Server.'
          ],

          highlights: [
            'Oracle University certification',
            'Hands-on AI agent development demonstrations',
            'LangChain and OpenAI Agents SDK',
            'Model Context Protocol (MCP) integration',
            'Multi-agent orchestration and tool calling',
            'Enterprise AI agents using Oracle Cloud Infrastructure',
            'Oracle AI Database and Vector Search'
          ],

          tags: [
            'Agentic AI',
            'Artificial Intelligence',
            'AI Agents',
            'Large Language Models (LLMs)',
            'LangChain',
            'OpenAI Agents SDK',
            'OpenAI Responses API',
            'Model Context Protocol (MCP)',
            'Prompt Engineering',
            'Function Calling',
            'Multi-Agent Systems',
            'AI Agent Orchestration',
            'AI Safety and Guardrails',
            'OCI Enterprise AI',
            'Oracle AI Database',
            'Vector Search',
            'Semantic Search'
          ],

          links: [
            {
              label: 'Verify Credential',
              url: 'https://catalog-education.oracle.com/pls/certview/sharebadge?id=9277466BCC811B2CF9D73FF7BFCA0461E6944299F4945C2E12F5E28336C29FF2'
            },
                
            {
              label: 'Official Oracle Learning Path',
              url: 'https://learn.oracle.com/ols/learning-path/become-an-oracle-agentic-ai-foundations-associate/146553/163239'
            }
          ],
        },

      
{
  id: 'cert-supervised-machine-learning',
  short: 'C2',
  title: 'Supervised Machine Learning: Regression and Classification',
  subtitle: 'DeepLearning.AI & Stanford University | Coursera',
  images: ['/media/certificates/Supervised_Learning.png'],
  date: 'June 27, 2026',

  summary: 'Successfully completed Andrew Ng’s Supervised Machine Learning: Regression and Classification course, gaining practical knowledge of supervised learning algorithms, predictive modeling, regression, and classification. Developed an understanding of how machine learning models learn from data through cost functions, gradient descent, feature engineering, and regularization using Python, NumPy, and Scikit-learn.',

  details: [
    'Introduction to Machine Learning: Understanding supervised and unsupervised learning, regression models, model representation, and the fundamentals of predictive modeling.',
    
    'Linear Regression: Learning single-variable and multiple-variable linear regression, cost functions, gradient descent, learning rates, and optimization techniques.',
    
    'Feature Engineering: Exploring vectorization with NumPy, feature scaling, feature engineering, and polynomial regression to improve model performance.',
    
    'Logistic Regression: Understanding binary classification, sigmoid functions, decision boundaries, logistic loss, and classification cost functions.',
    
    'Model Optimization: Implementing gradient descent for regression and classification, identifying overfitting, and applying regularization techniques.',
    
    'Practical Implementation: Working with Python, NumPy, Jupyter Notebooks, and Scikit-learn to build, train, and evaluate supervised machine learning models.'
  ],

  highlights: [
    'Completed Andrew Ng’s supervised machine learning course',
    'Implemented linear regression using gradient descent',
    'Explored multiple-variable regression and feature engineering',
    'Built logistic regression models for binary classification',
    'Practiced model optimization and regularization',
    'Hands-on Python, NumPy, and Scikit-learn labs',
    'Course authorized by DeepLearning.AI and Stanford University'
  ],

  tags: [
    'Machine Learning',
    'Supervised Learning',
    'Linear Regression',
    'Multiple Linear Regression',
    'Logistic Regression',
    'Gradient Descent',
    'Cost Function',
    'Feature Engineering',
    'Feature Scaling',
    'Polynomial Regression',
    'Binary Classification',
    'Regularization',
    'Overfitting',
    'Python',
    'NumPy',
    'Scikit-learn',
    'Jupyter Notebook'
  ],

  links: [
    {
      label: 'Verify Credential',
      url: 'https://coursera.org/verify/6BJ7K4S28RGA'
    },
    {
      label: 'Official Course Syllabus',
      url: 'https://www.coursera.org/learn/machine-learning'
    }
  ],
},

      {
        id: 'cert-cloud',
        short: 'C3',
        title: 'Cloud Fundamentals',
        subtitle: 'Example Cloud Provider',
        date: 'Jul 2025',
        summary: 'Core cloud services, networking, IAM and cost basics.',
        details: ['Describe the services you used hands-on.'],
        highlights: ['Hands-on labs completed'],
        tags: ['Cloud', 'IAM', 'Deployment'],
        links: [{ label: 'Verify credential', url: '' }],
      },
      {
        id: 'cert-js',
        short: 'C4',
        title: 'Advanced JavaScript',
        subtitle: 'Example Learning Platform',
        date: 'Jan 2025',
        summary: 'Closures, async patterns, the event loop, modules and tooling.',
        details: ['Describe a concept from the course that changed how you write code.'],
        highlights: ['Scored in the top 10%'],
        tags: ['JavaScript', 'Async'],
        links: [{ label: 'Verify credential', url: '' }],
      },
    ],
  },
  {
    key: 'skills',
    label: 'Skills',
    accent: '#7d72b5',
    blurb: 'What I work with',
    items: [
      {
        id: 'skill-lang',
        short: '{ }',
        title: 'Languages',
        subtitle: 'Day to day',
        date: '',
        summary: 'The languages I write most often.',
        details: ['Say how you use each one and how comfortable you are with it.'],
        highlights: [],
        tags: ['JavaScript', 'TypeScript', 'Python', 'SQL', 'Java'],
        links: [],
      },
      {
        id: 'skill-front',
        short: 'UI',
        title: 'Frontend',
        subtitle: 'Interfaces',
        date: '',
        summary: 'Building accessible, responsive interfaces.',
        details: ['Mention testing, accessibility and performance work.'],
        highlights: [],
        tags: ['React', 'Vite', 'Bootstrap', 'CSS', 'Three.js'],
        links: [],
      },
      {
        id: 'skill-back',
        short: 'API',
        title: 'Backend',
        subtitle: 'Servers and data',
        date: '',
        summary: 'REST APIs, auth and data modelling.',
        details: ['Mention the databases and patterns you are comfortable with.'],
        highlights: [],
        tags: ['Node.js', 'Express', 'PostgreSQL', 'MongoDB'],
        links: [],
      },
      {
        id: 'skill-tools',
        short: '>_',
        title: 'Tools & DevOps',
        subtitle: 'Shipping',
        date: '',
        summary: 'Version control, CI and deployment.',
        details: ['Mention how you release and monitor what you build.'],
        highlights: [],
        tags: ['Git', 'GitHub Actions', 'Docker', 'Linux'],
        links: [],
      },
      {
        id: 'skill-cs',
        short: 'CS',
        title: 'CS Fundamentals',
        subtitle: 'The foundations',
        date: '',
        summary: 'Algorithms, operating systems, networks and databases.',
        details: ['Mention coursework or projects that show it.'],
        highlights: [],
        tags: ['DSA', 'OS', 'Networks', 'DBMS'],
        links: [],
      },
    ],
  },
  {
    key: 'journey',
    label: 'Experience & Education',
    accent: '#b5574a',
    blurb: 'Where I have worked and studied',
    items: [
      {
        id: 'exp-intern',
        short: 'E1',
        title: 'Software Engineering Intern',
        subtitle: 'Example Company',
        date: 'Jun – Aug 2026',
        summary: 'Built and shipped features for an internal dashboard used by the support team.',
        details: ['Describe what you owned, what you shipped and the impact it had.'],
        highlights: ['Cut report generation time by 40%', 'Wrote the first test suite for the module'],
        tags: ['React', 'Node.js'],
        links: [],
      },
      {
        id: 'edu-degree',
        short: 'ED',
        title: 'B.Tech, Computer Science',
        subtitle: 'Example Institute of Technology',
        date: '2022 – 2026',
        summary: 'Core CS coursework with a focus on software engineering and databases.',
        details: ['Mention your CGPA if it helps, relevant coursework and your final-year project.'],
        highlights: ['CGPA: 0.0 / 10'],
        tags: ['Algorithms', 'DBMS', 'Software engineering'],
        links: [],
      },
      {
        id: 'ach-leetcode',
        short: 'LC',
        title: 'LeetCode',
        subtitle: 'Problem solving',
        date: 'Ongoing',
        summary: 'Regular practice on data structures and algorithms.',
        details: ['Add your solved count, rating and any badges.'],
        highlights: ['300+ problems solved'],
        tags: ['DSA'],
        links: [{ label: 'Profile', url: 'https://leetcode.com/u/your-handle' }],
      },
      {
        id: 'ach-hack',
        short: 'HK',
        title: 'Hackathon Finalist',
        subtitle: 'Example Hackathon 2025',
        date: '2025',
        summary: 'Built a working prototype in 24 hours with a team of four.',
        details: ['Describe what you built and what your part was.'],
        highlights: ['Top 10 of 120 teams'],
        tags: ['Teamwork', 'Prototyping'],
        links: [],
      },
    ],
  },
];

export const allItems = sections.flatMap((s, i) => s.items.map((item) => ({ ...item, sectionIndex: i })));
