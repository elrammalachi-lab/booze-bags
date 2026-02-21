import { useState, useEffect, useMemo } from 'react'
import Dashboard from './components/Dashboard'
import OrdersTable from './components/OrdersTable'
import OrderForm from './components/OrderForm'
import MonthlyStats from './components/MonthlyStats'

const STORAGE_KEY = 'cocktail_bag_orders_v1'

const DEMO_ORDERS = [
  {
    id: 'demo_1',
    customerName: 'שרה לוי',
    phone: '050-1234567',
    eventDate: '2026-03-15',
    eventType: 'חתונה',
    bagCount: 300,
    packagePrice: 4500,
    extras: 500,
    productionCost: 2800,
    status: 'closed',
    notes: 'שקיות עם ריבון זהב, לקוחה מאוד מרוצה',
    createdAt: '2026-02-01T10:00:00.000Z',
  },
  {
    id: 'demo_2',
    customerName: 'יוסי כהן',
    phone: '052-9876543',
    eventDate: '2026-04-20',
    eventType: 'בר מצווה',
    bagCount: 200,
    packagePrice: 3200,
    extras: 0,
    productionCost: 1900,
    status: 'in-progress',
    notes: '',
    createdAt: '2026-02-05T14:30:00.000Z',
  },
  {
    id: 'demo_3',
    customerName: 'רחל אברהם',
    phone: '054-5556789',
    eventDate: '2026-05-10',
    eventType: 'יום הולדת',
    bagCount: 400,
    packagePrice: 5800,
    extras: 800,
    productionCost: 3500,
    status: 'open',
    notes: 'לקוחה ביקשה צבע תכלת לשקיות',
    createdAt: '2026-02-10T09:00:00.000Z',
  },
  {
    id: 'demo_4',
    customerName: 'דוד מזרחי',
    phone: '058-3334455',
    eventDate: '2026-03-28',
    eventType: 'אירוע חברה',
    bagCount: 500,
    packagePrice: 7200,
    extras: 1200,
    productionCost: 4800,
    status: 'open',
    notes: 'לוגו חברה על השקיות',
    createdAt: '2026-02-12T16:00:00.000Z',
  },
]

function App() {
  const [orders, setOrders] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) return JSON.parse(stored)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_ORDERS))
      return DEMO_ORDERS
    } catch {
      return []
    }
  })

  const [activeTab, setActiveTab] = useState('dashboard')
  const [showForm, setShowForm] = useState(false)
  const [editingOrder, setEditingOrder] = useState(null)
  const [filters, setFilters] = useState({ month: '', status: '' })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
  }, [orders])

  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        if (filters.month) {
          const orderMonth = order.eventDate?.substring(0, 7)
          if (orderMonth !== filters.month) return false
        }
        if (filters.status && order.status !== filters.status) return false
        return true
      })
      .sort((a, b) => {
        if (!a.eventDate) return 1
        if (!b.eventDate) return -1
        return new Date(a.eventDate) - new Date(b.eventDate)
      })
  }, [orders, filters])

  const handleSave = (data) => {
    if (editingOrder) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === editingOrder.id
            ? { ...data, id: editingOrder.id, createdAt: editingOrder.createdAt }
            : o
        )
      )
    } else {
      setOrders((prev) => [
        ...prev,
        {
          ...data,
          id: `order_${Date.now()}`,
          createdAt: new Date().toISOString(),
        },
      ])
    }
    setShowForm(false)
    setEditingOrder(null)
  }

  const handleEdit = (order) => {
    setEditingOrder(order)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('האם למחוק את ההזמנה? פעולה זו אינה הפיכה.')) {
      setOrders((prev) => prev.filter((o) => o.id !== id))
    }
  }

  const handleAddNew = () => {
    setEditingOrder(null)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingOrder(null)
  }

  const TABS = [
    { id: 'dashboard', label: '📊  דשבורד' },
    { id: 'orders', label: '📋  הזמנות' },
    { id: 'monthly', label: '📅  סיכום חודשי' },
  ]

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-content">
          <div className="header-logo">
            <span className="header-icon">🍹</span>
            <div>
              <h1 className="header-title">מנהל הזמנות</h1>
              <p className="header-subtitle">שקיות קוקטייל לאירועים</p>
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleAddNew}>
            + הזמנה חדשה
          </button>
        </div>
      </header>

      <nav className="tab-nav">
        <div className="tab-nav-content">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard orders={orders} onAddNew={handleAddNew} onEdit={handleEdit} />
        )}
        {activeTab === 'orders' && (
          <OrdersTable
            orders={filteredOrders}
            allOrders={orders}
            filters={filters}
            onFilterChange={setFilters}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddNew={handleAddNew}
          />
        )}
        {activeTab === 'monthly' && <MonthlyStats orders={orders} />}
      </main>

      {showForm && (
        <OrderForm order={editingOrder} onSave={handleSave} onClose={handleCloseForm} />
      )}
    </div>
  )
}

export default App
