<script setup>
import { computed } from 'vue'
import PlayerAvatar from './PlayerAvatar.vue'
import TeamBadge from './TeamBadge.vue'
import { getTeamStyle, getNationStyle } from '../data/leagues.js'

// ===== Props（模拟 FC26 FUT 金卡样式） =====
// player: 玩家对象 { name, position, ovr, potential, team, teamLeague, nationality, age, value, reputation }
// variant: 'gold'(金卡, OVR>=75) / 'silver'(银卡, OVR<75>=65) / 'bronze'(铜卡) / 'icon'(传奇) / 'special'(赛季最佳)
// size: 'normal'(默认, 宽约 220px) / 'small'(紧凑型, 约 160px) / 'wide'(横向宽版, 360px)
// showTeam: 是否显示球队徽章
// showStats: 是否显示6维属性条
const props = defineProps({
  player: { type: Object, required: true },
  variant: { type: String, default: '' }, // 自动根据 OVR 判断
  size: { type: String, default: 'normal' }, // normal / small / wide
  showTeam: { type: Boolean, default: true },
  showStats: { type: Boolean, default: true },
  isNation: { type: Boolean, default: false }, // 是否国家队卡片
})

// 根据 OVR 决定卡片稀有度色
const finalVariant = computed(() => {
  if (props.variant) return props.variant
  const o = props.player.ovr || 60
  if (o >= 90) return 'special'
  if (o >= 85) return 'icon'
  if (o >= 75) return 'gold'
  if (o >= 65) return 'silver'
  return 'bronze'
})

// 卡片背景渐变（按稀有度）
const cardBgStyle = computed(() => {
  const map = {
    gold: ['linear-gradient(160deg,#fff8d6 0%,#ffd34a 45%,#c98a00 100%)', '#4a3400'],
    silver: ['linear-gradient(160deg,#f5f5f5 0%,#c8c9cc 45%,#6e6f73 100%)', '#1a1a1a'],
    bronze: ['linear-gradient(160deg,#f8e3d0 0%,#cd8f55 45%,#7b4a1b 100%)', '#3a1f08'],
    icon: ['linear-gradient(160deg,#fff9d9 0%,#ffde4a 20%,#ff9d00 60%,#b35900 100%)', '#3a1f00'],
    special: ['linear-gradient(160deg,#b8e0ff 0%,#4aa8ff 20%,#6f3bff 60%,#2c0a91 100%)', '#fff'],
  }
  return map[finalVariant.value] || map.gold
})

// 主要六项属性（FC26 风格：PAC/SHO/PAS/DRI/DEF/PHY）
const attrNames = [
  { key: 'pace', zh: '速度' },
  { key: 'shooting', zh: '射门' },
  { key: 'passing', zh: '传球' },
  { key: 'dribbling', zh: '盘带' },
  { key: 'defense', zh: '防守' },
  { key: 'physical', zh: '身体' },
]
const attrs = computed(() => {
  const a = props.player.attrs || {}
  const vals = {
    pace: Math.round(((a.acceleration || 60) + (a.sprintSpeed || 60)) / 2),
    shooting: Math.round(((a.finishing || 60) + (a.shotPower || 60) + (a.longShots || 60)) / 3),
    passing: Math.round(((a.shortPassing || 60) + (a.longPassing || 60) + (a.crossing || 60)) / 3),
    dribbling: Math.round(((a.dribbling || 60) + (a.ballControl || 60) + (a.agility || 60)) / 3),
    defense: Math.round(((a.standingTackle || 60) + (a.slidingTackle || 60) + (a.interception || 60) + (a.marking || 60)) / 4),
    physical: Math.round(((a.strength || 60) + (a.stamina || 60) + (a.jumping || 60)) / 3),
  }
  return attrNames.map(n => ({ ...n, value: Math.max(1, Math.min(99, vals[n.key])) }))
})

// OVR 级别文字
const ovrLabel = computed(() => {
  const map = {
    special: '赛季最佳',
    icon: '传奇巨星',
    gold: '黄金卡牌',
    silver: '白银卡牌',
    bronze: '青铜卡牌',
  }
  return map[finalVariant.value] || ''
})

// 价格 / 身价格式化
const valueStr = computed(() => {
  const v = props.player.value || 0
  if (v >= 1e8) return (v / 1e8).toFixed(2) + '亿欧'
  if (v >= 1e4) return Math.round(v / 1e4) + '万欧'
  return v + '欧'
})

// 卡片高度
const cardClass = computed(() => `size-${props.size}`)
</script>

<template>
  <div class="player-card" :class="[finalVariant, cardClass]"
       :style="{ background: cardBgStyle[0] }">
    <!-- 顶部区域：OVR + 位置 + 球队徽章 -->
    <div class="pc-top">
      <div class="pc-ovr-col">
        <div class="pc-ovr" :style="{ color: cardBgStyle[1] }">
          {{ player.ovr || 60 }}
        </div>
        <div class="pc-pos" :style="{ color: cardBgStyle[1] }">
          {{ player.position || 'ST' }}
        </div>
        <div class="pc-variant" :style="{ color: cardBgStyle[1] }">
          {{ ovrLabel }}
        </div>
      </div>
      <div class="pc-avatar-wrap">
        <PlayerAvatar
          :name="player.name"
          :position="player.position"
          :skin-tone="2"
          size="large"
          class="pc-avatar"
        />
      </div>
      <div class="pc-badge-col" v-if="showTeam">
        <TeamBadge
          v-if="!isNation"
          :team-name="player.team"
          :league-code="player.teamLeague"
          size="medium"
          class="pc-badge"
        />
        <TeamBadge
          v-else
          :nation-name="player.nationality || '中国'"
          size="medium"
          class="pc-badge"
        />
      </div>
    </div>

    <!-- 姓名条 -->
    <div class="pc-name-bar">
      <span class="pc-name">{{ player.name || '未知球员' }}</span>
    </div>

    <!-- 信息行：国籍 / 年龄 / 身高(可选) -->
    <div class="pc-meta">
      <div class="pc-meta-item" v-if="player.nationality || isNation">
        <TeamBadge
          :nation-name="player.nationality || '中国'"
          size="small"
          shape="round"
          class="mini-nation"
        />
        <span>{{ isNation ? '国家队' : (player.nationality || '') }}</span>
      </div>
      <div class="pc-meta-item" v-if="player.age">
        <span class="pc-meta-icon">🎂</span>
        <span>{{ player.age }}岁</span>
      </div>
      <div class="pc-meta-item" v-if="player.potential">
        <span class="pc-meta-icon">📈</span>
        <span>潜力 {{ player.potential }}</span>
      </div>
    </div>

    <!-- 六项属性 -->
    <div class="pc-stats" v-if="showStats && !['small'].includes(size)">
      <div class="pc-stat" v-for="s in attrs" :key="s.key">
        <div class="pcs-num" :style="{ color: cardBgStyle[1] }">{{ s.value }}</div>
        <div class="pcs-label" :style="{ color: cardBgStyle[1] }">{{ s.zh }}</div>
        <div class="pcs-bar">
          <div class="pcs-bar-fill" :style="{
            width: s.value + '%',
            background: cardBgStyle[1],
            opacity: 0.7,
          }"></div>
        </div>
      </div>
    </div>

    <!-- 底部：身价 / 声望 -->
    <div class="pc-footer" v-if="!['small'].includes(size)">
      <div class="pc-foot-item">
        <div class="pc-fi-label">身价</div>
        <div class="pc-fi-value">{{ valueStr }}</div>
      </div>
      <div class="pc-foot-item">
        <div class="pc-fi-label">声望</div>
        <div class="pc-fi-value">{{ player.reputation || 0 }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.player-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  padding: 12px;
  box-shadow: 0 4px 14px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.3);
  font-family: 'Microsoft YaHei', 'SimHei', sans-serif;
  user-select: none;
  border: 1px solid rgba(0,0,0,0.12);
}
/* 移除原斜纹装饰，保持简洁 */

/* ===== 尺寸变体 ===== */
.size-normal { width: 200px; }
.size-small { width: 140px; padding: 8px; }
.size-wide { width: 320px; padding: 12px; }

/* ===== 顶部 ===== */
.pc-top {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 4px; margin-bottom: 2px;
}
.pc-ovr-col {
  display: flex; flex-direction: column; align-items: flex-start;
  min-width: 40px;
}
.pc-ovr {
  font-size: 28px; font-weight: 900; line-height: 1;
  font-family: 'Arial Black', sans-serif;
  letter-spacing: -1px;
}
.size-small .pc-ovr { font-size: 22px; }
.pc-pos {
  font-size: 11px; font-weight: 800;
  letter-spacing: 1px;
  margin-top: 2px;
}
.pc-variant { display: none; } /* 隐藏冗余的稀有度文字 */
.pc-avatar-wrap {
  flex: 1; display: flex; justify-content: center;
}
.pc-avatar { transform: translateY(2px); }
.size-small .pc-avatar { transform: none; }
.pc-badge-col {
  display: flex; justify-content: flex-end; align-items: flex-start;
  min-width: 44px;
}

/* ===== 姓名条 ===== */
.pc-name-bar {
  text-align: center;
  padding: 3px 0; margin: 2px 0 4px;
  border-bottom: 1px solid rgba(0,0,0,0.08);
}
.pc-name {
  font-size: 14px; font-weight: 800;
  color: #1a1a1a;
  letter-spacing: 0.5px;
}
.size-small .pc-name { font-size: 12px; }

/* ===== 元信息行 ===== */
.pc-meta {
  display: flex; flex-wrap: wrap; gap: 4px;
  justify-content: center;
  margin-bottom: 4px;
  font-size: 10px;
  color: #1a1a1a;
  opacity: 0.8;
}
.pc-meta-item {
  display: inline-flex; align-items: center; gap: 3px;
  padding: 1px 5px;
  background: rgba(255,255,255,0.4);
  border-radius: 4px;
}
.mini-nation { transform: scale(0.85); }

/* ===== 6 维属性 ===== */
.pc-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 8px;
  padding: 4px 2px;
}
.size-wide .pc-stats {
  grid-template-columns: repeat(3, 1fr);
}
.pc-stat {
  display: flex; align-items: center; gap: 3px;
  padding-bottom: 2px;
}
.pcs-num {
  font-size: 12px; font-weight: 900; min-width: 18px; text-align: right;
  font-family: 'Arial Black', sans-serif;
}
.pcs-label { font-size: 9px; font-weight: 700; min-width: 26px; }
.pcs-bar {
  flex: 1; height: 2px; border-radius: 1px;
  background: rgba(0,0,0,0.1);
  overflow: hidden;
}
.pcs-bar-fill { height: 100%; border-radius: 1px; }

/* ===== 底部 ===== */
.pc-footer {
  display: flex; justify-content: space-between;
  margin-top: 6px; padding: 4px 6px 0;
  border-top: 1px solid rgba(0,0,0,0.08);
}
.pc-foot-item { text-align: center; }
.pc-fi-label {
  font-size: 8px; font-weight: 700; opacity: 0.65;
  color: #1a1a1a;
}
.pc-fi-value {
  font-size: 11px; font-weight: 800;
  color: #1a1a1a;
  margin-top: 1px;
}
</style>
