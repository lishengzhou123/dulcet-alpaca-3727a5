<script setup>
import { computed, ref, onMounted } from 'vue'
import { state, openAwardsNext, proceedAfterSummary } from '../store.js'

const awards = computed(() => state.seasonAwards || [])
const player = computed(() => state.player)
const year = computed(() => state.season?.year || (player.value ? player.value.birthYear + player.value.age : '—'))

// 分类显示
const individualAwards = computed(() => awards.value.filter(a => a.type === 'individual' || a.category === 'ballondor' || a.category === 'thebest' || a.category === 'fifpro' || a.category === 'europeangolden' || a.category === 'uefaplayer'))
const teamAwards = computed(() => awards.value.filter(a => a.type === 'team'))
const intlAwards = computed(() => awards.value.filter(a => a.type === 'continental' || a.type === 'world'))

// 逐张展示动画
const showing = ref(0)
const allShown = computed(() => showing.value >= awards.value.length)

onMounted(() => {
  // 每张卡片间隔 600ms 出现
  if (awards.value.length > 0) {
    const interval = setInterval(() => {
      showing.value++
      if (showing.value >= awards.value.length) clearInterval(interval)
    }, 550)
  }
})

function tierClass(tier) { return { gold: tier === 'gold', silver: tier === 'silver', bronze: tier === 'bronze' } }

function openAll() { showing.value = awards.value.length }
</script>

<template>
  <div class="awards-wrap">
    <div class="awards-hero">
      <div class="awards-badge">🏆</div>
      <h1>{{ year }} 赛季颁奖盛典</h1>
      <p class="sub">恭喜 <b>{{ player.name }}</b>！本赛季你收获了 {{ awards.length }} 项荣誉，继续努力！</p>
    </div>

    <div v-if="!awards.length" class="no-awards">
      <div class="na-icon">😔</div>
      <p>本赛季没能赢得任何荣誉。</p>
      <p class="na-sub">下赛季争取更好的表现，冠军和奖杯在向你招手！</p>
    </div>

    <template v-else>
      <!-- 个人荣誉（最重量级） -->
      <div v-if="individualAwards.length" class="awards-section">
        <div class="section-title">⭐ 个人奖项</div>
        <div class="awards-grid">
          <div v-for="(a, i) in individualAwards" :key="'p'+i"
            class="award-card" :class="tierClass(a.tier)"
            :style="{ opacity: i < showing ? 1 : 0, transform: i < showing ? 'translateY(0)' : 'translateY(30px)' }">
            <div class="ac-icon">{{ a.icon || '🏆' }}</div>
            <div class="ac-name">{{ a.text }}</div>
            <div v-if="a.season" class="ac-season">{{ a.season }}赛季</div>
            <div v-if="a.prestige" class="ac-prestige">历史声望 +{{ a.prestige }}</div>
          </div>
        </div>
      </div>

      <!-- 团队荣誉 -->
      <div v-if="teamAwards.length" class="awards-section">
        <div class="section-title">🛡️ 团队荣誉</div>
        <div class="awards-grid">
          <div v-for="(a, i) in teamAwards" :key="'t'+i"
            class="award-card team-card" :class="tierClass(a.tier)"
            :style="{ opacity: i + individualAwards.length < showing ? 1 : 0, transform: i + individualAwards.length < showing ? 'translateY(0)' : 'translateY(30px)' }">
            <div class="ac-icon">{{ a.icon || '🏆' }}</div>
            <div class="ac-name">{{ a.text }}</div>
            <div class="ac-season" v-if="a.season">{{ a.season }}赛季</div>
          </div>
        </div>
      </div>

      <!-- 洲际/世界级荣誉 -->
      <div v-if="intlAwards.length" class="awards-section">
        <div class="section-title">🌍 洲际与世界级</div>
        <div class="awards-grid">
          <div v-for="(a, i) in intlAwards" :key="'i'+i"
            class="award-card world-card" :class="tierClass(a.tier)"
            :style="{ opacity: i + individualAwards.length + teamAwards.length < showing ? 1 : 0 }">
            <div class="ac-icon">{{ a.icon || '🏆' }}</div>
            <div class="ac-name">{{ a.text }}</div>
            <div class="ac-season" v-if="a.season">{{ a.season }}赛季</div>
          </div>
        </div>
      </div>

      <button v-if="!allShown" class="skip-show" @click="openAll">跳过动画，全部展示 →</button>
    </template>

    <div class="awards-actions">
      <button class="next-btn" @click="openAwardsNext">继续 ▶</button>
    </div>
  </div>
</template>

<style scoped>
.awards-wrap { display:flex; flex-direction:column; gap:18px; padding:10px 0 30px; }
.awards-hero { text-align:center; padding:18px 10px 10px; }
.awards-badge { font-size:56px; }
.awards-hero h1 { margin:6px 0; font-size:26px; background:linear-gradient(90deg,#ffd700,#f1c40f,#ffb700); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; }
.sub { font-size:13px; color:#9fb0c8; }
.no-awards { text-align:center; padding:50px 20px; border-radius:14px; background:rgba(255,255,255,0.03); }
.na-icon { font-size:48px; } .no-awards p { margin:6px 0; color:#c8d4e6; }
.na-sub { font-size:12px; color:#8a99b0; }

.awards-section { display:flex; flex-direction:column; gap:10px; }
.section-title { font-size:15px; font-weight:800; color:#e8eef7; padding:0 4px; border-left:3px solid #ffd700; padding-left:10px; }
.awards-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }

.award-card {
  position:relative; padding:18px 12px; border-radius:14px; text-align:center;
  border:1px solid rgba(255,255,255,0.1); transition:all 0.45s cubic-bezier(.4,1.5,.5,1);
  background:linear-gradient(160deg,#162031,#0d141e);
}
.award-card.gold {
  background:linear-gradient(160deg,#3a2a00 0%,#1a1200 100%);
  border:1px solid rgba(255,215,0,0.4);
  box-shadow:0 0 18px rgba(255,215,0,0.15);
}
.award-card.silver {
  background:linear-gradient(160deg,#1e2532 0%,#0d141e 100%);
  border:1px solid rgba(180,190,210,0.35);
}
.award-card.bronze {
  background:linear-gradient(160deg,#2a1e10 0%,#15110a 100%);
  border:1px solid rgba(205,127,50,0.4);
}
.award-card.world-card {
  background:linear-gradient(160deg,#0a2038 0%,#050e18 100%);
  border:1px solid rgba(52,152,219,0.4);
}
.award-card.team-card {
  background:linear-gradient(160deg,#0f2b22 0%,#081915 100%);
  border:1px solid rgba(67,181,129,0.4);
}

.ac-icon { font-size:32px; margin-bottom:6px; }
.award-card.gold .ac-icon { filter:drop-shadow(0 0 6px rgba(255,215,0,0.5)); }
.ac-name { font-size:13px; font-weight:700; color:#e8eef7; line-height:1.4; }
.ac-season { font-size:11px; color:#8a99b0; margin-top:4px; }
.ac-prestige { font-size:11px; color:#ffd700; margin-top:6px; font-weight:700; }

.skip-show {
  align-self:center; padding:8px 20px; font-size:12px; border-radius:20px;
  background:rgba(255,255,255,0.06); color:#9fb0c8; border:1px solid rgba(255,255,255,0.1); cursor:pointer;
}
.awards-actions { display:flex; justify-content:center; padding:10px; }
.next-btn { padding:13px 44px; font-size:15px; font-weight:700; background:linear-gradient(90deg,#43b581,#2ecc71); color:#07140e; border:none; border-radius:10px; cursor:pointer; }

@media (max-width:600px){
  .awards-grid{grid-template-columns:1fr 1fr;}
  .award-card{padding:14px 8px;}
}
</style>
