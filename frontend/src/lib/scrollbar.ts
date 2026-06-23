/* 앱용 스크롤바 — 평소엔 투명, 스크롤(휠·터치·드래그)이 일어나는 동안에만 노출.
   스크롤 이벤트는 버블링하지 않으므로 capture 단계에서 전역 1개 리스너로 처리하고,
   스크롤이 멈추면 잠시 뒤 .is-scrolling 클래스를 떼어 다시 투명하게 만든다. */
const HIDE_DELAY = 700
const timers = new WeakMap<Element, number>()

export function initScrollbarAutohide(): void {
  document.addEventListener(
    'scroll',
    (e) => {
      const el = e.target
      if (!(el instanceof Element)) return
      el.classList.add('is-scrolling')
      const prev = timers.get(el)
      if (prev) clearTimeout(prev)
      timers.set(
        el,
        window.setTimeout(() => el.classList.remove('is-scrolling'), HIDE_DELAY),
      )
    },
    true,
  )
}
