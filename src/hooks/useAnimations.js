import { useEffect, useRef } from 'react'

export function useScrollReveal(options = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible')
          observer.unobserve(el)
        }
      },
      { threshold: options.threshold || 0.15, rootMargin: options.rootMargin || '0px 0px -50px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return ref
}

export function usePageReveals(dependencies = []) {
  useEffect(() => {
    const selector = '.reveal, .reveal-left, .reveal-right, .stagger-children'
    const elements = Array.from(document.querySelectorAll(selector))
      .filter(el => !el.classList.contains('visible'))

    if (!elements.length) return

    if (!('IntersectionObserver' in window)) {
      elements.forEach(el => el.classList.add('visible'))
      return
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    )

    elements.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, dependencies)
}

export function useCounter(target, suffix = '', duration = 2000) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const step = target / (duration / 16)
          let current = 0
          const update = () => {
            current += step
            if (current < target) {
              el.textContent = Math.floor(current) + suffix
              requestAnimationFrame(update)
            } else {
              el.textContent = target + suffix
            }
          }
          update()
          observer.unobserve(el)
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [target, suffix, duration])

  return ref
}

export function useParallax(rate = 0.4) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const handleScroll = () => {
      const scrolled = window.scrollY
      el.style.transform = `translateY(${scrolled * rate}px)`
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [rate])

  return ref
}
