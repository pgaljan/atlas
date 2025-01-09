import { useEffect, useRef } from "react"

const useOutsideClick = callback => {
  const ref = useRef()

  useEffect(() => {
    const handleClickOutside = event => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback()
      }
    }

    document.addEventListener("pointerdown", handleClickOutside)

    return () => {
      document.removeEventListener("pointerdown", handleClickOutside)
    }
  }, [callback])

  return ref
}

export default useOutsideClick
