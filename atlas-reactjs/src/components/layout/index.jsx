import React from "react"
import Header from "./header"
import { SidebarPage } from "./sidebar"
import { useLocation } from "react-router-dom"

const Layout = ({ children, onSubmit }) => {
  const location = useLocation()
  const routesneeded = location.pathname == "/canvas"
  return (
    <div className="flex flex-col h-screen">
      {!routesneeded && <Header />}

      <div className="flex flex-grow overflow-hidden">
        {!routesneeded && (
          <div className="w-64">
            <SidebarPage onSubmit={onSubmit} />
          </div>
        )}

        <main className="flex-1 bg-gray-200 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}

export default Layout
