<script setup>
import { computed } from 'vue'
import { state, chooseRetirement, simulateCoachSeason, resetGame } from '../store.js'
import { LEAGUES } from '../data/leagues.js'
import { formatMoney } from '../engine/util.js'

const player = computed(() => state.player)
const screen = computed(() => state.screen)

// 荣誉汇总
const allHonors = computed(() => player.value?.honors || [])
const careerLog = computed(() => state.careerLog)
const peakOvr = computed(() => Math.max(...careerLog.value.map(l => l.ovr), player.value?.ovr || 0))
const peakValue = computed(() => Math.max(...careerLog.value.map(l => l.value), player.value?.value || 0))
const totalGoals = computed(() => player.value?.careerStats.goals || 0)
const totalAssists = computed(() => player.value?.careerStats.assists || 0)
const totalApps = computed(() => player.value?.careerStats.apps || 0)
const totalCaps = computed(() => player.value?.caps || 0)
const totalIntlGoals = computed(() => player.value?.intlGoals || 0)

const tierIcon = { gold: '🥇', silver: '🥈', bronze: '🥉', world: '🏆' }
const tierClass = { gold: 'gold', silver: 'silver', bronze: 'bronze', world: 'world', continental: 'gold' }

const coach = computed(() => state.coachCareer)
const coachTrophies = computed(() => coach.value?.trophies || [])

// 退役后职业类型的动态文案
const careerType = computed(() => coach.value?.type || 'coach')
const careerBadge = computed(() => ({ coach: '📋', manager: '👔', commentator: '🎙️', academy: '🎓', ambassador: '🤝' }[careerType.value] || '📋'))
const careerTitle = computed(() => ({ coach: '主帅生涯', manager: '管理层生涯', commentator: '解说生涯', academy: '青训学院', ambassador: '品牌大使' }[careerType.value] || '主帅生涯'))
const careerSeasonLabel = computed(() => ({ coach: '执教赛季', manager: '管理赛季', commentator: '解说赛季', academy: '运营赛季', ambassador: '代言年份' }[careerType.value] || '执教赛季'))
const careerTrophyLabel = computed(() => ({ coach: '执教荣誉', manager: '管理荣誉', commentator: '行业荣誉', academy: '学院荣誉', ambassador: '商业荣誉' }[careerType.value] || '执教荣誉'))
const careerLogLabel = computed(() => ({ coach: '执教记录', manager: '管理记录', commentator: '解说记录', academy: '学院记录', ambassador: '代言记录' }[careerType.value] || '执教记录'))
const careerOrgLabel = computed(() => ({ coach: '球队', manager: '俱乐部', commentator: '平台', academy: '学院', ambassador: '机构' }[careerType.value] || '球队'))
const careerDetailLabel = computed(() => ({ coach: '排名', manager: '排名', commentator: '覆盖', academy: '学员', ambassador: '代言' }[careerType.value] || '排名'))
const careerSimLabel = computed(() => ({ coach: '模拟下赛季', manager: '模拟下赛季', commentator: '模拟下一年', academy: '模拟下一年', ambassador: '模拟下一年' }[careerType.value] || '模拟下赛季'))
const hasLeague = computed(() => careerType.value === 'coach' || careerType.value === 'manager' || careerType.value === 'commentator')
</script>

<template>
  <!-- 退役抉择 -->
  <div class="end-wrap" v-if="screen === 'retirement'">
    <div class="retire-card">
      <div class="retire-badge">🎯</div>
      <h2>四十不惑</h2>
      <p class="retire-narrative">
        时光荏苒，你已经 <b>{{ player.age }}</b> 岁了。镜子里的你鬓角染霜，膝盖在阴天隐隐作痛，但脚下的皮球依然听话。
        二十多年的职业生涯，荣誉室里摆满了奖杯。是时候做一个决定了——
      </p>
      <div class="retire-choices retire-grid">
        <button class="rc retire" @click="chooseRetirement('retire')">
          <span class="rc-icon">🏁</span>
          <span class="rc-title">挂靴退役</span>
          <span class="rc-desc">总结生涯荣誉，画上完美句点</span>
        </button>
        <button class="rc coach" @click="chooseRetirement('coach')">
          <span class="rc-icon">📋</span>
          <span class="rc-title">转战教练</span>
          <span class="rc-desc">拿起战术板，开启主帅生涯</span>
        </button>
        <button class="rc manager" @click="chooseRetirement('manager')">
          <span class="rc-icon">👔</span>
          <span class="rc-title">体育总监</span>
          <span class="rc-desc">转入俱乐部管理层，掌控转会与战略</span>
        </button>
        <button class="rc commentator" @click="chooseRetirement('commentator')">
          <span class="rc-icon">🎙️</span>
          <span class="rc-title">足球解说</span>
          <span class="rc-desc">坐上解说席，用声音延续足球缘</span>
        </button>
        <button class="rc academy" @click="chooseRetirement('academy')">
          <span class="rc-icon">🎓</span>
          <span class="rc-title">创办青训</span>
          <span class="rc-desc">建立足球学院，培养下一代球星</span>
        </button>
        <button class="rc ambassador" @click="chooseRetirement('ambassador')">
          <span class="rc-icon">🤝</span>
          <span class="rc-title">品牌大使</span>
          <span class="rc-desc">商业代言与公益，延续个人影响力</span>
        </button>
        <button class="rc cont" @click="chooseRetirement('continue')">
          <span class="rc-icon">⚽</span>
          <span class="rc-title">继续征战</span>
          <span class="rc-desc">老骥伏枥，再踢一个赛季</span>
        </button>
      </div>
    </div>
  </div>

  <!-- 退役荣誉总结 -->
  <div class="end-wrap" v-else-if="screen === 'honors'">
    <div class="honors-hero">
      <div class="hh-badge">🎬</div>
      <h2>{{ player.name }} 的传奇生涯</h2>
      <p class="hh-sub">{{ player.birthYear + 16 }} - {{ player.birthYear + player.age }} · 从青训少年到足坛传奇</p>
    </div>

    <div class="final-stats">
      <div class="fs"><b>{{ peakOvr }}</b><span>巅峰OVR</span></div>
      <div class="fs"><b>{{ formatMoney(peakValue) }}</b><span>巅峰身价</span></div>
      <div class="fs"><b>{{ totalApps }}</b><span>总出场</span></div>
      <div class="fs"><b class="goal">{{ totalGoals }}</b><span>总进球</span></div>
      <div class="fs"><b class="assist">{{ totalAssists }}</b><span>总助攻</span></div>
      <div class="fs"><b>{{ totalCaps }}</b><span>国家队出场</span></div>
      <div class="fs"><b class="goal">{{ totalIntlGoals }}</b><span>国家队进球</span></div>
    </div>

    <div class="honors-section" v-if="allHonors.length">
      <div class="section-title">🏅 生涯荣誉墙 ({{ allHonors.length }})</div>
      <div class="honors-wall">
        <div v-for="(h, i) in allHonors" :key="i" class="hw-item" :class="tierClass[h.tier] || 'silver'">
          <span class="hw-icon">{{ tierIcon[h.tier] || '🎖️' }}</span>
          <span class="hw-text">{{ h.text }}</span>
          <span class="hw-year">{{ h.season }}</span>
        </div>
      </div>
    </div>
    <div v-else class="empty-honors">生涯无重大荣誉，但你为足球倾注了全部青春。</div>

    <div class="log-section">
      <div class="section-title">📅 生涯赛季回顾</div>
      <div class="log-table">
        <div class="log-thead"><span>赛季</span><span>年龄</span><span>球队</span><span>OVR</span><span>身价</span><span>出场</span><span>进球</span><span>助攻</span><span>排名</span></div>
        <div v-for="(l, i) in careerLog" :key="i" class="log-row">
          <span>{{ l.year }}</span><span>{{ l.age }}</span><span class="lteam">{{ l.team }}<i>{{ l.league }}</i></span>
          <span>{{ l.ovr }}</span><span>{{ formatMoney(l.value) }}</span><span>{{ l.apps }}</span>
          <span class="goal">{{ l.goals }}</span><span class="assist">{{ l.assists }}</span><span>{{ l.leaguePos || '-' }}</span>
        </div>
      </div>
    </div>

    <div class="end-credit">
      <p>「足球是瞬间的游戏，而你的瞬间，将被永远铭记。」</p>
      <button class="restart-btn" @click="resetGame">开启新的生涯 ↻</button>
    </div>
  </div>

  <!-- 退役后生涯（教练/管理层/解说/青训/大使） -->
  <div class="end-wrap" v-else-if="screen === 'coach'">
    <div class="coach-hero">
      <div class="ch-badge">{{ careerBadge }}</div>
      <h2>{{ careerTitle }} · {{ coach.club }}</h2>
      <p class="ch-sub">{{ coach.age }}岁 · {{ coach.achievement || '初出茅庐' }} · 声望 {{ coach.reputation }}</p>
    </div>
    <div class="coach-stats">
      <div class="cs"><b>{{ coach.log.length }}</b><span>{{ careerSeasonLabel }}</span></div>
      <div class="cs"><b>{{ coachTrophies.length }}</b><span>荣誉数</span></div>
      <div class="cs"><b>{{ coach.reputation }}</b><span>声望</span></div>
    </div>
    <div class="trophies" v-if="coachTrophies.length">
      <div class="section-title">🏆 {{ careerTrophyLabel }}</div>
      <div class="trophy-list">
        <div v-for="(t, i) in coachTrophies" :key="i" class="trophy">🏆 {{ t }}</div>
      </div>
    </div>
    <div class="coach-log" v-if="coach.log.length">
      <div class="section-title">📅 {{ careerLogLabel }}</div>
      <div class="log-table">
        <div class="log-thead coach-thead">
          <span>年份</span><span>年龄</span><span>{{ careerOrgLabel }}</span>
          <span v-if="hasLeague">{{ careerDetailLabel }}</span>
          <span>荣誉</span>
        </div>
        <div v-for="(l, i) in coach.log" :key="i" class="log-row coach-row">
          <span>{{ l.year }}</span><span>{{ l.age }}</span><span class="lteam">{{ l.club }}</span>
          <span v-if="hasLeague" :class="{gold:l.pos===1}">{{ l.pos ? `第${l.pos}名` : (l.points ? `${l.points}人` : '-') }}</span>
          <span class="coach-trophy">{{ l.trophies?.length ? l.trophies.join('、') : '—' }}</span>
        </div>
      </div>
    </div>
    <div class="coach-actions">
      <button class="sim-btn" @click="simulateCoachSeason">{{ careerSimLabel }} ▶</button>
      <button class="restart-btn small" @click="resetGame">结束第二生涯 ↻</button>
    </div>
  </div>
</template>

<style scoped>
.end-wrap { display:flex; flex-direction:column; gap:16px; }
.retire-card, .honors-hero, .coach-hero {
  background:linear-gradient(160deg,#1a2332,#0f1620); border:1px solid rgba(255,255,255,0.08);
  border-radius:18px; padding:32px 26px; text-align:center;
}
.retire-badge, .hh-badge, .ch-badge { font-size:48px; }
.retire-card h2, .honors-hero h2, .coach-hero h2 { font-size:26px; margin:10px 0; color:#fff; }
.retire-narrative { font-size:14px; line-height:1.9; color:#c8d4e6; max-width:520px; margin:0 auto 22px; }
.retire-choices.retire-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
.rc { display:flex; flex-direction:column; gap:6px; align-items:center; padding:18px 12px; border-radius:12px; cursor:pointer; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.03); color:#e8eef7; transition:all 0.15s; }
.rc:hover { transform:translateY(-3px); }
.rc.retire:hover { border-color:#e74c3c; background:rgba(231,76,60,0.1); }
.rc.coach:hover { border-color:#3498db; background:rgba(52,152,219,0.1); }
.rc.manager:hover { border-color:#9b59b6; background:rgba(155,89,182,0.1); }
.rc.commentator:hover { border-color:#e67e22; background:rgba(230,126,34,0.1); }
.rc.academy:hover { border-color:#43b581; background:rgba(67,181,129,0.1); }
.rc.ambassador:hover { border-color:#f1c40f; background:rgba(241,196,15,0.1); }
.rc.cont:hover { border-color:#43b581; background:rgba(67,181,129,0.1); }
.rc-icon { font-size:28px; } .rc-title { font-size:15px; font-weight:800; } .rc-desc { font-size:11px; color:#9fb0c8; }

.hh-sub { font-size:13px; color:#9fb0c8; margin-top:4px; }
.final-stats { display:grid; grid-template-columns:repeat(7,1fr); gap:10px; background:linear-gradient(160deg,#1a2332,#0f1620); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:18px; }
.fs { text-align:center; } .fs b { display:block; font-size:20px; color:#43b581; } .fs b.goal { color:#e74c3c; } .fs b.assist { color:#3498db; } .fs span { font-size:10px; color:#8a99b0; }

.section-title { font-size:15px; font-weight:800; color:#c8d4e6; margin-bottom:12px; padding-left:4px; border-left:3px solid #43b581; }
.honors-section, .log-section, .trophies, .coach-log, .coach-stats { background:linear-gradient(160deg,#1a2332,#0f1620); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:18px; }
.honors-wall { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:10px; }
.hw-item { display:flex; align-items:center; gap:8px; padding:10px 12px; border-radius:10px; font-size:13px; }
.hw-item.gold { background:rgba(255,215,0,0.1); color:#ffd700; }
.hw-item.silver { background:rgba(192,192,192,0.1); color:#d8d8d8; }
.hw-item.bronze { background:rgba(205,127,50,0.1); color:#cd7f32; }
.hw-item.world { background:linear-gradient(90deg,rgba(255,215,0,0.15),rgba(231,76,60,0.1)); color:#ffd700; }
.hw-year { margin-left:auto; font-size:11px; opacity:0.7; }
.empty-honors { text-align:center; color:#8a99b0; padding:20px; font-size:14px; }

.log-table { font-size:12px; }
.log-thead, .log-row { display:grid; grid-template-columns: 56px 44px 1.6fr 44px 70px 44px 44px 44px 44px; gap:6px; padding:7px 8px; align-items:center; }
.log-thead { color:#8a99b0; border-bottom:1px solid rgba(255,255,255,0.08); font-weight:700; }
.log-row { border-bottom:1px solid rgba(255,255,255,0.04); }
.lteam i { color:#8a99b0; font-style:normal; font-size:11px; margin-left:4px; }
.log-row .goal { color:#e74c3c; } .log-row .assist { color:#3498db; } .log-row .gold { color:#ffd700; font-weight:700; }

.coach-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
.cs { text-align:center; } .cs b { font-size:24px; color:#43b581; display:block; } .cs span { font-size:11px; color:#8a99b0; }
.trophy-list { display:flex; flex-direction:column; gap:8px; }
.trophy { padding:9px 12px; background:rgba(255,215,0,0.1); color:#ffd700; border-radius:8px; font-size:13px; font-weight:600; }

.coach-log .log-thead, .coach-log .log-row { grid-template-columns: 56px 44px 1.4fr 60px 1fr; }
.coach-thead, .coach-row { align-items:center; }
.coach-trophy { font-size:11px; color:#ffd700; }

.end-credit { text-align:center; padding:24px; }
.end-credit p { font-size:14px; color:#9fb0c8; font-style:italic; margin-bottom:16px; }
.restart-btn { padding:13px 28px; font-size:15px; font-weight:700; background:linear-gradient(90deg,#43b581,#2ecc71); color:#07140e; border:none; border-radius:10px; cursor:pointer; }
.restart-btn.small { background:rgba(255,255,255,0.08); color:#c8d4e6; }
.coach-actions { display:flex; gap:12px; justify-content:center; }
.sim-btn { padding:13px 28px; font-size:15px; font-weight:700; background:linear-gradient(90deg,#3498db,#9b59b6); color:#fff; border:none; border-radius:10px; cursor:pointer; }

@media (max-width:600px){
  .retire-choices.retire-grid{grid-template-columns:1fr;}
  .final-stats{grid-template-columns:repeat(3,1fr);}
  .log-thead, .log-row{grid-template-columns:48px 36px 1.4fr 36px 56px 36px 36px 36px 36px;font-size:11px;}
  .coach-log .log-thead, .coach-log .log-row{grid-template-columns:40px 32px 1.2fr 50px 1fr;font-size:10px;}
}
</style>
