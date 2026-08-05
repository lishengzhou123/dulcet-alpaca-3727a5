<script setup>
import { computed } from 'vue'
import { state, startLiveIntlTournament, viewNextIntlMatch, skipRemainingLiveMatches, skipIntlTournament, proceedToNextTournament } from '../store.js'
import TeamBadge from './TeamBadge.vue'
import PlayerCard from './PlayerCard.vue'

const player = computed(() => state.player)
const liveTournament = computed(() => state.liveTournament)
const pendingTournaments = computed(() => state.intlTournaments || [])
const liveIdx = computed(() => state.liveTournamentIdx || 0)
const liveResults = computed(() => state.liveResults || [])

// 当前待开始的赛事（无直播赛事时，取待办列表第 liveIdx 项）
const currentPending = computed(() => {
  if (liveTournament.value) return null
  return pendingTournaments.value[liveIdx.value] || null
})

// 是否处于直播中
const isLive = computed(() => !!liveTournament.value)

// 直播赛事的下一场比赛信息
const nextMatch = computed(() => {
  if (!liveTournament.value) return null
  const t = liveTournament.value
  if (t.phase === 'group' && t.groupMatchIdx < t.playerGroupMatches.length) {
    return t.playerGroupMatches[t.groupMatchIdx]
  }
  if (t.phase === 'knockout' && t.knockoutIdx < t.knockoutMatches.length) {
    return t.knockoutMatches[t.knockoutIdx]
  }
  return null
})

// 直播赛事是否已结束
const liveDone = computed(() => liveTournament.value?.phase === 'done')

// 最近一场比赛结果（从 matches 末尾取）
const lastMatch = computed(() => {
  const ms = liveTournament.value?.matches || []
  return ms.length ? ms[ms.length - 1] : null
})

// 已完成的直播赛事结果（用于显示本届赛事最终结果）
const currentLiveResult = computed(() => {
  if (!liveDone.value) return null
  return liveResults.value[liveResults.value.length - 1] || null
})

// 小组赛进度信息（第X场/共3场）
const groupProgress = computed(() => {
  const t = liveTournament.value
  if (!t || t.phase !== 'group') return null
  const total = t.playerGroupMatches.length
  const current = Math.min(t.groupMatchIdx + 1, total)
  return { current, total }
})

// 阶段转换提示：小组赛结束→淘汰赛晋级 / 淘汰赛被淘汰
const phaseTransitionMsg = computed(() => {
  const t = liveTournament.value
  if (!t || !lastMatch.value) return null
  // 小组赛最后一场刚打完，已晋级淘汰赛
  if (lastMatch.value.phase === '小组赛' && t.phase === 'knockout' && t.advanced) {
    const playerTeam = t.groupTeams.find(g => g.isPlayer)
    const pos = playerTeam?.pos || 1
    return {
      type: 'advance',
      icon: '🎉',
      title: `恭喜晋级淘汰赛！`,
      desc: `小组赛${pos === 1 ? '头名' : '第二名'}出线，${t.knockoutMatches[0]?.round || '淘汰赛'}在等着你！`,
    }
  }
  // 淘汰赛被淘汰（但赛事尚未完全结束，即还有下一场要打但已出局——实际不会出现这种情况）
  // 淘汰赛最后一轮被淘汰
  if (t.phase === 'knockout' && !nextMatch.value && lastMatch.value.phase !== '小组赛' && !lastMatch.value.win) {
    return {
      type: 'eliminated',
      icon: '😞',
      title: `遗憾止步${lastMatch.value.phase}`,
      desc: `${lastMatch.value.goalsFor} : ${lastMatch.value.goalsAgainst}${lastMatch.value.penalty ? `（点球${lastMatch.value.penalty}）` : ''}不敌${lastMatch.value.opponent}，本届赛事到此结束。`,
    }
  }
  // 淘汰赛晋级下一轮
  if (t.phase === 'knockout' && lastMatch.value.phase !== '小组赛' && lastMatch.value.win && nextMatch.value) {
    return {
      type: 'advance',
      icon: '🔥',
      title: `晋级${nextMatch.value.round}！`,
      desc: `${lastMatch.value.goalsFor} : ${lastMatch.value.goalsAgainst}击败${lastMatch.value.opponent}，继续前进！`,
    }
  }
  return null
})

// 当前淘汰赛轮次名称（用于高亮当前轮次）
const currentKnockoutRound = computed(() => {
  const t = liveTournament.value
  if (!t || t.phase !== 'knockout') return null
  const m = t.knockoutMatches[t.knockoutIdx]
  return m?.round || null
})

// 赛事深度讲解库
const TOURNAMENT_GUIDES = {
  WC: {
    story: (year) => `🌍 国际足联世界杯（FIFA World Cup），每四年举办一届，是全球最高荣誉、最高规格、最高竞技水平、最高知名度的足球赛事。第${Math.round((year - 1930) / 4 + 1)}届${year}年世界杯，32支强队在一个月内为足坛至高荣耀角逐。`,
    history: '累计22届，8个国家曾捧杯：巴西(5星)、德国&意大利(4星)、阿根廷&乌拉圭&法国(2星)、英格兰&西班牙(1星)。',
    champs: ['巴西','德国','意大利','阿根廷','法国','乌拉圭','英格兰','西班牙'],
    stars: ['梅西','姆巴佩','哈兰德','贝林厄姆','维尼修斯','亚马尔'],
    darkHorses: ['摩洛哥','克罗地亚','塞内加尔','日本','澳大利亚'],
    keyMatchups: ['小组赛豪门对决','1/8决赛传统vs新锐','1/4决赛提前上演决赛','半决赛世纪对决'],
  },
  EURO: {
    story: (year) => `🏴 ${year}年欧洲足球锦标赛，24支球队展开角逐。"欧洲无弱旅"是它最好的注脚——2004年希腊神话、1992年丹麦童话、2016年葡萄牙逆袭，冷门与奇迹轮番上演。`,
    history: '创办于1960年。历届冠军：苏联(1)、西班牙(3)、意大利(2)、法国(2)、德国(3)、葡萄牙(1)、荷兰(1)、丹麦(1)、希腊(1)、捷克(1)。',
    champs: ['西班牙','德国','法国','意大利','葡萄牙','英格兰','荷兰'],
    stars: ['姆巴佩','贝林厄姆','凯恩','穆西亚拉','德布劳内','克瓦拉茨赫利亚'],
    darkHorses: ['土耳其','阿尔巴尼亚','格鲁吉亚','斯洛伐克','罗马尼亚'],
    keyMatchups: ['死亡之组突围','英法德意提前碰撞','黑马奇迹再现','决赛宿命对决'],
  },
  CA: {
    story: (year) => `🌎 ${year}年美洲杯是南美足球最高荣誉赛事。12支南美球队参赛，梅西、内马尔、维尼修斯等球星悉数登场。美洲杯是世界上历史最悠久的洲际国家队赛事（始于1916年）。`,
    history: '乌拉圭15冠居首、阿根廷16冠追平记录、巴西9冠、智利2冠、巴拉圭2冠、哥伦比亚1冠、秘鲁2冠、玻利维亚1冠。',
    champs: ['阿根廷','巴西','乌拉圭','智利','哥伦比亚'],
    stars: ['梅西','内马尔','维尼修斯','苏亚雷斯','卡瓦尼','劳塔罗'],
    darkHorses: ['巴拉圭','秘鲁','厄瓜多尔','委内瑞拉','加拿大(受邀)'],
    keyMatchups: ['阿根廷卫冕之路','巴西王者归来','乌拉圭新老交替','决赛巴阿经典对抗'],
  },
  AC: {
    story: (year) => `🏮 ${year}年亚洲杯，24支亚洲劲旅展开角逐。日本、韩国、伊朗、澳大利亚、沙特五强争冠，国足能否突围小组赛、打破"16强魔咒"成为全亚洲关注的焦点。`,
    history: '始于1956年。日本4次夺冠，沙特3冠，伊朗3冠，韩国2冠，澳大利亚1冠，卡塔尔1冠(2019)。',
    champs: ['日本','韩国','伊朗','澳大利亚','沙特阿拉伯','卡塔尔'],
    stars: ['孙兴慜','久保建英','三笘薫','金玟哉','阿兹蒙','塔雷米'],
    darkHorses: ['卡塔尔(卫冕)','越南','伊拉克','乌兹别克斯坦','泰国'],
    keyMatchups: ['东亚vs西亚抗衡','小组赛日韩相遇','16强中日对决','决赛新王加冕'],
  },
  AFCON: {
    story: (year) => `🦁 ${year}年非洲国家杯（AFCON），24支非洲球队参赛。非洲杯是世界足坛速度最快、对抗最激烈的国家队赛事之一。`,
    history: '创办于1957年。埃及7次夺冠、喀麦隆5次、加纳4次、尼日利亚3次、塞内加尔1冠(2021)、阿尔及利亚2冠、科特迪瓦2冠。',
    champs: ['埃及','塞内加尔','喀麦隆','尼日利亚','摩洛哥','科特迪瓦','阿尔及利亚','加纳'],
    stars: ['萨拉赫','马内','奥纳纳','奥斯梅恩','阿什拉夫','马赫雷斯'],
    darkHorses: ['佛得角','安哥拉','赤道几内亚','布基纳法索','纳米比亚'],
    keyMatchups: ['北非vs西非对抗','埃及冲击8冠','萨拉赫vs马内宿命对决','非洲黑马再爆冷门'],
  },
  WCQ: {
    story: (year) => `🔥 ${year}年世界杯预选赛激战正酣！各大洲的球队为了世界杯正赛的席位拼死角逐，每场比赛都是国家荣辱的代名词——绝无退路。`,
    history: '世界杯预选赛的经典记忆：1990阿根廷一球险胜以色列、2006附加赛澳大利亚点球胜乌拉圭、2022哥斯达黎加点球胜新西兰。',
    champs: ['德国','巴西','阿根廷','法国','西班牙','意大利','英格兰','荷兰'],
    stars: ['哈兰德','姆巴佩','梅西','C罗','莱万','德布劳内'],
    darkHorses: ['苏格兰','巴拿马','牙买加','埃及','秘鲁','新西兰'],
    keyMatchups: ['洲际附加赛生死战','东道主热身赛练兵','最后一轮出线奇迹','传统强队翻车夜'],
  },
  FRIENDLY: {
    story: (year) => `🤝 ${year}年国际足联国家队比赛日，是各国教练考察新人、磨合阵容的宝贵窗口。大牌球员通常只出场45-60分钟，年轻球员有望迎来国家队首秀。`,
    history: '国际友谊赛始于19世纪，著名德比：英德大战、巴阿大战、法德、西葡、日韩、英法。',
    champs: ['巴西','德国','西班牙','阿根廷','法国','英格兰','葡萄牙'],
    stars: ['（轮换阵容，青训新人出场机会）'],
    darkHorses: ['（排名30开外但主场作战的球队）'],
    keyMatchups: ['新人国家队首秀','新教练战术试验','主场球迷测试氛围','主力中场轮休'],
  },
}

function currentGuide(comp) {
  if (!comp) return null
  const code = comp.code
  if (TOURNAMENT_GUIDES[code]) return TOURNAMENT_GUIDES[code]
  const nm = (comp.name || '').toString()
  if (nm.includes('世界杯')) return TOURNAMENT_GUIDES.WC
  if (nm.includes('欧洲杯')) return TOURNAMENT_GUIDES.EURO
  if (nm.includes('美洲杯')) return TOURNAMENT_GUIDES.CA
  if (nm.includes('亚洲杯')) return TOURNAMENT_GUIDES.AC
  if (nm.includes('非洲杯')) return TOURNAMENT_GUIDES.AFCON
  return TOURNAMENT_GUIDES.FRIENDLY
}

function strengthLabel() {
  const ovr = player.value?.ovr || 60
  if (ovr >= 85) return { text: '⭐ 世界级核心', color: '#ffd700' }
  if (ovr >= 80) return { text: '🌟 国家队主力', color: '#43b581' }
  if (ovr >= 72) return { text: '🔷 轮换主力', color: '#3498db' }
  if (ovr >= 65) return { text: '🔸 边缘国脚', color: '#e67e22' }
  return { text: '🆕 新人征召', color: '#9fb0c8' }
}

function posLabel(pos) {
  const m = { 1: '🏆 冠军', 2: '🥈 亚军', 3: '🥉 季军', 4: '四强', 8: '八强', 16: '16强' }
  return m[pos] || `第${pos}名`
}

function phaseLabel(t) {
  if (!t) return ''
  if (t.phase === 'group') return '小组赛'
  if (t.phase === 'knockout') {
    const last = t.knockoutBracket[t.knockoutBracket.length - 1]
    return last?.round || '淘汰赛'
  }
  if (t.phase === 'done') return '赛事结束'
  return ''
}

function startTournament() {
  if (!currentPending.value) return
  startLiveIntlTournament(currentPending.value.comp, currentPending.value.year)
}

function watchNext() {
  viewNextIntlMatch()
}

function skipRemaining() {
  skipRemainingLiveMatches()
}

function skipAll() {
  skipIntlTournament()
}

// 当直播赛事结束时，显示结果并准备下一项
function nextTournamentOrContinue() {
  proceedToNextTournament()
}
</script>

<template>
  <div class="it-wrap" v-if="player">
    <!-- ===== 直播中：显示赛事进度 ===== -->
    <template v-if="isLive && !liveDone">
      <div class="live-hero">
        <div class="hero-row">
          <button class="skip-btn" @click="skipRemaining">跳过剩余比赛 →</button>
          <div class="hero-badge">{{ liveTournament.comp?.icon || '🌍' }}</div>
        </div>
        <h1>{{ liveTournament.comp?.name }}</h1>
        <div class="intro-year">
          {{ liveTournament.year }} 年 · <span class="phase-tag">{{ phaseLabel(liveTournament) }}</span>
          <span class="progress-tag" v-if="groupProgress">第 {{ groupProgress.current }} / {{ groupProgress.total }} 场</span>
        </div>
      </div>

      <!-- 阶段转换提示（晋级/淘汰） -->
      <div class="phase-transition" v-if="phaseTransitionMsg" :class="phaseTransitionMsg.type">
        <div class="pt-icon">{{ phaseTransitionMsg.icon }}</div>
        <div class="pt-body">
          <div class="pt-title">{{ phaseTransitionMsg.title }}</div>
          <div class="pt-desc">{{ phaseTransitionMsg.desc }}</div>
        </div>
      </div>

      <!-- 国家队横幅（卡牌式：国家队徽 + PlayerCard + 人物介绍） -->
      <div class="nation-banner">
        <!-- 顶部：国家队徽 + 国家名 -->
        <div class="nb-header">
          <TeamBadge
            :nation-name="liveTournament.playerNation"
            size="medium"
            shape="round"
          />
          <div class="nb-title">{{ liveTournament.playerNation }} 国家队</div>
        </div>

        <!-- 球员卡（国家队版） -->
        <PlayerCard
          :player="player"
          :is-nation="true"
          size="normal"
          :show-team="false"
          :show-stats="false"
          class="nb-card"
        />

        <!-- 人物介绍（卡牌下方） -->
        <div class="nb-intro">
          <div class="nb-intro-name">{{ player.name }}</div>
          <div class="nb-intro-meta">
            <b :style="{ color: strengthLabel().color }">{{ strengthLabel().text }}</b>
            <span>OVR {{ player.ovr }} · {{ player.position }}</span>
            <span>{{ player.age }}岁</span>
          </div>
        </div>
      </div>

      <!-- 当前阶段信息 -->
      <div class="live-status-card">
        <div class="lsc-row">
          <div class="lsc-item">
            <div class="lsci-label">代表国家队</div>
            <div class="lsci-val">{{ liveTournament.playerNation }}</div>
          </div>
          <div class="lsc-item">
            <div class="lsci-label">已赛场次</div>
            <div class="lsci-val">{{ liveTournament.apps }}</div>
          </div>
          <div class="lsc-item">
            <div class="lsci-label">你的进球</div>
            <div class="lsci-val gol">{{ liveTournament.playerGoals }}</div>
          </div>
          <div class="lsc-item">
            <div class="lsci-label">你的助攻</div>
            <div class="lsci-val gol">{{ liveTournament.playerAssists }}</div>
          </div>
        </div>
      </div>

      <!-- 小组赛积分榜 -->
      <div class="group-standings" v-if="liveTournament.groupTeams?.length">
        <div class="gs-title">📊 小组赛积分榜</div>
        <div class="gs-table">
          <div class="gs-header">
            <div class="gsh-pos">#</div>
            <div class="gsh-team">国家</div>
            <div class="gsh-num">赛</div>
            <div class="gsh-num">胜</div>
            <div class="gsh-num">平</div>
            <div class="gsh-num">负</div>
            <div class="gsh-num">进</div>
            <div class="gsh-num">失</div>
            <div class="gsh-num">分</div>
          </div>
          <div
            v-for="t in liveTournament.groupTeams"
            :key="t.nation"
            class="gs-row"
            :class="{ me: t.isPlayer }"
          >
            <div class="gsr-pos">{{ t.pos || '-' }}</div>
            <div class="gsr-team">
              <span class="team-flag">{{ t.isPlayer ? '⭐' : '🏳️' }}</span>
              <span class="team-name">{{ t.nation }}</span>
              <span class="me-tag" v-if="t.isPlayer">你</span>
            </div>
            <div class="gsr-num">{{ t.played }}</div>
            <div class="gsr-num win">{{ t.win }}</div>
            <div class="gsr-num draw">{{ t.draw }}</div>
            <div class="gsr-num loss">{{ t.loss }}</div>
            <div class="gsr-num">{{ t.gf }}</div>
            <div class="gsr-num">{{ t.ga }}</div>
            <div class="gsr-num pts">{{ t.points }}</div>
          </div>
        </div>
      </div>

      <!-- 淘汰赛对阵 -->
      <div class="knockout-bracket" v-if="liveTournament.knockoutBracket?.length">
        <div class="kb-title">🏆 淘汰赛征程</div>
        <div class="kb-rounds">
          <div
            v-for="(m, i) in liveTournament.knockoutBracket"
            :key="i"
            class="kb-round"
            :class="{ win: m.win, lose: !m.win, current: m.round === currentKnockoutRound }"
          >
            <div class="kb-round-label">{{ m.round }}</div>
            <div class="kb-match">
              <div class="kb-team me-team">
                <span class="kbt-flag">⭐</span>
                <span class="kbt-name">{{ liveTournament.playerNation }}</span>
              </div>
              <div class="kb-vs">VS</div>
              <div class="kb-team opp-team">
                <span class="kbt-flag">🏳️</span>
                <span class="kbt-name">{{ m.opponent }}</span>
              </div>
            </div>
            <div class="kb-score">
              <span class="score-num" :class="{ win: m.win }">{{ m.goalsFor }}</span>
              <span class="score-sep">:</span>
              <span class="score-num" :class="{ lose: m.win }">{{ m.goalsAgainst }}</span>
              <span class="score-pen" v-if="m.penalty">(点球{{ m.penalty }})</span>
            </div>
            <div class="kb-result" :class="{ win: m.win }">
              {{ m.win ? '✓ 晋级' : '✗ 止步' }}
            </div>
          </div>
        </div>
      </div>

      <!-- 上一场比赛结果 -->
      <div class="last-match" v-if="lastMatch">
        <div class="lm-title">📋 上一场比赛</div>
        <div class="lm-row" :class="{ win: lastMatch.win, lose: !lastMatch.win }">
          <div class="lm-phase">{{ lastMatch.phase }}</div>
          <div class="lm-nation-wrap my">
            <TeamBadge :nation-name="liveTournament.playerNation" size="normal" shape="round" />
            <span class="lm-nation-name my">{{ liveTournament.playerNation }}</span>
          </div>
          <div class="lm-score-box">
            <span class="lm-s my">{{ lastMatch.goalsFor }}</span>
            <span class="lm-colon">:</span>
            <span class="lm-s opp">{{ lastMatch.goalsAgainst }}</span>
            <div class="lm-result" :class="lastMatch.win ? 'win' : 'lose'">{{ lastMatch.win ? '✓' : '✗' }}</div>
          </div>
          <div class="lm-nation-wrap opp">
            <TeamBadge :nation-name="lastMatch.opponent" size="normal" shape="round" />
            <span class="lm-nation-name opp">{{ lastMatch.opponent }}</span>
          </div>
          <div class="lm-contrib" v-if="lastMatch.playerGoals || lastMatch.playerAssists">
            <span v-if="lastMatch.playerGoals">⚽ {{ lastMatch.playerGoals }}</span>
            <span v-if="lastMatch.playerAssists">🅰️ {{ lastMatch.playerAssists }}</span>
          </div>
        </div>
      </div>

      <!-- 观看下一场 / 跳过（FC26 风格双队徽对阵，精简） -->
      <div class="live-actions" v-if="nextMatch">
        <div class="next-match-fixture">
          <div class="nmf-team home">
            <TeamBadge :nation-name="nextMatch.homeNation" size="medium" shape="round" />
            <div class="nmf-name">{{ nextMatch.homeNation }}</div>
          </div>
          <div class="nmf-center">
            <div class="nmf-round">{{ nextMatch.round || phaseLabel(liveTournament) }}</div>
            <div class="nmf-vs">VS</div>
          </div>
          <div class="nmf-team away">
            <TeamBadge :nation-name="nextMatch.awayNation" size="medium" shape="round" />
            <div class="nmf-name">{{ nextMatch.awayNation }}</div>
          </div>
        </div>
        <div class="nmf-btns">
          <button class="watch-btn" @click="watchNext">📺 观看直播</button>
          <button class="skip-mini-btn" @click="skipRemaining">跳过 ⏭</button>
        </div>
      </div>
    </template>

    <!-- ===== 赛事结束：显示最终结果 ===== -->
    <template v-else-if="liveDone && currentLiveResult">
      <div class="result-hero">
        <div class="rh-icon" :class="{ gold: currentLiveResult.finalPos === 1 }">
          {{ currentLiveResult.finalPos === 1 ? '🏆' : currentLiveResult.finalPos === 2 ? '🥈' : currentLiveResult.finalPos === 3 ? '🥉' : liveTournament?.comp?.icon || '🌍' }}
        </div>
        <h2>{{ posLabel(currentLiveResult.finalPos) }}</h2>
        <div class="rh-comp">{{ liveTournament?.comp?.name }} · {{ liveTournament?.year }}</div>
        <div class="rh-nation">代表 {{ currentLiveResult.playerNation }}</div>
      </div>

      <!-- 小组赛积分榜 -->
      <div class="group-standings" v-if="currentLiveResult.groupStandings?.length">
        <div class="gs-title">📊 小组赛积分榜</div>
        <div class="gs-table">
          <div class="gs-header">
            <div class="gsh-pos">#</div>
            <div class="gsh-team">国家</div>
            <div class="gsh-num">赛</div>
            <div class="gsh-num">胜</div>
            <div class="gsh-num">平</div>
            <div class="gsh-num">负</div>
            <div class="gsh-num">进</div>
            <div class="gsh-num">失</div>
            <div class="gsh-num">分</div>
          </div>
          <div
            v-for="t in currentLiveResult.groupStandings"
            :key="t.nation"
            class="gs-row"
            :class="{ me: t.isPlayer, qualified: t.pos <= 2 }"
          >
            <div class="gsr-pos">
              <span class="pos-mark" :class="t.pos <= 2 ? 'q' : 'out'">{{ t.pos }}</span>
            </div>
            <div class="gsr-team">
              <span class="team-flag">{{ t.isPlayer ? '⭐' : '🏳️' }}</span>
              <span class="team-name">{{ t.nation }}</span>
            </div>
            <div class="gsr-num">{{ t.played }}</div>
            <div class="gsr-num win">{{ t.win }}</div>
            <div class="gsr-num draw">{{ t.draw }}</div>
            <div class="gsr-num loss">{{ t.loss }}</div>
            <div class="gsr-num">{{ t.gf }}</div>
            <div class="gsr-num">{{ t.ga }}</div>
            <div class="gsr-num pts">{{ t.points }}</div>
          </div>
        </div>
      </div>

      <!-- 淘汰赛对阵 -->
      <div class="knockout-bracket" v-if="currentLiveResult.knockoutBracket?.length">
        <div class="kb-title">🏆 淘汰赛征程</div>
        <div class="kb-rounds">
          <div
            v-for="(m, i) in currentLiveResult.knockoutBracket"
            :key="i"
            class="kb-round"
            :class="{ win: m.win, lose: !m.win }"
          >
            <div class="kb-round-label">{{ m.round }}</div>
            <div class="kb-match">
              <div class="kb-team me-team"><span class="kbt-flag">⭐</span><span class="kbt-name">{{ currentLiveResult.playerNation }}</span></div>
              <div class="kb-vs">VS</div>
              <div class="kb-team opp-team"><span class="kbt-flag">🏳️</span><span class="kbt-name">{{ m.opponent }}</span></div>
            </div>
            <div class="kb-score">
              <span class="score-num" :class="{ win: m.win }">{{ m.goalsFor }}</span>
              <span class="score-sep">:</span>
              <span class="score-num" :class="{ lose: m.win }">{{ m.goalsAgainst }}</span>
            </div>
            <div class="kb-result" :class="{ win: m.win }">{{ m.win ? '✓' : '✗' }}</div>
          </div>
        </div>
      </div>

      <!-- 玩家数据 -->
      <div class="player-stats" v-if="currentLiveResult">
        <div class="ps-title">📊 你的数据</div>
        <div class="ps-grid">
          <div class="ps-item"><b>{{ currentLiveResult.apps }}</b><span>出场</span></div>
          <div class="ps-item"><b>{{ currentLiveResult.playerGoals }}</b><span>进球</span></div>
          <div class="ps-item"><b>{{ currentLiveResult.playerAssists }}</b><span>助攻</span></div>
        </div>
      </div>

      <!-- 荣誉 -->
      <div class="honors-section" v-if="currentLiveResult.honor || currentLiveResult.individualHonor">
        <div class="hs-title">🏅 荣誉</div>
        <div v-if="currentLiveResult.honor" class="honor-row gold">
          <span class="h-medal">{{ currentLiveResult.honor.tier === 'gold' ? '🥇' : currentLiveResult.honor.tier === 'silver' ? '🥈' : '🥉' }}</span>
          <span>{{ currentLiveResult.honor.text }}</span>
        </div>
        <div v-if="currentLiveResult.individualHonor" class="honor-row gold">
          <span class="h-medal">{{ currentLiveResult.individualHonor.tier === 'gold' ? '🥇' : '🥈' }}</span>
          <span>{{ currentLiveResult.individualHonor.text }}</span>
        </div>
      </div>

      <button class="next-btn" @click="nextTournamentOrContinue">
        {{ liveIdx + 1 < pendingTournaments.length ? '下一项赛事 →' : '继续职业生涯 →' }}
      </button>
    </template>

    <!-- ===== 介绍阶段：显示赛事讲解 ===== -->
    <template v-else-if="currentPending">
      <div class="intro-hero">
        <div class="hero-row">
          <button class="skip-btn" @click="skipAll">跳过国际赛事 →</button>
          <div class="hero-badge">{{ currentPending.comp?.icon || '🌍' }}</div>
        </div>
        <h1>{{ currentPending.comp?.name || '国际赛事' }}</h1>
        <div class="intro-year">{{ currentPending.year }} 年</div>
      </div>

      <div class="comp-card" v-if="currentPending.comp">
        <div class="comp-banner" :style="{ background: `linear-gradient(135deg, ${currentPending.comp.color || '#43b581'}44, transparent)` }">
          <div class="comp-icon">{{ currentPending.comp.icon }}</div>
          <div class="comp-info">
            <div class="comp-name">{{ currentPending.comp.name }}</div>
            <div class="comp-desc">{{ currentPending.comp.desc }}</div>
            <div class="comp-meta">
              <span class="meta-tag">{{ currentPending.comp.confederation }}</span>
              <span class="meta-tag" v-if="currentPending.comp.tier === 'gold'">⭐ 顶级赛事</span>
              <span class="meta-tag" v-else-if="currentPending.comp.tier === 'silver'">🏆 二级赛事</span>
              <span class="meta-tag" v-else>🌱 三级赛事</span>
            </div>
          </div>
        </div>

        <div class="nation-banner">
          <div class="nb-left">
            <div class="nb-label">你将代表</div>
            <div class="nb-nation">{{ player.nationality }}</div>
          </div>
          <div class="nb-right">
            <div class="nb-label">球员状态</div>
            <div class="nb-ovr">OVR {{ player.ovr }}</div>
          </div>
        </div>

        <div class="rounds-info">
          <div class="ri-title">赛事阶段</div>
          <div class="ri-rounds">
            <span v-for="(r, i) in currentPending.comp.rounds" :key="i" class="round-chip">{{ r }}</span>
          </div>
        </div>

        <!-- 赛事深度讲解 -->
        <div class="tour-guide" v-if="currentGuide(currentPending.comp)">
          <div class="tg-section">
            <div class="tg-label">📖 赛事故事</div>
            <p class="tg-story">{{ currentGuide(currentPending.comp).story(currentPending.year) }}</p>
          </div>
          <div class="tg-section" v-if="currentGuide(currentPending.comp).history">
            <div class="tg-label">🏛️ 历史荣誉</div>
            <p class="tg-history">{{ currentGuide(currentPending.comp).history }}</p>
          </div>

          <div class="tg-grid">
            <div class="tg-item">
              <div class="tgi-label">🏆 历届冠军</div>
              <div class="tgi-chips">
                <span v-for="c in currentGuide(currentPending.comp).champs.slice(0, 6)" :key="c" class="tgi-chip champ">{{ c }}</span>
              </div>
            </div>
            <div class="tg-item">
              <div class="tgi-label">⭐ 焦点球星</div>
              <div class="tgi-chips">
                <span v-for="s in currentGuide(currentPending.comp).stars.slice(0, 6)" :key="s" class="tgi-chip star">{{ s }}</span>
              </div>
            </div>
            <div class="tg-item">
              <div class="tgi-label">🐴 黑马之选</div>
              <div class="tgi-chips">
                <span v-for="d in currentGuide(currentPending.comp).darkHorses?.slice(0,5)" :key="d" class="tgi-chip horse">{{ d }}</span>
              </div>
            </div>
            <div class="tg-item">
              <div class="tgi-label">🔥 看点</div>
              <div class="tgi-chips">
                <span v-for="k in currentGuide(currentPending.comp).keyMatchups?.slice(0,4)" :key="k" class="tgi-chip key">{{ k }}</span>
              </div>
            </div>
          </div>

          <div class="tg-self">
            <div class="tgs-label">你在本届赛事的定位</div>
            <div class="tgs-badge" :style="{color: strengthLabel().color}">{{ strengthLabel().text }}</div>
            <p class="tgs-hint" v-if="player.ovr < 68">作为新人，争取获得出场机会、展现自己是首要目标。</p>
            <p class="tgs-hint" v-else-if="player.ovr < 78">稳定出场+贡献进球/助攻，帮助国家队走得更远。</p>
            <p class="tgs-hint" v-else-if="player.ovr < 85">你是国家队战术核心，你的发挥将决定球队上限。</p>
            <p class="tgs-hint" v-else>世界级球星！本届赛事你的目标是——捧杯+冲击金球奖！</p>
          </div>
        </div>

        <button class="play-btn" @click="startTournament">出战赛事 ⚽</button>
      </div>

      <div class="upcoming" v-if="pendingTournaments.length > 1">
        <div class="up-title">本届赛事清单 ({{ liveIdx + 1 }}/{{ pendingTournaments.length }})</div>
        <div class="up-list">
          <div v-for="(t, i) in pendingTournaments" :key="i" class="up-item" :class="{ active: i === liveIdx, done: i < liveIdx }">
            <span class="up-icon">{{ t.comp.icon }}</span>
            <span class="up-name">{{ t.comp.short }}</span>
            <span class="up-year">{{ t.year }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.it-wrap { max-width: 720px; margin: 0 auto; padding: 16px; display: flex; flex-direction: column; gap: 16px; }

/* ===== 通用 ===== */
.intro-hero, .live-hero { text-align: center; padding: 12px 0; }
.hero-row { display: flex; align-items: center; justify-content: space-between; }
.skip-btn { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #c8d4e6; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; }
.skip-btn:hover { background: rgba(255,255,255,0.1); }
.hero-badge { font-size: 40px; }
.intro-hero h1, .live-hero h1 { font-size: 24px; margin: 6px 0; color: #fff; background: linear-gradient(90deg,#ffd700,#43b581); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.intro-year { font-size: 14px; color: #9fb0c8; }
.phase-tag { color: #43b581; font-weight: 700; }
.progress-tag { color: #ffd700; font-weight: 700; margin-left: 8px; padding: 2px 8px; border-radius: 6px; background: rgba(255,215,0,0.1); font-size: 12px; }

/* ===== 阶段转换提示（晋级/淘汰） ===== */
.phase-transition { display: flex; align-items: center; gap: 14px; padding: 14px 16px; border-radius: 12px; }
.phase-transition.advance { background: linear-gradient(90deg, rgba(67,181,129,0.15), rgba(52,152,219,0.08)); border-left: 4px solid #43b581; }
.phase-transition.eliminated { background: linear-gradient(90deg, rgba(231,76,60,0.15), rgba(230,126,34,0.08)); border-left: 4px solid #e74c3c; }
.pt-icon { font-size: 32px; flex-shrink: 0; }
.pt-body { flex: 1; }
.pt-title { font-size: 16px; font-weight: 800; color: #fff; margin-bottom: 4px; }
.phase-transition.advance .pt-title { color: #43b581; }
.phase-transition.eliminated .pt-title { color: #e74c3c; }
.pt-desc { font-size: 13px; color: #c8d4e6; line-height: 1.6; }

/* ===== 赛事介绍卡 ===== */
.comp-card { background: linear-gradient(160deg,#1a2332,#0f1620); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px; display: flex; flex-direction: column; gap: 14px; }
.comp-banner { display: flex; gap: 14px; padding: 14px; border-radius: 10px; align-items: center; }
.comp-icon { font-size: 48px; }
.comp-info { flex: 1; }
.comp-name { font-size: 18px; font-weight: 800; color: #fff; }
.comp-desc { font-size: 12px; color: #9fb0c8; margin-top: 4px; line-height: 1.6; }
.comp-meta { display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap; }
.meta-tag { font-size: 10px; padding: 3px 8px; border-radius: 6px; background: rgba(255,215,0,0.12); color: #ffd700; font-weight: 600; }

.nation-banner { display: flex; justify-content: space-between; padding: 12px 14px; background: rgba(67,181,129,0.08); border-left: 3px solid #43b581; border-radius: 8px; }
.nb-label { font-size: 11px; color: #8a99b0; }
.nb-nation { font-size: 18px; font-weight: 800; color: #fff; margin-top: 2px; }
.nb-ovr { font-size: 18px; font-weight: 800; color: #43b581; margin-top: 2px; text-align: right; }

.rounds-info { padding: 0 2px; }
.ri-title { font-size: 12px; color: #8a99b0; margin-bottom: 6px; }
.ri-rounds { display: flex; gap: 6px; flex-wrap: wrap; }
.round-chip { font-size: 11px; padding: 4px 10px; border-radius: 6px; background: rgba(255,255,255,0.05); color: #c8d4e6; }

.tour-guide { padding: 4px 2px; display: flex; flex-direction: column; gap: 10px; }
.tg-section { padding: 10px 12px; background: rgba(255,255,255,0.03); border-radius: 10px; }
.tg-label { font-size: 11px; color: #ffd700; font-weight: 800; margin-bottom: 6px; }
.tg-story, .tg-history { margin: 0; font-size: 12px; color: #c8d4e6; line-height: 1.7; }

.tg-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.tg-item { padding: 10px 12px; background: rgba(255,255,255,0.03); border-radius: 10px; }
.tgi-label { font-size: 11px; color: #43b581; font-weight: 700; margin-bottom: 6px; }
.tgi-chips { display: flex; gap: 5px; flex-wrap: wrap; }
.tgi-chip { font-size: 10px; padding: 3px 8px; border-radius: 5px; font-weight: 600; }
.tgi-chip.champ { background: linear-gradient(90deg,#ffd70033,#ffd70011); color: #ffd700; border: 1px solid rgba(255,215,0,0.3); }
.tgi-chip.star { background: rgba(52,152,219,0.15); color: #3498db; border: 1px solid rgba(52,152,219,0.3); }
.tgi-chip.horse { background: rgba(155,89,182,0.15); color: #9b59b6; border: 1px solid rgba(155,89,182,0.3); }
.tgi-chip.key { background: rgba(230,126,34,0.15); color: #e67e22; border: 1px solid rgba(230,126,34,0.3); }

.tg-self { padding: 12px; border-radius: 10px; background: linear-gradient(90deg, rgba(67,181,129,0.12), rgba(52,152,219,0.08)); border-left: 3px solid #43b581; }
.tgs-label { font-size: 11px; color: #8a99b0; font-weight: 700; }
.tgs-badge { font-size: 15px; font-weight: 900; margin-top: 3px; }
.tgs-hint { margin: 6px 0 0; font-size: 12px; color: #c8d4e6; line-height: 1.6; }

.play-btn { background: linear-gradient(90deg,#43b581,#2ecc71); color: #07140e; border: none; padding: 12px; border-radius: 10px; font-size: 15px; font-weight: 800; cursor: pointer; transition: transform 0.15s; }
.play-btn:hover { transform: translateY(-1px); }

.upcoming { background: rgba(255,255,255,0.03); border-radius: 10px; padding: 12px; }
.up-title { font-size: 12px; color: #8a99b0; margin-bottom: 8px; }
.up-list { display: flex; flex-direction: column; gap: 4px; }
.up-item { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 6px; font-size: 12px; color: #9fb0c8; }
.up-item.active { background: rgba(67,181,129,0.15); color: #43b581; font-weight: 700; }
.up-item.done { opacity: 0.5; }
.up-icon { font-size: 14px; }
.up-year { margin-left: auto; font-size: 11px; }

/* ===== 直播状态卡 ===== */
.live-status-card { background: linear-gradient(160deg,#1a2332,#0f1620); border: 1px solid rgba(67,181,129,0.2); border-radius: 12px; padding: 14px; }
.lsc-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; }
.lsc-item { text-align: center; }
.lsci-label { font-size: 10px; color: #8a99b0; }
.lsci-val { font-size: 20px; font-weight: 800; color: #fff; margin-top: 2px; }
.lsci-val.gol { color: #ffd700; }

/* ===== 国家队横幅（卡牌式：顶部队徽 + 中部 PlayerCard + 底部介绍） ===== */
.nation-banner {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  padding: 14px 12px; margin-bottom: 12px;
  background: linear-gradient(135deg, rgba(155,89,182,0.1), rgba(52,152,219,0.04));
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
}
.nb-header {
  display: flex; align-items: center; gap: 10px;
  width: 100%;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.nb-title { font-size: 14px; font-weight: 800; color: #fff; }
.nb-card { margin: 0 auto; }
.nb-intro {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  text-align: center;
}
.nb-intro-name { font-size: 15px; font-weight: 800; color: #fff; }
.nb-intro-meta {
  display: flex; flex-wrap: wrap; justify-content: center; gap: 8px;
  font-size: 11px; color: #9fb0c8;
}
.nb-intro-meta b { font-weight: 800; font-size: 12px; }
.nb-intro-meta span { display: inline-flex; align-items: center; }

/* ===== 上一场结果 ===== */
.last-match { background: rgba(255,255,255,0.03); border-radius: 12px; padding: 14px; }
.lm-title { font-size: 13px; font-weight: 800; color: #c8d4e6; margin-bottom: 10px; }
.lm-row {
  display: grid;
  grid-template-columns: 64px 1fr 120px 1fr 70px;
  gap: 10px; align-items: center;
  padding: 10px 12px; border-radius: 10px; font-size: 12px;
}
.lm-row.win { background: linear-gradient(90deg, rgba(67,181,129,0.12), rgba(67,181,129,0.04)); }
.lm-row.lose { background: linear-gradient(90deg, rgba(231,76,60,0.12), rgba(231,76,60,0.04)); }
.lm-phase { font-size: 11px; color: #8a99b0; font-weight: 700; }
.lm-nation-wrap { display: flex; align-items: center; gap: 8px; }
.lm-nation-wrap.my { justify-content: flex-end; }
.lm-nation-name { font-weight: 700; color: #fff; font-size: 13px; }
.lm-nation-name.opp { color: #c8d4e6; }
.lm-score-box {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  position: relative;
  background: rgba(0,0,0,0.2);
  border-radius: 8px; padding: 6px 8px;
}
.lm-s { font-family: 'Arial Black', sans-serif; font-size: 18px; font-weight: 900; color: #fff; }
.lm-s.my { color: #43b581; }
.lm-s.opp { color: #e74c3c; }
.lm-colon { color: #ffd700; font-weight: 900; font-size: 18px; }
.lm-result {
  position: absolute; top: -8px; right: -8px;
  width: 22px; height: 22px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 900; font-size: 12px;
}
.lm-result.win { background: #43b581; color: #fff; }
.lm-result.lose { background: #e74c3c; color: #fff; }
.lm-contrib {
  font-size: 11px; color: #ffd700;
  display: flex; flex-direction: column; gap: 3px; align-items: flex-end;
}

/* ===== 直播操作区（FC26 风格双队徽对阵，精简） ===== */
.live-actions { background: linear-gradient(160deg,#1a2332,#0f1620); border: 1px solid rgba(52,152,219,0.15); border-radius: 10px; padding: 12px; display: flex; flex-direction: column; gap: 10px; }
.next-match-fixture {
  display: grid; grid-template-columns: 1fr auto 1fr; gap: 8px; align-items: center;
  padding: 10px;
  background: linear-gradient(90deg, rgba(67,181,129,0.06), rgba(52,152,219,0.06));
  border-radius: 8px;
}
.nmf-team { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.nmf-team.home { align-items: flex-end; }
.nmf-team.away { align-items: flex-start; }
.nmf-name { font-weight: 700; color: #fff; font-size: 12px; }
.nmf-center { display: flex; flex-direction: column; align-items: center; gap: 3px; }
.nmf-round { font-size: 10px; color: #ffd700; font-weight: 700; padding: 1px 6px; border-radius: 4px; background: rgba(255,215,0,0.1); }
.nmf-vs {
  font-family: 'Arial Black', sans-serif; font-size: 16px; font-weight: 900;
  color: #e74c3c; letter-spacing: 1px;
}
.nmf-btns { display: flex; gap: 8px; }
.watch-btn {
  flex: 1;
  background: linear-gradient(90deg,#e74c3c,#e67e22);
  color: #fff; border: none; padding: 10px; border-radius: 8px;
  font-size: 13px; font-weight: 700; cursor: pointer;
  transition: transform 0.15s;
}
.watch-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(231,76,60,0.3); }
.skip-mini-btn {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  color: #9fb0c8; padding: 10px 14px;
  border-radius: 8px; cursor: pointer;
  font-size: 11px; font-weight: 700;
  transition: background 0.15s;
}
.skip-mini-btn:hover { background: rgba(255,255,255,0.1); }

/* ===== 小组赛积分榜 ===== */
.group-standings { background: rgba(255,255,255,0.03); border-radius: 10px; padding: 12px; }
.gs-title { font-size: 13px; font-weight: 800; color: #c8d4e6; margin-bottom: 10px; }
.gs-table { display: flex; flex-direction: column; gap: 2px; }
.gs-header { display: grid; grid-template-columns: 30px 1.6fr repeat(7, 32px); gap: 4px; padding: 6px 8px; background: rgba(255,255,255,0.05); border-radius: 6px; font-size: 10px; color: #8a99b0; font-weight: 700; text-align: center; }
.gsh-team { text-align: left; }
.gs-row { display: grid; grid-template-columns: 30px 1.6fr repeat(7, 32px); gap: 4px; padding: 8px; border-radius: 6px; font-size: 12px; align-items: center; background: rgba(255,255,255,0.02); }
.gs-row.me { background: rgba(67,181,129,0.12); border-left: 3px solid #43b581; }
.gsr-pos { text-align: center; }
.pos-mark { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 4px; font-size: 11px; font-weight: 800; }
.pos-mark.q { background: rgba(67,181,129,0.3); color: #43b581; }
.pos-mark.out { background: rgba(231,76,60,0.2); color: #e74c3c; }
.gsr-team { display: flex; align-items: center; gap: 4px; color: #c8d4e6; font-weight: 600; }
.team-flag { font-size: 13px; }
.team-name { font-size: 12px; }
.me-tag { font-size: 9px; padding: 1px 5px; border-radius: 3px; background: #43b581; color: #07140e; font-weight: 800; margin-left: 2px; }
.gsr-num { text-align: center; color: #c8d4e6; font-size: 12px; }
.gsr-num.win { color: #43b581; }
.gsr-num.draw { color: #ffd700; }
.gsr-num.loss { color: #e74c3c; }
.gsr-num.pts { color: #fff; font-weight: 800; }

/* ===== 淘汰赛 ===== */
.knockout-bracket { background: linear-gradient(160deg,#1a2332,#0f1620); border: 1px solid rgba(255,215,0,0.15); border-radius: 10px; padding: 12px; }
.kb-title { font-size: 13px; font-weight: 800; color: #ffd700; margin-bottom: 10px; }
.kb-rounds { display: flex; flex-direction: column; gap: 8px; }
.kb-round { display: grid; grid-template-columns: 70px 1fr 80px 50px; gap: 8px; padding: 10px; border-radius: 8px; align-items: center; background: rgba(255,255,255,0.03); border-left: 3px solid #43b581; }
.kb-round.lose { border-left-color: #e74c3c; background: rgba(231,76,60,0.05); }
.kb-round.current { border-left-color: #ffd700; background: rgba(255,215,0,0.08); box-shadow: 0 0 12px rgba(255,215,0,0.15); }
.kb-round-label { font-size: 11px; font-weight: 800; color: #ffd700; text-align: center; }
.kb-match { display: flex; align-items: center; gap: 8px; }
.kb-team { display: flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 6px; font-size: 12px; flex: 1; }
.kb-team.me-team { background: rgba(67,181,129,0.1); }
.kb-team.opp-team { background: rgba(231,76,60,0.08); }
.kbt-flag { font-size: 13px; }
.kbt-name { color: #e8eef7; font-weight: 700; font-size: 12px; }
.kb-vs { font-size: 10px; color: #8a99b0; font-weight: 800; }
.kb-score { display: flex; align-items: center; justify-content: center; gap: 4px; }
.score-num { font-size: 16px; font-weight: 800; color: #c8d4e6; }
.score-num.win { color: #43b581; }
.score-num.lose { color: #e74c3c; }
.score-sep { color: #8a99b0; font-size: 14px; }
.score-pen { font-size: 10px; color: #9fb0c8; margin-left: 4px; }
.kb-result { font-size: 11px; font-weight: 800; text-align: center; }
.kb-result.win { color: #43b581; }
.kb-result:not(.win) { color: #e74c3c; }

/* ===== 结果页 ===== */
.result-hero { text-align: center; padding: 20px; background: linear-gradient(160deg,#1a2332,#0f1620); border-radius: 14px; border: 1px solid rgba(255,215,0,0.2); }
.rh-icon { font-size: 56px; }
.rh-icon.gold { animation: glow 1.5s infinite; }
@keyframes glow { 0%,100% { filter: drop-shadow(0 0 4px #ffd700); } 50% { filter: drop-shadow(0 0 16px #ffd700); } }
.result-hero h2 { font-size: 26px; margin: 8px 0; color: #ffd700; font-weight: 900; }
.rh-comp { font-size: 13px; color: #c8d4e6; }
.rh-nation { font-size: 12px; color: #9fb0c8; margin-top: 4px; }

.player-stats { background: rgba(255,255,255,0.03); border-radius: 10px; padding: 12px; }
.ps-title { font-size: 13px; font-weight: 800; color: #c8d4e6; margin-bottom: 8px; }
.ps-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; }
.ps-item { text-align: center; background: rgba(255,255,255,0.04); padding: 10px 4px; border-radius: 8px; }
.ps-item b { display: block; font-size: 22px; color: #43b581; font-weight: 800; }
.ps-item span { font-size: 11px; color: #8a99b0; }

.honors-section { background: linear-gradient(90deg,rgba(255,215,0,0.1),transparent); border-left: 3px solid #ffd700; border-radius: 8px; padding: 12px; }
.hs-title { font-size: 13px; font-weight: 800; color: #ffd700; margin-bottom: 8px; }
.honor-row { display: flex; align-items: center; gap: 8px; padding: 6px 0; font-size: 13px; color: #fff; font-weight: 600; }
.h-medal { font-size: 18px; }

.next-btn { background: linear-gradient(90deg,#3498db,#43b581); color: #fff; border: none; padding: 12px; border-radius: 10px; font-size: 15px; font-weight: 800; cursor: pointer; }
.next-btn:hover { transform: translateY(-1px); }

/* ===== 移动端响应式 ===== */
.it-wrap { padding: 12px; }
@media (max-width: 600px) {
  .it-wrap { padding: 8px; }
  .live-hero h1, .intro-hero h1 { font-size: 18px; }
  .nation-banner { padding: 10px; }
  .nb-header { padding-bottom: 8px; }
  /* 国家队横幅卡牌缩小 */
  :deep(.nb-card) { transform: scale(0.92); transform-origin: top center; }
  /* 积分榜横向滚动 + 字号缩小 */
  .group-standings { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .gs-table { min-width: 320px; }
  .gs-header, .gs-row {
    grid-template-columns: 24px 1.4fr repeat(7, 26px);
    gap: 2px; padding: 5px 4px; font-size: 10px;
  }
  /* 淘汰赛对阵表紧凑 */
  .kb-round {
    grid-template-columns: 56px 1fr 60px 40px;
    gap: 5px; padding: 8px 6px; font-size: 11px;
  }
  /* live-status-card 2列 */
  .lsc-row { grid-template-columns: 1fr 1fr !important; gap: 6px; }
  /* 底部按钮全宽 */
  .live-actions button, .next-btn, .play-btn { width: 100%; }
}
</style>
