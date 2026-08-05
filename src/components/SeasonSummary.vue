<script setup>
import { computed } from 'vue'
import { state, startTransferWindow, openSkillTree, proceedAfterSummary } from '../store.js'
import { LEAGUES } from '../data/leagues.js'
import { ATTR_LABELS } from '../data/positions.js'
import { formatMoney } from '../engine/util.js'

const s = computed(() => state.summary)
const player = computed(() => state.player)

const leagueName = computed(() => s.value?.leagueResult ? LEAGUES[s.value.leagueResult.leagueCode]?.name : '')
const standings = computed(() => s.value?.leagueResult?.standings || [])
const playerPos = computed(() => s.value?.leagueResult?.playerRow?.pos)
const total = computed(() => standings.value.length)

const honorTier = { gold: '🥇', silver: '🥈', bronze: '🥉' }

function growthText(g) {
  if (!g || !g.length) return '本赛季无明显自然成长'
  return g.map(x => `${ATTR_LABELS[x.attr] || x.attr} ${x.delta > 0 ? '+' : ''}${x.delta}`).join(' · ')
}

// 目标进度文本
function objProgressText(o) {
  if (o.metric === 'league_pos') return o.progress ? `第${o.progress}名` : '未结算'
  if (o.metric === 'rating') return o.progress.toFixed(1)
  return o.progress
}
</script>

<template>
  <div class="summary-wrap" v-if="s">
    <div class="sum-hero">
      <div class="year">{{ s.logEntry.year }} 赛季总结</div>
      <div class="age-line">年龄段 {{ s.logEntry.age }}岁 · {{ player.team }} · {{ LEAGUES[player.teamLeague]?.short }}</div>
    </div>

    <!-- FC26 赛季目标结算 -->
    <div class="objectives-card" v-if="s.objectives">
      <div class="card-title">🎯 赛季目标结算 · 获得 {{ s.spGained }} SP</div>
      <div class="obj-list">
        <div v-for="(o, i) in s.objectives" :key="i" class="obj-item" :class="{ done: o.done }">
          <span class="oi-icon">{{ o.icon }}</span>
          <span class="oi-label">{{ o.label }}</span>
          <span class="oi-desc">{{ o.desc }}</span>
          <span class="oi-progress">{{ objProgressText(o) }} / {{ o.metric === 'league_pos' ? `前${o.target}` : o.target }}</span>
          <span class="oi-status">{{ o.done ? '✓ 完成' : '✗ 未达' }}</span>
        </div>
      </div>
      <div class="sp-summary">
        <span class="sp-detail">基础 2 + 完成 {{ s.objectives.filter(o => o.done).length }} 项 + 评分奖励 {{ s.spGained - 2 - s.objectives.filter(o => o.done).length }} = </span>
        <span class="sp-total">+{{ s.spGained }} SP</span>
        <span class="sp-now">当前 SP: {{ player.skillPoints }}</span>
      </div>
    </div>

    <!-- OVR / 身价变化 -->
    <div class="change-row">
      <div class="change-box">
        <div class="cb-label">总评 OVR</div>
        <div class="cb-vals"><span class="old">{{ s.prevOvr }}</span> <span class="arrow">→</span> <span class="new" :class="s.newOvr>s.prevOvr?'up':s.newOvr<s.prevOvr?'down':''">{{ s.newOvr }}</span></div>
        <div class="cb-delta" :class="s.newOvr>s.prevOvr?'up':s.newOvr<s.prevOvr?'down':''">{{ s.newOvr - s.prevOvr > 0 ? '+' : '' }}{{ s.newOvr - s.prevOvr }}</div>
      </div>
      <div class="change-box">
        <div class="cb-label">身价</div>
        <div class="cb-vals"><span class="old">{{ formatMoney(s.prevValue) }}</span> <span class="arrow">→</span> <span class="new" :class="s.newValue>s.prevValue?'up':s.newValue<s.prevValue?'down':''">{{ formatMoney(s.newValue) }}</span></div>
        <div class="cb-delta" :class="s.newValue>s.prevValue?'up':s.newValue<s.prevValue?'down':''">{{ s.newValue - s.prevValue > 0 ? '+' : '' }}{{ formatMoney(Math.abs(s.newValue - s.prevValue)) }}</div>
      </div>
    </div>

    <!-- 个人数据 -->
    <div class="stats-card">
      <div class="card-title">📊 个人数据</div>
      <div class="stats-grid">
        <div class="sg"><b>{{ s.seasonStats.apps }}</b><span>出场</span></div>
        <div class="sg"><b class="goal">{{ s.seasonStats.goals }}</b><span>进球</span></div>
        <div class="sg"><b class="assist">{{ s.seasonStats.assists }}</b><span>助攻</span></div>
        <div class="sg"><b>{{ s.seasonStats.rating }}</b><span>场均评分</span></div>
      </div>
      <div class="event-contrib">其中关键决策贡献：{{ s.seasonStats.eventGoals }}球 / {{ s.seasonStats.eventAssists }}助攻</div>
    </div>

    <!-- 联赛排名 -->
    <div class="league-card" v-if="standings.length">
      <div class="card-title">🏆 {{ leagueName }} 积分榜</div>
      <div class="table">
        <div class="thead"><span>#</span><span>球队</span><span>赛</span><span>胜</span><span>平</span><span>负</span><span>积分</span></div>
        <div v-for="row in standings.slice(0, Math.max(6, playerPos||0))" :key="row.name" class="trow" :class="{ me: row.isPlayer, top: row.pos===1, rel: row.pos > total-2 }">
          <span>{{ row.pos }}</span><span class="tname">{{ row.name }}<i v-if="row.isPlayer"> (你)</i></span><span>{{ row.played }}</span><span>{{ row.win }}</span><span>{{ row.draw }}</span><span>{{ row.loss }}</span><span class="pts">{{ row.points }}</span>
        </div>
      </div>
      <div class="league-note">
        <span v-if="playerPos === 1">🏅 你随队夺得联赛冠军！</span>
        <span v-else-if="playerPos <= 3">🎖️ 联赛第 {{ playerPos }} 名，站上领奖台</span>
        <span v-else>联赛第 {{ playerPos }} / {{ total }} 名</span>
        <span v-if="s.leagueResult.promoted" class="promote">⬆️ 升级成功！</span>
        <span v-if="s.leagueResult.relegated" class="relegate">⬇️ 不幸降级</span>
      </div>
    </div>

    <!-- 国家队 -->
    <div class="nt-card" v-if="s.nationalTeam.called">
      <div class="card-title">🏳️ {{ player.nationality }}国家队征召</div>
      <p>本阶段你代表{{ player.nationality }}国家队出场 <b>{{ s.nationalTeam.caps }}</b> 次，攻入 <b>{{ s.nationalTeam.intlGoals }}</b> 球。国歌奏响时，胸前的国旗沉甸甸的。</p>
    </div>

    <!-- 伤病信息 -->
    <div class="injury-card" v-if="s.newInjury">
      <div class="card-title">🚑 赛季末伤病</div>
      <div class="inj-info">
        <span class="inj-name" :style="{color: s.newInjury.severityColor}">{{ s.newInjury.name }}</span>
        <span class="inj-sev">{{ s.newInjury.severityLabel }}</span>
        <span class="inj-weeks">预计缺阵 {{ s.newInjury.totalWeeks }} 周 / {{ s.newInjury.matchesMissed }} 场</span>
      </div>
      <p class="inj-desc">{{ s.newInjury.description }}</p>
      <p class="inj-cause">致伤原因：{{ s.newInjury.cause }}</p>
    </div>

    <!-- 俱乐部杯赛征程 -->
    <div class="clubcups-card" v-if="s.clubCupResults && s.clubCupResults.length">
      <div class="card-title">🏆 俱乐部杯赛征程</div>
      <div v-for="(r, i) in s.clubCupResults" :key="i" class="ccup-block">
        <div class="ccup-header">
          <span class="ccup-icon">{{ r.cup.icon }}</span>
          <span class="ccup-name">{{ r.cup.name }}</span>
          <span class="ccup-result" :class="{ champion: r.finalPos === 1, runnerup: r.finalPos === 2 }">
            <span v-if="r.finalPos === 1">🥇 冠军</span>
            <span v-else-if="r.finalPos === 2">🥈 亚军</span>
            <span v-else-if="r.finalPos === 4">四强</span>
            <span v-else-if="r.finalPos === 8">八强</span>
            <span v-else-if="r.finalPos === 16">16强</span>
            <span v-else>小组第{{ r.finalPos }}名</span>
          </span>
        </div>
        <div class="ccup-stats">
          <span>出场 {{ r.apps }}</span>
          <span class="goal">进球 {{ r.playerGoals }}</span>
          <span class="assist">助攻 {{ r.playerAssists }}</span>
        </div>
        <!-- 小组赛积分榜（仅UCL/ACL） -->
        <div v-if="r.groupStandings && r.groupStandings.length" class="ccup-group">
          <div class="ccup-gtitle">小组赛积分榜</div>
          <div class="ccup-gtable">
            <div class="ccup-thead">
              <span>#</span><span>球队</span><span>赛</span><span>胜</span><span>平</span><span>负</span><span>分</span>
            </div>
            <div
              v-for="t in r.groupStandings"
              :key="t.name"
              class="ccup-trow"
              :class="{ me: t.isPlayer, q: t.pos <= 2 }"
            >
              <span>{{ t.pos }}</span>
              <span class="ccup-tname">{{ t.name }}<i v-if="t.isPlayer"> (你)</i></span>
              <span>{{ t.played }}</span>
              <span>{{ t.win }}</span>
              <span>{{ t.draw }}</span>
              <span>{{ t.loss }}</span>
              <span class="ccup-pts">{{ t.points }}</span>
            </div>
          </div>
        </div>
        <!-- 淘汰赛对阵 -->
        <div v-if="r.knockoutBracket && r.knockoutBracket.length" class="ccup-ko">
          <div class="ccup-gtitle">淘汰赛</div>
          <div v-for="(m, j) in r.knockoutBracket" :key="j" class="ccup-kmatch" :class="{ win: m.win }">
            <span class="ccup-round">{{ m.round }}</span>
            <span class="ccup-vs">vs {{ m.opponent }}</span>
            <span class="ccup-score" :class="{ win: m.win, lose: !m.win }">
              {{ m.goalsFor }} : {{ m.goalsAgainst }}
              <i v-if="m.penalty">(点{{ m.penalty }})</i>
            </span>
            <span class="ccup-status">{{ m.win ? '✓' : '✗' }}</span>
          </div>
        </div>
        <div class="ccup-honor" v-if="r.honor || r.individualHonor">
          <span v-if="r.honor" class="ccup-h-item">🏅 {{ r.honor.text }}</span>
          <span v-if="r.individualHonor" class="ccup-h-item">⭐ {{ r.individualHonor.text }}</span>
        </div>
      </div>
    </div>

    <!-- 荣誉 -->
    <div class="honors-card" v-if="s.honors.length">
      <div class="card-title">🏅 本赛季荣誉</div>
      <div class="honors-list">
        <div v-for="(h, i) in s.honors" :key="i" class="honor" :class="h.tier">
          <span class="h-icon">{{ honorTier[h.tier] || '🎖️' }}</span>{{ h.text }}
        </div>
      </div>
    </div>

    <!-- 成长 -->
    <div class="growth-card">
      <div class="card-title">📈 自然成长</div>
      <p class="growth-text">{{ growthText(s.growth) }}</p>
    </div>

    <!-- 国际赛事预告 -->
    <div class="intl-preview" v-if="s.intlTournaments && s.intlTournaments.length">
      <div class="card-title">🌍 国际赛事预告</div>
      <div class="intl-list">
        <div v-for="(t, i) in s.intlTournaments" :key="i" class="intl-item">
          <span class="ii-icon">{{ t.comp.icon }}</span>
          <span class="ii-name">{{ t.comp.name }}</span>
          <span class="ii-year">{{ t.year }}</span>
        </div>
      </div>
      <p class="intl-hint">赛季结束后将代表 {{ player.nationality }} 国家队出战上述赛事</p>
    </div>

    <button class="next-btn skilltree-btn" @click="proceedAfterSummary">继续 ▶</button>
  </div>
</template>

<style scoped>
.summary-wrap { display: flex; flex-direction: column; gap: 14px; }
.sum-hero { text-align: center; padding: 6px 0; }
.year { font-size: 24px; font-weight: 800; background: linear-gradient(90deg,#43b581,#3498db); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.age-line { font-size: 13px; color: #9fb0c8; margin-top: 4px; }

.objectives-card { background: linear-gradient(160deg,#1a2332,#0f1620); border:1px solid rgba(255,215,0,0.2); border-radius:12px; padding:16px; }
.obj-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
.obj-item {
  display: grid; grid-template-columns: 24px 1.4fr 1.6fr 1fr 80px; gap: 8px; align-items: center;
  padding: 8px 10px; border-radius: 8px; background: rgba(255,255,255,0.03);
  font-size: 12px;
}
.obj-item.done { background: rgba(67,181,129,0.1); border-left: 3px solid #43b581; }
.oi-icon { font-size: 14px; text-align: center; }
.oi-label { color: #e8eef7; font-weight: 700; }
.oi-desc { color: #9fb0c8; }
.oi-progress { color: #c8d4e6; font-weight: 600; text-align: right; }
.oi-status { font-weight: 700; text-align: center; }
.obj-item.done .oi-status { color: #43b581; }
.obj-item:not(.done) .oi-status { color: #e74c3c; }
.sp-summary { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 12px; }
.sp-detail { color: #9fb0c8; }
.sp-total { font-size: 16px; font-weight: 800; color: #ffd700; padding: 3px 10px; background: rgba(255,215,0,0.12); border-radius: 6px; }
.sp-now { color: #3498db; font-weight: 700; margin-left: auto; }

.change-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.change-box { background: linear-gradient(160deg,#1a2332,#0f1620); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:14px; text-align:center; }
.cb-label { font-size:11px; color:#8a99b0; letter-spacing:1px; }
.cb-vals { font-size:18px; margin:6px 0; }
.cb-vals .old { color:#8a99b0; } .cb-vals .arrow { color:#5a6b85; margin:0 4px; }
.cb-vals .new { font-weight:800; color:#e8eef7; }
.cb-vals .new.up { color:#43b581; } .cb-vals .new.down { color:#e74c3c; }
.cb-delta { font-size:13px; font-weight:700; }
.cb-delta.up { color:#43b581; } .cb-delta.down { color:#e74c3c; }

.card-title { font-size:14px; font-weight:800; color:#c8d4e6; margin-bottom:10px; }
.stats-card, .league-card, .nt-card, .honors-card, .growth-card {
  background: linear-gradient(160deg,#1a2332,#0f1620); border:1px solid rgba(255,255,255,0.08);
  border-radius:12px; padding:16px;
}
.stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; }
.sg { text-align:center; } .sg b { font-size:24px; color:#e8eef7; display:block; }
.sg b.goal { color:#e74c3c; } .sg b.assist { color:#3498db; } .sg span { font-size:11px; color:#8a99b0; }
.event-contrib { font-size:12px; color:#8a99b0; margin-top:10px; text-align:center; }

.table { font-size:13px; }
.thead, .trow { display:grid; grid-template-columns: 28px 1fr 36px 36px 36px 36px 52px; gap:6px; padding:6px 8px; align-items:center; }
.thead { color:#8a99b0; font-weight:700; border-bottom:1px solid rgba(255,255,255,0.08); }
.trow { border-bottom:1px solid rgba(255,255,255,0.04); }
.trow.me { background:rgba(67,181,129,0.12); border-radius:6px; }
.trow.top { background:rgba(255,215,0,0.08); }
.trow.rel { color:#e74c3c; }
.tname i { color:#43b581; font-style:normal; font-size:11px; }
.pts { font-weight:800; }
.league-note { margin-top:10px; font-size:13px; color:#c8d4e6; display:flex; gap:14px; flex-wrap:wrap; }
.promote { color:#43b581; font-weight:700; } .relegate { color:#e74c3c; font-weight:700; }

.nt-card p { font-size:13px; line-height:1.7; color:#c8d4e6; margin:0; }

.injury-card { background: linear-gradient(160deg,#2a1010,#1a0808); border:1px solid rgba(231,76,60,0.3); border-radius:12px; padding:16px; }
.inj-info { display:flex; gap:12px; align-items:center; flex-wrap:wrap; margin-bottom:8px; }
.inj-name { font-size:15px; font-weight:800; }
.inj-sev { font-size:12px; padding:2px 8px; border-radius:6px; background:rgba(231,76,60,0.2); color:#e74c3c; font-weight:700; }
.inj-weeks { font-size:12px; color:#9fb0c8; }
.inj-desc { font-size:12px; color:#c8d4e6; line-height:1.6; margin:4px 0; }
.inj-cause { font-size:11px; color:#8a99b0; margin:2px 0 0; }

/* 俱乐部杯赛卡片 */
.clubcups-card {
  background: linear-gradient(160deg,#1a2332,#0f1620); border:1px solid rgba(255,215,0,0.15);
  border-radius:12px; padding:16px;
}
.ccup-block { background: rgba(255,255,255,0.03); border-radius: 10px; padding: 12px; margin-bottom: 12px; }
.ccup-block:last-child { margin-bottom: 0; }
.ccup-header { display: flex; align-items: center; gap: 10px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06); margin-bottom: 10px; }
.ccup-icon { font-size: 22px; }
.ccup-name { flex: 1; font-size: 14px; font-weight: 700; color: #e8eef7; }
.ccup-result { font-size: 13px; font-weight: 800; padding: 4px 10px; border-radius: 6px; background: rgba(255,255,255,0.05); color: #c8d4e6; }
.ccup-result.champion { background: rgba(255,215,0,0.15); color: #ffd700; }
.ccup-result.runnerup { background: rgba(192,192,192,0.15); color: #d8d8d8; }
.ccup-stats { display: flex; gap: 14px; padding: 8px 0; font-size: 12px; color: #9fb0c8; }
.ccup-stats .goal { color: #43b581; font-weight: 700; }
.ccup-stats .assist { color: #3498db; font-weight: 700; }
.ccup-group { margin: 10px 0; }
.ccup-gtitle { font-size: 11px; font-weight: 700; color: #8a99b0; margin-bottom: 6px; }
.ccup-gtable { font-size: 11px; }
.ccup-thead, .ccup-trow { display: grid; grid-template-columns: 24px 1.6fr 30px 30px 30px 30px 36px; gap: 4px; padding: 4px 6px; align-items: center; }
.ccup-thead { color: #8a99b0; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.06); }
.ccup-trow { color: #c8d4e6; border-bottom: 1px solid rgba(255,255,255,0.03); }
.ccup-trow.me { background: rgba(67,181,129,0.1); border-radius: 4px; }
.ccup-trow.q:not(.me) { background: rgba(67,181,129,0.04); }
.ccup-tname i { color: #43b581; font-style: normal; font-size: 10px; }
.ccup-pts { font-weight: 800; color: #fff; }
.ccup-ko { margin: 10px 0; }
.ccup-kmatch { display: grid; grid-template-columns: 60px 1fr 80px 30px; gap: 8px; align-items: center; padding: 5px 6px; border-radius: 4px; font-size: 11px; }
.ccup-kmatch.win { background: rgba(67,181,129,0.06); }
.ccup-kmatch:not(.win) { background: rgba(231,76,60,0.05); }
.ccup-round { font-size: 10px; font-weight: 700; color: #ffd700; }
.ccup-vs { color: #c8d4e6; }
.ccup-score { font-weight: 800; text-align: center; }
.ccup-score.win { color: #43b581; }
.ccup-score.lose { color: #e74c3c; }
.ccup-score i { font-size: 9px; color: #9fb0c8; font-style: normal; }
.ccup-status { text-align: center; font-weight: 800; }
.ccup-kmatch.win .ccup-status { color: #43b581; }
.ccup-kmatch:not(.win) .ccup-status { color: #e74c3c; }
.ccup-honor { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.05); }
.ccup-h-item { font-size: 11px; padding: 3px 8px; border-radius: 4px; background: rgba(255,215,0,0.1); color: #ffd700; font-weight: 600; }

.honors-list { display:flex; flex-direction:column; gap:8px; }
.honor { display:flex; align-items:center; gap:8px; padding:9px 12px; border-radius:8px; font-size:13px; font-weight:600; }
.honor.gold { background:rgba(255,215,0,0.12); color:#ffd700; }
.honor.silver { background:rgba(192,192,192,0.12); color:#d8d8d8; }
.honor.bronze { background:rgba(205,127,50,0.12); color:#cd7f32; }
.honor.world { background:linear-gradient(90deg,rgba(255,215,0,0.18),rgba(231,76,60,0.12)); color:#ffd700; }
.growth-text { font-size:13px; color:#9fb0c8; line-height:1.7; margin:0; }

.intl-preview { background: linear-gradient(160deg,#1a2332,#0f1620); border:1px solid rgba(255,215,0,0.2); border-radius:12px; padding:14px; }
.intl-list { display:flex; flex-direction:column; gap:6px; margin: 8px 0; }
.intl-item { display:flex; align-items:center; gap:10px; padding:8px 10px; background:rgba(255,255,255,0.04); border-radius:8px; font-size:13px; color:#c8d4e6; }
.ii-icon { font-size:18px; }
.ii-name { flex:1; font-weight:700; }
.ii-year { font-size:12px; color:#9fb0c8; }
.intl-hint { font-size:11px; color:#9fb0c8; margin:6px 0 0; text-align:center; }

.next-btn { width:100%; padding:15px; font-size:16px; font-weight:800; background:linear-gradient(90deg,#43b581,#2ecc71); color:#07140e; border:none; border-radius:12px; cursor:pointer; margin-top:6px; }
.next-btn:hover { box-shadow:0 10px 30px rgba(67,181,129,0.3); }
.skilltree-btn { background: linear-gradient(90deg,#9b59b6,#3498db); color: #fff; }
.skilltree-btn:hover { box-shadow: 0 10px 30px rgba(155,89,182,0.3); }
@media (max-width:520px){ .change-row{grid-template-columns:1fr;} .stats-grid{grid-template-columns:repeat(2,1fr);} .obj-item{grid-template-columns:24px 1fr 60px;} .oi-desc, .oi-progress{display:none;} }
</style>
