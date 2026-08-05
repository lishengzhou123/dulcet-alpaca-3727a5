<script setup>
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { state, finishMatchView, continueSeason, finishIntlMatchView } from '../store.js'
import { LEAGUES } from '../data/leagues.js'
import { applyEffects } from '../engine/player.js'
import { resolveKeyMoment, applyKeyMomentChoicesToResult } from '../engine/matchSim.js'
import PlayerAvatar from './PlayerAvatar.vue'

// ========== 响应式状态 ==========
const matchResult = computed(() => state.matchResult)
const allEvents = computed(() => matchResult.value?.events || [])
const currentMinute = ref(0)
const isPlaying = ref(false)
const speed = ref(1) // 1x, 2x, 4x
const revealedEvents = ref([])
const homeGoals = ref(0)
const awayGoals = ref(0)
let timer = null

const homeTeam = computed(() => matchResult.value?.homeTeam)
const awayTeam = computed(() => matchResult.value?.awayTeam)

// === 关键时刻状态 ===
const pendingKeyMoment = ref(null) // 暂停等待选择的关键时刻 { ev }
const userKeyMomentChoices = ref({}) // { kmId: resolvedMoment }
const keyMomentResolutions = ref([]) // 展示用的关键时刻解决列表

// === 玩家属性变化（应用选择结果到 player） ===
const playerDeltas = ref({ attrs: {} })
const finalApplied = ref(false)

const isFinished = computed(() => {
  if (!allEvents.value.length) return false
  return revealedEvents.value.some(e => e.type === 'end')
})

// ========== 播放控制 ==========
function start() {
  if (isPlaying.value || pendingKeyMoment.value) return
  isPlaying.value = true
  tick()
}
function pause() {
  isPlaying.value = false
  if (timer) { clearTimeout(timer); timer = null }
}
function tick() {
  if (!isPlaying.value) return
  const nextIdx = revealedEvents.value.length
  if (nextIdx >= allEvents.value.length) {
    isPlaying.value = false
    return
  }
  const nextEv = allEvents.value[nextIdx]

  // ===== 检查：若是玩家队的关键时刻 → 暂停并等待选择 =====
  if (nextEv.type === 'keymoment' && nextEv.keyMoment?.playerSide) {
    pause()
    pendingKeyMoment.value = { ev: nextEv }
    return
  }

  // 推进事件
  revealEvent(nextEv)

  if (nextEv.type === 'end') {
    isPlaying.value = false
    onMatchFinished()
    return
  }

  const interval = 750 / speed.value
  timer = setTimeout(tick, interval)
}

function revealEvent(ev) {
  revealedEvents.value.push(ev)
  currentMinute.value = ev.minute
  if (ev.type === 'goal') {
    if (ev.side === 'home') homeGoals.value = ev.homeGoals
    else awayGoals.value = ev.awayGoals
  } else if (ev.homeGoals !== undefined) {
    homeGoals.value = ev.homeGoals
    awayGoals.value = ev.awayGoals
  }
}

// 跳到终场（关键时刻按最优选择解决）
function simulateToEnd() {
  autoResolveRemaining('simulate')
}
// 跳到终场（关键时刻随机选择）
function skipToEnd() {
  autoResolveRemaining('skip')
}
// 内部通用：自动解决所有关键时刻，reveal 所有事件
function autoResolveRemaining(mode) {
  pause()
  pendingKeyMoment.value = null
  while (revealedEvents.value.length < allEvents.value.length) {
    const idx = revealedEvents.value.length
    const ev = allEvents.value[idx]
    if (ev.type === 'keymoment' && ev.keyMoment?.playerSide && !userKeyMomentChoices.value[ev.keyMoment.id]) {
      const optsCount = ev.keyMoment.template.options.length
      let choice
      if (mode === 'simulate') {
        choice = ev.keyMoment.template.options.reduce((best, o, i) => {
          const score = o.goalMod * ((o.effects_ok?.goals || 0) * 2 + (o.effects_ok?.assists || 0) + (o.effects_ok?.rating || 0))
          return score > best.score ? { idx: i, score } : best
        }, { idx: 0, score: -Infinity }).idx
      } else {
        choice = Math.floor(Math.random() * optsCount)
      }
      const resolved = resolveKeyMoment(ev.keyMoment, choice, state.player)
      userKeyMomentChoices.value[ev.keyMoment.id] = resolved
      keyMomentResolutions.value.push({ ev, resolved })
      // 展示结果（进球/助攻/narrative）
      revealEvent(ev)
      const kmEv = ev
      if (resolved.effects.goals) {
        const newHg = kmEv.side === 'home' ? homeGoals.value + resolved.effects.goals : homeGoals.value
        const newAg = kmEv.side === 'away' ? awayGoals.value + resolved.effects.goals : awayGoals.value
        revealedEvents.value.push({
          minute: kmEv.minute, type: 'goal', side: kmEv.side, team: kmEv.team,
          scorer: { name: state.player?.name || '???', pos: state.player?.position || 'ST', ovr: state.player?.ovr || 60 },
          assister: resolved.effects.assists ? { name: '队友' } : null,
          desc: resolved.narrative, homeGoals: newHg, awayGoals: newAg, keyMomentResult: true,
        })
        homeGoals.value = newHg; awayGoals.value = newAg
      } else if (resolved.success && resolved.effects.assists) {
        const newHg = kmEv.side === 'home' ? homeGoals.value + 1 : homeGoals.value
        const newAg = kmEv.side === 'away' ? awayGoals.value + 1 : awayGoals.value
        revealedEvents.value.push({
          minute: kmEv.minute, type: 'goal', side: kmEv.side, team: kmEv.team,
          scorer: { name: '队友', pos: 'ST', ovr: 70 },
          assister: { name: state.player?.name || '???' },
          desc: resolved.narrative, homeGoals: newHg, awayGoals: newAg, keyMomentResult: true,
        })
        homeGoals.value = newHg; awayGoals.value = newAg
      } else {
        revealedEvents.value.push({
          minute: kmEv.minute, type: resolved.success ? 'chance' : 'save', side: kmEv.side, team: kmEv.team,
          scorer: { name: state.player?.name || '???' },
          desc: resolved.narrative, homeGoals: kmEv.homeGoals, awayGoals: kmEv.awayGoals, keyMomentResult: true,
        })
      }
      continue
    }
    revealEvent(ev)
  }
  onMatchFinished()
}

function toggleSpeed() {
  speed.value = speed.value === 1 ? 2 : speed.value === 2 ? 4 : 1
}

// ========== 关键时刻用户选择 ==========
function chooseKeyMomentOption(choiceIdx) {
  const km = pendingKeyMoment.value.ev.keyMoment
  const kmEv = pendingKeyMoment.value.ev
  const resolved = resolveKeyMoment(km, choiceIdx, state.player)
  userKeyMomentChoices.value[km.id] = resolved
  keyMomentResolutions.value.push({ ev: kmEv, resolved })

  // 先展示 km 事件
  revealEvent(kmEv)
  // 成功：进球/助攻 → 立即插入一个 goal 事件
  if (resolved.effects.goals) {
    const newHg = kmEv.side === 'home' ? homeGoals.value + resolved.effects.goals : homeGoals.value
    const newAg = kmEv.side === 'away' ? awayGoals.value + resolved.effects.goals : awayGoals.value
    revealedEvents.value.push({
      minute: kmEv.minute,
      type: 'goal',
      side: kmEv.side,
      team: kmEv.team,
      scorer: { name: state.player?.name || '???', pos: state.player?.position || 'ST', ovr: state.player?.ovr || 60 },
      assister: resolved.effects.assists ? { name: '队友' } : null,
      desc: resolved.narrative,
      homeGoals: newHg, awayGoals: newAg,
      keyMomentResult: true,
    })
    homeGoals.value = newHg
    awayGoals.value = newAg
  } else if (resolved.success && resolved.effects.assists) {
    // 成功但没进球（助攻场景）→ 插入队友进球
    const newHg = kmEv.side === 'home' ? homeGoals.value + 1 : homeGoals.value
    const newAg = kmEv.side === 'away' ? awayGoals.value + 1 : awayGoals.value
    revealedEvents.value.push({
      minute: kmEv.minute,
      type: 'goal',
      side: kmEv.side,
      team: kmEv.team,
      scorer: { name: '队友', pos: 'ST', ovr: 70 },
      assister: { name: state.player?.name || '???' },
      desc: resolved.narrative,
      homeGoals: newHg, awayGoals: newAg,
      keyMomentResult: true,
    })
    homeGoals.value = newHg
    awayGoals.value = newAg
  } else {
    // 失败：插入一条 narrative
    revealedEvents.value.push({
      minute: kmEv.minute,
      type: resolved.success ? 'chance' : 'save',
      side: kmEv.side,
      team: kmEv.team,
      scorer: { name: state.player?.name || '???' },
      desc: resolved.narrative,
      homeGoals: kmEv.homeGoals, awayGoals: kmEv.awayGoals,
      keyMomentResult: true,
    })
  }
  pendingKeyMoment.value = null
  // 继续播放
  setTimeout(() => start(), 800)
}

// 跳过当前关键时刻（随机选）
function skipKeyMoment() {
  const choice = Math.floor(Math.random() * pendingKeyMoment.value.ev.keyMoment.template.options.length)
  chooseKeyMomentOption(choice)
}

// 自动解决当前 pending 关键时刻（simulate/rest 用）
function autoResolvePending(mode = 'simulate') {
  const kmEv = pendingKeyMoment.value.ev
  const km = kmEv.keyMoment
  let choice
  if (mode === 'simulate') {
    // 选最优预期收益
    choice = km.template.options.reduce((best, o, i) => {
      const score = o.goalMod * ((o.effects_ok?.goals || 0) * 2 + (o.effects_ok?.assists || 0) + (o.effects_ok?.rating || 0))
      return score > best.score ? { idx: i, score } : best
    }, { idx: 0, score: -Infinity }).idx
  } else {
    choice = Math.floor(Math.random() * km.template.options.length)
  }
  pendingKeyMoment.value = null
  chooseKeyMomentOption(choice)
}

// ========== 比赛结束：应用所有玩家选择结果到 player ==========
function onMatchFinished() {
  if (finalApplied.value) return
  finalApplied.value = true
  // 合并所有关键时刻的 effects
  const compositeEffects = { attrs: {}, morale: 0, fitness: 0, reputation: 0, coachRelation: 0, teammateRelation: 0, goals: 0, assists: 0, matchRating: 0 }
  for (const r of Object.values(userKeyMomentChoices.value)) {
    if (!r) continue
    const ef = r.effects
    if (ef.morale) compositeEffects.morale += ef.morale
    if (ef.fitness) compositeEffects.fitness += ef.fitness
    if (ef.reputation) compositeEffects.reputation += ef.reputation
    if (ef.coachRelation) compositeEffects.coachRelation += ef.coachRelation
    if (ef.teammateRelation) compositeEffects.teammateRelation += ef.teammateRelation
    if (ef.rating) compositeEffects.matchRating += ef.rating
    // goals/assists 已在 playerContribution 里累计，这里不累加到 seasonStats（避免重复）
  }
  // 小量基础属性变化（一场比赛小幅影响）
  if (state.player) {
    const pc = matchResult.value?.playerContribution
    if (pc?.goals) compositeEffects.goals = pc.goals
    if (pc?.assists) compositeEffects.assists = pc.assists
    // 应用
    const deltas = applyEffects(state.player, compositeEffects)
    playerDeltas.value = deltas
    // 更新 matchResult 的最终比分（含关键时刻结果）
    const finalResult = applyKeyMomentChoicesToResult(matchResult.value, userKeyMomentChoices.value, state.player)
    state.matchResult = finalResult
    homeGoals.value = finalResult.homeGoals
    awayGoals.value = finalResult.awayGoals
  }
}

function close() {
  // 国际赛事直播：提交结果并返回赛事屏
  if (state.liveTournament && state.previousScreen === 'intltournament') {
    finishIntlMatchView()
    return
  }
  finishMatchView()
  // 比赛类事件无选项，直播结束直接进入下一事件
  if (state.currentEvent?.type === 'match') {
    nextTick(() => continueSeason())
  }
}

// ========== UI 辅助函数 ==========
function eventIcon(type) {
  const m = { kickoff:'⚽', goal:'🥅', keymoment:'🎯', chance:'⚡', save:'🧤', foul:'⚠️', yellow:'🟨', red:'🟥', corner:'🚩', sub:'🔄', halftime:'⏸️', extra:'⏱️', end:'🏁' }
  return m[type] || '•'
}
function eventColor(type) {
  const m = { goal:'#43b581', keymoment:'#ffd700', chance:'#e67e22', save:'#3498db', yellow:'#ffd700', red:'#e74c3c', sub:'#9b59b6', halftime:'#9fb0c8', end:'#43b581' }
  return m[type] || '#9fb0c8'
}
function typeLabel(type) {
  return { kickoff:'开场', goal:'进球', keymoment:'关键时刻', chance:'机会', save:'扑救', foul:'犯规', yellow:'黄牌', red:'红牌', corner:'角球', sub:'换人', halftime:'半场', extra:'补时', end:'终场' }[type] || type
}

// ========== 生命周期 ==========
onMounted(() => {
  if (allEvents.value.length) {
    revealedEvents.value.push(allEvents.value[0])
    currentMinute.value = allEvents.value[0].minute
    // 不自动开始，等用户点击播放
  }
})
onUnmounted(() => { pause() })

// pendingKeyMoment 变化时滚动到底部
watch([pendingKeyMoment, revealedEvents], () => {
  const feed = document.querySelector('.feed-list')
  if (feed) setTimeout(() => { feed.scrollTop = feed.scrollHeight }, 30)
}, { deep: true, flush: 'post' })
</script>

<template>
  <div class="mv-wrap" v-if="matchResult">
    <!-- 比分板 -->
    <div class="scoreboard">
      <div class="sb-team home">
        <div class="t-emblem">{{ homeTeam?.name?.charAt(0) || '⚽' }}</div>
        <div class="t-name">{{ homeTeam?.name }}</div>
        <div class="t-city">{{ homeTeam?.city }}</div>
      </div>
      <div class="sb-score">
        <div class="score-num">{{ homeGoals }} - {{ awayGoals }}</div>
        <div class="score-minute" v-if="!isFinished">{{ currentMinute }}'</div>
        <div class="score-minute ft" v-else>FT</div>
      </div>
      <div class="sb-team away">
        <div class="t-emblem">{{ awayTeam?.name?.charAt(0) || '⚽' }}</div>
        <div class="t-name">{{ awayTeam?.name }}</div>
        <div class="t-city">{{ awayTeam?.city }}</div>
      </div>
    </div>

    <!-- 进度条 -->
    <div class="progress-bar">
      <div class="pb-track">
        <div class="pb-fill" :style="{ width: Math.min(100, (currentMinute / 90) * 100) + '%' }"></div>
        <div class="pb-mark" style="left: 50%"></div>
        <div class="pb-label-left">0'</div>
        <div class="pb-label-mid">HT</div>
        <div class="pb-label-right">90'</div>
      </div>
      <!-- 关键时刻标记点 -->
      <div class="pb-keymarks" v-if="matchResult.keyMoments">
        <span
          v-for="km in matchResult.keyMoments"
          :key="km.id"
          class="pb-km"
          :class="{ resolved: userKeyMomentChoices[km.id], yours: km.playerSide }"
          :style="{ left: (km.minute / 90 * 100) + '%' }"
          :title="`${km.minute}' ${km.template.title}`"
        >🎯</span>
      </div>
    </div>

    <!-- 控制按钮（未 finish 且无 pending 关键时刻） -->
    <div class="controls" v-if="!isFinished && !pendingKeyMoment">
      <button class="ctrl-btn play" v-if="!isPlaying" @click="start">▶ 播放</button>
      <button class="ctrl-btn pause" v-else @click="pause">⏸ 暂停</button>
      <button class="ctrl-btn speed" @click="toggleSpeed">{{ speed }}x</button>
      <button class="ctrl-btn simulate" @click="simulateToEnd">🤖 模拟剩余</button>
      <button class="ctrl-btn skip" @click="skipToEnd">⏭ 跳过终场</button>
    </div>

    <!-- 关键时刻选择弹窗 -->
    <div class="keymoment-modal" v-if="pendingKeyMoment" @click.stop>
      <div class="km-card" :class="pendingKeyMoment.ev.keyMoment.type">
        <div class="km-header">
          <div class="km-badge">{{ pendingKeyMoment.ev.minute }}'</div>
          <div class="km-title">{{ pendingKeyMoment.ev.keyMoment.template.title }}</div>
        </div>
        <div class="km-intro">{{ pendingKeyMoment.ev.keyMoment.template.intro }}</div>
        <div class="km-options">
          <button
            v-for="(opt, i) in pendingKeyMoment.ev.keyMoment.template.options"
            :key="i"
            class="km-option"
            @click="chooseKeyMomentOption(i)"
          >
            <span class="kmopt-label">{{ opt.label }}</span>
            <span class="kmopt-hint" v-if="opt.hint">💡 {{ opt.hint }}</span>
            <span class="kmopt-prob" :style="{ '--p': opt.goalMod }">
              <i class="prob-bar"></i>
              <span>{{ Math.round(opt.goalMod * 100) }}%</span>
            </span>
          </button>
        </div>
        <button class="km-skip" @click="skipKeyMoment">🎲 随机选择（跳过）</button>
      </div>
    </div>

    <!-- 事件流 -->
    <div class="event-feed">
      <div class="feed-title">📋 比赛实况</div>
      <div class="feed-list">
        <div
          v-for="(ev, i) in revealedEvents"
          :key="i"
          class="feed-item"
          :class="[ev.side, ev.type, { keyresult: ev.keyMomentResult }]"
        >
          <div class="fi-left">
            <div class="fi-minute">{{ ev.minute }}'</div>
            <!-- 进球/机会/黄牌 等带球员头像 -->
            <div class="fi-player" v-if="ev.type === 'goal' || ev.type === 'chance' || ev.type === 'save' || ev.type === 'yellow' || ev.type === 'foul'">
              <PlayerAvatar
                :name="(ev.scorer?.name || ev.player?.name) || ''"
                :position="(ev.scorer?.pos || ev.player?.pos) || 'ST'"
                :ovr="(ev.scorer?.ovr || ev.player?.ovr) || 0"
                size="small"
              />
            </div>
            <div class="fi-icon">{{ eventIcon(ev.type) }}</div>
          </div>
          <div class="fi-content">
            <div class="fi-type">{{ typeLabel(ev.type) }}</div>
            <div class="fi-desc" :style="{ color: eventColor(ev.type) }">{{ ev.desc }}</div>
            <div class="fi-meta" v-if="ev.type === 'goal'">
              <span class="meta-team">{{ ev.team }}</span>
              <span class="meta-assist" v-if="ev.assister">🅰️ {{ ev.assister.name }}</span>
              <span class="meta-km" v-if="ev.keyMomentResult">🎯 关键选择结果</span>
            </div>
            <div class="fi-meta" v-else-if="ev.type === 'keymoment'">
              <span class="meta-team">{{ ev.team }}</span>
              <span class="meta-km" v-if="ev.keyMoment?.playerSide">🎯 你的选择时刻</span>
              <span class="meta-km" v-else>⚠️ 对方关键时刻</span>
            </div>
            <div class="fi-meta" v-else-if="ev.type === 'chance' || ev.type === 'save'">
              <span class="meta-team">{{ ev.team }}</span>
              <span class="meta-km" v-if="ev.keyMomentResult">🎯 关键选择结果</span>
            </div>
            <div class="fi-meta" v-else-if="ev.type === 'yellow' || ev.type === 'foul'">
              <span class="meta-team">{{ ev.team }}</span>
            </div>
          </div>
          <div class="fi-score" v-if="ev.homeGoals !== undefined && (ev.type === 'goal' || ev.type === 'halftime' || ev.type === 'end')">{{ ev.homeGoals }} - {{ ev.awayGoals }}</div>
        </div>
      </div>
    </div>

    <!-- 赛后统计（完成时） -->
    <div class="match-stats" v-if="isFinished">
      <div class="ms-title">📊 比赛统计</div>
      <div class="stat-row" v-for="stat in ['shots','onTarget','possession','corners','fouls']" :key="stat">
        <div class="stat-label">
          <span class="sl-home">{{ matchResult.homeStats[stat] }}{{ stat === 'possession' ? '%' : '' }}</span>
          <span class="sl-name">{{ {shots:'射门',onTarget:'射正',possession:'控球率',corners:'角球',fouls:'犯规'}[stat] }}</span>
          <span class="sl-away">{{ matchResult.awayStats[stat] }}{{ stat === 'possession' ? '%' : '' }}</span>
        </div>
        <div class="stat-bar">
          <div class="sb-home" :style="{ width: (stat === 'possession' ? matchResult.homeStats[stat] : (matchResult.homeStats[stat] / (matchResult.homeStats[stat] + matchResult.awayStats[stat])) * 100) + '%' }"></div>
        </div>
      </div>
      <!-- 关键时刻统计 -->
      <div class="km-summary" v-if="keyMomentResolutions.length">
        <div class="kms-title">🎯 关键时刻汇总</div>
        <div class="kms-stats">
          <span>参与 <b>{{ keyMomentResolutions.length }}</b> 次</span>
          <span class="kms-good">成功 <b>{{ keyMomentResolutions.filter(r => r.resolved.success).length }}</b></span>
          <span class="kms-bad">失败 <b>{{ keyMomentResolutions.filter(r => !r.resolved.success).length }}</b></span>
        </div>
        <div class="kms-list">
          <div v-for="(r, i) in keyMomentResolutions" :key="i" class="km-row" :class="{ win: r.resolved.success, lose: !r.resolved.success }">
            <span class="kmr-minute">{{ r.ev.minute }}'</span>
            <span class="kmr-type">{{ r.ev.keyMoment.template.title }}</span>
            <span class="kmr-choice">{{ r.resolved.option.label }}</span>
            <span class="kmr-outcome" :class="{ good: r.resolved.success, bad: !r.resolved.success }">
              {{ r.resolved.success ? '✓ 成功' : '✗ 失败' }}
            </span>
          </div>
        </div>
      </div>
      <!-- MVP -->
      <div class="mvp-box">
        <div class="mvp-label">⭐ 全场最佳</div>
        <div class="mvp-info">
          <span class="mvp-name">{{ matchResult.mvp.name }}</span>
          <span class="mvp-team">{{ matchResult.mvp.team || '' }}</span>
          <span class="mvp-pos">{{ matchResult.mvp.pos }}</span>
          <span class="mvp-ovr">OVR {{ matchResult.mvp.ovr }}</span>
        </div>
      </div>
      <!-- 玩家贡献 -->
      <div class="player-contrib" v-if="matchResult.playerContribution">
        <div class="pc-label">🏅 你的贡献</div>
        <div class="pc-stats">
          <span v-if="matchResult.playerContribution.goals">⚽ {{ matchResult.playerContribution.goals }} 球</span>
          <span v-if="matchResult.playerContribution.assists">🅰️ {{ matchResult.playerContribution.assists }} 助攻</span>
          <span v-if="matchResult.playerContribution.keyMomentGoals">🎯 关键进球 {{ matchResult.playerContribution.keyMomentGoals }}</span>
          <span v-if="matchResult.playerContribution.keyMomentAssists">🎯 关键助攻 {{ matchResult.playerContribution.keyMomentAssists }}</span>
        </div>
        <div class="pc-delta" v-if="playerDeltas && (playerDeltas.morale || playerDeltas.fitness || playerDeltas.reputation || playerDeltas.goals || playerDeltas.assists)">
          <span v-if="playerDeltas.morale" :class="playerDeltas.morale > 0 ? 'pos' : 'neg'">士气 {{ playerDeltas.morale > 0 ? '+' : '' }}{{ playerDeltas.morale }}</span>
          <span v-if="playerDeltas.fitness" :class="playerDeltas.fitness > 0 ? 'pos' : 'neg'">体能 {{ playerDeltas.fitness > 0 ? '+' : '' }}{{ playerDeltas.fitness }}</span>
          <span v-if="playerDeltas.reputation" :class="playerDeltas.reputation > 0 ? 'pos' : 'neg'">声望 {{ playerDeltas.reputation > 0 ? '+' : '' }}{{ playerDeltas.reputation }}</span>
          <span v-if="playerDeltas.coachRelation" :class="playerDeltas.coachRelation > 0 ? 'pos' : 'neg'">主帅 {{ playerDeltas.coachRelation > 0 ? '+' : '' }}{{ playerDeltas.coachRelation }}</span>
          <span v-if="playerDeltas.teammateRelation" :class="playerDeltas.teammateRelation > 0 ? 'pos' : 'neg'">队友 {{ playerDeltas.teammateRelation > 0 ? '+' : '' }}{{ playerDeltas.teammateRelation }}</span>
        </div>
      </div>
      <button class="close-btn" @click="close">继续 ▶</button>
    </div>
  </div>
</template>

<style scoped>
.mv-wrap { max-width: 680px; margin: 0 auto; padding: 16px; display: flex; flex-direction: column; gap: 14px; position: relative; }

.scoreboard { display: grid; grid-template-columns: 1fr auto 1fr; gap: 16px; align-items: center; background: linear-gradient(160deg,#1a2332,#0f1620); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 20px; }
.sb-team { text-align: center; }
.t-emblem { width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg,#43b581,#3498db); color: #fff; font-size: 24px; font-weight: 900; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
.t-name { font-size: 16px; font-weight: 800; color: #fff; }
.t-city { font-size: 11px; color: #9fb0c8; margin-top: 2px; }
.sb-score { text-align: center; }
.score-num { font-size: 36px; font-weight: 900; color: #fff; line-height: 1; }
.score-minute { font-size: 14px; color: #43b581; font-weight: 700; margin-top: 4px; }
.score-minute.ft { color: #ffd700; }

.progress-bar { padding: 0 8px 18px; }
.pb-track { position: relative; height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: visible; }
.pb-fill { height: 100%; background: linear-gradient(90deg,#43b581,#2ecc71); border-radius: 3px; transition: width 0.4s ease; }
.pb-mark { position: absolute; top: -2px; width: 2px; height: 10px; background: rgba(255,255,255,0.3); }
.pb-label-left, .pb-label-mid, .pb-label-right { position: absolute; top: 12px; font-size: 10px; color: #8a99b0; }
.pb-label-left { left: 0; } .pb-label-mid { left: 50%; transform: translateX(-50%); } .pb-label-right { right: 0; }
.pb-keymarks { position: relative; }
.pb-km { position: absolute; top: -18px; transform: translateX(-50%); font-size: 12px; opacity: 0.7; transition: opacity 0.2s; cursor: help; }
.pb-km.yours { opacity: 1; filter: drop-shadow(0 0 3px #ffd700); }
.pb-km.resolved { opacity: 0.4; }

.controls { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
.ctrl-btn { padding: 8px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #c8d4e6; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.15s; }
.ctrl-btn:hover { transform: translateY(-1px); }
.ctrl-btn.play { background: linear-gradient(90deg,#43b581,#2ecc71); color: #07140e; border: none; font-weight: 800; }
.ctrl-btn.speed { min-width: 48px; }
.ctrl-btn.simulate { background: linear-gradient(90deg, rgba(155,89,182,0.25), rgba(155,89,182,0.12)); border-color: rgba(155,89,182,0.4); color: #c39bd3; }
.ctrl-btn.skip { background: linear-gradient(90deg, rgba(230,126,34,0.2), rgba(230,126,34,0.08)); border-color: rgba(230,126,34,0.4); color: #f5b041; }

/* 关键时刻弹窗 */
.keymoment-modal {
  position: fixed; inset: 0; background: rgba(0,0,0,0.65);
  backdrop-filter: blur(4px); z-index: 100;
  display: flex; align-items: center; justify-content: center; padding: 16px;
  animation: fadeIn 0.25s;
}
@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
.km-card {
  max-width: 460px; width: 100%;
  background: linear-gradient(160deg,#1a2332,#0f1620);
  border: 2px solid rgba(255,215,0,0.35);
  border-radius: 16px; padding: 20px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(255,215,0,0.1);
  animation: popIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes popIn { from { transform: scale(0.85); opacity: 0 } to { transform: scale(1); opacity: 1 } }
.km-card.penalty { border-color: rgba(231,76,60,0.4); }
.km-card.oneonone { border-color: rgba(67,181,129,0.4); }
.km-card.freekick { border-color: rgba(52,152,219,0.4); }
.km-card.counter { border-color: rgba(230,126,34,0.4); }
.km-card.penaltyArea { border-color: rgba(155,89,182,0.4); }
.km-card.lastchance { border-color: rgba(255,215,0,0.6); box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 60px rgba(255,215,0,0.25); }
.km-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.km-badge {
  padding: 4px 10px; border-radius: 6px; background: rgba(255,215,0,0.2);
  color: #ffd700; font-size: 13px; font-weight: 800;
}
.km-title { font-size: 18px; font-weight: 900; color: #fff; }
.km-intro { font-size: 14px; line-height: 1.7; color: #c8d4e6; padding: 10px 12px; background: rgba(255,255,255,0.03); border-radius: 8px; margin-bottom: 14px; }
.km-options { display: flex; flex-direction: column; gap: 8px; }
.km-option {
  display: flex; flex-direction: column; gap: 4px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px; padding: 11px 14px; text-align: left; cursor: pointer;
  color: #e8eef7; transition: all 0.15s;
}
.km-option:hover {
  background: rgba(67,181,129,0.12);
  border-color: rgba(67,181,129,0.5);
  transform: translateX(3px);
}
.kmopt-label { font-size: 14px; font-weight: 700; }
.kmopt-hint { font-size: 11px; color: #8a99b0; }
.kmopt-prob {
  position: relative; height: 5px; margin-top: 2px;
  background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden;
  display: flex; align-items: center; justify-content: flex-end;
}
.kmopt-prob span { position: relative; z-index: 2; font-size: 10px; color: #fff; font-weight: 700; padding-right: 6px; }
.prob-bar {
  position: absolute; left: 0; top: 0; height: 100%;
  width: calc(var(--p) * 100%);
  background: linear-gradient(90deg, rgba(67,181,129,0.7), rgba(46,204,113,0.9));
  border-radius: 3px; transition: width 0.3s;
}
.km-skip {
  width: 100%; margin-top: 10px; padding: 8px;
  background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.15);
  border-radius: 8px; color: #8a99b0; font-size: 12px; font-weight: 600; cursor: pointer;
}
.km-skip:hover { color: #c8d4e6; background: rgba(255,255,255,0.06); }

.event-feed { background: rgba(255,255,255,0.03); border-radius: 12px; padding: 12px; max-height: 380px; overflow-y: auto; }
.feed-title { font-size: 13px; font-weight: 800; color: #c8d4e6; margin-bottom: 10px; }
.feed-list { display: flex; flex-direction: column; gap: 4px; }
.feed-item {
  display: grid; grid-template-columns: auto 1fr 60px; gap: 10px; align-items: start;
  padding: 8px 10px; border-radius: 8px; font-size: 12px; animation: slideIn 0.3s;
}
@keyframes slideIn { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
.feed-item.goal { background: rgba(67,181,129,0.1); }
.feed-item.keymoment { background: rgba(255,215,0,0.08); border-left: 3px solid rgba(255,215,0,0.5); }
.feed-item.keyresult { background: rgba(155,89,182,0.08); }
.feed-item.yellow { background: rgba(255,215,0,0.08); }
.feed-item.red { background: rgba(231,76,60,0.08); }
.fi-left {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  min-width: 44px;
}
.fi-minute { font-size: 10px; color: #8a99b0; font-weight: 700; }
.fi-player { flex: 0 0 auto; }
.fi-icon { font-size: 13px; }
.fi-content { min-width: 0; }
.fi-type { font-size: 9px; color: #8a99b0; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 1px; }
.fi-desc { font-size: 12px; line-height: 1.5; }
.fi-meta { font-size: 10px; color: #9fb0c8; margin-top: 2px; display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.meta-team { color: #8a99b0; }
.meta-assist { color: #3498db; font-weight: 600; }
.meta-km { color: #ffd700; font-weight: 700; }
.fi-score { font-size: 14px; font-weight: 900; color: #fff; text-align: right; font-family: 'Arial Black', sans-serif; padding-top: 2px; }

.match-stats {
  background: linear-gradient(160deg,#1a2332,#0f1620);
  border: 1px solid rgba(67,181,129,0.2);
  border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 10px;
}
.ms-title { font-size: 14px; font-weight: 800; color: #fff; }
.stat-row { display: flex; flex-direction: column; gap: 4px; }
.stat-label { display: flex; justify-content: space-between; font-size: 11px; color: #c8d4e6; }
.sl-home { color: #43b581; font-weight: 700; } .sl-away { color: #e67e22; font-weight: 700; }
.stat-bar { height: 4px; background: rgba(231,126,34,0.3); border-radius: 2px; overflow: hidden; }
.sb-home { height: 100%; background: #43b581; transition: width 0.5s; }

.km-summary { margin-top: 6px; padding: 10px; background: rgba(255,215,0,0.06); border-radius: 8px; border-left: 3px solid #ffd700; }
.kms-title { font-size: 12px; color: #ffd700; font-weight: 800; margin-bottom: 6px; }
.kms-stats { display: flex; gap: 14px; font-size: 11px; color: #c8d4e6; margin-bottom: 6px; }
.kms-good { color: #43b581; } .kms-bad { color: #e74c3c; }
.kms-stats b { color: #fff; margin: 0 2px; }
.kms-list { display: flex; flex-direction: column; gap: 3px; }
.km-row {
  display: grid; grid-template-columns: 40px 1fr 1fr 60px; gap: 6px;
  font-size: 10px; padding: 4px 6px; border-radius: 4px; align-items: center;
}
.km-row.win { background: rgba(67,181,129,0.1); }
.km-row.lose { background: rgba(231,76,60,0.08); }
.kmr-minute { color: #8a99b0; font-weight: 700; }
.kmr-type { color: #e8eef7; font-weight: 700; }
.kmr-choice { color: #9fb0c8; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.kmr-outcome { text-align: right; font-weight: 800; }
.kmr-outcome.good { color: #43b581; } .kmr-outcome.bad { color: #e74c3c; }

.mvp-box { margin-top: 8px; padding: 10px; background: rgba(255,215,0,0.08); border-radius: 8px; border-left: 3px solid #ffd700; }
.mvp-label { font-size: 12px; color: #ffd700; font-weight: 700; }
.mvp-info { display: flex; gap: 10px; margin-top: 4px; font-size: 13px; align-items: center; flex-wrap: wrap; }
.mvp-name { color: #fff; font-weight: 800; }
.mvp-team { color: #9fb0c8; font-size: 11px; }
.mvp-pos { font-size: 10px; padding: 2px 6px; background: rgba(67,181,129,0.2); border-radius: 4px; color: #43b581; }
.mvp-ovr { font-size: 11px; color: #ffd700; margin-left: auto; }

.player-contrib { padding: 10px; background: rgba(67,181,129,0.08); border-radius: 8px; }
.pc-label { font-size: 12px; color: #43b581; font-weight: 700; }
.pc-stats { display: flex; gap: 12px; margin-top: 4px; font-size: 14px; color: #fff; font-weight: 800; flex-wrap: wrap; }
.pc-delta { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.06); font-size: 11px; }
.pc-delta .pos { color: #43b581; font-weight: 700; }
.pc-delta .neg { color: #e74c3c; font-weight: 700; }

.close-btn { margin-top: 8px; padding: 12px; background: linear-gradient(90deg,#43b581,#2ecc71); color: #07140e; border: none; border-radius: 10px; font-size: 15px; font-weight: 800; cursor: pointer; }

/* 移动端响应式 */
@media (max-width: 600px) {
  .mv-wrap { padding: 10px; gap: 10px; }
  .scoreboard { padding: 14px; gap: 10px; }
  .t-emblem { width: 44px; height: 44px; font-size: 18px; }
  .t-name { font-size: 13px; }
  .score-num { font-size: 28px; }
  .km-choice-grid { grid-template-columns: 1fr !important; }
  .km-choice-btn { padding: 12px; font-size: 13px; }
  .close-btn { padding: 11px; font-size: 14px; }
}
</style>
