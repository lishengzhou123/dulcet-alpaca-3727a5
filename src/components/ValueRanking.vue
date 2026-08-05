<script setup>
import { computed, ref } from 'vue'
import { state } from '../store.js'
import { buildRanking, buildGlobalRanking } from '../engine/ranking.js'
import { LEAGUES } from '../data/leagues.js'
import { formatMoney } from '../engine/util.js'
import PlayerProfile from './PlayerProfile.vue'

const props = defineProps({
  mode: { type: String, default: 'league' }, // 'league' | 'global'
})
const emit = defineEmits(['back'])

const player = computed(() => state.player)
const scope = ref(props.mode) // league / global
const selectedProfile = ref(null)

const ranking = computed(() => {
  if (!player.value) return []
  const year = state.season?.year || (player.value.birthYear + player.value.age)
  if (scope.value === 'global') return buildGlobalRanking(player.value, 50, year)
  return buildRanking(player.value.teamLeague, player.value, 20, year)
})

const leagueName = computed(() => {
  if (scope.value === 'global') return '世界足坛'
  return LEAGUES[player.value?.teamLeague]?.name || '当前联赛'
})

function posColor(pos) {
  const m = { ST:'#e74c3c', CF:'#e74c3c', LW:'#e67e22', RW:'#e67e22', CAM:'#9b59b6', CM:'#3498db', CDM:'#16a085', CB:'#2ecc71', LB:'#27ae60', RB:'#27ae60', GK:'#f39c12' }
  return m[pos] || '#3498db'
}
function ovrColor(ovr) {
  if (ovr >= 88) return '#ffd700'
  if (ovr >= 82) return '#43b581'
  if (ovr >= 75) return '#3498db'
  if (ovr >= 68) return '#e67e22'
  return '#95a5a6'
}
function showProfile(p) { selectedProfile.value = p }
function closeProfile() { selectedProfile.value = null }
function switchScope(s) { scope.value = s }

const myRank = computed(() => ranking.value.find(p => p.isPlayer)?.rank || '—')
</script>

<template>
  <div class="vr-wrap" v-if="player">
    <div class="vr-hero">
      <div class="hero-row">
        <button class="back-btn" @click="emit('back')">← 返回</button>
        <div class="hero-badge">💰</div>
      </div>
      <h1>球员身价排行榜</h1>
      <div class="scope-tabs">
        <button class="scope-tab" :class="{active: scope==='league'}" @click="switchScope('league')">本联赛 · {{ LEAGUES[player.teamLeague]?.short }}</button>
        <button class="scope-tab" :class="{active: scope==='global'}" @click="switchScope('global')">🌍 世界总榜</button>
      </div>
      <div class="my-rank">你的排名：<b>{{ myRank }}</b> / {{ ranking.length }}</div>
    </div>

    <div class="ranking-list">
      <div
        v-for="p in ranking"
        :key="p.name + p.team"
        class="rank-row"
        :class="{ me: p.isPlayer }"
        @click="showProfile(p)"
      >
        <div class="r-rank" :class="{ top3: p.rank <= 3 }">{{ p.rank }}</div>
        <div class="r-ovr" :style="{ color: ovrColor(p.ovr) }">{{ p.ovr }}</div>
        <div class="r-pos" :style="{ background: posColor(p.pos) }">{{ p.pos }}</div>
        <div class="r-info">
          <div class="r-name">{{ p.name }}<span class="me-tag" v-if="p.isPlayer">YOU</span></div>
          <div class="r-team">{{ p.team }} · {{ p.nation }}</div>
        </div>
        <div class="r-age">{{ p.age }}岁</div>
        <div class="r-value">{{ formatMoney(p.value) }}</div>
      </div>
    </div>

    <div class="vr-hint">💡 点击任意球员查看详细简介</div>

    <PlayerProfile :player="selectedProfile" @close="closeProfile" />
  </div>
</template>

<style scoped>
.vr-wrap { max-width: 800px; margin: 0 auto; padding: 16px; display: flex; flex-direction: column; gap: 14px; }
.vr-hero { text-align: center; padding: 8px 0; }
.hero-row { display: flex; align-items: center; justify-content: space-between; }
.back-btn { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #c8d4e6; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; }
.back-btn:hover { background: rgba(255,255,255,0.1); }
.hero-badge { font-size: 32px; }
.vr-hero h1 { font-size: 22px; margin: 4px 0; color: #fff; background: linear-gradient(90deg,#43b581,#ffd700); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.scope-tabs { display: inline-flex; gap: 4px; background: rgba(255,255,255,0.04); padding: 4px; border-radius: 10px; margin-top: 8px; }
.scope-tab { background: transparent; border: none; color: #9fb0c8; padding: 6px 14px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600; }
.scope-tab.active { background: linear-gradient(90deg,#43b581,#2ecc71); color: #07140e; }
.my-rank { font-size: 13px; color: #9fb0c8; margin-top: 8px; }
.my-rank b { color: #ffd700; font-size: 16px; }

.ranking-list { display: flex; flex-direction: column; gap: 4px; background: linear-gradient(160deg,#1a2332,#0f1620); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 8px; }
.rank-row {
  display: grid; grid-template-columns: 36px 36px 36px 1fr 44px 100px; gap: 8px; align-items: center;
  padding: 8px 10px; border-radius: 8px; cursor: pointer; transition: background 0.15s;
}
.rank-row:hover { background: rgba(255,255,255,0.05); }
.rank-row.me { background: rgba(67,181,129,0.12); border-left: 3px solid #43b581; }
.r-rank { font-size: 15px; font-weight: 800; color: #9fb0c8; text-align: center; }
.r-rank.top3 { color: #ffd700; }
.r-ovr { font-size: 15px; font-weight: 800; text-align: center; }
.r-pos { font-size: 10px; color: #fff; font-weight: 700; padding: 2px 4px; border-radius: 4px; text-align: center; }
.r-info { min-width: 0; }
.r-name { font-size: 13px; font-weight: 700; color: #e8eef7; display: flex; align-items: center; gap: 6px; }
.me-tag { font-size: 9px; background: #43b581; color: #07140e; padding: 1px 5px; border-radius: 3px; font-weight: 800; }
.r-team { font-size: 11px; color: #8a99b0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.r-age { font-size: 12px; color: #9fb0c8; text-align: center; }
.r-value { font-size: 13px; font-weight: 700; color: #43b581; text-align: right; }
.vr-hint { text-align: center; font-size: 12px; color: #8a99b0; }
</style>
