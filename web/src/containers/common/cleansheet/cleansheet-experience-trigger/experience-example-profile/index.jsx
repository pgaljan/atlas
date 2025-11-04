import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { importCleansheetProfile } from '../../../../../redux/slices/cleansheet';
import ConfirmModal from '../../../../../components/modals/ConfirmModal';
import LoadingSpinner from '../../../../../components/loader/LoadingSpinner';
import cogoToast from '@successtar/cogo-toast';
import { useSelector } from 'react-redux';

const EXAMPLES = {
  'retail-manager': {
    version: '1.0.0',
    userName: 'Marcus Thompson',
    userGoals: 'Transition from retail management into operations or people management roles.',
    exportDate: new Date().toISOString(),
    experiences: [
      {
        role: 'Store Manager',
        organizationName: 'Target Corporation',
        location: 'Minneapolis, MN',
        startDate: '2019-03',
        endDate: '',
        description:
          'Lead operations for a $25M store with 85+ employees. Oversaw hiring, scheduling, and performance improvement initiatives.',
        keySkills: ['Team Leadership', 'P&L Management', 'Customer Experience'],
        achievements: ['Increased sales by 18% through floor layout optimization.'],
        competencies: ['Operations Management', 'Strategic Planning'],
        projectTypes: [
          'Operational Strategy Execution',
          'Team Leadership',
          'Performance Optimization',
          'Implementation',
        ],
        technologies: [
          { name: 'Excel', type: 'Core' },
          { name: 'Kronos', type: 'Peripheral' },
        ],
        externalStakeholders: ['Customers', 'Vendors', 'Corporate Partners'],
        internalStakeholders: ['Regional Manager', 'Store Team Leads', 'Cashiers'],
      },
      {
        role: 'Assistant Store Manager',
        organizationName: 'Walmart Inc.',
        location: 'Chicago, IL',
        startDate: '2015-07',
        endDate: '2019-02',
        description:
          'Supervised 6 department leads and 60 associates. Managed merchandising, payroll, and customer satisfaction KPIs.',
        keySkills: ['Inventory Control', 'Employee Development'],
        competencies: ['People Management', 'Operational Execution'],
        projectTypes: [
          'Retail Operations',
          'Employee Development',
          'Customer Experience',
          'Implementation',
        ],
        technologies: [{ name: 'SAP Retail', type: 'Core' }],
        externalStakeholders: ['Customers', 'Local Vendors'],
        internalStakeholders: ['Department Leads', 'Associates'],
      },
      {
        role: 'Department Supervisor',
        organizationName: 'Best Buy',
        location: 'Chicago, IL',
        startDate: '2013-03',
        endDate: '2015-06',
        description: 'Managed electronics department, achieving 120% of quarterly sales targets.',
        keySkills: ['Sales Leadership', 'Customer Engagement'],
        competencies: ['Sales Optimization', 'Communication'],
        projectTypes: ['Department Oversight', 'Sales Target Management', 'Implementation'],
        externalStakeholders: ['Customers'],
        internalStakeholders: ['Sales Associates', 'Department Staff'],
      },
      {
        role: 'Sales Associate',
        organizationName: 'Target Corporation',
        location: 'Chicago, IL',
        startDate: '2011-08',
        endDate: '2013-02',
        description:
          'Provided exceptional customer service and supported inventory restocking and POS operations.',
        keySkills: ['Customer Service', 'POS Systems'],
        competencies: ['Teamwork', 'Reliability'],
        projectTypes: ['Customer Service Delivery', 'Store Operations', 'Implementation'],
        externalStakeholders: ['Customers'],
        internalStakeholders: ['Supervisors', 'Store Team'],
      },
    ],
  },

  chemist: {
    version: '1.0.0',
    userName: 'Dr. Sarah Mitchell',
    userGoals:
      'Lead formulation R&D and process improvement initiatives in the pharmaceutical industry.',
    exportDate: new Date().toISOString(),
    experiences: [
      {
        role: 'Senior R&D Chemist',
        organizationName: 'PharmaTech Laboratories',
        location: 'Boston, MA',
        startDate: '2020-01',
        endDate: '',
        description:
          'Lead product formulation and stability testing for new pharmaceutical compounds. Oversaw junior chemists and maintained GLP documentation.',
        keySkills: ['Formulation Chemistry', 'Stability Studies'],
        competencies: ['Analytical Thinking', 'Team Collaboration'],
        projectTypes: [
          'Formulation Development',
          'Stability Testing',
          'Process Improvement',
          'Implementation',
        ],
        technologies: [
          { name: 'HPLC', type: 'Core' },
          { name: 'GC-MS', type: 'Core' },
        ],
        externalStakeholders: ['Regulatory Auditors', 'Suppliers'],
        internalStakeholders: ['Lab Technicians', 'R&D Team'],
      },
      {
        role: 'Quality Control Chemist',
        organizationName: 'BioPure Inc.',
        location: 'Cambridge, MA',
        startDate: '2016-05',
        endDate: '2019-12',
        description:
          'Conducted QC testing of raw materials and finished products following FDA standards. Improved batch release time by 15%.',
        keySkills: ['Quality Assurance', 'Spectroscopy'],
        projectTypes: ['QC Testing', 'Compliance Validation', 'Implementation'],
        technologies: [
          { name: 'FTIR', type: 'Peripheral' },
          { name: 'UV-Vis', type: 'Peripheral' },
        ],
        externalStakeholders: ['Regulatory Agencies', 'Suppliers'],
        internalStakeholders: ['QA Team', 'Production Team'],
      },
      {
        role: 'Analytical Chemist',
        organizationName: 'Acme Labs',
        location: 'Boston, MA',
        startDate: '2013-01',
        endDate: '2016-04',
        description:
          'Performed analytical method development and sample testing. Supported validation projects for new equipment.',
        keySkills: ['Method Development', 'Sample Preparation'],
        projectTypes: ['Analytical Method Design', 'Equipment Validation', 'Implementation'],
        technologies: [{ name: 'HPLC', type: 'Core' }],
        externalStakeholders: ['Equipment Vendors'],
        internalStakeholders: ['Analytical Team', 'QA Department'],
      },
      {
        role: 'Research Intern',
        organizationName: 'Harvard Chemistry Department',
        location: 'Cambridge, MA',
        startDate: '2012-01',
        endDate: '2012-12',
        description:
          'Assisted in polymer chemistry experiments and published findings in an academic journal.',
        keySkills: ['Lab Safety', 'Data Recording'],
        competencies: ['Attention to Detail', 'Research Documentation'],
        projectTypes: ['Academic Research', 'Polymer Study', 'Implementation'],
        externalStakeholders: ['Academic Advisors'],
        internalStakeholders: ['Lab Supervisors', 'Research Team'],
      },
    ],
  },

  'new-graduate': {
    version: '1.0.0',
    userName: 'Alex Rivera',
    userGoals:
      'Secure an entry-level software engineering role focused on full-stack web development and cloud technologies.',
    exportDate: new Date().toISOString(),
    experiences: [
      {
        role: 'Software Engineering Intern',
        organizationName: 'TechNova Solutions',
        location: 'Remote',
        startDate: '2024-06',
        endDate: '2024-09',
        description:
          'Collaborated with senior developers to design and build internal tools using React and Node.js.',
        keySkills: ['JavaScript', 'React', 'Node.js'],
        achievements: ['Delivered internal dashboard for 3 teams.'],
        competencies: ['Frontend Development', 'Collaboration'],
        projectTypes: ['Web App Development', 'Team Collaboration', 'Implementation'],
        technologies: [
          { name: 'React', type: 'Core' },
          { name: 'Node.js', type: 'Core' },
        ],
        externalStakeholders: ['End Users', 'Project Managers'],
        internalStakeholders: ['Senior Developers', 'QA Team'],
      },
      {
        role: 'Final Year Project - Smart Campus System',
        organizationName: 'University of Technology',
        location: 'Boston, MA',
        startDate: '2023-09',
        endDate: '2024-05',
        description: 'Developed IoT-based campus system integrating sensors and data dashboards.',
        keySkills: ['Python', 'IoT', 'Database Design'],
        competencies: ['System Design', 'Innovation'],
        projectTypes: ['IoT Integration', 'Data Visualization', 'Implementation'],
        technologies: [
          { name: 'Python', type: 'Core' },
          { name: 'MySQL', type: 'Peripheral' },
        ],
        externalStakeholders: ['Faculty Advisors'],
        internalStakeholders: ['Project Teammates', 'Department Staff'],
      },
    ],
  },

  'data-analyst': {
    version: '1.0.0',
    userName: 'Data Analyst Example',
    userGoals: 'Advance in data science and analytics.',
    exportDate: new Date().toISOString(),
    experiences: [
      {
        role: 'Data Analyst',
        organizationName: 'Insights Co',
        location: 'Remote',
        startDate: '2018-06',
        endDate: '',
        description: 'Developed interactive dashboards and automated pipelines for BI reporting.',
        keySkills: ['SQL', 'Tableau'],
        competencies: ['Data Visualization', 'Automation'],
        projectTypes: ['Data Reporting', 'Pipeline Automation', 'Implementation'],
        technologies: [
          { name: 'SQL', type: 'Core' },
          { name: 'Tableau', type: 'Peripheral' },
        ],
        externalStakeholders: ['Business Clients', 'Executives'],
        internalStakeholders: ['BI Team', 'Data Engineers'],
      },
    ],
  },
};

const ExampleProfiles = ({ className = '' }) => {
  const dispatch = useDispatch();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedExample, setSelectedExample] = useState(null);
  const [loading, setLoading] = useState(false);
  const profile = useSelector((s) => s.cleansheet.profile);

  const immediateImport = async (key) => {
    const exampleJson = EXAMPLES[key];
    if (!exampleJson) return;

    setLoading(true);
    try {
      await dispatch(importCleansheetProfile({ json: exampleJson })).unwrap?.();
      cogoToast.success('Example profile imported successfully!');
    } catch (err) {
      cogoToast.error('Failed to import example profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (key) => {
    const hasExperiences = profile?.experiences && profile?.experiences?.length > 0;

    if (!hasExperiences) {
      immediateImport(key);
      return;
    }

    setSelectedExample(key);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedExample) return;
    const exampleJson = EXAMPLES[selectedExample];
    if (!exampleJson) return;

    setLoading(true);
    try {
      await dispatch(importCleansheetProfile({ json: exampleJson })).unwrap?.();
      cogoToast.success('Example profile imported successfully!');
      setConfirmOpen(false);
    } catch (err) {
      cogoToast.error('Failed to import example profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <LoadingSpinner mode="fullscreen" message="Importing example..." />}

      <div className={`flex flex-wrap gap-2 ${className}`}>
        <div className="text-sm font-semibold mr-2 self-center">Example Profiles:</div>

        {Object.keys(EXAMPLES).map((key) => (
          <button
            key={key}
            onClick={() => handleExampleClick(key)}
            className="px-3 py-1 rounded bg-gray-100 text-sm hover:bg-gray-200 capitalize"
          >
            {key.replace('-', ' ')}
          </button>
        ))}
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        title="Replace Current Profile?"
        message="This will overwrite your current profile with the selected example. Continue?"
        confirmText="Replace"
        cancelText="Cancel"
        loading={loading}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
};

export default ExampleProfiles;
