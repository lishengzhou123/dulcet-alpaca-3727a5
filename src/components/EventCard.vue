<script setup>
import { computed } from 'vue'
import { state, chooseOption, continueSeason, startMatchView } from '../store.js'
import { ATTR_LABELS } from '../data/positions.js'
import { formatMoney } from '../engine/util.js'
import PlayerAvatar from './PlayerAvatar.vue'
import TeamBadge from './TeamBadge.vue'

const ev = computed(() => state.currentEvent)
const outcome = computed(() => state.lastOutcome)
const showOutcome = computed(() => state.showOutcome)
const progress = computed(() => {
  const s = state.season
  if (!s) return 0
  return Math.round(((s.eventIndex + (showOutcome.value ? 1 : 0)) / s.events.length) * 100)
})

const typeIcon = { match: '⚽', training: '🏋️', relationship: '🤝', media: '📰', life: '🏠', transfer: '🔁' }
const typeLabel = { match: '比赛直播', training: '训练', relationship: '人际关系', media: '媒体舆论', life: '场外生活', transfer: '转会' }

// 是否为比赛类事件（match类型且有对手名）
const isMatchEvent = computed(() => ev.value?.type === 'match' && ev.value?.opponentName)
const opponentName = computed(() => ev.value?.opponentName || '')

function watchMatch() {
  if (opponentName.value) startMatchView(opponentName.value)
}

function deltaList(deltas) {
  if (!deltas) return []
  const items = []
  if (deltas.attrs) {
    for (const [k, v] of Object.entries(deltas.attrs)) {
      if (v !== 0) items.push({ label: ATTR_LABELS[k] || k, val: v })
    }
  }
  const map = { morale: '士气', fitness: '体能', injuryRisk: '伤险', reputation: '声望', coachRelation: '主帅关系', teammateRelation: '队友关系', money: '收入', weakFoot: '逆足星级' }
  for (const [k, label] of Object.entries(map)) {
    if (deltas[k] != null && deltas[k] !== 0) items.push({ label, val: deltas[k], isMoney: k === 'money' })
  }
  if (deltas.goals) items.push({ label: '进球', val: deltas.goals })
  if (deltas.assists) items.push({ label: '助攻', val: deltas.assists })
  return items
}
</script>

<template>
  <div class="event-wrap" v-if="ev">
    <!-- 进度 -->
    <div class="progress-line">
      <div class="prog-info">
        <span class="chip">{{ typeIcon[ev.type] }} {{ typeLabel[ev.type] }}</span>
        <span class="season-tag">第 {{ state.season.eventIndex + 1 }} / {{ state.season.events.length }} 节 · {{ state.season.year }}赛季 · {{ state.player.age }}岁</span>
      </div>
      <div class="prog-track"><div class="prog-fill" :style="{width: progress+'%'}"></div></div>
    </div>

    <div class="event-card" :class="ev.type">
      <!-- 球员 + 俱乐部信息横幅（精简版） -->
      <div class="event-card-hero">
        <PlayerAvatar
          :name="state.player.name"
          :position="state.player.position"
          :ovr="state.player.ovr"
          size="small"
          class="ech-ava"
        />
        <div class="ech-info">
          <div class="ech-name">{{ state.player.name }}</div>
          <div class="ech-meta">
            <span>{{ state.player.age }}岁</span>
            <span>·</span>
            <span>{{ state.player.position }}</span>
          </div>
        </div>
        <div class="ech-team">
          <TeamBadge
            :team-name="state.player.team"
            :league-code="state.player.teamLeague"
            size="small"
          />
        </div>
      </div>

      <!-- 比赛信息条（match类事件显示轮次/对阵/时间） -->
      <div class="match-info" v-if="ev.type === 'match' && ev.round">
        <span class="mi-round">第 {{ ev.round }} 轮</span>
        <span class="mi-sep">·</span>
        <span class="mi-date">📅 {{ ev.dateStr }}</span>
        <span class="mi-sep">·</span>
        <span class="mi-venue" :class="ev.home ? 'home':'away'">{{ ev.home ? '🏟️ 主场' : '✈️ 客场' }}</span>
      </div>
      <!-- 比赛类事件：观看直播按钮（含对阵信息） -->
      <button class="watch-match-btn" v-if="isMatchEvent && !showOutcome" @click="watchMatch">
        📺 观看直播 · {{ state.player.team }} vs {{ opponentName }}
      </button>
      <div class="event-title">{{ ev.title }}</div>
      <p class="narrative">{{ ev.narrative }}</p>

      <!-- 选项（非比赛类事件才显示） -->
      <div class="options" v-if="!showOutcome && !isMatchEvent">
        <button v-for="(opt, i) in ev.options" :key="i" class="option" @click="chooseOption(i)">
          <span class="opt-text">{{ opt.label }}</span>
          <span class="opt-hint" v-if="opt.hint">💡 {{ opt.hint }}</span>
        </button>
      </div>

      <!-- 结果 -->
      <div class="outcome" v-else>
        <div class="outcome-banner">抉择后果</div>
        <p class="outcome-text">{{ outcome.option.outcome }}</p>
        <div class="delta-grid" v-if="deltaList(outcome.deltas).length">
          <div v-for="(d, i) in deltaList(outcome.deltas)" :key="i" class="delta" :class="d.val > 0 ? 'pos' : 'neg'">
            <span class="d-label">{{ d.label }}</span>
            <span class="d-val">{{ d.isMoney ? (d.val>0?'+':'') + formatMoney(Math.abs(d.val)) : (d.val>0?'+':'') + d.val }}</span>
          </div>
        </div>
        <div class="ovr-change" v-if="outcome.newOvr !== outcome.prevOvr || outcome.newValue !== outcome.prevValue">
          <span v-if="outcome.newOvr !== outcome.prevOvr" class="ovr-delta" :class="outcome.newOvr > outcome.prevOvr ? 'pos':'neg'">
            OVR {{ outcome.prevOvr }} → {{ outcome.newOvr }} ({{ outcome.newOvr > outcome.prevOvr ? '+' : '' }}{{ outcome.newOvr - outcome.prevOvr }})
          </span>
          <span v-if="outcome.newValue !== outcome.prevValue" class="ovr-delta" :class="outcome.newValue > outcome.prevValue ? 'pos':'neg'">
            身价 {{ formatMoney(outcome.prevValue) }} → {{ formatMoney(outcome.newValue) }}
          </span>
        </div>
        <button class="cont-btn" @click="continueSeason">继续 ▶</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.event-wrap { display: flex; flex-direction: column; gap: 14px; }
.progress-line { display: flex; flex-direction: column; gap: 8px; }
.prog-info { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.chip { font-size: 12px; font-weight: 700; color: #fff; background: linear-gradient(90deg,#43b581,#2ecc71); padding: 4px 12px; border-radius: 20px; }
.season-tag { font-size: 12px; color: #8a99b0; }
.prog-track { height: 4px; background: rgba(255,255,255,0.08); border-radius: 2px; overflow: hidden; }
.prog-fill { height: 100%; background: linear-gradient(90deg,#43b581,#3498db); transition: width 0.4s; }

.event-card {
  background: linear-gradient(160deg, #1a2332 0%, #0f1620 100%);
  border: 1px solid rgba(255,255,255,0.08);
  border-left: 4px solid #43b581;
  border-radius: 16px; padding: 22px; color: #e8eef7;
}
.event-card.match { border-left-color: #e74c3c; }
.event-card.training { border-left-color: #43b581; }
.event-card.relationship { border-left-color: #9b59b6; }
.event-card.media { border-left-color: #3498db; }
.event-card.life { border-left-color: #e67e22; }
.event-card.transfer { border-left-color: #1abc9c; }

/* ===== 球员信息横幅（精简版） ===== */
.event-card-hero {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 10px; margin-bottom: 12px;
  background: linear-gradient(135deg, rgba(67,181,129,0.06), rgba(52,152,219,0.03));
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 8px;
}
.ech-ava { flex-shrink: 0; }
.ech-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.ech-name { font-size: 14px; font-weight: 800; color: #fff; }
.ech-meta { display: flex; flex-wrap: wrap; gap: 6px; font-size: 11px; color: #9fb0c8; align-items: center; }
.ech-team { display: flex; align-items: center; flex-shrink: 0; }

.event-title { font-size: 17px; font-weight: 800; margin: 12px 0 10px; }

.match-info {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  padding: 8px 12px; margin-bottom: 14px; border-radius: 8px;
  background: linear-gradient(90deg, rgba(52,152,219,0.12), rgba(52,152,219,0.04));
  border-left: 3px solid #3498db; font-size: 12px;
}
.mi-round { font-weight: 800; color: #3498db; }
.mi-sep { color: #5a6b85; }
.mi-date { color: #c8d4e6; }
.mi-venue { font-weight: 700; padding: 2px 8px; border-radius: 4px; }
.mi-venue.home { background: rgba(67,181,129,0.15); color: #43b581; }
.mi-venue.away { background: rgba(230,126,34,0.15); color: #e67e22; }

.watch-match-btn {
  width: 100%; padding: 10px 14px; margin-bottom: 14px;
  background: linear-gradient(90deg, rgba(231,76,60,0.15), rgba(231,76,60,0.05));
  border: 1px solid rgba(231,76,60,0.3); border-radius: 10px;
  color: #e74c3c; font-size: 13px; font-weight: 700; cursor: pointer;
  transition: all 0.15s;
}
.watch-match-btn:hover { background: rgba(231,76,60,0.2); border-color: rgba(231,76,60,0.5); transform: translateY(-1px); }

.narrative { font-size: 14.5px; line-height: 1.85; color: #c8d4e6; white-space: pre-line; margin: 0 0 18px; }

.options { display: flex; flex-direction: column; gap: 10px; }
.option {
  text-align: left; display: flex; flex-direction: column; gap: 4px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px; padding: 13px 16px; cursor: pointer; color: #e8eef7;
  transition: all 0.15s;
}
.option:hover { background: rgba(67,181,129,0.12); border-color: rgba(67,181,129,0.5); transform: translateX(3px); }
.opt-text { font-size: 15px; font-weight: 700; }
.opt-hint { font-size: 12px; color: #8a99b0; }

.outcome-banner { font-size: 12px; font-weight: 700; color: #ffd700; letter-spacing: 1px; margin-bottom: 8px; }
.outcome-text { font-size: 14.5px; line-height: 1.8; color: #e8eef7; white-space: pre-line; margin: 0 0 14px; }
.delta-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
.delta { display: flex; align-items: center; gap: 6px; padding: 5px 10px; border-radius: 8px; font-size: 12px; }
.delta.pos { background: rgba(67,181,129,0.15); color: #43b581; }
.delta.neg { background: rgba(231,76,60,0.15); color: #e74c3c; }
.d-label { color: #9fb0c8; }
.ovr-change { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 14px; }
.ovr-delta { font-size: 13px; font-weight: 700; padding: 6px 12px; border-radius: 8px; }
.ovr-delta.pos { background: rgba(255,215,0,0.12); color: #ffd700; }
.ovr-delta.neg { background: rgba(231,76,60,0.12); color: #e74c3c; }
.cont-btn {
  width: 100%; padding: 13px; font-size: 15px; font-weight: 700;
  background: linear-gradient(90deg,#43b581,#2ecc71); color: #07140e;
  border: none; border-radius: 10px; cursor: pointer;
}
.cont-btn:hover { box-shadow: 0 8px 24px rgba(67,181,129,0.3); }

/* 移动端响应式 */
@media (max-width: 600px) {
  .event-card-hero { flex-wrap: wrap; gap: 6px; padding: 8px; }
  .ech-info { flex: 1 1 100%; }
  .ech-team { flex: 1 1 100%; justify-content: flex-start; }
  .options { grid-template-columns: 1fr !important; }
  .option-card { padding: 10px; }
  .option-text { font-size: 13px; }
  .cont-btn { padding: 11px; font-size: 14px; }
}
</style>
