import { createContext } from 'react'

/** 스플래시가 끝나 홈 화면이 실제로 화면에 보이는 상태인지.
 *  첫 로드에선 스플래시가 떠 있는 동안 false, 끝나면 true. 첫 로드가 아닌 탭 이동 등에선 항상 true.
 *  홈의 진입 애니메이션(복약률 그래프 차오름)이 스플래시 뒤에서 끝나버리지 않도록 시작 시점을 맞춘다. */
export const SplashReadyContext = createContext(true)
