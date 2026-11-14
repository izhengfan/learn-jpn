import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
  jp?: string
}

export function PageHeader({ eyebrow, title, description, actions, jp }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header-copy">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <div className="page-title-row">
          <h1>{title}</h1>
          {jp && <span className="page-title-jp">{jp}</span>}
        </div>
        {description && <p className="page-description">{description}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </header>
  )
}
