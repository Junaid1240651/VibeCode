import { useEffect, useState } from "react"

export const useScroll = ( threshold=10) => {
    const [scroll, setScroll] = useState(false)
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > threshold) {
                setScroll(true)
            } else {
                setScroll(false)
            }
        }
        window.addEventListener('scroll', handleScroll)
        handleScroll();
        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [threshold])
    return scroll
}