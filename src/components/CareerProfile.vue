<script setup>
import { computed } from 'vue'
import { state, returnFromOverlay } from '../store.js'
import { buildCareerProfile } from '../engine/careerProfile.js'
import { LEAGUES } from '../data/leagues.js'
import { formatMoney } from '../engine/util.js'

const player = computed(() => state.player)
const profile = computed(() => player.value ? buildCareerProfile(player.value, state.careerLog) : null)

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
function tierIcon(tier) {
  return tier === 'gold' ? '🥇' : tier === 'silver' ? '🥈' : '🥉'
}
function posLabel(pos) {
  if (!pos) return '-'
  if (pos <= 1) return '🥇 冠军'
  if (pos === 2) return '🥈 亚军'
  if (pos === 3) return '🥉 季军'
  if (pos <= 4) return '四强'
  if (pos <= 6) return '前六'
  if (pos <= 10) return `第${pos}`
  return `第${pos}`
}
</script>

<template>
  <div class="cp-wrap" v-if="profile">
    <!-- 返回按钮 -->
    <div class="cp-topbar">
      <button class="back-btn" @click="returnFromOverlay">← 返回</button>
      <span class="cp-title">📋 生涯档案</span>
    </div>

    <!-- 球员头部卡片 -->
    <div class="cp-header" :style="{ background: `linear-gradient(135deg, ${posColor(profile.personal.position)}55, transparent)` }">
      <div class="ch-avatar" :style="{ background: `linear-gradient(135deg,${posColor(profile.personal.position)},#3498db)` }">
        {{ profile.personal.name?.charAt(0) || '?' }}
      </div>
      <div class="ch-info">
        <h1>{{ profile.personal.name }}</h1>
        <div class="ch-meta">
          <span class="pos-tag" :style="{ background: posColor(profile.personal.position) }">{{ profile.personal.position }}</span>
          <span>🏳️ {{ profile.personal.nationality }}</span>
          <span>· {{ profile.personal.age }}岁</span>
          <span>· {{ profile.personal.height }}cm / {{ profile.personal.weight }}kg</span>
          <span>· {{ profile.personal.preferredFoot }}足</span>
        </div>
        <div class="ch-stage">
          <span class="stage-chip">{{ profile.stage }}</span>
          <span class="rating-chip" v-if="profile.rating">⭐ {{ profile.rating }}</span>
        </div>
      </div>
      <div class="ch-ovr">
        <div class="ovr-num" :style="{ color: ovrColor(profile.personal.ovr) }">{{ profile.personal.ovr }}</div>
        <div class="ovr-label">OVR</div>
        <div class="ovr-val">身价 {{ formatMoney(profile.personal.value) }}</div>
        <div class="ovr-pot">潜力 {{ profile.personal.potential }}</div>
      </div>
    </div>

    <!-- 生涯总览 -->
    <div class="cp-section">
      <div class="section-title">📊 生涯总览</div>
      <div class="overview-grid">
        <div class="ov-item"><b>{{ profile.totals.seasons }}</b><span>赛季</span></div>
        <div class="ov-item"><b>{{ profile.totals.clubs }}</b><span>效力俱乐部</span></div>
        <div class="ov-item"><b>{{ profile.totals.apps }}</b><span>总出场</span></div>
        <div class="ov-item goal"><b>{{ profile.totals.goals }}</b><span>总进球</span></div>
        <div class="ov-item assist"><b>{{ profile.totals.assists }}</b><span>总助攻</span></div>
        <div class="ov-item"><b>{{ profile.totals.goalPerGame }}</b><span>场均进球</span></div>
        <div class="ov-item"><b>{{ profile.totals.caps }}</b><span>国家队出场</span></div>
        <div class="ov-item"><b>{{ profile.totals.intlGoals }}</b><span>国家队进球</span></div>
      </div>
    </div>

    <!-- 俱乐部杯赛汇总 -->
    <div class="cp-section" v-if="profile.clubCups?.length">
      <div class="section-title">🏆 俱乐部杯赛征程</div>
      <div class="cups-table">
        <div class="ct-header">
          <div class="cth-club">赛事</div>
          <div class="cth-num">参赛</div>
          <div class="cth-num">出场</div>
          <div class="cth-num">进球</div>
          <div class="cth-num">助攻</div>
          <div class="cth-num">夺冠</div>
          <div class="cth-num">最佳</div>
        </div>
        <div v-for="cup in profile.clubCups" :key="cup.code" class="ct-row">
          <div class="ctr-club">
            <span class="club-emblem">{{ cup.icon }}</span>
            <div class="club-info">
              <div class="club-name">{{ cup.name }}</div>
              <div class="club-league">{{ cup.short }}</div>
            </div>
          </div>
          <div class="ctr-num">{{ cup.participations }}</div>
          <div class="ctr-num">{{ cup.apps }}</div>
          <div class="ctr-num goal">{{ cup.goals }}</div>
          <div class="ctr-num assist">{{ cup.assists }}</div>
          <div class="ctr-num" :class="{ champion: cup.titles > 0 }">{{ cup.titles }}</div>
          <div class="ctr-num">
            <span v-if="cup.bestPos === 1" class="best-gold">🥇</span>
            <span v-else-if="cup.bestPos === 2" class="best-silver">🥈</span>
            <span v-else-if="cup.bestPos === 4">4强</span>
            <span v-else-if="cup.bestPos === 8">8强</span>
            <span v-else-if="cup.bestPos === 16">16强</span>
            <span v-else>-</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 俱乐部生涯 -->
    <div class="cp-section">
      <div class="section-title">🏟️ 俱乐部生涯</div>
      <div class="clubs-table">
        <div class="ct-header">
          <div class="cth-club">俱乐部</div>
          <div class="cth-seasons">赛季</div>
          <div class="cth-num">出场</div>
          <div class="cth-num">进球</div>
          <div class="cth-num">助攻</div>
          <div class="cth-num">场均</div>
        </div>
        <div v-for="club in profile.clubs" :key="club.team" class="ct-row">
          <div class="ctr-club">
            <span class="club-emblem">{{ club.team.charAt(0) }}</span>
            <div class="club-info">
              <div class="club-name">{{ club.team }}</div>
              <div class="club-league">{{ club.league }} · {{ club.startYear }}-{{ club.endYear }}</div>
            </div>
          </div>
          <div class="ctr-seasons">{{ club.endAge - club.startAge + 1 }}季 ({{ club.startAge }}-{{ club.endAge }}岁)</div>
          <div class="ctr-num">{{ club.apps }}</div>
          <div class="ctr-num goal">{{ club.goals }}</div>
          <div class="ctr-num assist">{{ club.assists }}</div>
          <div class="ctr-num">{{ club.apps > 0 ? (club.goals / club.apps).toFixed(2) : '-' }}</div>
        </div>
      </div>
    </div>

    <!-- 荣誉墙 -->
    <div class="cp-section">
      <div class="section-title">
        🏆 荣誉墙
        <span class="honor-count" v-if="profile.honorCount.total > 0">
          {{ profile.honorCount.gold }}🥇 {{ profile.honorCount.silver }}🥈 {{ profile.honorCount.bronze }}🥉
        </span>
      </div>
      <div v-if="profile.honorCount.total === 0" class="no-honors">暂无荣誉，继续努力！</div>
      <div v-else class="honor-groups">
        <template v-for="(g, key) in profile.honorGroups" :key="key">
          <div v-if="g.items.length" class="honor-group">
            <div class="hg-title">{{ g.icon }} {{ g.label }} ({{ g.items.length }})</div>
            <div class="hg-list">
              <div v-for="(h, i) in g.items" :key="i" class="honor-item" :class="h.tier">
                <span class="hi-icon">{{ tierIcon(h.tier) }}</span>
                <span class="hi-text">{{ h.text }}</span>
                <span class="hi-year" v-if="h.season">{{ h.season }}</span>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- 国家队记录 -->
    <div class="cp-section">
      <div class="section-title">🏳️ 国家队记录</div>
      <div class="intl-summary">
        <div class="is-info">
          <span class="is-nation">代表 {{ profile.international.nationality }}</span>
          <span class="is-locked" v-if="profile.international.locked">🔒 已锁定</span>
        </div>
        <div class="is-stats">
          <div class="is-item"><b>{{ profile.international.caps }}</b><span>出场</span></div>
          <div class="is-item"><b>{{ profile.international.goals }}</b><span>进球</span></div>
          <div class="is-item"><b>{{ profile.international.goalPerGame }}</b><span>场均进球</span></div>
        </div>
      </div>
      <!-- 国际赛事历史 -->
      <div class="intl-history" v-if="profile.international.history.length">
        <div class="ih-title">🌍 国际赛事历程</div>
        <div v-for="(h, i) in profile.international.history" :key="i" class="ih-row">
          <div class="ih-year">{{ h.year }}</div>
          <div class="ih-comp">{{ h.comp }}</div>
          <div class="ih-result">
            <span v-if="h.finalPos === 1">🥇 冠军</span>
            <span v-else-if="h.finalPos === 2">🥈 亚军</span>
            <span v-else-if="h.finalPos === 3">🥉 季军</span>
            <span v-else>第{{ h.finalPos }}名</span>
          </div>
          <div class="ih-stats">{{ h.apps }}场 {{ h.goals }}球 {{ h.assists }}助</div>
          <div class="ih-honor" v-if="h.honor || h.individualHonor">
            <span v-if="h.honor">🏅 {{ h.honor }}</span>
            <span v-if="h.individualHonor">⭐ {{ h.individualHonor }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 生涯时间线 -->
    <div class="cp-section">
      <div class="section-title">📅 生涯时间线</div>
      <div class="timeline">
        <div v-for="(t, i) in profile.timeline" :key="i" class="tl-row">
          <div class="tl-year">{{ t.year }} ({{ t.age }}岁)</div>
          <div class="tl-team">{{ t.team }} <span class="tl-league">{{ t.league }}</span></div>
          <div class="tl-stats">
            <span>{{ t.apps }}场</span>
            <span class="goal">{{ t.goals }}球</span>
            <span class="assist">{{ t.assists }}助</span>
            <span>⭐{{ t.rating }}</span>
            <span :class="t.leaguePos <= 3 ? 'pos-good' : ''">{{ posLabel(t.leaguePos) }}</span>
          </div>
          <div class="tl-cups" v-if="t.clubCups?.length">
            <span v-for="(c, j) in t.clubCups" :key="j" class="tl-cup" :class="{ champion: c.finalPos === 1 }">
              {{ c.icon }} {{ c.short }}
              <template v-if="c.finalPos === 1">🥇</template>
              <template v-else-if="c.finalPos === 2">🥈</template>
              <template v-else-if="c.finalPos === 4">4强</template>
              <template v-else-if="c.finalPos === 8">8强</template>
              <template v-if="c.goals || c.assists"> · {{ c.goals }}球{{ c.assists }}助</template>
            </span>
          </div>
          <div class="tl-honors" v-if="t.honors?.length">
            <span v-for="(h, j) in t.honors" :key="j" class="tl-honor">{{ h }}</span>
          </div>
          <div class="tl-nt" v-if="t.nationalTeam">🏳️ {{ t.nationalTeam }}</div>
          <div class="tl-transfer" v-if="t.promoted">↑ 升级</div>
          <div class="tl-transfer" v-if="t.relegated">↓ 降级</div>
        </div>
      </div>
    </div>

    <!-- 青训信息 -->
    <div class="cp-section" v-if="profile.personal.academy">
      <div class="section-title">🎓 青训背景</div>
      <div class="academy-info">{{ profile.personal.academy }} · {{ profile.personal.birthYear }}年出生</div>
    </div>

    <!-- 比赛风格 -->
    <div class="cp-section" v-if="profile.personal.playStyles?.length || profile.personal.perks?.length">
      <div class="section-title">🎮 比赛风格</div>
      <div class="styles-list">
        <span v-for="s in profile.personal.playStyles" :key="s" class="style-chip">{{ s }}</span>
        <span v-for="p in profile.personal.perks" :key="p" class="perk-chip">{{ p }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cp-wrap { max-width: 720px; margin: 0 auto; padding: 16px; display: flex; flex-direction: column; gap: 16px; }

.cp-topbar { display: flex; align-items: center; gap: 12px; }
.back-btn { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #c8d4e6; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; }
.cp-title { font-size: 16px; font-weight: 800; color: #fff; }

.cp-header { display: flex; gap: 16px; padding: 20px; border-radius: 14px; background: linear-gradient(160deg,#1a2332,#0f1620); border: 1px solid rgba(255,255,255,0.08); align-items: center; }
.ch-avatar { width: 72px; height: 72px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 30px; font-weight: 900; color: #fff; flex-shrink: 0; box-shadow: 0 4px 16px rgba(0,0,0,0.3); }
.ch-info { flex: 1; min-width: 0; }
.ch-info h1 { font-size: 22px; margin: 0 0 6px; color: #fff; }
.ch-meta { display: flex; gap: 6px; flex-wrap: wrap; font-size: 12px; color: #9fb0c8; align-items: center; }
.pos-tag { font-size: 10px; padding: 2px 8px; border-radius: 4px; color: #fff; font-weight: 800; }
.ch-stage { display: flex; gap: 6px; margin-top: 8px; }
.stage-chip { font-size: 11px; padding: 3px 10px; border-radius: 12px; background: rgba(67,181,129,0.15); color: #43b581; font-weight: 700; }
.rating-chip { font-size: 11px; padding: 3px 10px; border-radius: 12px; background: rgba(255,215,0,0.15); color: #ffd700; font-weight: 700; }
.ch-ovr { text-align: center; min-width: 80px; }
.ovr-num { font-size: 36px; font-weight: 900; line-height: 1; }
.ovr-label { font-size: 11px; color: #8a99b0; }
.ovr-val { font-size: 11px; color: #43b581; margin-top: 4px; }
.ovr-pot { font-size: 10px; color: #8a99b0; }

.cp-section { background: rgba(255,255,255,0.03); border-radius: 12px; padding: 14px; }
.section-title { font-size: 15px; font-weight: 800; color: #fff; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; }
.honor-count { font-size: 12px; color: #9fb0c8; font-weight: 600; }

.overview-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; }
.ov-item { text-align: center; background: rgba(255,255,255,0.04); padding: 10px 4px; border-radius: 8px; }
.ov-item b { display: block; font-size: 22px; color: #c8d4e6; font-weight: 800; }
.ov-item.goal b { color: #43b581; }
.ov-item.assist b { color: #3498db; }
.ov-item span { font-size: 10px; color: #8a99b0; }

.clubs-table { display: flex; flex-direction: column; gap: 2px; }
.ct-header { display: grid; grid-template-columns: 2fr 1.2fr 50px 50px 50px 50px; gap: 4px; padding: 6px 8px; background: rgba(255,255,255,0.05); border-radius: 6px; font-size: 10px; color: #8a99b0; font-weight: 700; text-align: center; }
.cth-club, .cth-seasons { text-align: left; }
.ct-row { display: grid; grid-template-columns: 2fr 1.2fr 50px 50px 50px 50px; gap: 4px; padding: 8px; border-radius: 6px; font-size: 12px; align-items: center; }
.ct-row:hover { background: rgba(255,255,255,0.03); }
.ctr-club { display: flex; align-items: center; gap: 8px; }
.club-emblem { width: 28px; height: 28px; border-radius: 6px; background: linear-gradient(135deg,#43b581,#3498db); color: #fff; font-size: 13px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.club-info { min-width: 0; }
.club-name { color: #fff; font-weight: 700; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.club-league { font-size: 10px; color: #8a99b0; }
.ctr-seasons { font-size: 11px; color: #9fb0c8; }
.ctr-num { text-align: center; color: #c8d4e6; }
.ctr-num.goal { color: #43b581; font-weight: 700; }
.ctr-num.assist { color: #3498db; font-weight: 700; }
.ctr-num.champion { color: #ffd700; font-weight: 800; }
.best-gold { color: #ffd700; }
.best-silver { color: #c0c0c0; }

/* 杯赛表格列数与俱乐部表一致（复用样式） */
.cups-table { display: flex; flex-direction: column; gap: 2px; }
.cups-table .ct-header { grid-template-columns: 2fr 50px 50px 50px 50px 50px 60px; }
.cups-table .ct-row { grid-template-columns: 2fr 50px 50px 50px 50px 50px 60px; }

.no-honors { text-align: center; padding: 20px; color: #8a99b0; font-size: 13px; }
.honor-groups { display: flex; flex-direction: column; gap: 12px; }
.honor-group { display: flex; flex-direction: column; }
.hg-title { font-size: 12px; font-weight: 700; color: #c8d4e6; margin-bottom: 6px; }
.hg-list { display: flex; flex-direction: column; gap: 4px; }
.honor-item { display: flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 6px; font-size: 12px; }
.honor-item.gold { background: rgba(255,215,0,0.08); border-left: 3px solid #ffd700; }
.honor-item.silver { background: rgba(192,192,192,0.08); border-left: 3px solid #c0c0c0; }
.honor-item.bronze { background: rgba(205,127,50,0.08); border-left: 3px solid #cd7f32; }
.hi-icon { font-size: 14px; }
.hi-text { flex: 1; color: #e8eef7; font-weight: 600; }
.hi-year { font-size: 11px; color: #8a99b0; }

.intl-summary { display: flex; justify-content: space-between; align-items: center; }
.is-info { display: flex; gap: 8px; align-items: center; }
.is-nation { font-size: 16px; font-weight: 800; color: #fff; }
.is-locked { font-size: 11px; color: #e74c3c; }
.is-stats { display: flex; gap: 12px; }
.is-item { text-align: center; }
.is-item b { display: block; font-size: 18px; color: #43b581; font-weight: 800; }
.is-item span { font-size: 10px; color: #8a99b0; }

.intl-history { margin-top: 12px; }
.ih-title { font-size: 12px; font-weight: 700; color: #c8d4e6; margin-bottom: 6px; }
.ih-row { display: grid; grid-template-columns: 50px 1fr 80px 100px 1fr; gap: 6px; padding: 6px 8px; border-radius: 6px; font-size: 11px; align-items: center; }
.ih-row:hover { background: rgba(255,255,255,0.03); }
.ih-year { font-weight: 700; color: #9fb0c8; }
.ih-comp { color: #c8d4e6; }
.ih-result { font-weight: 700; }
.ih-stats { color: #8a99b0; }
.ih-honor { font-size: 10px; color: #ffd700; display: flex; gap: 6px; flex-wrap: wrap; }

.timeline { display: flex; flex-direction: column; gap: 4px; }
.tl-row { display: grid; grid-template-columns: 100px 1fr 1fr 1fr; gap: 6px; padding: 8px; border-radius: 6px; font-size: 11px; border-left: 2px solid rgba(67,181,129,0.3); }
.tl-row:hover { background: rgba(255,255,255,0.03); }
.tl-year { font-weight: 700; color: #43b581; }
.tl-team { color: #fff; font-weight: 600; }
.tl-league { font-size: 10px; color: #8a99b0; }
.tl-stats { display: flex; gap: 6px; color: #9fb0c8; flex-wrap: wrap; }
.tl-stats .goal { color: #43b581; font-weight: 600; }
.tl-stats .assist { color: #3498db; }
.tl-stats .pos-good { color: #ffd700; font-weight: 600; }
.tl-honors { display: flex; gap: 4px; flex-wrap: wrap; }
.tl-honor { font-size: 10px; padding: 2px 6px; background: rgba(255,215,0,0.1); border-radius: 4px; color: #ffd700; }
.tl-cups { display: flex; gap: 4px; flex-wrap: wrap; }
.tl-cup { font-size: 10px; padding: 2px 6px; background: rgba(155,89,182,0.12); border-radius: 4px; color: #c8d4e6; }
.tl-cup.champion { background: rgba(255,215,0,0.18); color: #ffd700; font-weight: 700; }
.tl-nt { font-size: 10px; color: #43b581; }
.tl-transfer { font-size: 10px; font-weight: 700; }
.tl-transfer { color: #e67e22; }

.academy-info { font-size: 13px; color: #c8d4e6; padding: 6px 0; }

.styles-list { display: flex; gap: 6px; flex-wrap: wrap; }
.style-chip { font-size: 11px; padding: 4px 10px; background: rgba(67,181,129,0.12); border-radius: 12px; color: #43b581; font-weight: 600; }
.perk-chip { font-size: 11px; padding: 4px 10px; background: rgba(255,215,0,0.12); border-radius: 12px; color: #ffd700; font-weight: 600; }
</style>
