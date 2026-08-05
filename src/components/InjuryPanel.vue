<script setup>
import { computed } from 'vue'
import { state } from '../store.js'

const injury = computed(() => state.player?.injury)
const injuryHistory = computed(() => state.player?.injuryHistory || [])

const severityStyle = computed(() => {
  const s = injury.value?.severity
  if (s === 'severe') return { border: 'rgba(231,76,60,0.6)', bg: 'linear-gradient(160deg,#3a1414,#1a0808)' }
  if (s === 'moderate') return { border: 'rgba(230,126,34,0.6)', bg: 'linear-gradient(160deg,#3a2a10,#1a1005)' }
  return { border: 'rgba(67,181,129,0.5)', bg: 'linear-gradient(160deg,#0f2a1f,#081915)' }
})

const injuryTypeLabel = {
  muscle: '肌肉拉伤',
  ligament: '韧带损伤',
  fracture: '骨折',
  impact: '碰撞伤',
  overuse: '疲劳性炎症',
}

function progressColor() {
  const r = injury.value?.recoveryStage || 0
  if (r < 30) return '#e74c3c'
  if (r < 70) return '#e67e22'
  return '#43b581'
}
</script>

<template>
  <div v-if="injury" class="injury-panel" :style="severityStyle">
    <div class="ip-head">
      <div>
        <div class="ip-title">🚑 当前伤病：<b>{{ injury.name }}</b></div>
        <div class="ip-sub">
          <span class="ip-sev" :style="{color: injury.severityColor}">
            {{ injury.severityLabel }} · {{ injuryTypeLabel[injury.type] }}
          </span>
          <span>缺阵 {{ injury.weeksRemaining }} 周 / {{ injury.matchesMissed }} 场</span>
        </div>
      </div>
      <div class="ip-badge" :style="{color: injury.severityColor}">
        {{ Math.round(injury.recoveryStage) }}%
      </div>
    </div>

    <!-- 恢复进度条 -->
    <div class="ip-progress">
      <div class="ip-bar">
        <div class="ip-fill" :style="{ width: injury.recoveryStage + '%', background: progressColor() }"></div>
      </div>
      <div class="ip-labels">
        <span>确诊</span>
        <span>{{ injury.totalWeeks }}周总疗程 · 剩余{{ injury.daysRemaining }}天</span>
        <span>复出</span>
      </div>
    </div>

    <div class="ip-details">
      <div class="ip-row">
        <span class="ip-k">📌 致伤原因</span>
        <span class="ip-v">{{ injury.cause }}</span>
      </div>
      <div class="ip-row desc">
        <span class="ip-k">📝 伤情描述</span>
        <span class="ip-v">{{ injury.description }}</span>
      </div>
      <div class="ip-row">
        <span class="ip-k">💊 治疗方案</span>
        <ul class="ip-v treat-list"><li v-for="(t,i) in injury.treatment" :key="i">{{ t }}</li></ul>
      </div>
      <div class="ip-row career" v-if="injury.careerImpact">
        <span class="ip-k">⚠️ 职业影响</span>
        <span class="ip-v warn">{{ injury.careerImpact }}</span>
      </div>
      <div class="ip-row attrs" v-if="Object.keys(injury.attrPenaltyDuring||{}).length">
        <span class="ip-k">📉 伤中属性</span>
        <span class="ip-v">
          <span v-for="(v, k) in injury.attrPenaltyDuring" :key="k" class="attr-pen">
            {{ {
              acceleration:'爆发',sprintSpeed:'速度',stamina:'体力',agility:'敏捷',jumping:'弹跳',
              strength:'强壮',balance:'平衡',heading:'头球',vision:'视野',composure:'沉着',
              decisions:'决策',finishing:'射门',shortPassing:'短传',dribbling:'盘带',
              penalties:'点球',positioning:'跑位',reflexes:'反应',diving:'扑救'
            }[k] || k }}
            <b>{{ v }}</b>
          </span>
        </span>
      </div>
    </div>
  </div>

  <!-- 伤病史 -->
  <div v-if="injuryHistory.length" class="injury-history">
    <div class="ih-title">📁 伤病史 ({{ injuryHistory.length }} 次)</div>
    <div class="ih-list">
      <div v-for="(h, i) in injuryHistory.slice(-5).reverse()" :key="i" class="ih-item">
        <span class="ih-sev" :style="{color:h.severityColor}">●</span>
        <span class="ih-name">{{ h.name }}</span>
        <span class="ih-weeks">{{ h.totalWeeks }}周缺阵</span>
        <span class="ih-year">{{ h.seasonYear || '' }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.injury-panel {
  margin:10px 0; padding:14px; border-radius:12px; border:1px solid;
}
.ip-head { display:flex; justify-content:space-between; align-items:flex-start; gap:10px; margin-bottom:10px; }
.ip-title { font-size:15px; font-weight:800; color:#e8eef7; }
.ip-sub { font-size:12px; color:#9fb0c8; display:flex; gap:12px; margin-top:3px; }
.ip-sev { font-weight:700; }
.ip-badge { font-size:22px; font-weight:900; min-width:60px; text-align:right; }

.ip-progress { margin:8px 0 12px; }
.ip-bar { height:10px; border-radius:8px; background:rgba(255,255,255,0.08); overflow:hidden; }
.ip-fill { height:100%; transition:width 0.5s; border-radius:8px; }
.ip-labels { display:flex; justify-content:space-between; font-size:10px; color:#8a99b0; margin-top:4px; }

.ip-details { display:flex; flex-direction:column; gap:8px; }
.ip-row { display:grid; grid-template-columns:90px 1fr; gap:10px; font-size:12px; }
.ip-k { color:#8a99b0; }
.ip-v { color:#c8d4e6; line-height:1.6; }
.ip-row.desc .ip-v { color:#e8eef7; }
.treat-list { margin:0; padding-left:18px; }
.treat-list li { line-height:1.6; }
.attr-pen {
  display:inline-block; padding:2px 8px; margin:2px 4px 2px 0; border-radius:6px;
  background:rgba(231,76,60,0.15); color:#e74c3c; font-size:11px;
}
.attr-pen b { color:#e74c3c; }
.ip-row.career .ip-v.warn { color:#e74c3c; font-weight:600; }

.injury-history { margin-top:10px; padding:10px; border-radius:10px; background:rgba(255,255,255,0.03); border-left:2px solid #e67e22; }
.ih-title { font-size:12px; font-weight:800; color:#e67e22; margin-bottom:6px; }
.ih-list { display:flex; flex-direction:column; gap:4px; }
.ih-item { display:grid; grid-template-columns:16px 1fr 80px 50px; gap:6px; font-size:11px; color:#9fb0c8; }
.ih-name { color:#c8d4e6; }
.ih-weeks { color:#e74c3c; font-weight:600; text-align:right; }
.ih-year { text-align:right; }
</style>
