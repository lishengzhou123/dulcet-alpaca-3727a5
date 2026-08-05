<script setup>
import { computed } from 'vue'
import { state, closeTeamInfo } from '../store.js'
import { LEAGUES, TEAMS } from '../data/leagues.js'
import { getSquad } from '../data/teamSquads.js'

const teamName = computed(() => state.viewTeam)
const team = computed(() => TEAMS.find(t => t.name === teamName.value))
const league = computed(() => team.value ? LEAGUES[team.value.league] : null)
const squad = computed(() => team.value ? getSquad(team.value.name) : [])
const starters = computed(() => squad.value.filter(p => p.starting))
const bench = computed(() => squad.value.filter(p => !p.starting))

// 生成队徽图片URL
function emblemUrl(team) {
  if (!team) return ''
  const prompt = encodeURIComponent(`football club emblem crest badge, ${team.name}, minimalist circular logo, ${league.value?.color || '#43b581'} color scheme, esports icon style, clean vector art`)
  return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${prompt}&image_size=square_hd`
}

const emblemSrc = computed(() => emblemUrl(team.value))

function posColor(pos) {
  const m = { ST:'#e74c3c', CF:'#e74c3c', LW:'#e67e22', RW:'#e67e22', CAM:'#9b59b6', CM:'#3498db', CDM:'#16a085', CB:'#2ecc71', LB:'#27ae60', RB:'#27ae60', GK:'#f39c12' }
  return m[pos] || '#3498db'
}
function ovrColor(ovr) {
  if (ovr >= 88) return '#ffd700'
  if (ovr >= 80) return '#43b581'
  if (ovr >= 72) return '#3498db'
  if (ovr >= 65) return '#e67e22'
  return '#95a5a6'
}
</script>

<template>
  <div class="ti-mask" v-if="team" @click.self="closeTeamInfo">
    <div class="ti-modal">
      <button class="close-btn" @click="closeTeamInfo">✕</button>

      <!-- 球队头部 -->
      <div class="ti-header" :style="{ background: `linear-gradient(135deg, ${league?.color || '#43b581'}66, transparent)` }">
        <div class="th-emblem">
          <img :src="emblemSrc" :alt="team.name + '队徽'" class="emblem-img" @error="$event.target.style.display='none'; $event.target.nextElementSibling.style.display='flex'">
          <div class="emblem-fallback">{{ team.name.charAt(0) }}</div>
        </div>
        <div class="th-info">
          <h2>{{ team.name }}</h2>
          <div class="th-meta">
            <span class="meta-tag" :style="{ background: league?.color || '#43b581' }">{{ league?.short }}</span>
            <span>{{ team.city }}</span>
            <span class="sep">·</span>
            <span>成立于 {{ team.founded }}</span>
          </div>
          <div class="th-stats">
            <div class="ts-item"><b>{{ team.strength }}</b><span>实力</span></div>
            <div class="ts-item"><b>{{ team.reputation }}</b><span>声望</span></div>
            <div class="ts-item"><b>{{ team.founded }}</b><span>成立</span></div>
          </div>
        </div>
      </div>

      <!-- 球队介绍 -->
      <div class="ti-desc">
        <div class="desc-title">📖 球队简介</div>
        <p class="desc-text">{{ team.desc }}</p>
        <div class="stadium-info">
          <span class="si-icon">🏟️</span>
          <span class="si-name">{{ team.stadium }}</span>
        </div>
      </div>

      <!-- 首发阵容 -->
      <div class="ti-squad">
        <div class="squad-title">⚽ 首发阵容 (4-3-3)</div>
        <div class="squad-grid">
          <div v-for="p in starters" :key="p.name" class="player-card" :class="{ star: !p.isFiller }">
            <div class="pc-ovr" :style="{ color: ovrColor(p.ovr) }">{{ p.ovr }}</div>
            <div class="pc-pos" :style="{ background: posColor(p.pos) }">{{ p.pos }}</div>
            <div class="pc-info">
              <div class="pc-name">{{ p.name }}</div>
              <div class="pc-meta">
                <span>{{ p.age }}岁</span>
                <span v-if="p.nation">· {{ p.nation }}</span>
                <span v-if="!p.isFiller" class="star-tag">⭐</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 替补席 -->
      <div class="ti-bench">
        <div class="bench-title">🪑 替补席</div>
        <div class="bench-list">
          <div v-for="p in bench" :key="p.name" class="bench-item">
            <span class="bi-ovr" :style="{ color: ovrColor(p.ovr) }">{{ p.ovr }}</span>
            <span class="bi-pos" :style="{ background: posColor(p.pos) }">{{ p.pos }}</span>
            <span class="bi-name">{{ p.name }}</span>
            <span class="bi-age">{{ p.age }}岁</span>
          </div>
        </div>
      </div>

      <!-- 知名球星 -->
      <div class="ti-stars" v-if="team.starPlayers?.length">
        <div class="stars-title">⭐ 知名球星</div>
        <div class="stars-list">
          <span v-for="sp in team.starPlayers" :key="sp" class="star-chip">{{ sp }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ti-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 100; display: flex; align-items: flex-start; justify-content: center; padding: 20px; overflow-y: auto; }
.ti-modal { background: linear-gradient(160deg,#1a2332,#0f1620); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; max-width: 560px; width: 100%; padding: 20px; color: #e8eef7; position: relative; animation: slideUp 0.25s; }
@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.close-btn { position: absolute; top: 12px; right: 12px; background: rgba(255,255,255,0.08); border: none; color: #c8d4e6; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-size: 14px; z-index: 1; }
.close-btn:hover { background: rgba(231,76,60,0.2); }

.ti-header { display: flex; gap: 16px; padding: 16px; border-radius: 12px; margin-bottom: 16px; }
.th-emblem { width: 80px; height: 80px; border-radius: 12px; overflow: hidden; flex-shrink: 0; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; }
.emblem-img { width: 100%; height: 100%; object-fit: cover; }
.emblem-fallback { display: none; width: 100%; height: 100%; align-items: center; justify-content: center; font-size: 32px; font-weight: 900; color: #fff; background: linear-gradient(135deg,#43b581,#3498db); }
.th-info { flex: 1; min-width: 0; }
.th-info h2 { font-size: 22px; margin: 0 0 6px; color: #fff; }
.th-meta { display: flex; gap: 6px; align-items: center; font-size: 12px; color: #9fb0c8; flex-wrap: wrap; }
.meta-tag { font-size: 10px; padding: 2px 8px; border-radius: 4px; color: #fff; font-weight: 700; }
.sep { color: #5a6b85; }
.th-stats { display: flex; gap: 16px; margin-top: 10px; }
.ts-item { text-align: center; }
.ts-item b { display: block; font-size: 18px; color: #43b581; font-weight: 800; }
.ts-item span { font-size: 10px; color: #8a99b0; }

.ti-desc { background: rgba(255,255,255,0.04); border-radius: 10px; padding: 14px; margin-bottom: 14px; }
.desc-title { font-size: 13px; font-weight: 800; color: #c8d4e6; margin-bottom: 6px; }
.desc-text { font-size: 13px; line-height: 1.8; color: #9fb0c8; margin: 0 0 8px; }
.stadium-info { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #43b581; }
.si-icon { font-size: 14px; }

.ti-squad { margin-bottom: 14px; }
.squad-title { font-size: 13px; font-weight: 800; color: #c8d4e6; margin-bottom: 8px; }
.squad-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; }
.player-card { display: flex; align-items: center; gap: 8px; padding: 8px 10px; background: rgba(255,255,255,0.03); border-radius: 8px; border: 1px solid transparent; }
.player-card.star { border-color: rgba(255,215,0,0.2); background: rgba(255,215,0,0.05); }
.pc-ovr { font-size: 16px; font-weight: 900; min-width: 24px; text-align: center; }
.pc-pos { font-size: 9px; padding: 2px 5px; border-radius: 4px; color: #fff; font-weight: 700; min-width: 28px; text-align: center; }
.pc-info { flex: 1; min-width: 0; }
.pc-name { font-size: 12px; font-weight: 700; color: #e8eef7; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pc-meta { font-size: 10px; color: #8a99b0; }
.star-tag { color: #ffd700; }

.ti-bench { margin-bottom: 14px; }
.bench-title { font-size: 13px; font-weight: 800; color: #c8d4e6; margin-bottom: 8px; }
.bench-list { display: flex; flex-direction: column; gap: 4px; }
.bench-item { display: flex; align-items: center; gap: 8px; padding: 6px 10px; background: rgba(255,255,255,0.02); border-radius: 6px; font-size: 11px; }
.bi-ovr { font-weight: 800; min-width: 20px; }
.bi-pos { font-size: 9px; padding: 1px 4px; border-radius: 3px; color: #fff; font-weight: 600; min-width: 24px; text-align: center; }
.bi-name { flex: 1; color: #c8d4e6; }
.bi-age { color: #8a99b0; }

.ti-stars { padding: 12px; background: rgba(255,215,0,0.06); border-radius: 10px; border-left: 3px solid #ffd700; }
.stars-title { font-size: 13px; font-weight: 800; color: #ffd700; margin-bottom: 8px; }
.stars-list { display: flex; gap: 6px; flex-wrap: wrap; }
.star-chip { font-size: 11px; padding: 4px 10px; background: rgba(255,215,0,0.12); border-radius: 12px; color: #ffd700; font-weight: 600; }
</style>
