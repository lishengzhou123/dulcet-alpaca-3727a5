<script setup>
import { computed } from 'vue'
import { state } from '../store.js'
import { categoryValues } from '../engine/player.js'
import { ATTRIBUTE_GROUPS, ATTR_LABELS, POSITION_KEYS } from '../data/positions.js'
import { formatMoney } from '../engine/util.js'
import { LEAGUES } from '../data/leagues.js'
import { getArchetype, PERKS } from '../data/archetypes.js'
import { squadRole } from '../engine/skilltree.js'
import InjuryPanel from './InjuryPanel.vue'
import PlayerCard from './PlayerCard.vue'
import TeamBadge from './TeamBadge.vue'

const p = computed(() => state.player)
const cats = computed(() => p.value ? categoryValues(p.value.attrs) : {})
const isGK = computed(() => p.value?.position === 'GK')
const groupOrder = computed(() => isGK.value ? ['GK','PHY','DRI','PAS','SHO'] : ['PAC','SHO','PAS','DRI','DEF','PHY'])
const teamLeagueName = computed(() => p.value ? LEAGUES[p.value.teamLeague]?.short : '')

const archetype = computed(() => p.value?.archetype ? getArchetype(p.value.archetype) : null)
const team = computed(() => {
  if (!p.value) return null
  return state.season?.leagueResult?.standings?.find(t => t.isPlayer)
    || { strength: 65 }
})
const role = computed(() => {
  if (!p.value) return null
  // 用球队强度（粗略：从TEAMS查）
  const t = LEAGUES[p.value.teamLeague]
  return squadRole(p.value.ovr, t?.tier === 2 ? 58 : 66)
})

// 玩家档案（卡牌周围展示）
const profileLeft = computed(() => {
  if (!p.value) return []
  return [
    { icon: '🎂', label: '年龄', value: `${p.value.age}岁` },
    { icon: '📏', label: '身高', value: `${p.value.height}cm` },
    { icon: '🦶', label: '惯用脚', value: p.value.preferredFoot || '右脚' },
    { icon: '🏫', label: '青训', value: p.value.academy || '-' },
  ]
})
const profileRight = computed(() => {
  if (!p.value) return []
  return [
    { icon: '⚽', label: '位置', value: p.value.position, color: role.value?.color },
    { icon: '🏷️', label: '定位', value: role.value?.name || '-', color: role.value?.color },
    { icon: '🎭', label: '原型', value: archetype.value?.name || '-' },
    { icon: '🏳️', label: '国籍', value: p.value.nationality || '中国' },
  ]
})
const profileBottom = computed(() => {
  if (!p.value) return []
  return [
    { icon: '⭐', label: '花式', value: `${p.value.skillMoves}★` },
    { icon: '🔄', label: '逆足', value: `${p.value.weakFoot}★` },
    { icon: '📈', label: '潜力', value: p.value.potential },
    { icon: '💎', label: '技能点', value: `${p.value.skillPoints || 0} SP` },
    { icon: '💰', label: '身价', value: formatMoney(p.value.value) },
  ]
})

const objectives = computed(() => state.season?.objectives || [])
const showObjectives = computed(() => ['event', 'summary'].includes(state.screen) && objectives.value.length)

function ovrColor(ovr) {
  if (ovr >= 85) return '#ffd700'
  if (ovr >= 78) return '#43b581'
  if (ovr >= 70) return '#3498db'
  if (ovr >= 60) return '#e67e22'
  return '#95a5a6'
}
function catColor(key) { return ATTRIBUTE_GROUPS[key]?.color || '#888' }

// 实时目标进度（基于已发生的赛季事件数据）
function objProgress(o) {
  if (!p.value) return 0
  if (o.metric === 'goals') return p.value.seasonStats.goals
  if (o.metric === 'assists') return p.value.seasonStats.assists
  if (o.metric === 'apps') return p.value.seasonStats.apps
  if (o.metric === 'rating') return p.value.seasonStats.rating
  // 其余目标在赛季末才结算
  return 0
}
function objPercent(o) {
  const v = objProgress(o)
  if (o.metric === 'league_pos' || o.metric === 'ovr_growth' || o.metric === 'growth_count') return 0
  return Math.min(100, Math.round((v / o.target) * 100))
}
</script>

<template>
  <div class="panel" v-if="p">
    <!-- 顶部：PlayerCard 居中 + 档案介绍环绕（左/右/下） -->
    <div class="showcase">
      <!-- 左栏档案 -->
      <div class="sc-side sc-left">
        <div v-for="(it, i) in profileLeft" :key="i" class="sc-item">
          <span class="sc-icon">{{ it.icon }}</span>
          <div class="sc-body">
            <div class="sc-label">{{ it.label }}</div>
            <div class="sc-value">{{ it.value }}</div>
          </div>
        </div>
      </div>

      <!-- 中央卡牌 + 俱乐部信息 -->
      <div class="sc-center">
        <PlayerCard
          :player="p"
          size="small"
          :show-team="false"
          :show-stats="false"
          class="sc-card"
        />
        <!-- 俱乐部徽 + 俱乐部名 -->
        <div class="sc-team">
          <TeamBadge
            :team-name="p.team"
            :league-code="p.teamLeague"
            size="small"
            class="sc-tbadge"
          />
          <div class="sc-tinfo">
            <div class="sc-tname">{{ p.team }}</div>
            <div class="sc-tleague">{{ teamLeagueName }}</div>
          </div>
        </div>
      </div>

      <!-- 右栏档案 -->
      <div class="sc-side sc-right">
        <div v-for="(it, i) in profileRight" :key="i" class="sc-item">
          <span class="sc-icon">{{ it.icon }}</span>
          <div class="sc-body">
            <div class="sc-label">{{ it.label }}</div>
            <div class="sc-value" :style="it.color ? {color: it.color, fontWeight: 700} : null">{{ it.value }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部徽章横排 -->
    <div class="sc-bottom">
      <div v-for="(it, i) in profileBottom" :key="i" class="sb-chip" :class="{'sp': it.label === '技能点', 'pot': it.label === '潜力'}">
        <span class="sb-icon">{{ it.icon }}</span>
        <span class="sb-label">{{ it.label }}</span>
        <b class="sb-value">{{ it.value }}</b>
      </div>
    </div>

    <!-- 比赛风格与特权 -->
    <div class="ps-perks" v-if="p.playStyles.length || p.perks.length">
      <div class="pp-row" v-if="p.playStyles.length">
        <span class="pp-label">🎯 比赛风格</span>
        <div class="pp-tags">
          <span v-for="ps in p.playStyles" :key="ps" class="pp-tag ps">{{ ps }}</span>
        </div>
      </div>
      <div class="pp-row" v-if="p.perks.length">
        <span class="pp-label">✨ 特权</span>
        <div class="pp-tags">
          <span v-for="pk in p.perks" :key="pk" class="pp-tag perk" :title="PERKS[pk]?.desc">{{ PERKS[pk]?.name || pk }}</span>
        </div>
      </div>
    </div>

    <!-- 赛季目标 -->
    <div class="objectives" v-if="showObjectives">
      <div class="obj-title">🎯 赛季目标</div>
      <div v-for="o in objectives" :key="o.id" class="obj-row">
        <div class="obj-head">
          <span class="obj-icon">{{ o.icon }}</span>
          <span class="obj-label">{{ o.label }}</span>
          <span class="obj-target">{{ o.desc }}</span>
        </div>
        <div class="obj-bar">
          <div class="obj-fill" :style="{ width: objPercent(o)+'%' }"></div>
        </div>
      </div>
    </div>

    <!-- 六维雷达式条 -->
    <div class="cats">
      <div v-for="key in groupOrder" :key="key" class="cat-row">
        <div class="cat-name" :style="{ color: catColor(key) }">{{ ATTRIBUTE_GROUPS[key].label }}</div>
        <div class="cat-bar">
          <div class="cat-fill" :style="{ width: (cats[key]||0)+'%', background: catColor(key) }"></div>
        </div>
        <div class="cat-val">{{ cats[key] || 0 }}</div>
      </div>
    </div>

    <!-- 状态条 -->
    <div class="stats-bar">
      <div class="stat"><span>😀 士气</span><div class="mini-bar"><div class="mini-fill morale" :style="{width:p.morale+'%'}"></div></div><b>{{ p.morale }}</b></div>
      <div class="stat"><span>💪 体能</span><div class="mini-bar"><div class="mini-fill fitness" :style="{width:p.fitness+'%'}"></div></div><b>{{ p.fitness }}</b></div>
      <div class="stat"><span>⭐ 声望</span><div class="mini-bar"><div class="mini-fill rep" :style="{width:p.reputation+'%'}"></div></div><b>{{ p.reputation }}</b></div>
      <div class="stat"><span>🤝 队友</span><div class="mini-bar"><div class="mini-fill team" :style="{width:p.teammateRelation+'%'}"></div></div><b>{{ p.teammateRelation }}</b></div>
      <div class="stat"><span>👔 主帅</span><div class="mini-bar"><div class="mini-fill coach" :style="{width:p.coachRelation+'%'}"></div></div><b>{{ p.coachRelation }}</b></div>
      <div class="stat"><span>⚠️ 伤险</span><div class="mini-bar"><div class="mini-fill inj" :style="{width:p.injuryRisk+'%'}"></div></div><b>{{ p.injuryRisk }}</b></div>
    </div>

    <!-- 伤病展示 -->
    <InjuryPanel v-if="p.injury" />

    <!-- 合同信息 -->
    <div class="contract-info">
      <div class="ci-head">📝 合同信息</div>
      <div class="ci-grid">
        <div class="ci-item"><span>年薪</span><b>{{ formatMoney(p.salary) }}</b></div>
        <div class="ci-item"><span>剩余</span><b :class="{exp: p.contractYears<=1}">{{ p.contractYears }} 年</b></div>
        <div class="ci-item"><span>身价</span><b>{{ formatMoney(p.value) }}</b></div>
        <div class="ci-item"><span>存款</span><b>{{ formatMoney(p.money || 0) }}</b></div>
      </div>
    </div>

    <!-- 赛季累计 -->
    <div class="season-stats">
      <div class="ss-item"><b>{{ p.seasonStats.goals }}</b><span>赛季进球</span></div>
      <div class="ss-item"><b>{{ p.seasonStats.assists }}</b><span>赛季助攻</span></div>
      <div class="ss-item"><b>{{ p.careerStats.apps }}</b><span>生涯出场</span></div>
      <div class="ss-item"><b>{{ p.careerStats.goals }}</b><span>生涯进球</span></div>
      <div class="ss-item"><b>{{ p.caps }}</b><span>国家队出场</span></div>
    </div>
  </div>
</template>

<style scoped>
.panel {
  background: linear-gradient(160deg, #1a2332 0%, #0f1620 100%);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px; padding: 18px; color: #e8eef7;
}
/* ===== PlayerCard 居中 + 档案环绕展示 ===== */
.showcase {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 10px;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.sc-side {
  display: flex; flex-direction: column; gap: 8px;
  min-width: 0;
}
.sc-right { align-items: flex-end; }
.sc-item {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 8px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 8px;
  width: 100%;
  transition: background 0.15s;
}
.sc-item:hover { background: rgba(67,181,129,0.07); }
.sc-right .sc-item { flex-direction: row-reverse; text-align: right; }
.sc-icon { font-size: 15px; flex-shrink: 0; }
.sc-body { display: flex; flex-direction: column; gap: 1px; min-width: 0; flex: 1; }
.sc-label { font-size: 9px; color: #8a99b0; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; }
.sc-value { font-size: 12px; color: #e8eef7; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.sc-center {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 4px 2px;
}
.sc-card { margin: 0 auto; }
.sc-team {
  display: flex; align-items: center; gap: 8px;
  padding: 5px 10px;
  background: rgba(67,181,129,0.08);
  border: 1px solid rgba(67,181,129,0.2);
  border-radius: 8px;
}
.sc-tbadge { flex-shrink: 0; }
.sc-tinfo { display: flex; flex-direction: column; line-height: 1.1; }
.sc-tname { font-size: 12px; font-weight: 800; color: #fff; }
.sc-tleague { font-size: 9px; color: #9fb0c8; }

/* 底部徽章横排 */
.sc-bottom {
  display: flex; flex-wrap: wrap; gap: 5px;
  padding: 10px 0 12px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  justify-content: center;
}
.sb-chip {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 4px 9px;
  font-size: 10px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 6px;
  color: #c8d4e6;
}
.sb-chip .sb-icon { font-size: 11px; }
.sb-chip .sb-label { opacity: 0.7; }
.sb-chip .sb-value { color: #fff; font-weight: 700; font-size: 11px; }
.sb-chip.sp { background: rgba(52,152,219,0.14); color: #3498db; border-color: rgba(52,152,219,0.3); }
.sb-chip.sp .sb-value { color: #5dade2; }
.sb-chip.pot { background: rgba(67,181,129,0.14); color: #43b581; border-color: rgba(67,181,129,0.3); }
.sb-chip.pot .sb-value { color: #58d68d; }

/* 兼容旧 badge 类（保留以免其他组件影响） */
.badge { font-size: 10px; padding: 2px 6px; border-radius: 4px; background: rgba(255,255,255,0.06); color: #c8d4e6; }
.badge.gold { background: rgba(255,215,0,0.12); color: #ffd700; }
.badge.pot { background: rgba(67,181,129,0.12); color: #43b581; }
.badge.sp { background: rgba(52,152,219,0.15); color: #3498db; font-weight: 700; }
.badge.rep { background: rgba(241,196,15,0.12); color: #f1c40f; }

.ps-perks { padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; flex-direction: column; gap: 8px; }
.pp-row { display: flex; align-items: flex-start; gap: 8px; flex-wrap: wrap; }
.pp-label { font-size: 11px; color: #8a99b0; font-weight: 700; min-width: 70px; padding-top: 2px; }
.pp-tags { display: flex; gap: 4px; flex-wrap: wrap; }
.pp-tag { font-size: 10px; padding: 2px 7px; border-radius: 4px; font-weight: 600; }
.pp-tag.ps { background: rgba(255,215,0,0.12); color: #ffd700; }
.pp-tag.perk { background: rgba(155,89,182,0.15); color: #c39bd3; }

.objectives { padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.08); }
.obj-title { font-size: 12px; font-weight: 800; color: #c8d4e6; margin-bottom: 8px; }
.obj-row { margin-bottom: 8px; }
.obj-head { display: flex; align-items: center; gap: 6px; font-size: 11px; margin-bottom: 3px; flex-wrap: wrap; }
.obj-icon { font-size: 13px; }
.obj-label { color: #e8eef7; font-weight: 600; }
.obj-target { color: #8a99b0; font-size: 10px; margin-left: auto; }
.obj-bar { height: 4px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden; }
.obj-fill { height: 100%; background: linear-gradient(90deg, #43b581, #ffd700); border-radius: 2px; transition: width 0.4s; }

.cats { padding: 12px 0; display: flex; flex-direction: column; gap: 7px; border-bottom: 1px solid rgba(255,255,255,0.08); }
.cat-row { display: flex; align-items: center; gap: 10px; }
.cat-name { width: 78px; font-size: 12px; font-weight: 700; }
.cat-bar { flex: 1; height: 8px; background: rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden; }
.cat-fill { height: 100%; border-radius: 4px; transition: width 0.4s; }
.cat-val { width: 28px; text-align: right; font-size: 13px; font-weight: 700; }

.stats-bar { padding: 12px 0; display: grid; grid-template-columns: 1fr 1fr; gap: 6px 14px; border-bottom: 1px solid rgba(255,255,255,0.08); }
.stat { display: flex; align-items: center; gap: 8px; font-size: 11px; color: #9fb0c8; }
.stat span { width: 52px; }
.stat b { width: 26px; text-align: right; color: #e8eef7; }
.mini-bar { flex: 1; height: 5px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; }
.mini-fill { height: 100%; border-radius: 3px; }
.mini-fill.morale { background: #43b581; }
.mini-fill.fitness { background: #3498db; }
.mini-fill.rep { background: #ffd700; }
.mini-fill.team { background: #9b59b6; }
.mini-fill.coach { background: #e67e22; }
.mini-fill.inj { background: #e74c3c; }

.season-stats { padding-top: 12px; display: grid; grid-template-columns: repeat(5,1fr); gap: 8px; }
.ss-item { text-align: center; }
.ss-item b { display: block; font-size: 17px; color: #43b581; }
.ss-item span { font-size: 10px; color: #8a99b0; }

.contract-info { margin-top: 12px; padding: 10px 12px; background: rgba(52,152,219,0.08); border-radius: 10px; border-left: 3px solid #3498db; }
.ci-head { font-size: 12px; font-weight: 800; color: #3498db; margin-bottom: 8px; }
.ci-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 6px; }
.ci-item { display:flex; justify-content:space-between; font-size: 11px; padding: 3px 0; border-bottom: 1px dashed rgba(255,255,255,0.06); }
.ci-item:last-child, .ci-item:nth-child(3) { border-bottom: none; }
.ci-item span { color: #8a99b0; }
.ci-item b { color: #e8eef7; }
.ci-item b.exp { color: #e74c3c; }

@media (max-width: 600px) {
  .stats-bar { grid-template-columns: 1fr; }
  .season-stats { grid-template-columns: repeat(3,1fr); }
  /* 卡牌+档案 showcase 改竖向堆叠 */
  .showcase {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .sc-side { flex-direction: row; flex-wrap: wrap; align-items: stretch; }
  .sc-right { align-items: stretch; }
  .sc-right .sc-item { flex-direction: row; text-align: left; }
  .sc-item { flex: 1 1 calc(50% - 4px); min-width: 130px; }
  .sc-center { order: -1; } /* 卡牌先显示 */
}
</style>
