export interface TeamMember {
  id: number
  name: string
  email: string
  role: string
  department: string
  isAdmin: boolean
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 1,
    name: 'Joy Cata',
    email: 'joy.cata@thakralone.com',
    role: 'Project Manager',
    department: 'Management',
    isAdmin: false,
  },
  {
    id: 2,
    name: 'Francis Ferdinand Dizon',
    email: 'francis.dizon@thakralone.com',
    role: 'Solution / Data Architect',
    department: 'Architecture',
    isAdmin: false,
  },
  {
    id: 3,
    name: 'Joliver Macatuggal',
    email: 'joliver.macatuggal@thakralone.com',
    role: 'Business Analyst',
    department: 'Analysis',
    isAdmin: false,
  },
  {
    id: 4,
    name: 'Joshua John I. Gutierrez',
    email: 'joshua.gutierrez@thakralone.com',
    role: 'Data Engineer',
    department: 'Engineering',
    isAdmin: false,
  },
  {
    id: 5,
    name: 'Regie Langomes',
    email: 'regie.langomes@thakralone.com',
    role: 'Senior Data Engineer',
    department: 'Engineering',
    isAdmin: false,
  },
  {
    id: 6,
    name: 'John Lawrence Abuzo',
    email: 'john.abuzo@thakralone.com',
    role: 'Data Engineer',
    department: 'Engineering',
    isAdmin: false,
  },
  {
    id: 7,
    name: 'Ferdinand Joseph J. Pimentel',
    email: 'ferdinand.pimentel@thakralone.com',
    role: 'Data Engineer',
    department: 'Engineering',
    isAdmin: false,
  },
  {
    id: 8,
    name: 'Alexander James C. Gutierrez',
    email: 'alexander.gutierrez@thakralone.com',
    role: 'Data Engineer',
    department: 'Engineering',
    isAdmin: false,
  },
  {
    id: 9,
    name: 'Gernan C. Elgarico',
    email: 'gernan.elgarico@thakralone.com',
    role: 'Senior Data Engineer',
    department: 'Engineering',
    isAdmin: false,
  },
  {
    id: 10,
    name: 'Jojo B. Ramal',
    email: 'jojo.ramal@thakralone.com',
    role: 'Senior Tester',
    department: 'Quality Assurance',
    isAdmin: false,
  },
  {
    id: 11,
    name: 'Windy M. Taghoy',
    email: 'windy.taghoy@thakralone.com',
    role: 'Junior Tester',
    department: 'Quality Assurance',
    isAdmin: false,
  },
  {
    id: 12,
    name: 'Mallaiah Jatla',
    email: 'mallaiah.jatla@thakralone.com',
    role: 'SAP ISU Consultant',
    department: 'Consulting',
    isAdmin: false,
  },
  {
    id: 13,
    name: 'Manoj Kachhap',
    email: 'manoj.kachhap@thakralone.com',
    role: 'Azure Platform Admin',
    department: 'Infrastructure',
    isAdmin: false,
  },
  {
    id: 14,
    name: 'Petros Moutsopoulos',
    email: 'petros.moutsopoulos@thakralone.com',
    role: 'ASAPIO Consultant',
    department: 'Consulting',
    isAdmin: false,
  },
  {
    id: 15,
    name: 'Mac Brian Mann',
    email: 'mac.mann@thakralone.com',
    role: 'Country Managing Director',
    department: 'Executive',
    isAdmin: false,
  },
  {
    id: 16,
    name: 'Carlos Castro',
    email: 'carlos.castro@thakralone.com',
    role: 'Finance Head',
    department: 'Finance',
    isAdmin: false,
  },
  {
    id: 17,
    name: 'Hussein Srour',
    email: 'hussein.srour@thakralone.com',
    role: 'Project Governance',
    department: 'Governance',
    isAdmin: true,
  },
  {
    id: 18,
    name: 'Mauro Scarpa',
    email: 'mauro.scarpa@thakralone.com',
    role: 'Project Director',
    department: 'Executive',
    isAdmin: false,
  },
]

// Helper function to get team member by email
export const getTeamMemberByEmail = (email: string): TeamMember | undefined => {
  return TEAM_MEMBERS.find(member => member.email.toLowerCase() === email.toLowerCase())
}

// Helper function to check if email belongs to a team member
export const isTeamMember = (email: string): boolean => {
  return TEAM_MEMBERS.some(member => member.email.toLowerCase() === email.toLowerCase())
}

// Get team member name from email
export const getTeamMemberName = (email: string): string => {
  const member = getTeamMemberByEmail(email)
  return member ? member.name : email.split('@')[0]
}

// Get all departments
export const getDepartments = (): string[] => {
  return [...new Set(TEAM_MEMBERS.map(member => member.department))].sort()
}

// Get team members by department
export const getTeamMembersByDepartment = (department: string): TeamMember[] => {
  return TEAM_MEMBERS.filter(member => member.department === department)
}
