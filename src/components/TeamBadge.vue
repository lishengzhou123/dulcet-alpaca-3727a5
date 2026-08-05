<script setup>
import { computed } from 'vue'
import { getTeamStyle, getNationStyle } from '../data/leagues.js'

// ===== Props =====
// teamName: 俱乐部名称（如：'曼城'、'皇家马德里'）
// leagueCode: 联赛代码（如 EPL/LALIGA，用于未知球队的兜底配色）
// nationName: 国家队名称（如：'中国'、'巴西'），传 nationName 时会走国家队模式
// size: 尺寸（small=28px, normal=44px, medium=64px, large=88px）
// shape: 'shield'（盾形，俱乐部默认）/'round'（圆形，国家队/联赛默认）
const props = defineProps({
  teamName: { type: String, default: '' },
  leagueCode: { type: String, default: '' },
  nationName: { type: String, default: '' },
  size: { type: String, default: 'normal' }, // small / normal / medium / large
  shape: { type: String, default: '' }, // shield / round（空则自动判断）
})

// 国家队 or 俱乐部
const isNation = computed(() => !!props.nationName)

// 选择样式
const style = computed(() => {
  if (isNation.value) return getNationStyle(props.nationName)
  return getTeamStyle(props.teamName, props.leagueCode)
})

// 形状：国家队默认圆形，俱乐部默认盾形
const finalShape = computed(() => {
  if (props.shape) return props.shape
  return isNation.value ? 'round' : 'shield'
})

// 尺寸映射
const sizePx = computed(() => ({
  small: 28, normal: 44, medium: 64, large: 88,
})[props.size] || 44)
</script>

<template>
  <div class="team-badge" :class="[size, finalShape, { nation: isNation }]"
       :style="{ width: sizePx + 'px', height: finalShape === 'shield' ? (sizePx * 1.15) + 'px' : sizePx + 'px' }">
    <!-- 盾形（俱乐部） -->
    <svg viewBox="0 0 100 115" class="badge-svg" v-if="finalShape === 'shield'">
      <defs>
        <linearGradient :id="'shg-' + teamName + nationName" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" :stop-color="style.primary" stop-opacity="0.98" />
          <stop offset="55%" :stop-color="style.primary" />
          <stop offset="100%" :stop-color="style.secondary" stop-opacity="0.85" />
        </linearGradient>
        <linearGradient :id="'shg2-' + teamName + nationName" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" :stop-color="style.accent" />
          <stop offset="100%" :stop-color="style.secondary" />
        </linearGradient>
      </defs>
      <!-- 盾形边框 -->
      <path d="M 50,2 L 96,10 L 96,70 Q 96,100 50,113 Q 4,100 4,70 L 4,10 Z"
            fill="url(#shg-{{teamName}}{{nationName}})" stroke="rgba(0,0,0,0.35)" stroke-width="1.5" />
      <!-- 装饰条纹（V 形） -->
      <path d="M 4,35 L 50,70 L 96,35 L 96,45 L 50,80 L 4,45 Z"
            :fill="style.secondary" opacity="0.28" />
      <!-- 顶部徽章小横条 -->
      <rect x="4" y="6" width="92" height="8" rx="2" :fill="style.accent" opacity="0.65" />
      <!-- 缩写文字 -->
      <text x="50" y="60" text-anchor="middle"
            :fill="style.accent === style.primary ? style.secondary : style.accent"
            font-weight="900"
            :font-size="props.size === 'small' ? 30 : 38"
            font-family="'Microsoft YaHei', 'SimHei', sans-serif"
            style="paint-order: stroke; stroke: rgba(0,0,0,0.25); stroke-width: 0.6">
        {{ style.abbr }}
      </text>
      <!-- 下方球队名缩写小字 -->
      <text x="50" y="95" text-anchor="middle"
            :fill="style.secondary"
            font-weight="700" font-size="10" opacity="0.9"
            font-family="'Microsoft YaHei', sans-serif"
            v-if="size !== 'small'">
        {{ teamName }}
      </text>
    </svg>

    <!-- 圆形（国家队 / 杯赛） -->
    <svg viewBox="0 0 100 100" class="badge-svg" v-else>
      <defs>
        <linearGradient :id="'rg-' + (nationName || teamName)" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" :stop-color="style.primary" />
          <stop offset="50%" :stop-color="style.primary" />
          <stop offset="100%" :stop-color="style.secondary" />
        </linearGradient>
        <radialGradient :id="'rh-' + (nationName || teamName)" cx="35%" cy="30%">
          <stop offset="0%" stop-color="#fff" stop-opacity="0.35" />
          <stop offset="100%" stop-color="#000" stop-opacity="0.0" />
        </radialGradient>
      </defs>
      <!-- 外圈装饰（星点） -->
      <circle cx="50" cy="50" r="48" :stroke="style.accent" stroke-width="1.5" fill="none" opacity="0.6" />
      <!-- 圆形主体 -->
      <circle cx="50" cy="50" r="45" fill="url(#rg-{{nationName}}{{teamName}})"
              stroke="rgba(0,0,0,0.3)" stroke-width="1" />
      <circle cx="50" cy="50" r="45" :fill="`url(#rh-${nationName || teamName})`" />
      <!-- 内圈副色环 -->
      <circle cx="50" cy="50" r="34" :stroke="style.secondary" stroke-width="2" fill="none" opacity="0.7" />
      <!-- 星星徽章（五颗代表荣誉） -->
      <text x="50" y="16" text-anchor="middle" :fill="style.secondary" font-size="8" opacity="0.8">★</text>
      <!-- 缩写主字 -->
      <text x="50" y="58" text-anchor="middle"
            :fill="style.primary === '#fff' || style.primary === style.secondary ? '#1a1a1a' : style.secondary"
            font-weight="900"
            :font-size="props.size === 'small' ? 28 : 36"
            font-family="'Microsoft YaHei', 'SimHei', sans-serif"
            style="paint-order: stroke; stroke: rgba(0,0,0,0.3); stroke-width: 0.5">
        {{ style.abbr }}
      </text>
      <!-- 底部全名 -->
      <text x="50" y="86" text-anchor="middle"
            :fill="style.secondary"
            font-weight="700" font-size="9" opacity="0.9"
            font-family="'Microsoft YaHei', sans-serif"
            v-if="size !== 'small'">
        {{ nationName || teamName }}
      </text>
    </svg>
  </div>
</template>

<style scoped>
.team-badge {
  position: relative;
  flex-shrink: 0;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));
  display: inline-flex; align-items: center; justify-content: center;
}
.team-badge.round { border-radius: 50%; }
.team-badge.nation { filter: drop-shadow(0 2px 6px rgba(0,0,0,0.35)); }
.badge-svg { width: 100%; height: 100%; display: block; }
</style>
