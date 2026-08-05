<script setup>
import { computed, ref } from 'vue'
import { state, chooseTransfer, openNegotiation } from '../store.js'
import { LEAGUES, TEAMS } from '../data/leagues.js'
import { formatMoney } from '../engine/util.js'

const offers = computed(() => state.offers)
const player = computed(() => state.player)
const currentTeamLeague = computed(() => LEAGUES[player.value?.teamLeague]?.short || '')
const curTeamStrength = computed(() => TEAMS.find(t => t.name === player.value?.team)?.strength || 65)

const selected = ref(null)  // 选中的 offer 用于详情展示

function strengthLabel(s) {
  if (s >= 88) return '欧洲顶级'
  if (s >= 82) return '欧战级别'
  if (s >= 76) return '联赛劲旅'
  if (s >= 70) return '中上游'
  if (s >= 64) return '中游'
  return '保级队'
}
function tierLabel(strength, curStrength) {
  const diff = strength - curStrength
  if (diff >= 5) return { label: '级别跃升', color: '#43b581', up: true }
  if (diff >= 1) return { label: '小幅提升', color: '#2ecc71', up: true }
  if (diff >= -3) return { label: '平级转会', color: '#9fb0c8', up: null }
  if (diff >= -8) return { label: '略有下降', color: '#e67e22', up: false }
  return { label: '明显降薪/降级', color: '#e74c3c', up: false }
}
function salaryChange(newS, oldS) {
  const diff = newS - oldS
  const pct = Math.round(diff / oldS * 100)
  if (pct >= 60) return { label: `涨薪 ${pct}%`, color: '#43b581', icon: '🚀', pct }
  if (pct >= 20) return { label: `涨薪 ${pct}%`, color: '#2ecc71', icon: '📈', pct }
  if (pct >= 0) return { label: `持平 +${pct}%`, color: '#9fb0c8', icon: '➖', pct }
  if (pct >= -20) return { label: `降薪 ${pct}%`, color: '#e67e22', icon: '📉', pct }
  return { label: `降薪 ${pct}%`, color: '#e74c3c', icon: '⚠️', pct }
}

function selectOffer(o) { selected.value = selected.value === o ? null : o }

function choose(o) {
  if (o === 'stay') {
    // 留在本队，如果合同到期则进入续约谈判
    if (player.value.contractYears <= 0) {
      openNegotiation({ type: 'renew' })
    } else {
      chooseTransfer('stay')
    }
  } else {
    chooseTransfer(o)
  }
}
</script>

<template>
  <div class="tm-wrap">
    <div class="tm-hero">
      <div class="tm-title">🔁 夏季转会窗口</div>
      <p class="tm-sub">{{ player.birthYear + player.age }}年夏窗 · 你当前的声望吸引了 <b>{{ offers.length }}</b> 家俱乐部的目光</p>
      <div class="cur-team">
        <span class="cur-t-name">现效力：<b>{{ player.team }}</b> · {{ currentTeamLeague }}</span>
        <span>💶 年薪 {{ formatMoney(player.salary) }}</span>
        <span>📝 合同剩 <b :class="{danger: player.contractYears<=1}">{{ player.contractYears }} 年</b></span>
        <span>⚽ 当前OVR <b>{{ player.ovr }}</b></span>
      </div>
    </div>

    <!-- 留队 / 续约卡 -->
    <div class="offers">
      <div class="offer-card stay" @click="choose('stay')">
        <div class="o-head">
          <div>
            <div class="o-name">留在 {{ player.team }}</div>
            <div class="o-league">{{ currentTeamLeague }} · 原班人马 · 教练关系 {{ player.coachRelation }}/100</div>
          </div>
          <div class="o-tag stay">{{ player.contractYears <= 0 ? '需续约' : '续约/留队' }}</div>
        </div>
        <p class="o-desc">
          继续在熟悉的环境成长，稳定压倒一切。主帅与队友关系不变；
          <b v-if="player.contractYears<=0">合同已到期，将自动进入续约谈判</b>
          <b v-else-if="player.contractYears===1">明年到期，建议续约避免自由离队</b>
        </p>
        <div class="o-leave" v-if="player.contractYears<=0">💡 合同到期，留队需谈判新合同</div>
      </div>

      <div v-for="(o, i) in offers" :key="i"
        class="offer-card"
        :class="{ selected: selected === o }"
        @click="selectOffer(o)">
        <div class="o-head">
          <div>
            <div class="o-name">{{ o.team }}</div>
            <div class="o-league">{{ o.leagueName }} · {{ o.country }} · {{ strengthLabel(o.teamStrength) }}</div>
          </div>
          <div style="text-align:right">
            <div class="o-rep">⭐ 声望 {{ o.teamReputation }}</div>
            <div class="tier-tag" :style="{ color: tierLabel(o.teamStrength, curTeamStrength).color }">
              {{ tierLabel(o.teamStrength, curTeamStrength).label }}
            </div>
          </div>
        </div>

        <div class="o-stars" v-if="o.starPlayers.length">🌟 球星：{{ o.starPlayers.join('、') }}</div>

        <div class="o-money">
          <div class="om"><span>转会费</span><b>{{ formatMoney(o.fee) }}</b></div>
          <div class="om"><span>年薪</span><b :style="{color: salaryChange(o.salary, player.salary).color}">
            {{ formatMoney(o.salary) }} {{ salaryChange(o.salary, player.salary).icon }}
          </b></div>
          <div class="om"><span>合同</span><b>{{ o.contractYears }}年</b></div>
          <div class="om"><span>声望</span><b :class="o.repGain>=0?'pos':'neg'">{{ o.repGain>=0?'+':'' }}{{ o.repGain }}</b></div>
        </div>

        <!-- 转会介绍（展开详情） -->
        <div class="transfer-intro" v-if="selected === o">
          <div class="ti-title">📰 转会分析报告</div>
          <ul class="ti-list">
            <li><b>俱乐部定位：</b>{{ strengthLabel(o.teamStrength) }}的传统{{ o.country }}俱乐部，国内排名前{{ Math.max(1, 10 - Math.round(o.teamReputation/10)) }}。</li>
            <li><b>战术适配：</b>{{ ['主打433控球','352高压逼抢','4231防守反击','442两翼齐飞','圣诞树4321'][i%5] }}，对你的{{ player.position }}位置要求较高。</li>
            <li><b>竞争压力：</b>当前主力位置{{ ['空缺，你将作为核心引援','竞争激烈，需前半年证明自己','主力+替补各半，轮换机会多','年轻球员为主，成长空间大'][i%4] }}。</li>
            <li><b>城市因素：</b>{{ ['气候适宜、生活舒适','语言需适应、城市国际化程度高','球迷狂热、主场氛围顶级','税收优势明显、税后收入更高'][i%4] }}。</li>
            <li><b>经济对比：</b>比你当前年薪{{ salaryChange(o.salary, player.salary).label }}，{{ salaryChange(o.salary, player.salary).pct>=0 ? '经济层面合算' : '经济上略有牺牲，需权衡平台价值' }}。</li>
            <li><b>平台对比：</b>{{ tierLabel(o.teamStrength, curTeamStrength).label }}，对你的声望和金球奖评选{{ tierLabel(o.teamStrength, curTeamStrength).up===true ? '有显著加分' : tierLabel(o.teamStrength, curTeamStrength).up===false ? '可能产生负面影响' : '影响不大' }}。</li>
          </ul>
          <div class="ti-note">💡 选择转会将触发正式转会谈判，签订合同后你将为新俱乐部效力。</div>
          <button class="accept-btn" @click.stop="choose(o)">✅ 接受转会，加盟 {{ o.team }}</button>
        </div>
      </div>
    </div>

    <p class="tip">💡 点击任意报价卡片可查看详细转会分析报告；更高声望的俱乐部能提升曝光与平台，但出场时间可能受竞争影响。</p>
  </div>
</template>

<style scoped>
.tm-wrap { display:flex; flex-direction:column; gap:14px; }
.tm-hero { text-align:center; padding:8px 0; }
.tm-title { font-size:24px; font-weight:800; background:linear-gradient(90deg,#3498db,#9b59b6); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; }
.tm-sub { font-size:13px; color:#9fb0c8; margin:6px 0; }
.cur-team { font-size:12px; color:#c8d4e6; display:flex; gap:14px; justify-content:center; flex-wrap:wrap; }
.cur-team b.danger { color:#e74c3c; }

.offers { display:flex; flex-direction:column; gap:12px; }
.offer-card {
  background:linear-gradient(160deg,#1a2332,#0f1620); border:1px solid rgba(255,255,255,0.08);
  border-radius:14px; padding:16px; cursor:pointer; transition:all 0.15s;
}
.offer-card:hover { border-color:rgba(67,181,129,0.5); transform:translateY(-2px); box-shadow:0 10px 30px rgba(0,0,0,0.3); }
.offer-card.selected { border-color:#3498db; box-shadow:0 0 0 2px rgba(52,152,219,0.3); }
.offer-card.stay { border-left:4px solid #43b581; }
.o-head { display:flex; justify-content:space-between; align-items:flex-start; gap:10px; }
.o-name { font-size:18px; font-weight:800; }
.o-league { font-size:12px; color:#9fb0c8; margin-top:2px; }
.o-tag { font-size:11px; padding:3px 10px; border-radius:20px; background:rgba(67,181,129,0.15); color:#43b581; font-weight:700; white-space:nowrap; }
.o-tag.stay { background: rgba(67,181,129,0.15); color:#43b581; }
.o-rep { font-size:12px; color:#ffd700; font-weight:700; }
.tier-tag { font-size:11px; font-weight:700; margin-top:4px; text-align:right; }
.o-stars { font-size:12px; color:#9fb0c8; margin:8px 0; }
.o-money { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-top:10px; }
.om { text-align:center; } .om span { display:block; font-size:10px; color:#8a99b0; } .om b { font-size:14px; color:#e8eef7; }
.om b.pos { color:#43b581; } .om b.neg { color:#e74c3c; }
.o-desc { font-size:13px; color:#c8d4e6; line-height:1.6; margin:6px 0 0; }
.o-leave { margin-top:8px; font-size:12px; color:#e67e22; font-weight:600; }

.transfer-intro {
  margin-top:14px; padding:14px; border-radius:12px; background:rgba(0,0,0,0.2);
  border:1px dashed rgba(52,152,219,0.4);
}
.ti-title { font-size:14px; font-weight:800; color:#3498db; margin-bottom:8px; }
.ti-list { margin:0; padding-left:18px; }
.ti-list li { font-size:12px; color:#c8d4e6; line-height:1.8; }
.ti-list b { color:#e8eef7; }
.ti-note { font-size:11px; color:#9fb0c8; margin-top:10px; padding:8px; background:rgba(52,152,219,0.08); border-radius:8px; }
.accept-btn {
  width:100%; margin-top:12px; padding:11px; font-size:14px; font-weight:800;
  background:linear-gradient(90deg,#43b581,#3498db); color:#fff; border:none; border-radius:10px; cursor:pointer;
}
.accept-btn:hover { filter:brightness(1.1); }

.tip { font-size:12px; color:#8a99b0; line-height:1.7; text-align:center; padding:10px; background:rgba(52,152,219,0.06); border-radius:10px; }
@media (max-width:520px){ .o-money{grid-template-columns:1fr 1fr;} .cur-team{flex-direction:column; gap:4px;} }
</style>
