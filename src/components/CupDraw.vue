<script setup>
import { computed, ref } from 'vue'
import { state } from '../store.js'
import { eligibleCups, performDraw, simulateCupGroup } from '../engine/cupdraw.js'
import { CUPS } from '../data/starPlayers.js'
import { LEAGUES } from '../data/leagues.js'

const emit = defineEmits(['back', 'continue'])

const player = computed(() => state.player)
const phase = ref('intro') // intro | drawing | result | group
const selectedCup = ref(null)
const drawResult = ref(null)
const groupResult = ref(null)
const drawingAnim = ref(false)
const revealedCount = ref(0)

// 玩家可参赛的杯赛
const cups = computed(() => {
  if (!player.value) return []
  // 上赛季排名（从careerLog最后一条取）
  const lastLog = state.careerLog[state.careerLog.length - 1]
  const lastPos = lastLog?.leaguePos || null
  return eligibleCups(player.value, lastPos)
})

function startDraw(cup) {
  selectedCup.value = cup
  phase.value = 'drawing'
  drawingAnim.value = true
  revealedCount.value = 0
  // 模拟抽签动画
  const result = performDraw(cup.code, player.value)
  drawResult.value = result
  // 逐个揭晓
  let i = 0
  const interval = setInterval(() => {
    i++
    revealedCount.value = i
    if (i >= result.drawn.length) {
      clearInterval(interval)
      drawingAnim.value = false
      setTimeout(() => { phase.value = 'result' }, 600)
    }
  }, 900)
}

function simulateGroup() {
  if (!drawResult.value) return
  groupResult.value = simulateCupGroup(player.value, drawResult.value.group)
  phase.value = 'group'
}

function finish() {
  // 把杯赛结果加入玩家荣誉/声望
  if (groupResult.value) {
    const gr = groupResult.value
    if (gr.advanced) {
      player.value.reputation = Math.min(100, player.value.reputation + 3)
      player.value.morale = Math.min(100, player.value.morale + 5)
    }
    // 冠军判定（小组第一 + 随机淘汰赛）
    if (gr.groupPos === 1 && Math.random() < 0.25) {
      player.value.honors.push({
        type: 'cup', tier: 'gold',
        text: `${selectedCup.value.short}冠军 (${player.value.team})`,
        season: state.season?.year,
      })
      player.value.reputation = Math.min(100, player.value.reputation + 8)
    } else if (gr.advanced) {
      player.value.honors.push({
        type: 'cup', tier: 'silver',
        text: `${selectedCup.value.short}小组出线`,
        season: state.season?.year,
      })
    }
  }
  emit('continue')
}

function skipCup() { emit('continue') }
function reset() { phase.value = 'intro'; selectedCup.value = null; drawResult.value = null; groupResult.value = null }
</script>

<template>
  <div class="cd-wrap" v-if="player">
    <div class="cd-hero">
      <div class="hero-row">
        <button class="back-btn" v-if="phase==='intro'" @click="skipCup">跳过抽签 →</button>
        <div class="hero-badge">🎰</div>
      </div>
      <h1>杯赛抽签仪式</h1>
      <p class="subtitle" v-if="phase==='intro'">聚光灯下的抽签缸，对手即将揭晓——你的球队将面对谁？</p>
    </div>

    <!-- 选择杯赛 -->
    <div v-if="phase==='intro'" class="cup-select">
      <div class="cs-hint" v-if="!cups.length">本赛季你的球队暂无杯赛参赛资格，继续赛季征程。</div>
      <div class="cup-grid" v-else>
        <div
          v-for="cup in cups"
          :key="cup.code"
          class="cup-card"
          :style="{ borderColor: cup.color, background: `linear-gradient(135deg, ${cup.color}22, transparent)` }"
          @click="startDraw(cup)"
        >
          <div class="cup-icon">{{ cup.icon }}</div>
          <div class="cup-name">{{ cup.name }}</div>
          <div class="cup-short" :style="{ color: cup.color }">{{ cup.short }}</div>
          <div class="cup-desc">{{ cup.desc }}</div>
          <button class="draw-btn">参与抽签 →</button>
        </div>
      </div>
      <button v-if="cups.length" class="skip-btn" @click="skipCup">跳过抽签，专注联赛</button>
    </div>

    <!-- 抽签动画 -->
    <div v-if="phase==='drawing'" class="drawing-stage">
      <div class="draw-cylinder" :class="{ spinning: drawingAnim }">🎰</div>
      <div class="draw-status">{{ drawingAnim ? '抽签球滚动中…' : '抽签完成' }}</div>
      <div class="drawn-list">
        <div
          v-for="(d, i) in (drawResult?.drawn || [])"
          :key="i"
          class="drawn-ball"
          :class="{ revealed: i < revealedCount }"
        >
          <span v-if="i < revealedCount" class="db-content">
            <span class="db-name">{{ d.name }}</span>
            <span class="db-league">{{ LEAGUES[d.league]?.short }}</span>
          </span>
          <span v-else class="db-hidden">?</span>
        </div>
      </div>
      <p class="draw-narrative" v-if="drawResult">{{ drawResult.narrative }}</p>
    </div>

    <!-- 抽签结果 -->
    <div v-if="phase==='result' && drawResult" class="draw-result">
      <div class="dr-cup">{{ selectedCup.icon }} {{ selectedCup.name }} · 小组赛分组</div>
      <div class="dr-group">
        <div class="drg-me">你 · {{ player.team }}</div>
        <div class="drg-vs">同组对手</div>
        <div class="drg-opps">
          <div v-for="(d, i) in drawResult.drawn" :key="i" class="drg-opp">
            <span class="opp-name">{{ d.name }}</span>
            <span class="opp-meta">{{ LEAGUES[d.league]?.short }} · 实力{{ d.strength }}</span>
            <span class="opp-stars" v-if="d.starPlayers?.length">⭐ {{ d.starPlayers.slice(0,2).join('、') }}</span>
          </div>
        </div>
      </div>
      <button class="sim-btn" @click="simulateGroup">模拟小组赛 ▶</button>
    </div>

    <!-- 小组赛结果 -->
    <div v-if="phase==='group' && groupResult" class="group-result">
      <div class="gr-title">📊 {{ selectedCup.short }} 小组赛成绩</div>
      <div class="gr-summary" :class="{ advanced: groupResult.advanced }">
        <div class="gr-pos">小组第 {{ groupResult.groupPos }}</div>
        <div class="gr-pts">{{ groupResult.totalPts }} 积分</div>
        <div class="gr-status">{{ groupResult.advanced ? '✓ 成功出线' : '✗ 未能出线' }}</div>
      </div>
      <div class="gr-matches">
        <div v-for="(r, i) in groupResult.results" :key="i" class="gr-match">
          <span class="gm-round">R{{ r.round }}</span>
          <span class="gm-venue">{{ r.home ? '主' : '客' }}</span>
          <span class="gm-opp">vs {{ r.opponent }}</span>
          <span class="gm-score" :class="{ win: r.pts===3, draw: r.pts===1, loss: r.pts===0 }">{{ r.goalsFor }}-{{ r.goalsAgainst }}</span>
          <span class="gm-pts">{{ r.pts }}分</span>
        </div>
      </div>
      <div class="gr-honor-hint" v-if="groupResult.advanced">
        🎉 你随队闯过小组赛关卡，声望与士气提升！
      </div>
      <button class="finish-btn" @click="finish">继续赛季 ▶</button>
    </div>
  </div>
</template>

<style scoped>
.cd-wrap { max-width: 720px; margin: 0 auto; padding: 16px; display: flex; flex-direction: column; gap: 16px; }
.cd-hero { text-align: center; padding: 4px 0; }
.hero-row { display: flex; align-items: center; justify-content: space-between; }
.back-btn, .skip-btn { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #c8d4e6; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; }
.back-btn:hover, .skip-btn:hover { background: rgba(255,255,255,0.1); }
.hero-badge { font-size: 36px; }
.cd-hero h1 { font-size: 22px; margin: 4px 0; color: #fff; background: linear-gradient(90deg,#9b59b6,#ffd700); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.subtitle { font-size: 13px; color: #9fb0c8; margin: 4px auto 0; max-width: 480px; line-height: 1.6; }

.cup-select { display: flex; flex-direction: column; gap: 14px; align-items: center; }
.cs-hint { color: #9fb0c8; font-size: 14px; padding: 20px; text-align: center; }
.cup-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; width: 100%; }
.cup-card { background: linear-gradient(160deg,#1a2332,#0f1620); border: 2px solid; border-radius: 14px; padding: 16px; cursor: pointer; transition: all 0.2s; text-align: center; }
.cup-card:hover { transform: translateY(-4px); box-shadow: 0 10px 30px rgba(0,0,0,0.4); }
.cup-icon { font-size: 36px; }
.cup-name { font-size: 15px; font-weight: 800; color: #fff; margin-top: 4px; }
.cup-short { font-size: 12px; font-weight: 700; }
.cup-desc { font-size: 11px; color: #9fb0c8; margin: 6px 0 10px; line-height: 1.5; min-height: 33px; }
.draw-btn { background: linear-gradient(90deg,#9b59b6,#3498db); color: #fff; border: none; padding: 7px 16px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 700; }

.drawing-stage { text-align: center; padding: 20px; background: linear-gradient(160deg,#1a2332,#0f1620); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; }
.draw-cylinder { font-size: 60px; display: inline-block; }
.draw-cylinder.spinning { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
.draw-status { font-size: 14px; color: #c8d4e6; margin: 8px 0 16px; }
.drawn-list { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; }
.drawn-ball { width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, #ffd700, #f39c12); display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; color: #fff; box-shadow: 0 6px 20px rgba(255,215,0,0.3); transition: all 0.3s; }
.drawn-ball.revealed { animation: pop 0.4s; }
@keyframes pop { 0% { transform: scale(0.5); opacity: 0; } 60% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } }
.db-content { display: flex; flex-direction: column; align-items: center; font-size: 12px; line-height: 1.2; }
.db-name { font-size: 13px; }
.db-league { font-size: 10px; opacity: 0.9; }
.db-hidden { color: rgba(255,255,255,0.6); }
.draw-narrative { font-size: 13px; color: #c8d4e6; line-height: 1.7; margin: 8px 0 0; font-style: italic; }

.draw-result { background: linear-gradient(160deg,#1a2332,#0f1620); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px; text-align: center; }
.dr-cup { font-size: 16px; font-weight: 800; color: #ffd700; margin-bottom: 12px; }
.dr-group { background: rgba(255,255,255,0.03); border-radius: 10px; padding: 14px; margin-bottom: 14px; }
.drg-me { font-size: 15px; font-weight: 800; color: #43b581; margin-bottom: 8px; }
.drg-vs { font-size: 12px; color: #8a99b0; margin-bottom: 8px; }
.drg-opps { display: flex; flex-direction: column; gap: 6px; }
.drg-opp { display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 8px 10px; background: rgba(231,76,60,0.08); border-radius: 6px; font-size: 12px; flex-wrap: wrap; }
.opp-name { font-weight: 700; color: #e8eef7; }
.opp-meta { color: #9fb0c8; font-size: 11px; }
.opp-stars { color: #ffd700; font-size: 10px; }
.sim-btn { background: linear-gradient(90deg,#43b581,#2ecc71); color: #07140e; border: none; padding: 10px 24px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 800; }

.group-result { background: linear-gradient(160deg,#1a2332,#0f1620); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px; }
.gr-title { font-size: 15px; font-weight: 800; color: #c8d4e6; margin-bottom: 12px; text-align: center; }
.gr-summary { display: flex; justify-content: space-around; padding: 14px; border-radius: 10px; margin-bottom: 12px; background: rgba(231,76,60,0.1); }
.gr-summary.advanced { background: rgba(67,181,129,0.12); }
.gr-pos { font-size: 18px; font-weight: 800; color: #fff; }
.gr-pts { font-size: 18px; font-weight: 800; color: #ffd700; }
.gr-status { font-size: 14px; font-weight: 700; }
.gr-summary.advanced .gr-status { color: #43b581; }
.gr-summary:not(.advanced) .gr-status { color: #e74c3c; }
.gr-matches { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
.gr-match { display: grid; grid-template-columns: 40px 30px 1fr 60px 40px; gap: 8px; align-items: center; padding: 6px 10px; background: rgba(255,255,255,0.02); border-radius: 6px; font-size: 12px; }
.gm-round { font-weight: 700; color: #9fb0c8; }
.gm-venue { font-size: 11px; font-weight: 700; color: #c8d4e6; }
.gm-opp { color: #e8eef7; }
.gm-score { font-weight: 800; text-align: center; }
.gm-score.win { color: #43b581; } .gm-score.draw { color: #ffd700; } .gm-score.loss { color: #e74c3c; }
.gm-pts { font-size: 11px; color: #8a99b0; text-align: right; }
.gr-honor-hint { text-align: center; font-size: 13px; color: #ffd700; margin-bottom: 12px; padding: 8px; background: rgba(255,215,0,0.08); border-radius: 8px; }
.finish-btn { width: 100%; padding: 12px; background: linear-gradient(90deg,#43b581,#2ecc71); color: #07140e; border: none; border-radius: 10px; cursor: pointer; font-size: 15px; font-weight: 800; }
.finish-btn:hover { box-shadow: 0 8px 24px rgba(67,181,129,0.3); }
</style>
