import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/* 실제 3D 알약(캡슐) — Three.js/WebGL.
   - 좌우 2색은 셰이더 per-fragment 하드 스텝(보간 gradient 아님) → 경계가 칼같이 떨어진다.
   - ㅡ자 수평이 아니라 대각선으로 기울여(턴테이블) 회전.
   - 배경 투명(스플래시 그라데이션 비침), reduced-motion이면 정지. */
export default function Pill3D({ size = 208 }: { size?: number }) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    camera.position.set(0, 0.4, 6.6)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(size, size)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    const geo = new THREE.CapsuleGeometry(0.85, 1.75, 16, 48)

    // 캡슐 중앙(geometry y=0)을 경계로 위/아래 = 화이트/민트. per-fragment step으로 하드 경계.
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.0,
      clearcoat: 0.7,
      clearcoatRoughness: 0.28,
    })
    const top = new THREE.Color('#f6f8f8').convertSRGBToLinear()
    const bot = new THREE.Color('#1fd0b1').convertSRGBToLinear()
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTop = { value: top }
      shader.uniforms.uBot = { value: bot }
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying float vSplit;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\n  vSplit = position.y;')
      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          '#include <common>\nvarying float vSplit;\nuniform vec3 uTop;\nuniform vec3 uBot;',
        )
        .replace(
          '#include <color_fragment>',
          '#include <color_fragment>\n  diffuseColor.rgb = vSplit >= 0.0 ? uTop : uBot;',
        )
    }

    const pill = new THREE.Mesh(geo, mat)
    pill.rotation.z = Math.PI / 2 // 장축을 X로 (턴테이블 회전 시 끝이 보이며 입체감)
    pill.rotation.x = 0.12

    const spinGroup = new THREE.Group()
    spinGroup.add(pill)

    const tiltGroup = new THREE.Group()
    tiltGroup.rotation.z = -0.52 // 대각선 기울기
    tiltGroup.rotation.x = 0.22
    tiltGroup.add(spinGroup)
    scene.add(tiltGroup)

    scene.add(new THREE.AmbientLight(0xffffff, 0.95))
    const key = new THREE.DirectionalLight(0xffffff, 1.75)
    key.position.set(4, 6, 5)
    scene.add(key)
    const fill = new THREE.DirectionalLight(0xffffff, 0.6)
    fill.position.set(0, 1, 7)
    scene.add(fill)
    const rim = new THREE.DirectionalLight(0xd6f5ee, 0.7)
    rim.position.set(-5, -2, -3)
    scene.add(rim)

    let raf = 0
    const tick = () => {
      spinGroup.rotation.y += 0.03
      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }
    renderer.render(scene, camera)
    if (!reduce) raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      geo.dispose()
      mat.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [size])

  return <div ref={mountRef} style={{ width: size, height: size }} aria-hidden="true" />
}
