<script setup>
import { computed, ref } from 'vue'
import { state, returnFromOverlay, openTeamInfo } from '../store.js'
import { LEAGUES, TEAMS } from '../data/leagues.js'
import { simulateLeague } from '../engine/league.js'

const player = computed(() => state.player)
const scope = ref('') // 当前查看的联赛代码，默认玩家所在联赛
const leagueCode = computed(() => scope.value || player.value?.teamLeague || 'EPL')
const leagueInfo = computed(() => LEAGUES[leagueCode.value])

// 模拟当前联赛积分榜（缓存）
const cache = ref({})
function getStandings(code) {
  if (!cache.value[code]) {
    cache.value[code] = simulateLeague(code, player.value?.team || '')
  }
  return cache.value[code]
}
const result = computed(() => getStandings(leagueCode.value))
const standings = computed(() => result.value?.standings || [])
const playerRow = computed(() => result.value?.playerRow)

function switchLeague(code) {
  scope.value = code
}
function fmtGoalDiff(gd) {
  if (gd > 0) return `+${gd}`
  return `${gd}`
}
function posColor(pos, total) {
  if (pos === 1) return '#ffd700'
  if (pos <= 3) return '#43b581'
  if (pos <= 6) return '#3498db'
  if (pos > total - 2) return '#e74c3c'
  return '#9fb0c8'
}
</script>

<template>
  <div class="ls-wrap" v-if="player">
    <div class="ls-hero">
      <div class="hero-row">
        <button class="back-btn" @click="returnFromOverlay">← 返回</button>
        <div class="hero-badge">📊</div>
      </div>
      <h1>联赛积分榜</h1>
    </div>

    <!-- 联赛切换 -->
    <div class="league-tabs">
      <button
        v-for="(lg, code) in LEAGUES"
        :key="code"
        class="league-tab"
        :class="{ active: leagueCode === code }"
        @click="switchLeague(code)"
        :style="leagueCode === code ? { borderColor: lg.color, color: lg.color } : {}"
      >
        {{ lg.short }}
      </button>
    </div>

    <!-- 联赛信息 -->
    <div class="league-info" v-if="leagueInfo">
      <div class="li-name">{{ leagueInfo.name }}</div>
      <div class="li-meta">
        <span>{{ leagueInfo.country }}</span>
        <span class="li-sep">·</span>
        <span v-if="leagueInfo.tier === 1">顶级联赛</span>
        <span v-else>二级联赛</span>
      </div>
    </div>

    <!-- 玩家排名 -->
    <div class="my-rank" v-if="playerRow">
      <div class="mr-label">你的球队排名</div>
      <div class="mr-info">
        <span class="mr-pos" :style="{ color: posColor(playerRow.pos, standings.length) }">第 {{ playerRow.pos }} 名</span>
        <span class="mr-team">{{ player.team }}</span>
        <span class="mr-pts">{{ playerRow.points }} 分</span>
        <span class="mr-gd">净胜球 {{ fmtGoalDiff(playerRow.gf - playerRow.ga) }}</span>
      </div>
    </div>

    <!-- 积分榜表格 -->
    <div class="standings-table">
      <div class="st-header">
        <div class="sth-pos">#</div>
        <div class="sth-team">球队</div>
        <div class="sth-num">赛</div>
        <div class="sth-num">胜</div>
        <div class="sth-num">平</div>
        <div class="sth-num">负</div>
        <div class="sth-num">进</div>
        <div class="sth-num">失</div>
        <div class="sth-num">净</div>
        <div class="sth-num pts">分</div>
      </div>
      <div
        v-for="row in standings"
        :key="row.name"
        class="st-row"
        :class="{ player: row.isPlayer }"
        @click="openTeamInfo(row.name)"
      >
        <div class="str-pos" :style="{ color: posColor(row.pos, standings.length) }">
          <span class="pos-marker" :style="{ background: posColor(row.pos, standings.length) }"></span>
          {{ row.pos }}
        </div>
        <div class="str-team">
          <span class="t-emblem">{{ row.name.charAt(0) }}</span>
          <span class="t-name">{{ row.name }}</span>
          <span class="t-mark" v-if="row.isPlayer">★ 你</span>
        </div>
        <div class="str-num">{{ row.played }}</div>
        <div class="str-num">{{ row.win }}</div>
        <div class="str-num">{{ row.draw }}</div>
        <div class="str-num">{{ row.loss }}</div>
        <div class="str-num">{{ row.gf }}</div>
        <div class="str-num">{{ row.ga }}</div>
        <div class="str-num" :style="{ color: row.gf - row.ga > 0 ? '#43b581' : row.gf - row.ga < 0 ? '#e74c3c' : '#9fb0c8' }">{{ fmtGoalDiff(row.gf - row.ga) }}</div>
        <div class="str-num pts">{{ row.points }}</div>
      </div>
    </div>

    <!-- 图例 -->
    <div class="legend">
      <div class="leg-item"><span class="leg-dot gold"></span> 冠军/欧冠区</div>
      <div class="leg-item"><span class="leg-dot green"></span> 欧战区</div>
      <div class="leg-item"><span class="leg-dot blue"></span> 中游</div>
      <div class="leg-item"><span class="leg-dot red"></span> 降级区</div>
    </div>

    <div class="hint">点击任意球队查看球队详情与阵容</div>
  </div>
</template>

<style scoped>
.ls-wrap { max-width: 720px; margin: 0 auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }

.ls-hero { text-align: center; padding: 8px 0; }
.hero-row { display: flex; align-items: center; justify-content: space-between; }
.back-btn { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #c8d4e6; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; }
.hero-badge { font-size: 36px; }
.ls-hero h1 { font-size: 22px; margin: 4px 0; color: #fff; background: linear-gradient(90deg,#43b581,#3498db); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }

.league-tabs { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; }
.league-tab { padding: 6px 14px; border-radius: 8px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: #9fb0c8; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.15s; }
.league-tab.active { background: rgba(255,255,255,0.08); }

.league-info { text-align: center; padding: 6px; }
.li-name { font-size: 14px; color: #c8d4e6; font-weight: 700; }
.li-meta { font-size: 11px; color: #8a99b0; margin-top: 2px; }
.li-sep { margin: 0 4px; }

.my-rank { padding: 12px 14px; background: linear-gradient(90deg,rgba(67,181,129,0.12),transparent); border-left: 3px solid #43b581; border-radius: 8px; }
.mr-label { font-size: 11px; color: #8a99b0; }
.mr-info { display: flex; gap: 12px; align-items: center; margin-top: 4px; font-size: 13px; flex-wrap: wrap; }
.mr-pos { font-size: 18px; font-weight: 900; }
.mr-team { color: #fff; font-weight: 700; }
.mr-pts { color: #43b581; font-weight: 800; }
.mr-gd { color: #9fb0c8; font-size: 12px; }

.standings-table { background: rgba(255,255,255,0.03); border-radius: 10px; overflow: hidden; }
.st-header, .st-row { display: grid; grid-template-columns: 36px 1fr 28px 28px 28px 28px 28px 28px 36px 36px; gap: 4px; padding: 8px 10px; align-items: center; }
.st-header { background: rgba(255,255,255,0.05); font-size: 10px; color: #8a99b0; font-weight: 700; text-align: center; }
.sth-team, .str-team { text-align: left; }
.sth-pos { text-align: center; }
.st-row { font-size: 12px; border-bottom: 1px solid rgba(255,255,255,0.03); cursor: pointer; transition: background 0.1s; }
.st-row:hover { background: rgba(255,255,255,0.04); }
.st-row.player { background: rgba(67,181,129,0.08); }
.st-row.player:hover { background: rgba(67,181,129,0.12); }
.str-pos { font-weight: 800; display: flex; align-items: center; gap: 4px; justify-content: center; }
.pos-marker { width: 3px; height: 14px; border-radius: 2px; }
.str-team { display: flex; align-items: center; gap: 6px; }
.t-emblem { width: 22px; height: 22px; border-radius: 4px; background: linear-gradient(135deg,#43b581,#3498db); color: #fff; font-size: 11px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.t-name { color: #e8eef7; font-weight: 600; }
.t-mark { font-size: 9px; color: #43b581; font-weight: 800; background: rgba(67,181,129,0.15); padding: 1px 4px; border-radius: 3px; }
.str-num { text-align: center; color: #9fb0c8; }
.str-num.pts { color: #fff; font-weight: 800; font-size: 14px; }

.legend { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; padding: 8px; }
.leg-item { display: flex; align-items: center; gap: 4px; font-size: 10px; color: #8a99b0; }
.leg-dot { width: 8px; height: 8px; border-radius: 50%; }
.leg-dot.gold { background: #ffd700; } .leg-dot.green { background: #43b581; } .leg-dot.blue { background: #3498db; } .leg-dot.red { background: #e74c3c; }

.hint { text-align: center; font-size: 11px; color: #8a99b0; padding: 4px; }
</style>
