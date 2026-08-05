<script setup>
import { computed } from 'vue'
import { nameAvatarChars } from '../data/leagues.js'

// ===== Props =====
// name: 中文姓名
// position: 位置（ST/CAM/CDM/CB/LB/RB/GK/LW/RW/CM 等）
// skinTone: 肤色深浅 1-5（1最浅，5最深），可选
// size: 尺寸（small=40px, normal=64px, large=96px, xlarge=128px）
// ovr: 评分（可选，显示时左上角加OVR色条）
const props = defineProps({
  name: { type: String, default: '' },
  position: { type: String, default: '' },
  skinTone: { type: Number, default: 2 },
  size: { type: String, default: 'normal' }, // small / normal / large / xlarge
  ovr: { type: Number, default: 0 },
  showChars: { type: Boolean, default: false }, // 是否在头像内部显示中文字符（无图形时用）
})

// 根据位置、肤色、OYR 生成 CSS 颜色
const skinColors = ['#fce6d0', '#f2cfa6', '#c68642', '#8d5524', '#5c3a21']
const skin = computed(() => skinColors[Math.max(0, Math.min(4, (props.skinTone || 2) - 1))])

// 发色：根据姓名字符hash选色
function hashStr(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}
const hairColors = ['#1a1a1a', '#2c1810', '#4b2e25', '#6b3a1a', '#8b5a2b', '#a0522d', '#d4a017', '#c0392b', '#27ae60', '#2980b9']
const hair = computed(() => hairColors[hashStr(props.name || '球') % hairColors.length])

// 球衣颜色：根据位置 hash 选色（给头像底部球衣用）
const jerseyColors = [
  ['#c8102e', '#fff'], ['#003da5', '#fff'], ['#007a3d', '#fff'], ['#1c2e5b', '#ffd700'],
  ['#fdb913', '#000'], ['#6c0f2b', '#fff'], ['#004170', '#fff'], ['#cb3524', '#fff'],
]
const jersey = computed(() => jerseyColors[hashStr(props.position || 'ST') % jerseyColors.length])

// 显示的头像文字
const chars = computed(() => nameAvatarChars(props.name))

// OVR 色：FC26 风格
const ovrColor = computed(() => {
  const o = props.ovr
  if (!o) return 'transparent'
  if (o >= 90) return '#ffd700'
  if (o >= 85) return '#43b581'
  if (o >= 80) return '#3498db'
  if (o >= 75) return '#9b59b6'
  if (o >= 70) return '#e67e22'
  return '#95a5a6'
})

// 尺寸映射
const sizePx = computed(() => ({ small: 40, normal: 64, large: 96, xlarge: 128 })[props.size] || 64)
</script>

<template>
  <div class="player-avatar" :class="[size]" :style="{ width: sizePx + 'px', height: sizePx + 'px' }">
    <!-- OVR 色条角标（左上） -->
    <div class="ovr-badge" v-if="ovr" :style="{ background: ovrColor, color: ovr >= 85 ? '#1a1a1a' : '#fff' }">
      {{ ovr }}
    </div>
    <!-- 位置条（右上） -->
    <div class="pos-badge" v-if="position">{{ position }}</div>

    <!-- SVG 头像（FC26 风格：圆脸 + 发型 + 球衣V领） -->
    <svg viewBox="0 0 100 100" class="ava-svg">
      <!-- 背景渐变 -->
      <defs>
        <linearGradient id="avabg-{{name}}" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" :stop-color="jersey[0]" />
          <stop offset="100%" :stop-color="jersey[1]" stop-opacity="0.2" />
        </linearGradient>
      </defs>
      <!-- 球衣V领（底部） -->
      <path d="M 0,100 L 0,62 Q 0,55 8,55 L 36,55 L 50,70 L 64,55 L 92,55 Q 100,55 100,62 L 100,100 Z" :fill="jersey[0]" />
      <path d="M 44,56 L 50,68 L 56,56 L 50,54 Z" :fill="jersey[1]" opacity="0.85" />
      <!-- 脖子 -->
      <rect x="42" y="48" width="16" height="12" rx="4" :fill="skin" />
      <!-- 脸 -->
      <circle cx="50" cy="40" r="24" :fill="skin" />
      <!-- 耳朵 -->
      <ellipse cx="25" cy="40" rx="4" ry="6" :fill="skin" />
      <ellipse cx="75" cy="40" rx="4" ry="6" :fill="skin" />
      <!-- 头发（帽檐形） -->
      <path d="M 26,30 Q 50,8 74,30 Q 70,20 50,16 Q 30,20 26,30 Z" :fill="hair" />
      <!-- 额发小细节 -->
      <path d="M 30,30 Q 42,24 50,28 Q 58,24 70,30 L 65,32 Q 50,30 35,32 Z" :fill="hair" opacity="0.85" />
      <!-- 眉毛 -->
      <path d="M 36,36 Q 40,34 44,36" stroke="#1a1a1a" stroke-width="1.5" fill="none" stroke-linecap="round" />
      <path d="M 56,36 Q 60,34 64,36" stroke="#1a1a1a" stroke-width="1.5" fill="none" stroke-linecap="round" />
      <!-- 眼睛 -->
      <ellipse cx="40" cy="41" rx="2.2" ry="2.6" fill="#1a1a1a" />
      <ellipse cx="60" cy="41" rx="2.2" ry="2.6" fill="#1a1a1a" />
      <!-- 鼻子 -->
      <path d="M 50,43 Q 48,48 50,50 Q 52,48 50,43" stroke="rgba(0,0,0,0.25)" stroke-width="1" fill="none" />
      <!-- 嘴巴（微笑） -->
      <path d="M 43,52 Q 50,56 57,52" stroke="rgba(0,0,0,0.35)" stroke-width="1.3" fill="none" stroke-linecap="round" />
      <!-- 胡须可选（根据名字hash） -->
      <path v-if="hashStr(name) % 7 === 0" d="M 38,54 Q 50,60 62,54 Q 58,58 50,57 Q 42,58 38,54 Z" :fill="hair" opacity="0.6" />
    </svg>

    <!-- 文字模式（未启用 SVG 时的替代显示） -->
    <div class="chars" v-if="showChars">{{ chars }}</div>
  </div>
</template>

<style scoped>
.player-avatar {
  position: relative;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #2d3a4f, #1a2233);
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  border: 2px solid rgba(255,255,255,0.1);
}
.player-avatar.small .ovr-badge { font-size: 8px; padding: 1px 3px; }
.player-avatar.small .pos-badge { font-size: 7px; padding: 1px 2px; }
.ava-svg { width: 100%; height: 100%; display: block; }
.ovr-badge {
  position: absolute; left: 0; top: 0;
  font-weight: 900; font-size: 10px;
  padding: 2px 5px; border-bottom-right-radius: 6px;
  font-family: 'Arial Black', sans-serif;
  letter-spacing: -0.5px;
}
.pos-badge {
  position: absolute; right: 0; top: 0;
  background: rgba(0,0,0,0.75);
  color: #ffd700; font-weight: 800; font-size: 9px;
  padding: 2px 4px; border-bottom-left-radius: 6px;
  letter-spacing: -0.3px;
}
.chars {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-weight: 900; font-size: 18px;
  font-family: 'Microsoft YaHei', sans-serif;
  text-shadow: 0 2px 4px rgba(0,0,0,0.6);
}
.player-avatar.large .chars { font-size: 26px; }
.player-avatar.xlarge .chars { font-size: 36px; }
</style>
