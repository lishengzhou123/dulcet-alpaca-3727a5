<script setup>
import { computed, ref } from 'vue'
import { state, resolveNegotiation } from '../store.js'
import { formatMoney } from '../engine/util.js'

const negotiation = computed(() => state.negotiation)
const player = computed(() => state.player)

// 谈判回合
const round = ref(0)
// 俱乐部初始报价（基于球员价值）
const baseOffer = computed(() => {
  const p = player.value
  const n = negotiation.value
  const ovr = p.ovr
  // 续约 vs 转会签约
  if (n?.type === 'renew') {
    const years = 3 + Math.round((ovr - 70) * 0.1)
    const salaryBase = Math.round(p.value * 0.035 + 300000)
    const salary = Math.round(salaryBase * (0.95 + (p.coachRelation/100) * 0.2))
    const signingBonus = Math.round(salary * 0.25)
    const releaseClause = Math.round(p.value * (ovr >= 80 ? 1.4 : 1.2))
    return { years, salary, signingBonus, releaseClause, clauseMandatory: ovr >= 85 }
  }
  // 转会签约（俱乐部已在 offer 中给出）
  const off = n?.offer
  return {
    years: off?.contractYears || 4,
    salary: off?.salary || p.salary,
    signingBonus: Math.round((off?.salary || p.salary) * 0.3),
    releaseClause: Math.round(p.value * 1.3),
    clauseMandatory: false,
  }
})

// 当前提出的合同
const currentContract = ref(null)
// 玩家期望（可调节滑块）
const salaryWant = ref(0)
const yearsWant = ref(0)
const bonusWant = ref(0)

function initContract() {
  currentContract.value = { ...baseOffer.value }
  salaryWant.value = Math.round(currentContract.value.salary * 1.08)
  yearsWant.value = currentContract.value.years + (player.value.age <= 25 ? 1 : 0)
  bonusWant.value = Math.round(currentContract.value.signingBonus * 1.2)
}
initContract()

// 谈判策略（俱乐部反应）
function acceptPlayerTerms() {
  // 俱乐部接受
  const accepted = {
    years: yearsWant.value,
    salary: salaryWant.value,
    signingBonus: bonusWant.value,
    releaseClause: currentContract.value.releaseClause,
    clauseMandatory: currentContract.value.clauseMandatory,
  }
  currentContract.value = { ...accepted }
  resolveNegotiation({ accepted: true, contract: accepted })
}

function askForMore() {
  // 俱乐部的还价：适度上浮
  round.value += 1
  const maxRaise = 1 + (player.value.coachRelation / 100) * 0.12 + (player.value.ovr - 70) * 0.003
  currentContract.value.salary = Math.min(currentContract.value.salary * maxRaise, salaryWant.value * 1.02)
  currentContract.value.signingBonus = Math.round(currentContract.value.signingBonus * 1.1)
  currentContract.value.years = Math.min(currentContract.value.years + 1, yearsWant.value)
}

function takeClubOffer() {
  resolveNegotiation({ accepted: true, contract: { ...currentContract.value } })
}

function walkAway() {
  resolveNegotiation({ accepted: false, walkAway: true })
}

// 距离达成一致的差距
const salaryGap = computed(() => Math.round((salaryWant.value - currentContract.value.salary) / currentContract.value.salary * 100))
const yearsGap = computed(() => yearsWant.value - currentContract.value.years)
</script>

<template>
  <div class="neg-wrap" v-if="negotiation && player">
    <div class="neg-hero">
      <div class="neg-icon">🤝</div>
      <h2>{{ negotiation.type === 'renew' ? `续约谈判 · ${player.team}` : `签约谈判 · ${negotiation.offer?.team || '新俱乐部'}` }}</h2>
      <p class="sub">第 {{ round + 1 }} 回合 · <b :class="{warn: round>=3}">最多 3 轮还价</b></p>
    </div>

    <div class="neg-grid">
      <!-- 俱乐部报价 -->
      <div class="col club-col">
        <div class="col-title">🏟️ 俱乐部报价</div>
        <div class="contract-box">
          <div class="field">
            <span class="f-label">年薪</span>
            <span class="f-val">{{ formatMoney(currentContract.salary) }}</span>
            <span class="f-gap" v-if="salaryGap>5" :class="{big:salaryGap>12}">距你期望 -{{ salaryGap }}%</span>
            <span class="f-gap ok" v-else-if="salaryGap<=0">✅ 达标</span>
            <span class="f-gap ok" v-else>接近，可谈</span>
          </div>
          <div class="field">
            <span class="f-label">合同年限</span>
            <span class="f-val">{{ currentContract.years }} 年</span>
            <span class="f-gap" v-if="yearsGap>0" :class="{warn:yearsGap>1}">还少 {{ yearsGap }} 年</span>
            <span class="f-gap ok" v-else>✅ 达标</span>
          </div>
          <div class="field">
            <span class="f-label">签字费</span>
            <span class="f-val">{{ formatMoney(currentContract.signingBonus) }}</span>
          </div>
          <div class="field">
            <span class="f-label">解约金条款</span>
            <span class="f-val">{{ formatMoney(currentContract.releaseClause) }}</span>
            <span v-if="currentContract.clauseMandatory" class="f-tag">强制</span>
          </div>
        </div>
      </div>

      <!-- 玩家期望 -->
      <div class="col player-col">
        <div class="col-title">⚽ 你的期望值</div>
        <div class="slider-wrap">
          <label>年薪：{{ formatMoney(salaryWant) }}</label>
          <input type="range" :min="Math.round(player.salary*0.7)" :max="Math.round(player.salary*2.2)" v-model.number="salaryWant" step="50000">
        </div>
        <div class="slider-wrap">
          <label>合同年限：{{ yearsWant }} 年</label>
          <input type="range" min="1" max="6" v-model.number="yearsWant">
        </div>
        <div class="slider-wrap">
          <label>签字费：{{ formatMoney(bonusWant) }}</label>
          <input type="range" :min="Math.round(currentContract.signingBonus*0.3)" :max="Math.round(currentContract.signingBonus*3)" v-model.number="bonusWant" step="10000">
        </div>
        <div class="expect-summary">
          <div v-if="salaryGap>15 || yearsGap>2" class="es warn">⚠️ 期望过高，俱乐部可能不接受</div>
          <div v-else-if="salaryGap>8" class="es">💬 有分歧，建议还价尝试</div>
          <div v-else class="es ok">✅ 双方接近，可签约</div>
        </div>
      </div>
    </div>

    <div class="neg-actions">
      <button class="btn-walk" @click="walkAway" :disabled="negotiation.type==='renew' && player.contractYears<=0">
        {{ negotiation.type==='renew' && player.contractYears<=0 ? '(合同到期，不可离开)' : '🚪 暂停谈判' }}
      </button>
      <button class="btn-ask" @click="askForMore" :disabled="round>=3 || salaryGap<=0 && yearsGap<=0">
        🔄 我要求更多（第 {{ round }}/3 轮）
      </button>
      <button class="btn-sign" @click="salaryGap<=10 && yearsGap<=1 ? acceptPlayerTerms() : takeClubOffer()">
        ✍️ {{ salaryGap<=10 && yearsGap<=1 ? '按我期望签约' : '接受俱乐部报价' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.neg-wrap { display:flex; flex-direction:column; gap:16px; }
.neg-hero { text-align:center; }
.neg-icon { font-size:48px; }
.neg-hero h2 { margin:4px 0; font-size:20px; }
.neg-hero .sub { font-size:12px; color:#9fb0c8; }
.neg-hero .sub .warn { color:#e74c3c; font-weight:700; }

.neg-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
.col { padding:14px; border-radius:14px; background:linear-gradient(160deg,#1a2332,#0f1620); border:1px solid rgba(255,255,255,0.08); }
.col-title { font-size:14px; font-weight:800; margin-bottom:10px; }
.club-col .col-title { color:#3498db; }
.player-col .col-title { color:#43b581; }

.contract-box { display:flex; flex-direction:column; gap:10px; }
.field {
  display:grid; grid-template-columns:70px 1fr auto; gap:6px; align-items:center;
  padding:10px 12px; background:rgba(0,0,0,0.25); border-radius:10px;
}
.f-label { font-size:12px; color:#8a99b0; }
.f-val { font-size:15px; font-weight:700; color:#e8eef7; }
.f-gap { font-size:10px; color:#e67e22; font-weight:600; white-space:nowrap; }
.f-gap.big { color:#e74c3c; }
.f-gap.ok { color:#43b581; }
.f-tag { font-size:10px; padding:2px 6px; border-radius:4px; background:rgba(231,76,60,0.2); color:#e74c3c; margin-left:6px; }

.slider-wrap { padding:10px 0; border-bottom:1px dashed rgba(255,255,255,0.08); }
.slider-wrap:last-child { border-bottom: none; }
.slider-wrap label { display:block; font-size:12px; color:#c8d4e6; font-weight:700; margin-bottom:6px; }
.slider-wrap input[type=range] {
  width:100%; height:6px; background: linear-gradient(90deg,#43b581,#3498db); border-radius:6px;
  -webkit-appearance:none; appearance:none;
}
.slider-wrap input[type=range]::-webkit-slider-thumb {
  -webkit-appearance:none; appearance:none; width:18px; height:18px; border-radius:50%;
  background:#fff; border:2px solid #43b581; cursor:pointer;
}
.expect-summary { margin-top:12px; padding:10px; border-radius:10px; background:rgba(255,255,255,0.04); }
.es { font-size:12px; font-weight:600; }
.es.ok { color:#43b581; }
.es.warn { color:#e74c3c; }

.neg-actions { display:grid; grid-template-columns:1fr 1.2fr 1.2fr; gap:10px; }
.neg-actions button {
  padding:12px; border-radius:10px; border:none; font-weight:800; cursor:pointer; font-size:13px;
}
.btn-walk { background:rgba(255,255,255,0.06); color:#c8d4e6; }
.btn-walk:disabled { opacity:0.4; cursor:not-allowed; }
.btn-ask { background:linear-gradient(90deg,#e67e22,#f39c12); color:#fff; }
.btn-ask:disabled { opacity:0.4; cursor:not-allowed; }
.btn-sign { background:linear-gradient(90deg,#43b581,#2ecc71); color:#07140e; }

@media (max-width:600px){
  .neg-grid{grid-template-columns:1fr;}
  .neg-actions{grid-template-columns:1fr;}
}
</style>
