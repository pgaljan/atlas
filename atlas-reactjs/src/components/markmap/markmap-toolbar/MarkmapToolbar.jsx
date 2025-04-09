import { Toolbar } from "markmap-toolbar"
import React, { useEffect, useRef } from "react"
import useMarkmap from "../markmap-context/MarkmapContext"

const MarkmapToolbar = () => {
  const { markmapInstance } = useMarkmap()
  const containerRef = useRef(null)

  useEffect(() => {
    if (!markmapInstance) return

    const { el } = Toolbar.create(markmapInstance)

    el.style.position = "absolute"
    el.style.bottom = "0.5rem"
    el.style.right = "0.5rem"

    // Append the toolbar to the container
    if (containerRef.current) {
      containerRef.current.appendChild(el)
    }

    return () => {
      if (containerRef.current && el) {
        containerRef.current.removeChild(el)
      }
    }
  }, [markmapInstance])

  return <div ref={containerRef}></div>
}

export default MarkmapToolbar
