import re

def fix():
    with open('src/app/HandFlowers.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # Import the hook
    if "import { useFlowerDev }" not in content:
        content = content.replace(
            "import React, { useEffect, useRef, useState } from 'react';",
            "import React, { useEffect, useRef, useState } from 'react';\nimport { useFlowerDev } from './FlowerDevContext';"
        )

    # Inject the hook call
    if "const { settings: devSettings }" not in content:
        content = content.replace(
            "const timeoutMapRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());",
            "const timeoutMapRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());\n  const { settings: devSettings } = useFlowerDev();"
        )

    # Modify the flower-svg-wrapper styles
    target = """              <div
                className={`flower-svg-wrapper flower-${flower.id} ${isRevealed ? 'revealed' : ''} ${isActive ? 'hovered' : ''}`}
                onMouseEnter={() => handleMouseEnter(flower.id)}
                onMouseLeave={() => handleMouseLeave(flower.id)}
                style={{
                  ...flower.flowerStyle,
                  ...devStyle,
                  zIndex: flower.id === 'blue-lotus' ? 11 : flower.id === 'mango-blossom' ? 9 : 10,
                  opacity: currentOpacity,
                  transform: `scale(${currentScale}) translateZ(0)`,
                  transition: 'transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)',
                }}
              >"""
    
    replacement = """              <div
                className={`flower-svg-wrapper flower-${flower.id} ${isRevealed ? 'revealed' : ''} ${isActive ? 'hovered' : ''}`}
                onMouseEnter={() => handleMouseEnter(flower.id)}
                onMouseLeave={() => handleMouseLeave(flower.id)}
                style={{
                  ...flower.flowerStyle,
                  ...(devSettings && devSettings[flower.id] ? {
                    top: `${devSettings[flower.id].top}%`,
                    left: `${devSettings[flower.id].left}%`,
                    width: `${devSettings[flower.id].width}%`,
                    zIndex: devSettings[flower.id].zIndex,
                  } : {
                    zIndex: flower.id === 'blue-lotus' ? 11 : flower.id === 'mango-blossom' ? 9 : 10,
                  }),
                  ...devStyle,
                  opacity: currentOpacity,
                  transform: `scale(${currentScale}) translateZ(0)`,
                  transition: 'transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)',
                }}
              >"""
              
    content = content.replace(target, replacement)

    with open('src/app/HandFlowers.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

fix()
