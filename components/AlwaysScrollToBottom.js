import { useRef, useEffect } from "react"
/**
 * Helper component to always make the parent scrollable container scroll to the bottom
 * on state change.
 */
const AlwaysScrollToBottom = () => {
  const elementRef = useRef()
  useEffect(() => elementRef.current.scrollIntoView())
  return <div ref={elementRef} />
}

export default AlwaysScrollToBottom