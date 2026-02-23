import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import ProjectsList from './components/ProjectsList'
import ProjectDetail from './components/ProjectDetail'
import ProjectForm from './components/ProjectForm'

const STORAGE_KEY = 'urban-renewal-pm-v1'

const SAMPLE_DATA = {
  projects: [
    {
      id: 'proj_1',
      name: 'רחוב הרצל 42',
      address: 'הרצל 42',
      city: 'תל אביב',
      type: 'תמ"א 38/1',
      status: 'היתרים',
      startDate: '2023-06-01',
      expectedEndDate: '2025-12-31',
      totalUnits: 18,
      newUnits: 4,
      floors: 6,
      developer: 'אינוביישן נדל"ן',
      contractor: 'א.ב. בנייה בע"מ',
      description: 'חיזוק מבנה ותוספת קומות',
      notes: '',
      createdAt: '2023-06-01T10:00:00.000Z'
    },
    {
      id: 'proj_2',
      name: 'שכונת נווה שאנן',
      address: 'בן יהודה 7-15',
      city: 'חיפה',
      type: 'פינוי-בינוי',
      status: 'תכנון',
      startDate: '2024-01-15',
      expectedEndDate: '2028-06-30',
      totalUnits: 60,
      newUnits: 120,
      floors: 15,
      developer: 'גרין גרופ',
      contractor: '',
      description: 'פינוי 3 בניינים ישנים ובניית מגדל מגורים חדש',
      notes: 'בשלב תכנון עם העירייה',
      createdAt: '2024-01-15T09:00:00.000Z'
    }
  ],
  tenants: [
    {
      id: 'ten_1',
      projectId: 'proj_1',
      name: 'משפחת כהן',
      phone: '054-1234567',
      email: 'cohen@mail.com',
      apartment: '3א',
      floor: '1',
      agreementStatus: 'חתם',
      signedDate: '2023-09-01',
      notes: 'הסכים לאחר מו"מ'
    },
    {
      id: 'ten_2',
      projectId: 'proj_1',
      name: 'משפחת לוי',
      phone: '052-9876543',
      email: '',
      apartment: '5ב',
      floor: '2',
      agreementStatus: 'במו"מ',
      signedDate: '',
      notes: 'מעוניין בהחלפת דירה'
    },
    {
      id: 'ten_3',
      projectId: 'proj_1',
      name: 'ד"ר אבי שפירא',
      phone: '050-1112233',
      email: 'avi@example.com',
      apartment: '8ג',
      floor: '3',
      agreementStatus: 'ממתין',
      signedDate: '',
      notes: ''
    }
  ],
  tasks: [
    {
      id: 'task_1',
      projectId: 'proj_1',
      title: 'הגשת בקשה להיתר בנייה',
      description: 'להגיש את כל המסמכים לעירייה',
      dueDate: '2025-03-15',
      status: 'בתהליך',
      priority: 'גבוה',
      category: 'היתרים',
      createdAt: '2025-01-10T08:00:00.000Z'
    },
    {
      id: 'task_2',
      projectId: 'proj_1',
      title: 'פגישה עם דייר שפירא',
      description: 'לקיים פגישה לגבי תנאי ההסכם',
      dueDate: '2025-02-28',
      status: 'פתוח',
      priority: 'בינוני',
      category: 'דיירים',
      createdAt: '2025-01-15T10:00:00.000Z'
    },
    {
      id: 'task_3',
      projectId: 'proj_2',
      title: 'הכנת תוכנית לוועדה המקומית',
      description: 'הכנת מצגת לישיבת הוועדה',
      dueDate: '2025-04-01',
      status: 'פתוח',
      priority: 'דחוף',
      category: 'תכנון',
      createdAt: '2025-01-20T11:00:00.000Z'
    }
  ]
}

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  return SAMPLE_DATA
}

export default function App() {
  const [data, setData] = useState(loadData)
  const [view, setView] = useState('dashboard')
  const [selectedProjectId, setSelectedProjectId] = useState(null)
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [editingProject, setEditingProject] = useState(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {}
  }, [data])

  const updateData = (updater) => {
    setData(prev => updater(prev))
  }

  const handleSaveProject = (projectData) => {
    if (editingProject) {
      updateData(prev => ({
        ...prev,
        projects: prev.projects.map(p => p.id === projectData.id ? projectData : p)
      }))
    } else {
      updateData(prev => ({
        ...prev,
        projects: [...prev.projects, {
          ...projectData,
          id: 'proj_' + Date.now(),
          createdAt: new Date().toISOString()
        }]
      }))
    }
    setShowProjectForm(false)
    setEditingProject(null)
  }

  const handleDeleteProject = (projectId) => {
    updateData(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== projectId),
      tenants: prev.tenants.filter(t => t.projectId !== projectId),
      tasks: prev.tasks.filter(t => t.projectId !== projectId)
    }))
    setView('projects')
    setSelectedProjectId(null)
  }

  const openProject = (projectId) => {
    setSelectedProjectId(projectId)
    setView('project-detail')
  }

  const openEditProject = (project) => {
    setEditingProject(project)
    setShowProjectForm(true)
  }

  const openNewProject = () => {
    setEditingProject(null)
    setShowProjectForm(true)
  }

  const selectedProject = data.projects.find(p => p.id === selectedProjectId)

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="header-brand" onClick={() => setView('dashboard')} style={{ cursor: 'pointer' }}>
            <div className="header-logo">🏗️</div>
            <div>
              <h1 className="header-title">מנהל פרויקטים</h1>
              <p className="header-subtitle">התחדשות עירונית</p>
            </div>
          </div>
          <nav className="header-nav">
            <button
              className={`nav-btn ${view === 'dashboard' ? 'active' : ''}`}
              onClick={() => setView('dashboard')}
            >
              📊 דשבורד
            </button>
            <button
              className={`nav-btn ${view === 'projects' || view === 'project-detail' ? 'active' : ''}`}
              onClick={() => setView('projects')}
            >
              🏗️ פרויקטים
            </button>
          </nav>
          <button className="btn-primary" onClick={openNewProject}>
            + פרויקט חדש
          </button>
        </div>
      </header>

      <main className="main-content">
        {view === 'dashboard' && (
          <Dashboard
            data={data}
            onProjectClick={openProject}
            onAddProject={openNewProject}
          />
        )}
        {view === 'projects' && (
          <ProjectsList
            projects={data.projects}
            tenants={data.tenants}
            tasks={data.tasks}
            onProjectClick={openProject}
            onEditProject={openEditProject}
            onDeleteProject={handleDeleteProject}
            onAddProject={openNewProject}
          />
        )}
        {view === 'project-detail' && selectedProject && (
          <ProjectDetail
            project={selectedProject}
            tenants={data.tenants.filter(t => t.projectId === selectedProjectId)}
            tasks={data.tasks.filter(t => t.projectId === selectedProjectId)}
            onBack={() => setView('projects')}
            onEditProject={openEditProject}
            onDeleteProject={handleDeleteProject}
            onUpdateTenants={(tenants) => updateData(prev => ({
              ...prev,
              tenants: [
                ...prev.tenants.filter(t => t.projectId !== selectedProjectId),
                ...tenants
              ]
            }))}
            onUpdateTasks={(tasks) => updateData(prev => ({
              ...prev,
              tasks: [
                ...prev.tasks.filter(t => t.projectId !== selectedProjectId),
                ...tasks
              ]
            }))}
          />
        )}
      </main>

      {showProjectForm && (
        <ProjectForm
          project={editingProject}
          onSave={handleSaveProject}
          onClose={() => { setShowProjectForm(false); setEditingProject(null) }}
        />
      )}
    </div>
  )
}
