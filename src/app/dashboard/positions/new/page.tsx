"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Blocks,
  Brain,
  Briefcase,
  Check,
  Cloud,
  Code2,
  Cpu,
  Database,
  LineChart,
  Palette,
  RefreshCcw,
  Shield,
  Smartphone,
  Users,
  X,
} from "lucide-react";
import * as React from "react";

import { Badge } from "~/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/trpc/react";

const skillsData = {
  // Programming
  Python: "Programming",
  JavaScript: "Programming",
  TypeScript: "Programming",
  Java: "Programming",
  "C++": "Programming",
  Go: "Programming",
  Rust: "Programming",
  SQL: "Programming",

  // DevOps
  Docker: "DevOps",
  Kubernetes: "DevOps",
  AWS: "DevOps",
  "CI/CD": "DevOps",
  "Infrastructure as Code": "DevOps",
  Monitoring: "DevOps",

  // Database
  PostgreSQL: "Database",
  MongoDB: "Database",
  Redis: "Database",
  Elasticsearch: "Database",

  // Architecture
  "System Design": "Architecture",
  Microservices: "Architecture",
  "API Design": "Architecture",
  Scalability: "Architecture",

  // Soft Skills
  Communication: "Soft Skills",
  "Problem Solving": "Soft Skills",
  "Team Leadership": "Soft Skills",
  "Project Management": "Soft Skills",
  "Time Management": "Soft Skills",

  // Frontend
  React: "Frontend",
  "Vue.js": "Frontend",
  Angular: "Frontend",
  CSS: "Frontend",
  HTML: "Frontend",

  // Mobile
  "React Native": "Mobile",
  iOS: "Mobile",
  Android: "Mobile",
  Flutter: "Mobile",

  // AI/ML
  "Machine Learning": "AI/ML",
  "Deep Learning": "AI/ML",
  "Natural Language Processing": "AI/ML",
  "Computer Vision": "AI/ML",
} as const;

type SkillsDataType = typeof skillsData;
type SkillName = keyof SkillsDataType;
type CategoryName = SkillsDataType[SkillName];

interface CategoryGroup {
  category: CategoryName;
  skills: SkillName[];
}

const iconMap = {
  Code2,
  Palette,
  Database,
  Cloud,
  Brain,
  Briefcase,
  LineChart,
  Smartphone,
  Shield,
  Cpu,
  Users,
  Blocks,
} as const;

type IconName = keyof typeof iconMap;

interface CommonPosition {
  id: string;
  title: string;
  icon: IconName;
  description: string;
  created_at: Date;
  updated_at: Date;
}

type JobTitle = string;

const steps = [
  {
    title: "Job Description",
    description: "Enter or upload the job description",
  },
  { title: "Skills", description: "Review and edit required skills" },
  {
    title: "Assessment",
    description: "Review and customize the technical case",
  },
];

const jobDescriptions: Record<JobTitle, string> = {
  "Full Stack Developer": `We are seeking a talented Full Stack Developer to join our engineering team. The ideal candidate will be responsible for developing and maintaining both client and server-side applications.

Key Responsibilities:
• Design, develop, and maintain web applications using modern frameworks and technologies
• Work with front-end and back-end code to build robust and scalable features
• Collaborate with cross-functional teams including designers, product managers, and other developers
• Write clean, maintainable, and efficient code
• Troubleshoot and debug applications
• Optimize applications for maximum speed and scalability
• Implement security and data protection measures
• Stay updated with emerging technologies and industry trends

Requirements:
• 3+ years of experience in full stack development
• Proficiency in front-end technologies including HTML, CSS, JavaScript, React, or Angular
• Strong knowledge of back-end technologies like Node.js, Python, Ruby, or Java
• Experience with databases (SQL, NoSQL)
• Understanding of server-side templating languages
• Familiarity with version control systems like Git
• Strong problem-solving skills and attention to detail
• Excellent communication and collaboration abilities`,

  "Frontend Developer": `We are looking for a skilled Frontend Developer to join our team. As a Frontend Developer, you will be responsible for implementing visual elements that users interact with on our web applications.

Key Responsibilities:
• Develop new user-facing features using React and modern JavaScript
• Build reusable components and libraries for future use
• Translate designs and wireframes into high-quality code
• Optimize components for maximum performance across devices and browsers
• Collaborate with back-end developers and designers
• Ensure the technical feasibility of UI/UX designs
• Help maintain code quality, organization, and automatization

Requirements:
• 2+ years of experience in frontend development
• Proficiency in HTML, CSS, and JavaScript/TypeScript
• Experience with React, Vue.js, or Angular
• Understanding of responsive design principles
• Knowledge of browser testing and debugging
• Familiarity with code versioning tools like Git
• Basic understanding of server-side rendering
• Strong problem-solving skills and attention to detail`,

  "Backend Developer": `We are seeking an experienced Backend Developer to design, build, and maintain efficient, reliable, and reusable server-side applications.

Key Responsibilities:
• Design and implement robust, scalable, and secure server-side applications
• Write clean, maintainable, and efficient code
• Build and maintain databases, data storage solutions
• Create and maintain API endpoints
• Implement security and data protection systems
• Optimize applications for maximum speed and scalability
• Collaborate with frontend developers and other team members
• Troubleshoot and debug applications

Requirements:
• 3+ years of experience in backend development
• Proficiency in one or more backend programming languages (Python, Java, Node.js, Go)
• Experience with databases (SQL, NoSQL)
• Knowledge of web servers and containerization (Docker, Kubernetes)
• Understanding of the basics of frontend technologies
• Experience with version control systems (Git)
• Problem-solving aptitude with attention to detail
• Strong communication skills`,

  "DevOps Engineer": `We are looking for a skilled DevOps Engineer to help us build and maintain our infrastructure, deployment, and development operations processes.

Key Responsibilities:
• Design, implement and manage CI/CD pipelines
• Automate infrastructure provisioning and configuration management
• Monitor systems for performance, availability, and security
• Implement and maintain cloud infrastructure (AWS, Azure, GCP)
• Configure and optimize container orchestration platforms (Kubernetes, Docker)
• Collaborate with development teams to improve deployment processes
• Implement security best practices and maintain compliance
• Create and update documentation for processes and infrastructure

Requirements:
• 3+ years of experience in DevOps or similar role
• Strong knowledge of Linux/Unix administration
• Experience with infrastructure as code (Terraform, CloudFormation)
• Proficiency with configuration management tools (Ansible, Chef, Puppet)
• Experience with containerization technologies (Docker, Kubernetes)
• Knowledge of CI/CD tools (Jenkins, GitLab CI, GitHub Actions)
• Understanding of networking concepts and security protocols
• Excellent troubleshooting and problem-solving skills`,

  "Data Scientist": `We are seeking a Data Scientist to join our team. In this role, you will work with stakeholders throughout the organization to identify opportunities for leveraging company data to drive business solutions.

Key Responsibilities:
• Collect, process, and analyze large datasets from various sources
• Build predictive models and machine learning algorithms
• Create data visualizations and dashboards to present insights
• Collaborate with product and engineering teams to implement data solutions
• Develop A/B testing frameworks and test hypotheses
• Improve data collection procedures to include relevant information
• Process, cleanse, and verify the integrity of data used for analysis
• Monitor and optimize model performance

Requirements:
• 3+ years of experience in data science or related field
• Proficiency in Python or R, and SQL
• Experience with data visualization tools (Tableau, Power BI)
• Strong knowledge of statistical analysis and machine learning algorithms
• Understanding of experimental design and causal inference
• Experience working with large datasets and distributed computing
• Excellent problem-solving and communication skills
• MS or PhD in Statistics, Computer Science, or related quantitative field preferred`,

  "Product Manager": `We are looking for a Product Manager to join our team and help us build products that our customers love.

Key Responsibilities:
• Define the product strategy and roadmap based on market research and customer feedback
• Work closely with engineering, design, and marketing teams to deliver features
• Gather and prioritize product requirements and create detailed product specifications
• Define success metrics for product features and monitor outcomes
• Conduct competitive analysis and stay updated on market trends
• Run user testing and incorporate feedback into product requirements
• Present product demos to internal teams and key stakeholders
• Act as the voice of the customer within the organization

Requirements:
• 3+ years of experience in product management or similar role
• Strong understanding of software development processes
• Experience with product management tools (JIRA, Asana, Trello)
• Ability to translate business requirements into technical requirements
• Excellent communication and presentation skills
• Strong analytical and problem-solving abilities
• Experience with Agile methodologies
• Bachelor's degree in Business, Computer Science, or related field`,

  "Data Engineer": `We are seeking a skilled Data Engineer to design, build, and maintain our data infrastructure. The ideal candidate will be responsible for developing, optimizing, and managing our data pipelines and data warehousing solutions.

Key Responsibilities:
• Design, build, and maintain efficient data pipeline architecture
• Develop ETL processes to extract data from various sources
• Build and optimize data models for analytics and reporting
• Implement data quality controls and monitoring systems
• Collaborate with data scientists and analysts to make data accessible
• Improve data reliability, efficiency, and quality
• Explore and implement new data acquisition tools and technologies
• Create and maintain technical documentation

Requirements:
• 3+ years of experience in data engineering or similar role
• Proficiency in SQL and programming languages like Python or Java
• Experience with data warehousing and ETL tools
• Knowledge of big data technologies (Hadoop, Spark, Kafka)
• Experience with cloud platforms (AWS, GCP, Azure)
• Understanding of data modeling and database design
• Familiarity with data visualization tools
• Strong problem-solving skills and attention to detail`,

  "Mobile Developer": `We are looking for a talented Mobile Developer to join our development team. As a Mobile Developer, you will be responsible for designing, building, and maintaining mobile applications for iOS and/or Android platforms.

Key Responsibilities:
• Design, build, and maintain high-quality mobile applications
• Collaborate with cross-functional teams to define, design, and ship new features
• Identify and correct bottlenecks and fix bugs
• Help maintain code quality, organization, and automatization
• Publish applications to the App Store and/or Google Play Store
• Continuously discover, evaluate, and implement new technologies
• Work with outside data sources and APIs
• Unit-test code for robustness, including edge cases, usability, and reliability

Requirements:
• 3+ years of experience in mobile development
• Proficiency in Swift or Kotlin/Java
• Experience with mobile frameworks like React Native or Flutter
• Knowledge of offline storage, threading, and performance optimization
• Familiarity with RESTful APIs to connect to back-end services
• Understanding of the full mobile development life cycle
• Experience with version control systems like Git
• Attention to detail and commitment to quality`,

  "Security Engineer": `We are seeking a skilled Security Engineer to help protect our systems, networks, and data from security threats.

Key Responsibilities:
• Design, implement, and maintain security systems and protocols
• Perform vulnerability assessments and security audits
• Develop and implement security standards and best practices
• Monitor systems for security breaches and investigate incidents
• Configure and maintain security tools, including firewalls and intrusion detection systems, and related hardware and software
• Conduct regular security awareness training for employees
• Stay up-to-date with the latest security trends and threats
• Collaborate with IT teams to ensure security measures are integrated into systems and applications

Requirements:
• 3+ years of experience in IT security or related field
• Strong knowledge of security frameworks and compliance standards (NIST, ISO 27001, SOC2)
• Experience with security tools and technologies (firewalls, SIEM, endpoint protection)
• Understanding of network security, web application security, and cloud security
• Knowledge of encryption technologies and key management
• Experience with security testing and vulnerability assessment
• Familiarity with scripting/programming languages for automation
• Relevant security certifications (CISSP, CEH, Security+) preferred`,

  "ML Engineer": `We are looking for a Machine Learning Engineer to help us build and deploy intelligent systems and machine learning models.

Key Responsibilities:
• Design and implement machine learning and deep learning systems
• Research and implement appropriate ML algorithms and tools
• Develop machine learning applications according to requirements
• Select appropriate datasets and data representation methods
• Run machine learning tests and experiments
• Perform statistical analysis and fine-tuning using test results
• Train and retrain systems when necessary
• Extend existing ML libraries and frameworks
• Keep up-to-date with the latest ML research and technologies

Requirements:
• 3+ years of experience in machine learning or related field
• Strong programming skills in Python and understanding of ML frameworks (TensorFlow, PyTorch)
• Experience with data science toolkits (NumPy, Pandas, scikit-learn)
• Good understanding of mathematics, probability, statistics, and algorithms
• Experience in deploying ML models to production
• Knowledge of data structures, data modeling, and software architecture
• Ability to write robust code in a collaborative environment
• MS or PhD in Computer Science, Mathematics, or related field preferred`,

  "Engineering Manager": `We are seeking an experienced Engineering Manager to lead our development team. As an Engineering Manager, you will be responsible for the productivity and success of your team while ensuring the delivery of high-quality software.

Key Responsibilities:
• Lead and mentor a team of software engineers
• Work with product managers to define project scope, goals, and deliverables
• Plan and prioritize development activities and resource allocation
• Establish engineering best practices and coding standards
• Conduct regular one-on-one meetings and performance reviews
• Facilitate communication between team members and other departments
• Identify and address team skill gaps through training and hiring
• Contribute to technical architecture decisions and code reviews
• Ensure on-time delivery of high-quality software products

Requirements:
• 5+ years of software development experience
• 2+ years of experience in a leadership or management role
• Strong technical background and understanding of software development principles
• Experience with Agile development methodologies
• Excellent communication and interpersonal skills
• Proven track record of project delivery and team leadership
• Ability to balance technical leadership with people management
• Bachelor's degree in Computer Science or related field`,

  "Software Architect": `We are seeking an experienced Software Architect to help design and implement innovative software solutions for our organization.

Key Responsibilities:
• Create high-level product specifications and design documents
• Define the architecture of the system, including key components and interfaces
• Make critical technical decisions that shape the product development
• Evaluate and select appropriate technologies and frameworks
• Guide development teams in implementing the architecture
• Ensure the architecture meets requirements for scalability, security, and performance
• Collaborate with stakeholders to balance business requirements with technical constraints
• Create and maintain technical documentation
• Review code and ensure adherence to architectural guidelines

Requirements:
• 7+ years of software development experience
• 3+ years of experience in software architecture or technical leadership
• Deep understanding of software design patterns and principles
• Experience with multiple programming languages and technologies
• Knowledge of system integration and API design
• Understanding of cloud platforms and distributed systems
• Strong analytical and problem-solving skills
• Excellent communication abilities to explain technical concepts
• Bachelor's or Master's degree in Computer Science or related field`,
};

export default function NewPositionPage() {
  const { data: commonPositions = [], isLoading: isLoadingPositions } =
    api.positions.getCommonPositions.useQuery();
  const [step, setStep] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [jobDescription, setJobDescription] = React.useState("");
  const [skills, setSkills] = React.useState<CategoryGroup[]>([]);
  const [newSkill, setNewSkill] = React.useState("");
  const [case_, setCase] = React.useState({
    title: "",
    difficulty: "medium",
    estimatedTime: "2 hours",
    objectives: [
      "Implement a RESTful API using Node.js and Express",
      "Create a React frontend with proper state management",
      "Implement proper error handling and input validation",
      "Write unit tests for critical components",
    ],
    evaluationCriteria: [
      "Code organization and architecture",
      "Error handling and edge cases",
      "Testing coverage and quality",
      "Documentation and code comments",
    ],
    description: "",
  });

  const handleNext = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (step === 1) {
      setSkills([
        {
          category: "Programming",
          skills: ["Python", "JavaScript", "TypeScript"],
        },
        {
          category: "DevOps",
          skills: ["Docker", "Kubernetes"],
        },
        {
          category: "Soft Skills",
          skills: ["Communication", "Problem Solving"],
        },
      ]);
    } else if (step === 2) {
      setCase((prev) => ({
        ...prev,
        title: "Full-Stack Web Application Development Case",
        description: `Build a task management application that allows users to create, update, and manage their daily tasks. 
        
Key Requirements:
- Implement user authentication and authorization
- Create a RESTful API with proper endpoint structure
- Develop a responsive React frontend with modern state management
- Implement real-time updates using WebSocket
- Include proper error handling and input validation
- Write comprehensive tests for both frontend and backend
- Use TypeScript for type safety
- Include proper documentation

The candidate should demonstrate their ability to create a well-structured, scalable application while following best practices in both frontend and backend development.`,
      }));
    }

    setLoading(false);
    setStep(step + 1);
  };

  const addSkill = (skillName: SkillName) => {
    const category = skillsData[skillName];
    setSkills((currentSkills) => {
      const categoryIndex = currentSkills.findIndex(
        (c) => c.category === category,
      );
      if (categoryIndex >= 0) {
        const newSkills = [...currentSkills];
        if (!newSkills[categoryIndex]?.skills.includes(skillName)) {
          newSkills[categoryIndex] = {
            category,
            skills: [...(newSkills[categoryIndex]?.skills || []), skillName],
          };
          return newSkills;
        }
        return currentSkills;
      }
      return [...currentSkills, { category, skills: [skillName] }];
    });
    setNewSkill("");
  };

  const removeSkill = (category: CategoryName, skill: SkillName) => {
    setSkills((currentSkills) => {
      const categoryIndex = currentSkills.findIndex(
        (c) => c.category === category,
      );
      if (categoryIndex >= 0 && currentSkills[categoryIndex]) {
        const newSkills = [...currentSkills];
        const updatedSkills = newSkills[categoryIndex]?.skills.filter(
          (s) => s !== skill,
        );
        if (updatedSkills && updatedSkills.length === 0) {
          return newSkills.filter((c) => c.category !== category);
        }
        if (newSkills[categoryIndex]) {
          newSkills[categoryIndex] = {
            category,
            skills: updatedSkills || [],
          };
        }
        return newSkills;
      }
      return currentSkills;
    });
  };

  const regenerateCase = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setCase((prev) => ({
      ...prev,
      description: `Create a real-time chat application with the following features:

Key Requirements:
- Implement user authentication with OAuth
- Create group chat functionality
- Add file sharing capabilities
- Implement message search and filtering
- Create a responsive UI with dark mode support
- Add typing indicators and read receipts
- Implement message encryption
- Add comprehensive test coverage

The candidate should focus on creating a secure, scalable chat application while demonstrating their understanding of real-time communication and modern web development practices.`,
    }));
    setLoading(false);
  };

  // Helper function to get the job description
  const getJobDescription = (title: string): string => {
    switch (title) {
      case "Full Stack Developer":
        return `We are seeking a talented Full Stack Developer to join our engineering team. The ideal candidate will be responsible for developing and maintaining both client and server-side applications.

Key Responsibilities:
• Design, develop, and maintain web applications using modern frameworks and technologies
• Work with front-end and back-end code to build robust and scalable features
• Collaborate with cross-functional teams including designers, product managers, and other developers
• Write clean, maintainable, and efficient code
• Troubleshoot and debug applications
• Optimize applications for maximum speed and scalability
• Implement security and data protection measures
• Stay updated with emerging technologies and industry trends

Requirements:
• 3+ years of experience in full stack development
• Proficiency in front-end technologies including HTML, CSS, JavaScript, React, or Angular
• Strong knowledge of back-end technologies like Node.js, Python, Ruby, or Java
• Experience with databases (SQL, NoSQL)
• Understanding of server-side templating languages
• Familiarity with version control systems like Git
• Strong problem-solving skills and attention to detail
• Excellent communication and collaboration abilities`;

      case "Frontend Developer":
        return `We are looking for a skilled Frontend Developer to join our team. As a Frontend Developer, you will be responsible for implementing visual elements that users interact with on our web applications.

Key Responsibilities:
• Develop new user-facing features using React and modern JavaScript
• Build reusable components and libraries for future use
• Translate designs and wireframes into high-quality code
• Optimize components for maximum performance across devices and browsers
• Collaborate with back-end developers and designers
• Ensure the technical feasibility of UI/UX designs
• Help maintain code quality, organization, and automatization

Requirements:
• 2+ years of experience in frontend development
• Proficiency in HTML, CSS, and JavaScript/TypeScript
• Experience with React, Vue.js, or Angular
• Understanding of responsive design principles
• Knowledge of browser testing and debugging
• Familiarity with code versioning tools like Git
• Basic understanding of server-side rendering
• Strong problem-solving skills and attention to detail`;

      case "Backend Developer":
        return `We are seeking an experienced Backend Developer to design, build, and maintain efficient, reliable, and reusable server-side applications.

Key Responsibilities:
• Design and implement robust, scalable, and secure server-side applications
• Write clean, maintainable, and efficient code
• Build and maintain databases, data storage solutions
• Create and maintain API endpoints
• Implement security and data protection systems
• Optimize applications for maximum speed and scalability
• Collaborate with frontend developers and other team members
• Troubleshoot and debug applications

Requirements:
• 3+ years of experience in backend development
• Proficiency in one or more backend programming languages (Python, Java, Node.js, Go)
• Experience with databases (SQL, NoSQL)
• Knowledge of web servers and containerization (Docker, Kubernetes)
• Understanding of the basics of frontend technologies
• Experience with version control systems (Git)
• Problem-solving aptitude with attention to detail
• Strong communication skills`;

      case "DevOps Engineer":
        return `We are looking for a skilled DevOps Engineer to help us build and maintain our infrastructure, deployment, and development operations processes.

Key Responsibilities:
• Design, implement and manage CI/CD pipelines
• Automate infrastructure provisioning and configuration management
• Monitor systems for performance, availability, and security
• Implement and maintain cloud infrastructure (AWS, Azure, GCP)
• Configure and optimize container orchestration platforms (Kubernetes, Docker)
• Collaborate with development teams to improve deployment processes
• Implement security best practices and maintain compliance
• Create and update documentation for processes and infrastructure

Requirements:
• 3+ years of experience in DevOps or similar role
• Strong knowledge of Linux/Unix administration
• Experience with infrastructure as code (Terraform, CloudFormation)
• Proficiency with configuration management tools (Ansible, Chef, Puppet)
• Experience with containerization technologies (Docker, Kubernetes)
• Knowledge of CI/CD tools (Jenkins, GitLab CI, GitHub Actions)
• Understanding of networking concepts and security protocols
• Excellent troubleshooting and problem-solving skills`;

      case "Data Scientist":
        return `We are seeking a Data Scientist to join our team. In this role, you will work with stakeholders throughout the organization to identify opportunities for leveraging company data to drive business solutions.

Key Responsibilities:
• Collect, process, and analyze large datasets from various sources
• Build predictive models and machine learning algorithms
• Create data visualizations and dashboards to present insights
• Collaborate with product and engineering teams to implement data solutions
• Develop A/B testing frameworks and test hypotheses
• Improve data collection procedures to include relevant information
• Process, cleanse, and verify the integrity of data used for analysis
• Monitor and optimize model performance

Requirements:
• 3+ years of experience in data science or related field
• Proficiency in Python or R, and SQL
• Experience with data visualization tools (Tableau, Power BI)
• Strong knowledge of statistical analysis and machine learning algorithms
• Understanding of experimental design and causal inference
• Experience working with large datasets and distributed computing
• Excellent problem-solving and communication skills
• MS or PhD in Statistics, Computer Science, or related quantitative field preferred`;

      case "Product Manager":
        return `We are looking for a Product Manager to join our team and help us build products that our customers love.

Key Responsibilities:
• Define the product strategy and roadmap based on market research and customer feedback
• Work closely with engineering, design, and marketing teams to deliver features
• Gather and prioritize product requirements and create detailed product specifications
• Define success metrics for product features and monitor outcomes
• Conduct competitive analysis and stay updated on market trends
• Run user testing and incorporate feedback into product requirements
• Present product demos to internal teams and key stakeholders
• Act as the voice of the customer within the organization

Requirements:
• 3+ years of experience in product management or similar role
• Strong understanding of software development processes
• Experience with product management tools (JIRA, Asana, Trello)
• Ability to translate business requirements into technical requirements
• Excellent communication and presentation skills
• Strong analytical and problem-solving abilities
• Experience with Agile methodologies
• Bachelor's degree in Business, Computer Science, or related field`;

      case "Data Engineer":
        return `We are seeking a skilled Data Engineer to design, build, and maintain our data infrastructure. The ideal candidate will be responsible for developing, optimizing, and managing our data pipelines and data warehousing solutions.

Key Responsibilities:
• Design, build, and maintain efficient data pipeline architecture
• Develop ETL processes to extract data from various sources
• Build and optimize data models for analytics and reporting
• Implement data quality controls and monitoring systems
• Collaborate with data scientists and analysts to make data accessible
• Improve data reliability, efficiency, and quality
• Explore and implement new data acquisition tools and technologies
• Create and maintain technical documentation

Requirements:
• 3+ years of experience in data engineering or similar role
• Proficiency in SQL and programming languages like Python or Java
• Experience with data warehousing and ETL tools
• Knowledge of big data technologies (Hadoop, Spark, Kafka)
• Experience with cloud platforms (AWS, GCP, Azure)
• Understanding of data modeling and database design
• Familiarity with data visualization tools
• Strong problem-solving skills and attention to detail`;

      case "Mobile Developer":
        return `We are looking for a talented Mobile Developer to join our development team. As a Mobile Developer, you will be responsible for designing, building, and maintaining mobile applications for iOS and/or Android platforms.

Key Responsibilities:
• Design, build, and maintain high-quality mobile applications
• Collaborate with cross-functional teams to define, design, and ship new features
• Identify and correct bottlenecks and fix bugs
• Help maintain code quality, organization, and automatization
• Publish applications to the App Store and/or Google Play Store
• Continuously discover, evaluate, and implement new technologies
• Work with outside data sources and APIs
• Unit-test code for robustness, including edge cases, usability, and reliability

Requirements:
• 3+ years of experience in mobile development
• Proficiency in Swift or Kotlin/Java
• Experience with mobile frameworks like React Native or Flutter
• Knowledge of offline storage, threading, and performance optimization
• Familiarity with RESTful APIs to connect to back-end services
• Understanding of the full mobile development life cycle
• Experience with version control systems like Git
• Attention to detail and commitment to quality`;

      case "Security Engineer":
        return `We are seeking a skilled Security Engineer to help protect our systems, networks, and data from security threats.

Key Responsibilities:
• Design, implement, and maintain security systems and protocols
• Perform vulnerability assessments and security audits
• Develop and implement security standards and best practices
• Monitor systems for security breaches and investigate incidents
• Configure and maintain security tools, including firewalls and intrusion detection systems, and related hardware and software
• Conduct regular security awareness training for employees
• Stay up-to-date with the latest security trends and threats
• Collaborate with IT teams to ensure security measures are integrated into systems and applications

Requirements:
• 3+ years of experience in IT security or related field
• Strong knowledge of security frameworks and compliance standards (NIST, ISO 27001, SOC2)
• Experience with security tools and technologies (firewalls, SIEM, endpoint protection)
• Understanding of network security, web application security, and cloud security
• Knowledge of encryption technologies and key management
• Experience with security testing and vulnerability assessment
• Familiarity with scripting/programming languages for automation
• Relevant security certifications (CISSP, CEH, Security+) preferred`;

      case "ML Engineer":
        return `We are looking for a Machine Learning Engineer to help us build and deploy intelligent systems and machine learning models.

Key Responsibilities:
• Design and implement machine learning and deep learning systems
• Research and implement appropriate ML algorithms and tools
• Develop machine learning applications according to requirements
• Select appropriate datasets and data representation methods
• Run machine learning tests and experiments
• Perform statistical analysis and fine-tuning using test results
• Train and retrain systems when necessary
• Extend existing ML libraries and frameworks
• Keep up-to-date with the latest ML research and technologies

Requirements:
• 3+ years of experience in machine learning or related field
• Strong programming skills in Python and understanding of ML frameworks (TensorFlow, PyTorch)
• Experience with data science toolkits (NumPy, Pandas, scikit-learn)
• Good understanding of mathematics, probability, statistics, and algorithms
• Experience in deploying ML models to production
• Knowledge of data structures, data modeling, and software architecture
• Ability to write robust code in a collaborative environment
• MS or PhD in Computer Science, Mathematics, or related field preferred`;

      case "Engineering Manager":
        return `We are seeking an experienced Engineering Manager to lead our development team. As an Engineering Manager, you will be responsible for the productivity and success of your team while ensuring the delivery of high-quality software.

Key Responsibilities:
• Lead and mentor a team of software engineers
• Work with product managers to define project scope, goals, and deliverables
• Plan and prioritize development activities and resource allocation
• Establish engineering best practices and coding standards
• Conduct regular one-on-one meetings and performance reviews
• Facilitate communication between team members and other departments
• Identify and address team skill gaps through training and hiring
• Contribute to technical architecture decisions and code reviews
• Ensure on-time delivery of high-quality software products

Requirements:
• 5+ years of software development experience
• 2+ years of experience in a leadership or management role
• Strong technical background and understanding of software development principles
• Experience with Agile development methodologies
• Excellent communication and interpersonal skills
• Proven track record of project delivery and team leadership
• Ability to balance technical leadership with people management
• Bachelor's degree in Computer Science or related field`;

      case "Software Architect":
        return `We are seeking an experienced Software Architect to help design and implement innovative software solutions for our organization.

Key Responsibilities:
• Create high-level product specifications and design documents
• Define the architecture of the system, including key components and interfaces
• Make critical technical decisions that shape the product development
• Evaluate and select appropriate technologies and frameworks
• Guide development teams in implementing the architecture
• Ensure the architecture meets requirements for scalability, security, and performance
• Collaborate with stakeholders to balance business requirements with technical constraints
• Create and maintain technical documentation
• Review code and ensure adherence to architectural guidelines

Requirements:
• 7+ years of software development experience
• 3+ years of experience in software architecture or technical leadership
• Deep understanding of software design patterns and principles
• Experience with multiple programming languages and technologies
• Knowledge of system integration and API design
• Understanding of cloud platforms and distributed systems
• Strong analytical and problem-solving skills
• Excellent communication abilities to explain technical concepts
• Bachelor's or Master's degree in Computer Science or related field`;

      default:
        return title;
    }
    // TypeScript safeguard (unreachable code but satisfies TypeScript)
    return "";
  };

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Create New Position</h1>
        <p className="text-muted-foreground">
          Set up a new position and we&apos;ll help you create the perfect
          assessment.
        </p>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <Breadcrumb>
          <BreadcrumbList>
            {steps.map((s, i) => (
              <React.Fragment key={i}>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href="#"
                    className={
                      step === i + 1
                        ? "font-medium text-foreground"
                        : step > i + 1
                          ? "text-muted-foreground"
                          : "pointer-events-none text-muted-foreground/50"
                    }
                  >
                    {s.title}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {i < steps.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
                <CardDescription>
                  Select from our list of common positions or write your own job
                  description.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="relative">
                  {isLoadingPositions ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                  ) : (
                    <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/50 hover:scrollbar-thumb-muted-foreground overflow-x-auto overflow-y-hidden pb-2">
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          {commonPositions
                            .slice(0, Math.ceil(commonPositions.length / 2))
                            .map((position: CommonPosition) => {
                              const Icon = iconMap[position.icon];
                              return (
                                <Button
                                  key={position.title}
                                  variant="outline"
                                  onClick={() => {
                                    setJobDescription(position.description);
                                  }}
                                  className="h-10 w-fit shrink-0 whitespace-nowrap"
                                >
                                  <Icon className="mr-2 h-4 w-4" />
                                  {position.title}
                                </Button>
                              );
                            })}
                        </div>
                        <div className="flex gap-2">
                          {commonPositions
                            .slice(Math.ceil(commonPositions.length / 2))
                            .map((position: CommonPosition) => {
                              const Icon = iconMap[position.icon];
                              return (
                                <Button
                                  key={position.title}
                                  variant="outline"
                                  onClick={() => {
                                    setJobDescription(position.description);
                                  }}
                                  className="h-10 w-fit shrink-0 whitespace-nowrap"
                                >
                                  <Icon className="mr-2 h-4 w-4" />
                                  {position.title}
                                </Button>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or
                    </span>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste your job description here..."
                    className="min-h-[200px]"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {loading && step === 1 && (
          <motion.div
            key="loading1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="relative h-20 w-20">
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-primary"
                style={{ borderTopColor: "transparent" }}
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              />
            </div>
            <p className="mt-4 text-center text-muted-foreground">
              Analyzing job description and extracting relevant skills...
            </p>
          </motion.div>
        )}

        {step === 2 && !loading && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
                <CardDescription>
                  Review and edit the skills required for this position.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {skills.map((category) => (
                    <div key={category.category} className="space-y-2">
                      <h3 className="text-sm font-medium">
                        {category.category}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {category.skills.map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="text-sm"
                          >
                            {skill}
                            <button
                              onClick={() =>
                                removeSkill(category.category, skill)
                              }
                              className="ml-2 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-[200px] justify-start"
                      >
                        {newSkill ? newSkill : "Add skill..."}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Search skill..." />
                        <CommandList>
                          <CommandEmpty>No skills found.</CommandEmpty>
                          {Object.entries(skillsData)
                            .filter(
                              ([skill]) =>
                                !skills.some((cat) =>
                                  cat.skills.includes(skill as SkillName),
                                ),
                            )
                            .map(([skill]) => (
                              <CommandItem
                                key={skill}
                                value={skill}
                                onSelect={(value) => {
                                  const skillName = value as SkillName;
                                  const category = skillsData[skillName];
                                  setSkills((currentSkills) => {
                                    const categoryIndex =
                                      currentSkills.findIndex(
                                        (c) => c.category === category,
                                      );
                                    if (categoryIndex >= 0) {
                                      const newSkills = [...currentSkills];
                                      if (
                                        !newSkills[
                                          categoryIndex
                                        ]?.skills.includes(skillName)
                                      ) {
                                        newSkills[categoryIndex] = {
                                          category,
                                          skills: [
                                            ...(newSkills[categoryIndex]
                                              ?.skills || []),
                                            skillName,
                                          ],
                                        };
                                        return newSkills;
                                      }
                                      return currentSkills;
                                    }
                                    return [
                                      ...currentSkills,
                                      { category, skills: [skillName] },
                                    ];
                                  });
                                }}
                              >
                                {skill}
                              </CommandItem>
                            ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {loading && step === 2 && (
          <motion.div
            key="loading2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="relative">
              <motion.div
                className="h-20 w-20 rounded-lg bg-primary/10"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute inset-0 h-20 w-20 rounded-lg bg-primary/20"
                animate={{
                  scale: [1.2, 1, 1.2],
                  rotate: [180, 360, 180],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: 0.2,
                }}
              />
            </div>
            <p className="mt-4 text-center text-muted-foreground">
              Generating assessment case based on required skills...
            </p>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>
                  {case_.title || "Technical Assessment Case"}
                </CardTitle>
                <CardDescription>
                  Review and customize the assessment case.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label>Difficulty</Label>
                    <Select
                      value={case_.difficulty}
                      onValueChange={(v) =>
                        setCase((prev) => ({ ...prev, difficulty: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label>Estimated Time</Label>
                    <Select
                      value={case_.estimatedTime}
                      onValueChange={(v) =>
                        setCase((prev) => ({ ...prev, estimatedTime: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1 hour">1 hour</SelectItem>
                        <SelectItem value="2 hours">2 hours</SelectItem>
                        <SelectItem value="4 hours">4 hours</SelectItem>
                        <SelectItem value="8 hours">8 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Main Objectives</Label>
                  <ul className="mt-2 space-y-2">
                    {case_.objectives.map((objective, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-sm">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <Label>Evaluation Criteria</Label>
                  <ul className="mt-2 space-y-2">
                    {case_.evaluationCriteria.map((criteria, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-sm">{criteria}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <Label>Case Description</Label>
                  <Textarea
                    value={case_.description}
                    onChange={(e) =>
                      setCase((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="mt-2 min-h-[200px]"
                  />
                </div>

                <Button
                  variant="outline"
                  onClick={regenerateCase}
                  disabled={loading}
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Regenerate Case
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 flex justify-end gap-2">
        {step > 1 && (
          <Button variant="outline" onClick={() => setStep(step - 1)}>
            Back
          </Button>
        )}
        {step < 3 ? (
          <Button onClick={handleNext} disabled={loading}>
            Next
          </Button>
        ) : (
          <Button
            onClick={() => (window.location.href = "/dashboard/positions")}
            className="bg-verbo-purple hover:bg-verbo-purple/90"
          >
            Create Position
          </Button>
        )}
      </div>
    </div>
  );
}
