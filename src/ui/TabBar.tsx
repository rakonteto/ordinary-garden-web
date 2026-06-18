import { NavLink } from 'react-router-dom'
import './TabBar.css'

const TABS = [
  { to: '/today', label: '오늘' },
  { to: '/garden', label: '내 정원' },
  { to: '/settings', label: '설정' },
]

export default function TabBar() {
  return (
    <nav className="tabbar">
      {TABS.map((t) => (
        <NavLink key={t.to} to={t.to} className="tabbar__item">
          {t.label}
        </NavLink>
      ))}
    </nav>
  )
}
