<script setup>
import { computed, ref } from 'vue'
import { state } from '../store.js'
import { generateSchedule, leagueOverviews, currentRoundInfo } from '../engine/schedule.js'
import { LEAGUES } from '../data/leagues.js'

const emit = defineEmits(['back'])

const player = computed(() => state.player)
const overviews = computed(() => leagueOverviews())
const selectedLeague = ref(player.value?.teamLeague || 'CSL')
const showAll = ref(false) // true=显示所有联赛概览 false=显示选中联赛赛程

const mySchedule = computed(() => {
  if (!player.value) return null
  const year = player.value.birthYear + player.value.age
  return generateSchedule(player.value.teamLeague, player.value.team, year)
})

const leagueSchedule = computed(() => {
  // 展示选中联赛的前12轮（无需玩家球队，仅展示）
  const ov = overviews.value.find(o => o.code === selectedLeague.value)
  return ov
})

// 当前轮次（玩家赛程）
const currentRound = computed(() => {
  if (!mySchedule.value || !state.season) return null
  return currentRoundInfo(mySchedule.value, state.season.eventIndex || 0)
})

const visibleFixtures = computed(() => {
  if (!mySchedule.value) return []
  return showAll.value ? mySchedule.value.fixtures : mySchedule.value.fixtures.slice(0, 10)
})

function selectLeague(code) { selectedLeague.value = code }
</script>

<template>
  <div class="sv-wrap" v-if="player">
    <div class="sv-hero">
      <div class="hero-row">
        <button class="back-btn" @click="emit('back')">← 返回</button>
        <div class="hero-badge">📅</div>
      </div>
      <h1>联赛赛程 · 比赛时间</h1>
    </div>

    <!-- 各大联赛概览 -->
    <div class="leagues-overview">
      <div class="ov-title">🌍 七大联赛概览</div>
      <div class="ov-grid">
        <div
          v-for="lg in overviews"
          :key="lg.code"
          class="ov-card"
          :class="{ active: lg.code === player.teamLeague, selected: lg.code === selectedLeague }"
          :style="{ borderLeftColor: lg.color }"
          @click="selectLeague(lg.code)"
        >
          <div class="ov-short" :style="{ color: lg.color }">{{ lg.short }}</div>
          <div class="ov-name">{{ lg.name }}</div>
          <div class="ov-meta">
            <span>🗓️ {{ lg.window }}</span>
            <span>🔄 {{ lg.rounds }}轮</span>
            <span>🏟️ {{ lg.teamCount }}队</span>
          </div>
          <div class="ov-mytag" v-if="lg.code === player.teamLeague">我的联赛</div>
        </div>
      </div>
    </div>

    <!-- 我的赛程 -->
    <div class="my-schedule" v-if="mySchedule">
      <div class="ms-head">
        <div class="ms-title">📋 {{ mySchedule.leagueName }} · 我的赛程</div>
        <div class="ms-window">赛季周期：{{ mySchedule.window }} · 共 {{ mySchedule.rounds }} 轮</div>
      </div>
      <!-- 当前轮次高亮 -->
      <div class="current-round" v-if="currentRound">
        <div class="cr-label">⏰ 本轮比赛</div>
        <div class="cr-info">
          <span class="cr-round">第 {{ currentRound.round }} 轮</span>
          <span class="cr-date">{{ currentRound.dateStr }}</span>
          <span class="cr-vs">{{ currentRound.home ? '主场' : '客场' }} vs {{ currentRound.opponent }}</span>
        </div>
      </div>
      <!-- 赛程列表 -->
      <div class="fixtures">
        <div
          v-for="f in visibleFixtures"
          :key="f.round"
          class="fixture-row"
          :class="{ now: currentRound && f.round === currentRound.round, home: f.home, away: !f.home }"
        >
          <div class="f-round">R{{ f.round }}</div>
          <div class="f-date">{{ f.dateStr }}</div>
          <div class="f-venue">{{ f.home ? '🏟️ 主' : '✈️ 客' }}</div>
          <div class="f-opp">vs {{ f.opponent }}</div>
          <div class="f-strength">实力 {{ f.oppStrength }}</div>
        </div>
      </div>
      <button class="toggle-btn" @click="showAll = !showAll">
        {{ showAll ? '收起 ▲' : `查看全部 ${mySchedule.rounds} 轮 ▼` }}
      </button>
    </div>

    <!-- 选中联赛信息 -->
    <div class="league-detail" v-if="leagueSchedule">
      <div class="ld-title">{{ leagueSchedule.name }} · 联赛信息</div>
      <div class="ld-info">
        <span>国家：{{ leagueSchedule.country }}</span>
        <span>赛季：{{ leagueSchedule.window }}</span>
        <span>轮次：{{ leagueSchedule.rounds }}</span>
        <span>球队：{{ leagueSchedule.teamCount }} 支</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sv-wrap { max-width: 800px; margin: 0 auto; padding: 16px; display: flex; flex-direction: column; gap: 16px; }
.sv-hero { text-align: center; padding: 4px 0; }
.hero-row { display: flex; align-items: center; justify-content: space-between; }
.back-btn { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #c8d4e6; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; }
.back-btn:hover { background: rgba(255,255,255,0.1); }
.hero-badge { font-size: 32px; }
.sv-hero h1 { font-size: 22px; margin: 4px 0; color: #fff; background: linear-gradient(90deg,#3498db,#43b581); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }

.leagues-overview { background: linear-gradient(160deg,#1a2332,#0f1620); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px; }
.ov-title { font-size: 14px; font-weight: 800; color: #c8d4e6; margin-bottom: 10px; }
.ov-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }
.ov-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-left: 3px solid #888; border-radius: 8px; padding: 10px; cursor: pointer; transition: all 0.15s; position: relative; }
.ov-card:hover { background: rgba(255,255,255,0.06); transform: translateY(-2px); }
.ov-card.selected { background: rgba(52,152,219,0.1); border-color: rgba(52,152,219,0.4); }
.ov-card.active { box-shadow: 0 0 0 1px rgba(67,181,129,0.5); }
.ov-short { font-size: 18px; font-weight: 800; }
.ov-name { font-size: 11px; color: #9fb0c8; margin: 2px 0 6px; }
.ov-meta { display: flex; flex-direction: column; gap: 2px; font-size: 10px; color: #8a99b0; }
.ov-mytag { position: absolute; top: 4px; right: 4px; font-size: 9px; background: #43b581; color: #07140e; padding: 1px 5px; border-radius: 3px; font-weight: 800; }

.my-schedule { background: linear-gradient(160deg,#1a2332,#0f1620); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px; }
.ms-head { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
.ms-title { font-size: 15px; font-weight: 800; color: #e8eef7; }
.ms-window { font-size: 11px; color: #8a99b0; }
.current-round { background: linear-gradient(90deg, rgba(67,181,129,0.18), rgba(67,181,129,0.05)); border: 1px solid rgba(67,181,129,0.3); border-radius: 10px; padding: 12px; margin-bottom: 12px; }
.cr-label { font-size: 11px; color: #43b581; font-weight: 700; margin-bottom: 4px; }
.cr-info { display: flex; gap: 14px; flex-wrap: wrap; align-items: center; }
.cr-round { font-size: 16px; font-weight: 800; color: #fff; }
.cr-date { font-size: 13px; color: #c8d4e6; }
.cr-vs { font-size: 13px; color: #43b581; font-weight: 700; }

.fixtures { display: flex; flex-direction: column; gap: 4px; }
.fixture-row { display: grid; grid-template-columns: 44px 1fr 50px 1fr 70px; gap: 8px; align-items: center; padding: 7px 10px; border-radius: 6px; background: rgba(255,255,255,0.02); font-size: 12px; }
.fixture-row.home { border-left: 2px solid #43b581; }
.fixture-row.away { border-left: 2px solid #e67e22; }
.fixture-row.now { background: rgba(255,215,0,0.12); border-left-color: #ffd700; animation: pulse 2s infinite; }
@keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(255,215,0,0.3); } 50% { box-shadow: 0 0 0 3px rgba(255,215,0,0); } }
.f-round { font-size: 11px; font-weight: 800; color: #9fb0c8; }
.f-date { color: #c8d4e6; }
.f-venue { font-size: 11px; font-weight: 700; }
.f-opp { color: #e8eef7; font-weight: 600; }
.f-strength { font-size: 10px; color: #8a99b0; text-align: right; }
.toggle-btn { width: 100%; padding: 8px; margin-top: 8px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: #c8d4e6; border-radius: 8px; cursor: pointer; font-size: 12px; }
.toggle-btn:hover { background: rgba(255,255,255,0.08); }

.league-detail { background: linear-gradient(160deg,#1a2332,#0f1620); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px; }
.ld-title { font-size: 14px; font-weight: 800; color: #c8d4e6; margin-bottom: 8px; }
.ld-info { display: flex; gap: 16px; flex-wrap: wrap; font-size: 12px; color: #9fb0c8; }
</style>
