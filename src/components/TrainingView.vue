<script setup>
import { computed, ref } from 'vue'
import { state, executeDrill, skipTraining } from '../store.js'
import { recommendedDrills } from '../engine/training.js'
import { ATTR_LABELS } from '../data/positions.js'

const player = computed(() => state.player)
const drills = computed(() => recommendedDrills(player.value))
const result = ref(null)
const training = ref(false)

function attrLabel(k) { return ATTR_LABELS[k] || k }

function doTrain(drillId) {
  training.value = true
  result.value = executeDrill(drillId)
  setTimeout(() => { training.value = false }, 300)
}

function finish() {
  result.value = null
  skipTraining()
}
</script>

<template>
  <div class="train-wrap">
    <div class="train-hero" v-if="!result">
      <div class="th-icon">🏋️</div>
      <h2>训练日</h2>
      <p class="th-sub">选择一项训练项目，提升对应属性。训练会消耗体能，请注意恢复。</p>
      <div class="th-status">
        <span>💪 体能 <b :class="{low: player.fitness<50}">{{ player.fitness }}</b></span>
        <span>⚠️ 伤险 <b :class="{high: player.injuryRisk>50}">{{ player.injuryRisk }}</b></span>
        <span>⚽ OVR <b>{{ player.ovr }}</b></span>
      </div>
    </div>

    <!-- 训练结果 -->
    <div v-if="result" class="train-result">
      <div class="tr-icon">{{ result.icon }}</div>
      <h3>{{ result.drillName }} · 完成</h3>
      <p class="tr-narrative">{{ result.narrative }}</p>
      <div class="tr-gains" v-if="result.attrGains.length">
        <div class="tr-gains-title">📈 属性提升</div>
        <div class="tr-gain-list">
          <span v-for="g in result.attrGains" :key="g.attr" class="tr-gain">
            {{ attrLabel(g.attr) }} <b>+{{ g.gain }}</b>
          </span>
        </div>
      </div>
      <div class="tr-changes">
        <span :class="{neg: result.fatigueChange<0}">💪 体能 {{ result.fatigueChange }}</span>
        <span :class="{neg: result.injuryRiskChange>0, pos: result.injuryRiskChange<0}">⚠️ 伤险 {{ result.injuryRiskChange>0?'+':'' }}{{ result.injuryRiskChange }}</span>
      </div>
      <button class="tr-btn" @click="finish">继续 ▶</button>
    </div>

    <!-- 训练选项 -->
    <div v-else class="drills-grid">
      <div v-for="d in drills" :key="d.id" class="drill-card" :class="d.intensity" @click="doTrain(d.id)">
        <div class="dc-icon">{{ d.icon }}</div>
        <div class="dc-name">{{ d.name }}</div>
        <div class="dc-desc">{{ d.desc }}</div>
        <div class="dc-attrs">
          <span v-for="a in d.attrs" :key="a" class="dc-attr">{{ attrLabel(a) }}</span>
        </div>
        <div class="dc-meta">
          <span class="dc-fatigue">💪 -{{ d.fatigueCost }}</span>
          <span class="dc-risk" v-if="d.injuryRiskAdd > 0">⚠️ +{{ d.injuryRiskAdd }}</span>
          <span class="dc-risk neg" v-else>⚠️ {{ d.injuryRiskAdd }}</span>
        </div>
      </div>
    </div>

    <button v-if="!result" class="skip-btn" @click="skipTraining">跳过训练，直接比赛 ▶</button>
  </div>
</template>

<style scoped>
.train-wrap { display:flex; flex-direction:column; gap:14px; }
.train-hero { text-align:center; padding:10px 0; }
.th-icon { font-size:48px; }
.train-hero h2 { margin:4px 0; font-size:22px; }
.th-sub { font-size:12px; color:#9fb0c8; }
.th-status { display:flex; gap:16px; justify-content:center; font-size:13px; margin-top:8px; }
.th-status b { color:#e8eef7; }
.th-status b.low { color:#e74c3c; }
.th-status b.high { color:#e74c3c; }

.drills-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
.drill-card {
  padding:14px 12px; border-radius:12px; cursor:pointer; transition:all 0.15s;
  background:linear-gradient(160deg,#1a2332,#0f1620); border:1px solid rgba(255,255,255,0.08);
}
.drill-card:hover { border-color:#43b581; transform:translateY(-2px); }
.drill-card.high { border-left:3px solid #e74c3c; }
.drill-card.medium { border-left:3px solid #e67e22; }
.drill-card.low { border-left:3px solid #43b581; }
.dc-icon { font-size:28px; }
.dc-name { font-size:14px; font-weight:800; margin:4px 0; }
.dc-desc { font-size:11px; color:#9fb0c8; line-height:1.4; }
.dc-attrs { display:flex; flex-wrap:wrap; gap:4px; margin-top:8px; }
.dc-attr { font-size:10px; padding:2px 6px; border-radius:4px; background:rgba(67,181,129,0.15); color:#43b581; }
.dc-meta { display:flex; gap:8px; margin-top:8px; font-size:11px; }
.dc-fatigue { color:#3498db; }
.dc-risk { color:#e67e22; } .dc-risk.neg { color:#43b581; }

.skip-btn {
  padding:12px; border-radius:10px; border:1px solid rgba(255,255,255,0.1);
  background:rgba(255,255,255,0.04); color:#9fb0c8; cursor:pointer; font-size:13px;
}
.skip-btn:hover { background:rgba(255,255,255,0.08); }

.train-result {
  text-align:center; padding:20px; border-radius:14px;
  background:linear-gradient(160deg,#1a2332,#0f1620); border:1px solid rgba(67,181,129,0.3);
}
.tr-icon { font-size:48px; }
.train-result h3 { margin:6px 0; font-size:18px; }
.tr-narrative { font-size:13px; color:#c8d4e6; line-height:1.6; }
.tr-gains { margin:14px 0; }
.tr-gains-title { font-size:12px; font-weight:800; color:#43b581; margin-bottom:6px; }
.tr-gain-list { display:flex; gap:8px; justify-content:center; flex-wrap:wrap; }
.tr-gain { padding:4px 10px; border-radius:8px; background:rgba(67,181,129,0.15); color:#43b581; font-size:13px; font-weight:600; }
.tr-gain b { color:#fff; }
.tr-changes { display:flex; gap:16px; justify-content:center; font-size:12px; margin:10px 0; }
.tr-changes span { color:#9fb0c8; }
.tr-changes .neg { color:#e74c3c; }
.tr-changes .pos { color:#43b581; }
.tr-btn {
  margin-top:12px; padding:12px 40px; font-size:14px; font-weight:800;
  background:linear-gradient(90deg,#43b581,#2ecc71); color:#07140e; border:none; border-radius:10px; cursor:pointer;
}

@media (max-width:600px){ .drills-grid{grid-template-columns:1fr 1fr;} }
</style>
