// 事件模板库 —— 细腻叙事 + 多决策选项
// 每个事件是工厂函数 (ctx) => eventObj
// ctx: { player, season, opponent, team }
// effects 数值可为数字或字符串 'r1-3'(随机1~3)；引擎会解析

// ---------- 赛季前 / 训练类 ----------
export const preseasonEvents = [
  (ctx) => ({
    id: 'pre_season_camp',
    type: 'training',
    phase: 'preseason',
    title: '冬训营的第一天',
    narrative: `${ctx.player.team}的冬训营设在清冷的昆明海埂基地。清晨六点半，草皮上还凝着一层白霜，你呼出的白气在冷风里散开。主教练把全队召集到中圈，目光从每个人脸上扫过，最后停在你这个十六岁的年轻面孔上。\n\n"新赛季的竞争从这里开始。"他声音不高，却像钉子一样扎进每个人耳朵里，"谁能在冬训里多流一桶汗，谁就多一张通往首发的车票。"\n\n体能教练推过来一辆装满装备的小车，等你做选择。`,
    options: [
      { label: '魔鬼体能特训', hint: '耐力+力量大幅提升，但疲劳累积，易受伤', outcome: '你咬牙加码，每天比队友多跑五公里。两周后双腿像灌了铅，但肺活量明显上了一档。', effects: { attrs: { stamina: 'r3-4', strength: 'r1-2' }, fitness: -15, injuryRisk: 8 } },
      { label: '技术细节打磨', hint: '控球/盘带/射术小幅提升', outcome: '你留在场地加练停球与射门，脚感越来越细，皮球在脚下像粘了胶水。', effects: { attrs: { ballControl: 'r2-3', dribbling: 'r1-2', finishing: 'r1-2' }, fitness: -5 } },
      { label: '战术录像课', hint: '站位/视野提升，与教练关系+', outcome: '你泡在录像室里研究跑位，主教练路过时拍了拍你的肩："这小子有心。"', effects: { attrs: { positioning: 'r2-3', vision: 'r1-2', composure: 1 }, coachRelation: 5 } },
      { label: '适度训练，保证身体', hint: '疲劳低，状态稳，成长一般', outcome: '你按部就班完成计划，没有透支身体，但也没有格外亮眼。', effects: { attrs: { stamina: 1, reactions: 1 }, fitness: 5 } },
    ],
  }),
  (ctx) => ({
    id: 'new_training_method',
    type: 'training',
    phase: 'preseason',
    title: '神秘的训练师',
    narrative: `基地来了一位戴眼镜的中年训练师，自称曾在葡萄牙体育工作过。他手里拿着一块平板，屏幕上是你冲刺时的步频曲线。"你的蹬地角度浪费了0.1秒。"他推了推眼镜，"我有一套新方法，能让你的爆发力上一个台阶——但过程很痛苦，而且有受伤风险。你愿意试吗？"\n\n更衣室里老队员对此议论纷纷，有人说他是江湖骗子，有人说这能改变你的职业生涯。`,
    options: [
      { label: '尝试新型爆发力训练', hint: '加速大幅+，敏捷+，受伤风险', outcome: '一周的高强度蹬踏训练后，你起跑的瞬间明显更快了，但膝盖偶尔隐隐作痛。', effects: { attrs: { acceleration: 'r3-4', agility: 'r1-2', sprintSpeed: 1 }, injuryRisk: 10 } },
      { label: '只采纳部分内容', hint: '小幅提升，风险低', outcome: '你挑了几个温和的动作融入日常训练，进步不快但很踏实。', effects: { attrs: { acceleration: 'r1-2', agility: 1 } } },
      { label: '婉拒，沿用传统训练', hint: '稳妥，老队员关系+', outcome: '你谢绝了他的提议。几名老队员冲你竖起大拇指："小伙子有主见。"', effects: { attrs: { stamina: 1 }, teammateRelation: 4 } },
    ],
  }),
  (ctx) => ({
    id: 'weight_room',
    type: 'training',
    phase: 'preseason',
    title: '力量房的抉择',
    narrative: `力量房里，杠铃片碰撞的金属声此起彼伏。队医拿着你的体测报告皱起眉头："你现在的体重对抗中超后卫还差点意思。增肌能让你扛住人，但可能影响你的启动速度。你想怎么走？"\n\n镜子里的你正处于发育期，身体的每一寸都还在变化。`,
    options: [
      { label: '增肌10斤，强化对抗', hint: '力量+平衡+，冲刺速度略-', outcome: '三个月的高蛋白饮食加力量训练，你的肩膀宽了一圈，对抗时不再被轻易挤开，但启动时感觉脚下沉了些。', effects: { attrs: { strength: 'r3-4', balance: 'r1-2', jumping: 1, sprintSpeed: -1 } } },
      { label: '保持体型，强化速度', hint: '加速+敏捷+，对抗不变', outcome: '你拒绝了大重量，转而做爆发力与灵敏度训练，转身与变向更加灵活。', effects: { attrs: { acceleration: 'r2-3', agility: 'r1-2', balance: 1 } } },
      { label: '科学配比，均衡发展', hint: '全面小幅提升', outcome: '你与队医制定了均衡方案，力量与速度都稳步提升，没有明显短板。', effects: { attrs: { strength: 1, acceleration: 1, agility: 1, balance: 1 } } },
    ],
  }),
  (ctx) => ({
    id: 'footwork_drill',
    type: 'training',
    phase: 'preseason',
    title: '脚下功夫的精进',
    narrative: `助教推来一筐标志碟，在禁区前沿摆出一组S型绕桩。"前锋的脚下越细，禁区里的转身射门就越快。"他吹响哨子，"每天加练三十分钟，一个月后你的第一下触球会完全不一样。"\n\n夕阳下，皮球与标志碟碰撞的节奏声里，你看到老队员已经陆续离开。`,
    options: [
      { label: '苦练第一下触球', hint: '控球/反应+，射术+', outcome: '一个月后，你在密集防守中的停球转身明显更快了，门将都惊讶于你起脚的突然性。', effects: { attrs: { ballControl: 'r2-3', reactions: 'r1-2', finishing: 'r1-2' }, fitness: -6 } },
      { label: '专攻逆足训练', hint: '逆足能力提升，盘带+', outcome: '你重点练了非惯用脚，现在双足都能完成射门，防守人更难判断。', effects: { attrs: { dribbling: 'r1-2', balance: 1, composure: 1 }, weakFootUp: true, fitness: -5 } },
      { label: '按计划收工', hint: '体力恢复，小幅成长', outcome: '你完成基础训练就回去休息，没有额外加码。', effects: { attrs: { ballControl: 1 }, fitness: 8 } },
    ],
  }),
]

// ---------- 比赛中决策类 ----------
export const matchEvents = [
  (ctx) => ({
    id: 'match_one_on_one',
    type: 'match',
    phase: 'midseason',
    title: `单刀直入 · vs ${ctx.opponent.name}`,
    narrative: `比赛第78分钟，比分0:0。中场一记过顶长传撕裂了${ctx.opponent.name}的防线，皮球稳稳落在你脚下，你扛起最后一名后卫杀入禁区——门将弃门而出，封堵了近角。\n\n电光火石之间，全场几万人的呐喊仿佛被按下了静音键。你只有一个呼吸的时间做决定。`,
    options: [
      { label: '冷静推射远角', hint: '射术/沉着判定，进球率高', outcome: '你瞄了一眼远角，脚弓一推，皮球贴着草皮滚入网窝。门将扑救不及，全场沸腾！', effects: { attrs: { finishing: 'r1-2', composure: 'r1-2' }, goals: 1, matchRating: 2, reputation: 3, morale: 5 } },
      { label: '大力抽射近角', hint: '射门力量判定，门将可能扑出', outcome: '你抡圆右脚一记爆射，皮球带着风声砸向近角——', effects: { attrs: { shotPower: 'r1-2' }, matchRating: 0, morale: 1 } },
      { label: '过掉门将打空门', hint: '盘带/敏捷判定，高风险高回报', outcome: '你一个假动作晃倒门将，面对空门——', effects: { attrs: { dribbling: 'r1-2', agility: 1, composure: 'r1-2' }, goals: 1, matchRating: 3, reputation: 4, morale: 6 } },
      { label: '横传位置更好的队友', hint: '无私，团队+，但个人数据0', outcome: '你放弃射门，横敲给插上的队友，他轻松推射空门得手！队友冲过来抱住你。', effects: { attrs: { vision: 1, shortPassing: 'r1-2' }, assists: 1, teammateRelation: 6, matchRating: 1, morale: 3 } },
    ],
  }),
  (ctx) => ({
    id: 'match_corner_pressure',
    type: 'match',
    phase: 'midseason',
    title: `补时绝杀的机会 · vs ${ctx.opponent.name}`,
    narrative: `补时第3分钟，比分1:2落后。角球区，主罚队员把球摆在白点上，向你竖起三根手指——意思是发前点。禁区内人仰马马，两名中卫死死贴着你，胳膊肘不断顶你的腰。\n\n看台上主队球迷的歌声震耳欲聋，你的心跳声盖过了一切。这是扳平的最后机会。`,
    options: [
      { label: '强压后卫抢前点', hint: '力量/跳跃/头球判定', outcome: '你用身体扛住后卫，迎球甩头攻门——', effects: { attrs: { headingAccuracy: 'r1-2', jumping: 'r1-2', strength: 1 }, goals: 1, matchRating: 2, reputation: 4, morale: 6, fitness: -8 } },
      { label: '虚晃反跑抢后点', hint: '敏捷/站位判定，巧妙', outcome: '你突然变向摆脱盯防，杀向后点——', effects: { attrs: { positioning: 'r1-2', agility: 'r1-2', reactions: 1 }, goals: 1, matchRating: 2, reputation: 3, morale: 5 } },
      { label: '埋伏禁区外等二点', hint: '远射机会，反应判定', outcome: '你撤出禁区，等皮球被顶出来——', effects: { attrs: { longShots: 'r1-2', reactions: 'r1-2' }, matchRating: 1, morale: 1 } },
    ],
  }),
  (ctx) => ({
    id: 'match_counter_chance',
    type: 'match',
    phase: 'midseason',
    title: `反击三打三 · vs ${ctx.opponent.name}`,
    narrative: `本方半场断球，你带球狂奔四十米，身边两名队友插上，对方三名后卫且战且退。这是教科书般的反击机会，看台上的客队球迷已经站了起来。\n\n边路的队友举手要球，中路队友也在前插，而你眼前是一片开阔地。`,
    options: [
      { label: '自己长驱直入打门', hint: '盘带/远射判定，独', outcome: '你一条龙杀到禁区前沿起脚怒射——', effects: { attrs: { dribbling: 'r1-2', longShots: 'r1-2' }, matchRating: 1, morale: 2, teammateRelation: -3 } },
      { label: '直塞中路队友', hint: '视野/短传判定，助攻可能', outcome: '你脚腕一抖送出直塞，中路队友单刀——', effects: { attrs: { vision: 'r1-2', shortPassing: 'r1-2' }, assists: 1, teammateRelation: 4, matchRating: 1, morale: 3 } },
      { label: '分边再前插接应', hint: '团队配合，跑位+', outcome: '你分球给边路后高速前插，准备抢点——', effects: { attrs: { positioning: 'r1-2', stamina: 1, crossing: 1 }, teammateRelation: 5, matchRating: 1, morale: 2, fitness: -6 } },
    ],
  }),
  (ctx) => ({
    id: 'match_coach_instruction',
    type: 'match',
    phase: 'midseason',
    title: `主帅的临场指示 · vs ${ctx.opponent.name}`,
    narrative: `中场休息，更衣室里蒸汽弥漫。球队0:1落后，主帅在战术板前疾速画着箭头。"下半场你要回撤到前腰位置接球，"他指着你，"把他们的中卫带出来，给边路制造空间。"\n\n这与你习惯的中锋踢法完全不同。老队长在旁边补了一句："听教练的，团队第一。"`,
    options: [
      { label: '严格执行战术安排', hint: '视野/短传+，教练关系+', outcome: '你回撤接应，梳理进攻，球队渐渐起势。赛后教练点名表扬了你。', effects: { attrs: { vision: 'r1-2', shortPassing: 'r1-2', positioning: 1 }, coachRelation: 7, teammateRelation: 3, matchRating: 1 } },
      { label: '依旧顶在中锋位', hint: '坚持自己风格，教练关系-', outcome: '你留在禁区寻找机会，战术执行打折扣。主帅赛后把你叫到办公室谈话。', effects: { attrs: { positioning: 1 }, coachRelation: -8, matchRating: 0, morale: -3 } },
      { label: '灵活游走两个位置', hint: '高风险，可能两不讨好', outcome: '你时而回撤时而前插，踢得灵动但有些游离。', effects: { attrs: { positioning: 'r1-2', reactions: 1, composure: 1 }, coachRelation: -1, matchRating: 1 } },
    ],
  }),
  (ctx) => ({
    id: 'match_penalty_decision',
    type: 'match',
    phase: 'midseason',
    title: `点球谁来罚 · vs ${ctx.opponent.name}`,
    narrative: `比赛第85分钟，球队获得点球！比分1:1。禁区内，队内的头号点球手老队员走到了球前，但他今天状态平平，已经错失两次良机。他看了你一眼，似乎在犹豫要不要让给你。\n\n你全场比赛表现活跃，脚风正顺。主裁在催促，全场目光聚焦在点球点。`,
    options: [
      { label: '主动要球自己罚', hint: '点球/沉着判定，进球+声望；罚丢-声望', outcome: '你走到老队员面前："让我来。"他犹豫片刻，让出了球。你深吸一口气，把球摆好……', effects: { attrs: { penalties: 'r2-3', composure: 'r1-2' }, goals: 1, matchRating: 2, reputation: 5, morale: 6, teammateRelation: -2 } },
      { label: '让给老队员主罚', hint: '团队和谐+，无个人数据', outcome: '你退后一步，把机会让给老大哥。他感激地点点头，走上点球点……', effects: { attrs: { composure: 1 }, teammateRelation: 8, coachRelation: 2, morale: 2 } },
      { label: '建议老队员让队友罚', hint: '情商高，但可能冒犯老队员', outcome: '你低声建议换个脚风更顺的队友主罚，老队员脸色一沉……', effects: { teammateRelation: -5, composure: 1, vision: 1 } },
    ],
  }),
  (ctx) => ({
    id: 'match_defensive_duty',
    type: 'match',
    phase: 'midseason',
    title: `被迫回防 · vs ${ctx.opponent.name}`,
    narrative: `比赛尾声，球队1:0领先但少一人作战。主帅在场边冲你大喊："回！回来到边路帮忙防守！"你整场比赛冲了八十多分钟，肺像要炸开。对方边锋正拿球推进，而你这侧的空当已经暴露。\n\n这是一个枯燥却关键的防守回合，没人会记得，但可能决定三分。`,
    options: [
      { label: '拼命回追协防', hint: '耐力/立定抢断+，教练+', outcome: '你咬牙狂奔四十米，关键一脚把球断下解围。看台响起掌声，教练冲你竖大拇指。', effects: { attrs: { stamina: 'r1-2', standingTackle: 'r1-2', defensiveAwareness: 1 }, coachRelation: 6, teammateRelation: 4, matchRating: 1, fitness: -10, morale: 3 } },
      { label: '留在前场等反击', hint: '保存体力，但风险', outcome: '你挥手示意自己留在前面，等着反击机会。对方这一波攻势险些破门……', effects: { attrs: { positioning: 1 }, coachRelation: -5, morale: -2, fitness: 2 } },
      { label: '象征性回防', hint: '敷衍，两面不讨好', outcome: '你慢跑着回了几步，既没防住也没接到反击球。', effects: { coachRelation: -3, morale: -1 } },
    ],
  }),
  (ctx) => ({
    id: 'match_rival_duel',
    type: 'match',
    phase: 'midseason',
    title: `宿敌对决 · vs ${ctx.opponent.name}`,
    narrative: `今天的对手阵中有一名同位置的青年才俊，媒体赛前就把你们炒作成"新生代第一人之争"。开赛前握手时，他凑近你耳边轻声说："今天让所有人看看谁才是真正的天才。"\n\n比赛进行到下半场，你俩的直接对话越来越火药味十足。一次拼抢后，他挑衅地看着你。`,
    options: [
      { label: '用进球说话', hint: '求胜欲强，射术+，可能受伤', outcome: '你把怒火化作动力，拼尽全力寻找进球机会……', effects: { attrs: { finishing: 'r1-2', composure: 1, aggression: 1 }, goals: 1, matchRating: 2, reputation: 4, injuryRisk: 6, morale: 4 } },
      { label: '与他针锋相对', hint: '侵略性+，吃牌风险', outcome: '你下一脚拼抢更狠了，两人火气都上来了。主裁把你叫去警告……', effects: { attrs: { aggression: 'r1-2' }, matchRating: 0, morale: 1, reputation: -2, injuryRisk: 5 } },
      { label: '无视挑衅专注比赛', hint: '沉着+，团队+', outcome: '你冷冷看了他一眼，转身投入比赛。赛后他主动过来与你交换球衣。', effects: { attrs: { composure: 'r1-2', reactions: 1 }, teammateRelation: 4, reputation: 2, morale: 2 } },
    ],
  }),
  (ctx) => ({
    id: 'match_pressing_trap',
    type: 'match',
    phase: 'midseason',
    title: `高位逼抢的时机 · vs ${ctx.opponent.name}`,
    narrative: `对方后卫在禁区前沿倒脚，看起来漫不经心。你的直觉告诉你——这一刻他下一脚传球会稍微大一点。如果你现在扑上去，可能直接断球形成单刀；可一旦判断失误，身后就是大片空当。\n\n足球是瞬间的游戏，留给你的思考时间不到半秒。`,
    options: [
      { label: '果断上抢', hint: '反应/防守意识判定，断球单刀', outcome: '你像猎豹一样扑出去，脚尖一捅——皮球真的脱靶了！你单刀直入……', effects: { attrs: { reactions: 'r1-2', defensiveAwareness: 'r1-2', aggression: 1 }, goals: 1, matchRating: 2, reputation: 3, morale: 4, fitness: -6 } },
      { label: '保持阵型等候', hint: '稳妥，站位+', outcome: '你按兵不动，等候中场队友到位。一次稳健的选择。', effects: { attrs: { positioning: 1, defensiveAwareness: 1 }, matchRating: 0 } },
      { label: '指挥队友一起逼抢', hint: '视野/领导力，团队+', outcome: '你挥手招呼队友一起上，三人合围——', effects: { attrs: { vision: 1, interceptions: 1 }, teammateRelation: 5, matchRating: 1, morale: 2 } },
    ],
  }),
  (ctx) => ({
    id: 'match_free_kick',
    type: 'match',
    phase: 'midseason',
    title: `禁区前沿任意球 · vs ${ctx.opponent.name}`,
    narrative: `比赛第60分钟，球队在禁区前沿获得任意球，距离球门约25米。${ctx.opponent.name}排起了五人人墙，门将紧张地指挥站位。队内的任意球主罚手看了你一眼，似乎在问：要不要你来踢？\n\n你深吸一口气，皮球摆在草皮上，看台渐渐安静下来。`,
    options: [
      { label: '主罚弧线球绕过人墙', hint: '弧线/任意球精度判定，进球可能', outcome: '你助跑三步，脚弓一搓，皮球划出美妙弧线越过人墙——', effects: { attrs: { curve: 'r2-3', freeKickAccuracy: 'r2-3', composure: 1 }, goals: 1, matchRating: 2, reputation: 4, morale: 5 } },
      { label: '大力重炮轰门', hint: '射门力量/远射判定', outcome: '你抡起右脚重炮轰门，皮球带着呼啸砸向球门——', effects: { attrs: { shotPower: 'r1-2', longShots: 'r1-2' }, matchRating: 1, morale: 2 } },
      { label: '让老队员主罚自己抢点', hint: '团队+，头球/站位', outcome: '你让出主罚权，冲进禁区准备抢二点。老队员的任意球罚向——', effects: { attrs: { positioning: 'r1-2', headingAccuracy: 1 }, teammateRelation: 5, matchRating: 1, morale: 1 } },
    ],
  }),
  (ctx) => ({
    id: 'match_fast_break',
    type: 'match',
    phase: 'midseason',
    title: `半场吊射的诱惑 · vs ${ctx.opponent.name}`,
    narrative: `上半场补时阶段，${ctx.opponent.name}的门将扑角球时冲到了中圈附近！你断下解围球，眼前是空荡荡的半场和奋力回追的后卫。中线距离球门足有五十米，门将还在拼命往回跑。\n\n这是千载难逢的吊射机会，但角度极刁，稍有不慎就成了笑柄。`,
    options: [
      { label: '中场直接吊射空门', hint: '远射/沉着判定，惊世进球', outcome: '你没犹豫，中场线起脚吊射！皮球在空中划出抛物线，坠向空门——', effects: { attrs: { longShots: 'r2-3', composure: 'r1-2', vision: 1 }, goals: 1, matchRating: 3, reputation: 6, morale: 7 } },
      { label: '带球推进再射门', hint: '盘带/射术判定，稳妥', outcome: '你带球推进到禁区前沿起脚——', effects: { attrs: { dribbling: 'r1-2', finishing: 'r1-2' }, goals: 1, matchRating: 2, reputation: 3, morale: 4 } },
      { label: '护球等队友跟进', hint: '稳妥，团队+', outcome: '你护住球等队友插上，错失了吊射良机但保住了球权。', effects: { attrs: { strength: 1, vision: 1 }, teammateRelation: 3, matchRating: 0 } },
    ],
  }),
]

// ---------- 人际关系类 ----------
export const relationshipEvents = [
  (ctx) => ({
    id: 'rookie_hazing',
    type: 'relationship',
    phase: 'midseason',
    title: '更衣室的"下马威"',
    narrative: `作为队里最年轻的面孔，老队员们安排你每天负责捡球、拎包、给前辈买饮料。这本是足坛传统，但今天训练后，几名老队员半开玩笑地让你在全队面前唱首歌。\n\n更衣室里所有人的目光都聚过来，有人起哄，有人憋笑。你才十六岁，脸涨得通红。`,
    options: [
      { label: '大方献唱一首', hint: '团队融入+，老队员+', outcome: '你硬着头皮唱了首跑调的歌，更衣室笑成一团。老队员们觉得你这小子挺有意思，以后罩着你。', effects: { teammateRelation: 8, morale: 3, composure: 1 } },
      { label: '礼貌但坚定拒绝', hint: '个性+，但可能被孤立', outcome: '你平静地说："唱歌就算了，训练场上我请大家喝饮料。"更衣室安静了一秒，老队长点点头："行，有骨气。"', effects: { teammateRelation: -2, aggression: 1, composure: 1, reputation: 1 } },
      { label: '闷头不说话忍着', hint: '士气-', outcome: '你低着头默默照做，心里不是滋味。之后几天总觉得与队友隔着一层。', effects: { teammateRelation: -4, morale: -5, composure: -1 } },
    ],
  }),
  (ctx) => ({
    id: 'mentor_figure',
    type: 'relationship',
    phase: 'midseason',
    title: '老队长的邀约',
    narrative: `训练结束后，老队长单独把你叫到场边。"小子，跟我加练半小时射门。"他边说边把一筐球推过来，"我踢了十八年职业，有些东西可以教给你。"\n\n落日把球场的影子拉得很长，老队长眼角的皱纹里全是故事。这是个难得的学习机会，但你今天训练量已经很大了。`,
    options: [
      { label: '欣然接受加练', hint: '射术/站位+，老队长关系+', outcome: '老队长手把手教你如何用脚弓推死角，如何在跑动中调整步点。一个月后，你的射术明显精进。', effects: { attrs: { finishing: 'r2-3', positioning: 'r1-2', composure: 1 }, teammateRelation: 6, fitness: -8 } },
      { label: '请教跑位与意识', hint: '站位/视野+', outcome: '你向老队长请教无球跑位的心得，他笑着在地上画起了线路图。', effects: { attrs: { positioning: 'r2-3', vision: 'r1-2', reactions: 1 }, teammateRelation: 5 } },
      { label: '今天太累，改天', hint: '体力恢复，错失机会', outcome: '你婉言谢绝，老队长点点头没说什么，但之后他再没单独找过你。', effects: { fitness: 8, morale: -1 } },
    ],
  }),
  (ctx) => ({
    id: 'coach_criticism',
    type: 'relationship',
    phase: 'midseason',
    title: '主帅的严厉批评',
    narrative: `上一场比赛你错失两次绝佳机会，赛后主帅把你单独叫到办公室。"你天赋不差，"他把比赛录像按在暂停键上，"但你太想表现自己。足球不是一个人的运动。"他盯着你的眼睛，"你想成为球星，还是只想刷数据？"\n\n办公室里安静得能听见空调的嗡鸣。`,
    options: [
      { label: '虚心接受并反思', hint: '视野/沉着+，教练+', outcome: '你认真听完，承认了自己的问题。主帅露出难得的笑意："回去好好练，下次比赛我相信你。"', effects: { attrs: { vision: 'r1-2', composure: 'r1-2', positioning: 1 }, coachRelation: 9, morale: -1 } },
      { label: '据理力争', hint: '个性+，教练-', outcome: '你辩解说机会本就不多。主帅脸色一沉："年轻人，态度决定高度。出去吧。"', effects: { aggression: 1, coachRelation: -8, morale: -3 } },
      { label: '沉默不语', hint: '消极', outcome: '你一言不发听完，心里憋着一股劲。', effects: { composure: -1, coachRelation: -2, morale: -4 } },
    ],
  }),
  (ctx) => ({
    id: 'teammate_conflict',
    type: 'relationship',
    phase: 'midseason',
    title: '与队友的争执',
    narrative: `训练赛上，一名中场队友连续三次传球选择无视跑出空位的你。第三次时你终于忍不住吼了出来："我空了你看不见？！"对方也不甘示弱："你自己跑位有问题！"两人差点动手，被队友拉开。\n\n晚上回到宿舍，那条裂缝还横在你俩中间。明天还要一起训练比赛。`,
    options: [
      { label: '主动找他道歉和解', hint: '团队+，视野+', outcome: '你敲开他的房门："今天我冲动了，抱歉。"他愣了一下，也承认自己传球视野不够。两人握手言和。', effects: { teammateRelation: 9, attrs: { vision: 'r1-2', composure: 1 }, morale: 3 } },
      { label: '冷战，等他先开口', hint: '关系恶化', outcome: '接下来一周两人形同陌路，训练配合也变得生硬。', effects: { teammateRelation: -8, morale: -4 } },
      { label: '找老队长调解', hint: '情商高，团队+', outcome: '老队长拉你们坐下来谈心，把误会说开了。两人虽不算交心，但配合恢复了正常。', effects: { teammateRelation: 3, composure: 1, morale: 1 } },
    ],
  }),
  (ctx) => ({
    id: 'captain_chance',
    type: 'relationship',
    phase: 'midseason',
    title: '袖标的机会',
    narrative: `老队长累积黄牌停赛，主帅在更衣室宣布本场由你担任场上队长。你才十几岁，更衣室里几名老队员交换了意味深长的眼神。袖标沉甸甸地握在手里，上面还带着老队长的汗水味道。\n\n"带领球队赢下来。"主帅拍了拍你的肩。开场哨即将吹响。`,
    options: [
      { label: '用呐喊与拼劲鼓舞全队', hint: '侵略性+，团队+，体力-', outcome: '你全场嘶吼指挥，带头拼抢。全队被你的气势感染，踢出了一场硬仗。', effects: { attrs: { aggression: 'r1-2', stamina: 1 }, teammateRelation: 7, coachRelation: 5, reputation: 3, morale: 5, fitness: -10 } },
      { label: '用表现说话', hint: '个人能力+', outcome: '你不喊口号，但用一个进球和无数次回防带头示范。队友们心服口服。', effects: { attrs: { finishing: 'r1-2', positioning: 1 }, goals: 1, teammateRelation: 5, reputation: 4, morale: 4 } },
      { label: '把指挥权让给老后卫', hint: '谦逊，但错失机会', outcome: '你把袖标意义让给身边的老后卫，自己专注踢球。赛后主帅有些失望。', effects: { teammateRelation: 3, coachRelation: -3, composure: 1 } },
    ],
  }),
  (ctx) => ({
    id: 'young_rival_room',
    type: 'relationship',
    phase: 'midseason',
    title: '同房间的竞争对手',
    narrative: `俱乐部新签了一名同龄前锋，比你还要小半岁，技术细腻，媒体把他捧上天。偏偏主帅安排你俩住同一个房间。客场的夜晚，房间里安静得能听见空调的嗡鸣，气氛有些微妙。\n\n他在床上翻了个身："哥，明天首发你猜教练让谁上？"`,
    options: [
      { label: '坦诚交流，亦敌亦友', hint: '沉着+，视野+，可能双提升', outcome: '你俩聊到深夜，从青训聊到梦想。虽有竞争，但彼此惺惺相惜，训练中互相促进。', effects: { attrs: { composure: 'r1-2', vision: 1 }, teammateRelation: 5, morale: 2 } },
      { label: '冷处理，暗中较劲', hint: '侵略性+，士气略-', outcome: '你冷冷回了句"看状态"，翻身睡了。第二天训练你格外卖力，但心里多了一根刺。', effects: { attrs: { aggression: 1, composure: 1 }, teammateRelation: -3, morale: -2 } },
      { label: '主动帮他适应球队', hint: '团队+，声望+', outcome: '你主动带他熟悉球队，帮他融入。主帅看在眼里，对你的格局颇为赞赏。', effects: { teammateRelation: 7, coachRelation: 4, reputation: 2, composure: 1 } },
    ],
  }),
]

// ---------- 媒体/舆论类 ----------
export const mediaEvents = [
  (ctx) => ({
    id: 'post_match_interview',
    type: 'media',
    phase: 'midseason',
    title: '赛后混合区采访',
    narrative: `你刚踢进制胜球，混合区里记者蜂拥而至。话筒怼到嘴边，闪光灯晃得人睁不开眼。"你今天的表现太出色了，是不是觉得自己已经是国内最好的前锋之一了？"记者笑着问，"听说有欧洲球探在关注你？"\n\n这是一个看似随和实则带刺的问题。`,
    options: [
      { label: '谦虚归功团队', hint: '声誉+，教练/队友+', outcome: '"进球是全队的功劳，我还有很多需要学习的地方。"记者点头微笑，新闻出来后口碑极佳。', effects: { reputation: 5, teammateRelation: 4, coachRelation: 3, composure: 1 } },
      { label: '自信表达雄心', hint: '声誉++，但可能招黑', outcome: '"我相信自己有能力去欧洲踢球，这是我的目标。"新闻登上头条，有人赞赏你的志气，也有人骂你狂妄。', effects: { reputation: 7, aggression: 1, morale: 2, coachRelation: -2 } },
      { label: '回避问题匆匆离去', hint: '声望-', outcome: '你草草应付两句就走了。媒体写道："年轻球员似乎还不适应聚光灯。"', effects: { reputation: -3, composure: -1 } },
    ],
  }),
  (ctx) => ({
    id: 'endorsement_offer',
    type: 'media',
    phase: 'midseason',
    title: '第一份商业代言',
    narrative: `经纪人打来电话，一个运动品牌愿意给你开一份代言合同——金额对你这个年纪的球员来说相当可观。但合同要求你频繁参加商业活动，可能影响训练恢复；而且品牌方希望你踢得"更花哨"一些以增加曝光。\n\n钱、曝光、训练，三者需要权衡。`,
    options: [
      { label: '签约，但要保护训练时间', hint: '金钱+，需平衡', outcome: '你签下合同，但坚持训练日不接商业活动。代言费到手，曝光稳步增长。', effects: { money: 500000, reputation: 4, composure: 1, fitness: -3 } },
      { label: '全力配合商业活动', hint: '金钱++声望++，但状态-', outcome: '你频繁出席活动，钱包鼓了，名气也大了，但训练状态明显下滑。', effects: { money: 1500000, reputation: 8, fitness: -12, morale: 3, attrs: { stamina: -1 } } },
      { label: '婉拒，专注足球', hint: '声誉略-，状态稳', outcome: '你谢绝了代言，经纪人气得直摇头。但你知道，先把球踢好才是根本。', effects: { reputation: -1, coachRelation: 3, composure: 1, fitness: 5 } },
    ],
  }),
  (ctx) => ({
    id: 'social_media_storm',
    type: 'media',
    phase: 'midseason',
    title: '社交媒体风波',
    narrative: `昨晚你在ins上发了一张豪车合照（其实是朋友的），配文"努力终有回报"。一夜之间评论区炸了锅，有人骂你飘了、不务正业，球迷论坛上骂声一片。俱乐部新闻官一早紧急找你商议对策。\n\n手机消息提示音响个不停，你的手心在出汗。`,
    options: [
      { label: '公开道歉，删除动态', hint: '声誉修复，沉着+', outcome: '你发了一封诚恳的道歉信，解释误会并删除动态。风波渐渐平息，球迷欣赏你的担当。', effects: { reputation: -2, composure: 'r1-2', morale: -2 } },
      { label: '解释澄清，不卑不亢', hint: '声誉中性，个性+', outcome: '你发声明说明真相，不卑不亢。舆论分化，但有人开始欣赏你的态度。', effects: { reputation: 1, aggression: 1, composure: 1 } },
      { label: '关闭账号，从此不发声', hint: '声望-', outcome: '你一气之下注销账号，媒体写道："年轻球员无法承受舆论压力。"', effects: { reputation: -5, morale: -4, composure: -1 } },
    ],
  }),
  (ctx) => ({
    id: 'scout_rumor',
    type: 'media',
    phase: 'midseason',
    title: '欧洲球探的传闻',
    narrative: `一家欧洲媒体爆料：某五大联赛俱乐部派球探长期观察你。新闻传回国内，球迷圈沸腾了——"下一个留洋的希望"。但你的主帅在新闻发布会上被问及此事时，脸色不太好看："他现在最重要的是在俱乐部站稳脚跟。"\n\n更衣室里，队友的眼神也微妙起来。`,
    options: [
      { label: '公开表态专注当下', hint: '教练/队友+', outcome: '你主动召开发布会："我现在的全部精力都在俱乐部。"主帅满意地点点头。', effects: { coachRelation: 7, teammateRelation: 4, reputation: 2, composure: 1 } },
      { label: '不回应，让经纪人运作', hint: '暧昧，两边不讨好', outcome: '你不置可否，让经纪人在背后接触欧洲球队。主帅对你态度冷淡了几分。', effects: { coachRelation: -5, reputation: 1 } },
      { label: '高调表达留洋梦想', hint: '声誉++，但俱乐部不满', outcome: '你接受采访时直言："去欧洲是我的梦想。"球迷兴奋，但俱乐部高层很不满。', effects: { reputation: 6, coachRelation: -7, morale: 3, teammateRelation: -2 } },
    ],
  }),
  (ctx) => ({
    id: 'fan_letter',
    type: 'media',
    phase: 'midseason',
    title: '一封小球迷的来信',
    narrative: `训练基地前台转交来一封信，歪歪扭扭的字迹，是一个八岁小球迷写的："哥哥，我也想当前锋，可是教练说我太矮了。你小时候也有人这么说你吗？"信里还夹着一张你被铲倒后坚持比赛的剪报。\n\n这封信在更衣室传了一圈，几个老队员都红了眼眶。你怎么回？`,
    options: [
      { label: '亲自回信鼓励他', hint: '声望+，沉着+', outcome: '你认真写了一封回信，鼓励他坚持梦想。这故事被媒体报道后，你的公众形象大涨。', effects: { reputation: 5, composure: 1, morale: 4, coachRelation: 2 } },
      { label: '托俱乐部统一处理', hint: '声望略+', outcome: '你让俱乐部代为回复。礼貌但少了温度。', effects: { reputation: 1, morale: 1 } },
      { label: '邀请他来基地参观', hint: '声望++，但占用训练', outcome: '你邀请小球迷来基地看训练并合影。他眼睛亮得像星星，但你这周少练了两次。', effects: { reputation: 7, morale: 5, fitness: -5, attrs: { composure: 1 } } },
    ],
  }),
]

// ---------- 生活/场外类 ----------
export const lifeEvents = [
  (ctx) => ({
    id: 'family_visit',
    type: 'life',
    phase: 'midseason',
    title: '母亲的探望',
    narrative: `母亲从老家坐了二十多个小时火车来看你，提着满满一箱子家乡菜。她头发又白了几根，看到你训练完青紫的腿，眼眶一下红了。"别太拼了，妈就你一个。"她边给你夹菜边说。\n\n你小时候父亲走得早，母亲在工地搬砖供你踢球。这一桌菜，是攒了很久的钱。`,
    options: [
      { label: '陪母亲好好待几天', hint: '士气++，沉着+', outcome: '你请了两天假陪母亲逛街吃饭。归队时心里格外踏实，训练状态出奇的好。', effects: { morale: 8, composure: 'r1-2', fitness: 6, attrs: { composure: 1 } } },
      { label: '送走母亲加练补回', hint: '属性+，士气-', outcome: '你陪了母亲一天就送她走，然后疯狂加练补回训练量。母亲在火车上偷偷抹眼泪。', effects: { attrs: { finishing: 'r1-2', stamina: 1 }, morale: -5, fitness: -8 } },
      { label: '让母亲长住照顾自己', hint: '士气+，但独立性-', outcome: '你让母亲在基地附近租了房子长住。有人议论你"妈宝"，但你心里安稳。', effects: { morale: 4, reputation: -2, composure: 1 } },
    ],
  }),
  (ctx) => ({
    id: 'injury_recovery',
    type: 'life',
    phase: 'midseason',
    title: '伤病恢复期',
    narrative: `上轮比赛你被铲伤了脚踝，队医说至少休战三周。康复室冷清清的，队友们都去训练了，只有你一个人对着墙做理疗。窗外是连绵的阴雨，心里说不出的焦躁。\n\n恢复有快有慢，急不得，可位置竞争不等人。`,
    options: [
      { label: '科学康复，循序渐进', hint: '彻底恢复，属性小幅+', outcome: '你严格按队医计划恢复，三周后满血回归，没有留下隐患。', effects: { attrs: { stamina: 1, reactions: 1, composure: 1 }, fitness: 10, morale: 2, injuryRisk: -10 } },
      { label: '打封闭提前复出', hint: '早复出，但隐患大', outcome: '你打了一针封闭提前上场，疼痛被压下去，但脚踝隐隐的不适感挥之不去。', effects: { fitness: -5, injuryRisk: 18, morale: 3, reputation: 2 } },
      { label: '借机学习战术录像', hint: '视野/站位+', outcome: '康复期间你泡在录像室，把全队的战术吃了个透。复出后意识明显提升。', effects: { attrs: { vision: 'r1-2', positioning: 'r1-2', defensiveAwareness: 1 }, fitness: 6 } },
    ],
  }),
  (ctx) => ({
    id: 'diet_discipline',
    type: 'life',
    phase: 'midseason',
    title: '夜宵的诱惑',
    narrative: `客场之旅，球队住在酒店。晚上十一点，几个老队员叫了烧烤外卖，招呼你一起吃。香味飘进房间，你正饿得前胸贴后背——职业球员的饮食管理是基本功，但偶尔放纵一次应该没事吧？\n\n手机屏幕亮起，营养师发来今日饮食打卡提醒。`,
    options: [
      { label: '坚守饮食计划', hint: '耐力+，团队略-', outcome: '你忍住诱惑，喝了杯蛋白粉睡下。第二天训练体能明显比吃了烧烤的队友好。', effects: { attrs: { stamina: 'r1-2', strength: 1 }, fitness: 5, teammateRelation: -2 } },
      { label: '少吃一点意思一下', hint: '中性', outcome: '你吃了两串就停手，平衡了口腹之欲与职业纪律。', effects: { morale: 2, teammateRelation: 2, fitness: -2 } },
      { label: '放纵一次吃到爽', hint: '士气+，耐力-', outcome: '你跟着大吃大喝，第二天训练跑不动，被体能教练骂了一顿。', effects: { morale: 4, attrs: { stamina: -1, acceleration: -1 }, fitness: -8, coachRelation: -3 } },
    ],
  }),
  (ctx) => ({
    id: 'rest_vs_extra',
    type: 'life',
    phase: 'midseason',
    title: '休息日的选择',
    narrative: `难得的一个休息日，阳光正好。队友们三三两两去逛街、打游戏、睡懒觉。你身体确实很疲惫，赛季还很长。但你最近感觉右脚射门总差那么一点意思，加练或许能突破瓶颈。\n\n空荡荡的训练场在向你招手，温暖的床也在向你招手。`,
    options: [
      { label: '独自加练射门', hint: '射术+，疲劳+', outcome: '你加练了200脚射门，右脚起泡了，但脚感明显更细腻。', effects: { attrs: { finishing: 'r2-3', shotPower: 1, longShots: 1 }, fitness: -10, morale: 1 } },
      { label: '彻底休息恢复', hint: '体力+，状态稳', outcome: '你睡到自然醒，下午看了场电影。归队后精力充沛。', effects: { fitness: 12, morale: 4, stamina: 1 } },
      { label: '约队友一起加练', hint: '团队+，小幅提升', outcome: '你叫上两名队友一起加练传射配合，三人默契提升不少。', effects: { attrs: { shortPassing: 1, positioning: 1 }, teammateRelation: 6, fitness: -6 } },
    ],
  }),
  (ctx) => ({
    id: 'sleep_quality',
    type: 'life',
    phase: 'midseason',
    title: '失眠的夜晚',
    narrative: `连续几场首发让你神经紧绷，凌晨三点你还在床上翻来覆去。明天又是关键比赛，可越想睡越清醒。手机里弹出某App推送"助眠白噪音"，队医也曾经给过你一份褪黑素。\n\n窗外的城市霓虹在窗帘缝隙里闪烁，时间一分一秒流逝。`,
    options: [
      { label: '服用队医开的褪黑素', hint: '体力恢复，比赛状态稳', outcome: '你按医嘱服了褪黑素，很快沉沉睡去。第二天精神不错。', effects: { fitness: 8, morale: 2, composure: 1 } },
      { label: '听白噪音自然入睡', hint: '体力小幅恢复，无副作用', outcome: '你戴上耳机听雨声，不知何时睡着了。第二天略疲惫但精神清爽。', effects: { fitness: 4, morale: 1 } },
      { label: '索性爬起来看录像', hint: '站位+，但体力大减', outcome: '你索性不睡了，爬起来研究明天对手的录像。天亮时你眼圈发黑，但心里有了底。', effects: { attrs: { positioning: 'r1-2', vision: 1 }, fitness: -10, composure: 1 } },
    ],
  }),
]

// ---------- 比赛关键时刻类（开场战术 / 半场调整 / 补时决战） ----------
export const keyMomentEvents = [
  (ctx) => ({
    id: 'keymoment_open_tactics',
    type: 'match',
    phase: 'midseason',
    title: `开场战术布置 · vs ${ctx.opponent.name}`,
    narrative: `赛前更衣室，主帅在战术板上画出${ctx.opponent.name}的阵型。"对方两个中卫转身慢，"他敲了敲板子，"开场前十分钟我们要怎么打？"\n\n队友们的目光投向你，等待你这个核心的选择。开场哨还有三分钟吹响。`,
    options: [
      { label: '高位逼抢抢开局', hint: '侵略性+体能-，可能早进球', outcome: '开场你带队疯狂逼抢，第三分钟就断球形成射门！', effects: { attrs: { aggression: 'r1-2', stamina: 1 }, goals: 1, matchRating: 2, fitness: -8, morale: 4, teammateRelation: 3 } },
      { label: '稳住节奏试探对手', hint: '沉着+视野+，稳妥', outcome: '你示意队友先稳住球权，摸清对方路数再发难。', effects: { attrs: { composure: 'r1-2', vision: 1 }, matchRating: 1, coachRelation: 3 } },
      { label: '主打边路传中', hint: '传中+头球判定', outcome: '你指挥进攻往两边走，频繁起球找禁区内高点——', effects: { attrs: { crossing: 'r1-2', headingAccuracy: 1 }, matchRating: 1, morale: 1 } },
    ],
  }),
  (ctx) => ({
    id: 'keymoment_halftime_adjust',
    type: 'match',
    phase: 'midseason',
    title: `中场休息的调整 · vs ${ctx.opponent.name}`,
    narrative: `半场0:1落后。更衣室里蒸汽弥漫，队友们喘着粗气。${ctx.opponent.name}的左路今天特别活跃，把你们这侧压得很深。主帅看向你："下半场你想怎么调整？是继续硬刚，还是换个思路？"\n\n你的球衣已经被汗水浸透，六十分钟的高强度对抗还在后头。`,
    options: [
      { label: '主动回撤协防左路', hint: '防守意识+立定抢断+，团队+', outcome: '你回撤到左路帮忙，稳固了防线。主帅冲你点头赞许。', effects: { attrs: { defensiveAwareness: 'r1-2', standingTackle: 1, stamina: 1 }, coachRelation: 6, teammateRelation: 5, matchRating: 1, fitness: -6 } },
      { label: '前压反扑强攻', hint: '射术+前插，体能大幅消耗', outcome: '你顶到最前面，频繁冲击对方防线。', effects: { attrs: { positioning: 'r1-2', finishing: 1 }, goals: 1, matchRating: 2, fitness: -12, morale: 3 } },
      { label: '中场拿球控制节奏', hint: '控球+视野+，沉着', outcome: '你回到中场接球，用传球控制比赛节奏，让队友喘口气。', effects: { attrs: { ballControl: 'r1-2', vision: 'r1-2', composure: 1 }, matchRating: 1, teammateRelation: 4 } },
    ],
  }),
  (ctx) => ({
    id: 'keymoment_stoppage_time',
    type: 'match',
    phase: 'midseason',
    title: `补时最后时刻 · vs ${ctx.opponent.name}`,
    narrative: `补时第4分钟，也是最后一次进攻机会。比分1:1平。你方门将把大脚开向中场，皮球在空中划出长长的弧线。${ctx.opponent.name}全员回防，禁区里密密麻麻。\n\n你看着下落的皮球，时间仿佛慢了下来。这是改写比分的最后机会。`,
    options: [
      { label: '禁区内强行抢点', hint: '头球/力量判定，绝杀可能', outcome: '你挤进人群，迎着皮球起跳——', effects: { attrs: { headingAccuracy: 'r1-2', jumping: 1, strength: 1 }, goals: 1, matchRating: 3, reputation: 4, morale: 7, fitness: -8 } },
      { label: '禁区外等二点远射', hint: '远射/反应判定', outcome: '你撤出禁区，等皮球被顶出来——凌空抽射！', effects: { attrs: { longShots: 'r2-3', volleys: 1, reactions: 1 }, goals: 1, matchRating: 3, reputation: 5, morale: 6 } },
      { label: '回敲重整进攻', hint: '稳妥，视野+', outcome: '你把球回敲给中场，重新组织——但时间所剩无几。', effects: { attrs: { vision: 1, shortPassing: 1 }, matchRating: 0, morale: 0 } },
    ],
  }),
  (ctx) => ({
    id: 'keymoment_set_piece',
    type: 'match',
    phase: 'midseason',
    title: `定位球战术 · vs ${ctx.opponent.name}`,
    narrative: `禁区前沿的间接任意球，距离球门22米。${ctx.opponent.name}排起六人人墙，门将紧张地指挥。主帅在场边喊："你来主罚！打战术还是直接？" \n\n皮球摆在草皮上，你看了一眼禁区内队友的站位。`,
    options: [
      { label: '挑传禁区找高点', hint: '传中/弧线+，助攻可能', outcome: '你脚弓一搓，皮球划出弧线飞向后点——队友高高跃起！', effects: { attrs: { curve: 'r1-2', crossing: 1, vision: 1 }, assists: 1, teammateRelation: 5, matchRating: 2 } },
      { label: '直接攻门', hint: '任意球精度/射门力量', outcome: '你助跑三步，重炮轰门！皮球穿过人墙——', effects: { attrs: { freeKickAccuracy: 'r2-3', shotPower: 1 }, goals: 1, matchRating: 2, reputation: 3, morale: 5 } },
      { label: '假射真传打配合', hint: '视野+短传，巧妙', outcome: '你假装射门，却脚腕一抖送出直塞——', effects: { attrs: { vision: 'r1-2', shortPassing: 'r1-2', composure: 1 }, assists: 1, matchRating: 1, morale: 2 } },
    ],
  }),
  (ctx) => ({
    id: 'keymoment_counter_attack',
    type: 'match',
    phase: 'midseason',
    title: `反击黄金机会 · vs ${ctx.opponent.name}`,
    narrative: `本方禁区断球瞬间，你抬头一看——${ctx.opponent.name}全线压上，后场只剩两名后卫！这是教科书般的反击机会，三打二！队友从两翼插上，你带球推进。\n\n看台上客队球迷已经站起来，呐喊声震耳欲聋。`,
    options: [
      { label: '长驱直入自己打门', hint: '盘带/远射，独狼', outcome: '你一条龙杀到禁区前沿起脚——', effects: { attrs: { dribbling: 'r1-2', longShots: 1 }, goals: 1, matchRating: 2, reputation: 3, teammateRelation: -3, morale: 3 } },
      { label: '直塞插上队友', hint: '视野/短传，助攻', outcome: '你脚腕一抖送出直塞，队友单刀——', effects: { attrs: { vision: 'r1-2', shortPassing: 'r1-2' }, assists: 1, teammateRelation: 5, matchRating: 2, morale: 3 } },
      { label: '分边再传中', hint: '传中/团队配合', outcome: '你分球给边路队友，继续前插抢点——', effects: { attrs: { crossing: 1, positioning: 'r1-2' }, assists: 1, teammateRelation: 4, matchRating: 1, morale: 2, fitness: -5 } },
    ],
  }),
  (ctx) => ({
    id: 'keymoment_rival_star',
    type: 'match',
    phase: 'midseason',
    title: `与对方球星的直接对话 · vs ${ctx.opponent.name}`,
    narrative: `${ctx.opponent.name}阵中的当家球星今天状态火热，已经制造两次威胁。比赛第65分钟，你与他的一次直接对话即将上演——他在中场拿球，眼神挑衅地看着你。\n\n全场目光聚焦在这一刻。`,
    options: [
      { label: '果断上抢断球', hint: '反应/防守意识，反攻', outcome: '你像猎豹扑出，脚尖一捅——断球成功！带球反击！', effects: { attrs: { reactions: 'r1-2', defensiveAwareness: 'r1-2', aggression: 1 }, matchRating: 2, reputation: 3, morale: 4, fitness: -6 } },
      { label: '保持距离卡位等候', hint: '稳妥，站位+', outcome: '你卡住传球路线，等候队友协防。一次稳健的防守。', effects: { attrs: { positioning: 1, defensiveAwareness: 1 }, matchRating: 0, morale: 1 } },
      { label: '用进球回应他', hint: '射术+，求胜欲', outcome: '你把注意力放在进攻端，下一个回合就还以颜色——', effects: { attrs: { finishing: 'r1-2', composure: 1 }, goals: 1, matchRating: 2, reputation: 4, morale: 5 } },
    ],
  }),
]

// ---------- 突发事故类（训练伤病 / 场外意外 / 俱乐部危机） ----------
export const incidentEvents = [
  (ctx) => ({
    id: 'training_injury_clash',
    type: 'life',
    phase: 'midseason',
    title: '训练中的意外碰撞',
    narrative: `一次高强度对抗训练中，你与中卫队友争抢落点时膝盖重重撞在一起。剧痛瞬间从膝盖传遍整条腿，你倒在地上抱着膝盖，额头渗出冷汗。队医冲上场，脸色凝重。\n\n"先别动，"他按住你的膝盖检查，"可能伤到韧带了。"\n\n训练场上所有人都停了下来，空气仿佛凝固。`,
    options: [
      { label: '坚持训练，咬牙撑住', hint: '可能加重伤势，但显硬汉', outcome: '你咬着牙站起来继续训练，但每一步都钻心地疼。第二天膝盖肿得像馒头，队医痛心疾首。', effects: { injuryRisk: 22, fitness: -12, attrs: { stamina: 1, aggression: 1 }, morale: -3 } },
      { label: '立即停止训练就医', hint: '确保完全恢复', outcome: '你果断停止训练，让队医做全面检查。核磁共振显示并无大碍，休息几天即可。', effects: { fitness: -4, injuryRisk: -8, composure: 1 } },
      { label: '打封闭继续练两天', hint: '短期可练，隐患大', outcome: '你打了一针封闭坚持了两天，但膝盖隐隐的不适始终挥之不去。', effects: { injuryRisk: 15, fitness: -6, attrs: { aggression: 'r1-2' }, morale: 1 } },
    ],
  }),
  (ctx) => ({
    id: 'ankle_roll_training',
    type: 'life',
    phase: 'midseason',
    title: '崴脚的瞬间',
    narrative: `训练赛中你带球变向，脚踩在草皮的一个坑洼处——脚踝猛地内翻，"咔"的一声脆响。你立刻倒地，脚踝处像被火烧一样。助教跑过来查看，你的脚踝已经开始肿胀。\n\n这是足球运动员最常见也最恼人的伤病之一，处理不当会反复发作。`,
    options: [
      { label: 'RICE原则立即处理', hint: '冰敷加压，科学恢复', outcome: '你立刻用冰袋敷住脚踝，抬高患肢加压。队医夸你处理得专业，恢复会比预期快。', effects: { fitness: -6, injuryRisk: -10, attrs: { balance: 1 }, composure: 1 } },
      { label: '让队医推回去休息', hint: '稳妥，恢复一般', outcome: '你让队医用轮椅推你回更衣室，老队员打趣你"娇气"。', effects: { fitness: -8, injuryRisk: -5, teammateRelation: -2, morale: -1 } },
      { label: '绑紧护踝继续踢', hint: '风险高，但显顽强', outcome: '你缠上厚厚的护踝绷带继续训练，但每次变向都疼得皱眉。', effects: { injuryRisk: 20, fitness: -10, attrs: { aggression: 1, balance: -1 } } },
    ],
  }),
  (ctx) => ({
    id: 'offfield_traffic_accident',
    type: 'life',
    phase: 'midseason',
    title: '回家路上的小事故',
    narrative: `训练结束你开车回家，路口一辆电动车突然窜出来，你急打方向盘撞上了路沿。车子前保险杠瘪了一块，你的脖子被安全带勒得生疼，后脑勺撞在头枕上嗡嗡作响。\n\n对方电动车主也摔倒了，所幸人都没事。但你的脖子和后背已经开始隐隐作痛。`,
    options: [
      { label: '去医院做全面检查', hint: '确保无碍，但耽误训练', outcome: '你去医院拍了片子，医生说只是软组织挫伤，休养几天即可。但缺席了两天训练。', effects: { fitness: -8, injuryRisk: -5, money: -30000, morale: -2 } },
      { label: '私了，回家休息', hint: '省钱，但有隐患', outcome: '你给了对方一笔钱私了，回家贴了膏药就睡了。第二天脖子还是有些僵硬。', effects: { fitness: -5, injuryRisk: 8, money: -15000, composure: -1 } },
      { label: '报警走保险', hint: '合规，但流程繁琐', outcome: '你报了警走保险流程，折腾了大半天。虽然合规，但耽误了一整个下午。', effects: { fitness: -3, morale: -4, money: -5000, composure: 1 } },
    ],
  }),
  (ctx) => ({
    id: 'club_financial_crisis',
    type: 'relationship',
    phase: 'midseason',
    title: '俱乐部的财务危机',
    narrative: `新闻爆出${ctx.player.team}母公司出现严重财务问题，俱乐部拖欠球员奖金已经两个月。更衣室里人心惶惶，几名主力在私下讨论转会离队。主教练把球员们叫到一起开会，试图稳定军心。\n\n"奖金会补发的，"俱乐部经理承诺，但他的眼神有些躲闪。你才十几岁，这种场面让你感到不安。`,
    options: [
      { label: '公开表态留守共渡难关', hint: '声望++，球迷爱戴', outcome: '你主动在采访中说："困难时期我们更要团结。"球迷被你的担当打动，球队股价都涨了一点。', effects: { reputation: 8, morale: 3, coachRelation: 6, teammateRelation: 5, money: -50000 } },
      { label: '私下找经纪人打听转会', hint: '自保，但若泄露有风险', outcome: '你让经纪人悄悄接触其他俱乐部。主帅不知从哪听到了风声，看你的眼神复杂起来。', effects: { coachRelation: -8, morale: -2, reputation: -1 } },
      { label: '保持沉默专注训练', hint: '中立，无影响', outcome: '你什么也不说，每天照常训练比赛。风暴中沉默也是一种选择。', effects: { composure: 1, morale: -1 } },
    ],
  }),
  (ctx) => ({
    id: 'coach_sacking_rumor',
    type: 'relationship',
    phase: 'midseason',
    title: '主帅下课危机',
    narrative: `连续五场不胜，"主教练下课"的标语出现在了看台上。媒体爆料称俱乐部高层已经接触了新教练人选。训练场上，主帅的暴脾气比以往更盛，对每个细节都吹毛求疵。\n\n赛前准备会上，他突然把你单独叫出来："接下来三场你要多回撤拿球，帮我，也帮你自己。"\n\n这句话背后的压力很重——他在赌自己的帅位。`,
    options: [
      { label: '全力执行为教练保位', hint: '教练关系++，但消耗大', outcome: '你拼尽全力执行战术，三场比赛跑动距离创赛季新高。主帅赛后紧紧握住你的手。', effects: { coachRelation: 12, teammateRelation: 4, fitness: -15, attrs: { vision: 'r1-2', stamina: 1 }, morale: 4 } },
      { label: '按自己方式踢', hint: '保持状态，但教练-', outcome: '你没有完全按教练安排踢，依然按自己的节奏。主帅脸色铁青。', effects: { coachRelation: -10, attrs: { composure: 1 }, morale: -2 } },
      { label: '与队友商议应对', hint: '团队+,但可能被解读为逼宫', outcome: '你和几名老队员商议后决定主动调整打法。球队成绩有所回升，但高层还是换了教练。', effects: { teammateRelation: 8, coachRelation: -3, morale: 1, reputation: 2 } },
    ],
  }),
  (ctx) => ({
    id: 'food_poisoning',
    type: 'life',
    phase: 'midseason',
    title: '赛前食物中毒',
    narrative: `赛前一天晚上，球队在酒店集体用餐。凌晨三点你被剧烈的腹痛惊醒，冲进厕所就是上吐下泻。一打电话才知道，队里好几个球员都中招了——疑似食物不洁。\n\n明天就是关键比赛，你现在虚脱得站不稳，冷汗直冒。队医紧急赶来给你服了止泻药。`,
    options: [
      { label: '打点滴坚持上场', hint: '体能大降，但显职业', outcome: '你挂着吊瓶到天亮，勉强上了场。全场跑动不到平时的一半，但球迷为你的拼搏鼓掌。', effects: { fitness: -25, attrs: { stamina: 1, composure: 1 }, morale: 3, reputation: 3, injuryRisk: 8 } },
      { label: '申请轮休一场', hint: '休养，但教练可能不满', outcome: '你向教练申请休息，他皱眉批准了。比赛球队输了，赛后有人议论你"关键时刻掉链子"。', effects: { fitness: 5, coachRelation: -5, morale: -3, reputation: -2 } },
      { label: '只踢半场就下场', hint: '折中方案', outcome: '你踢了上半场就被换下，状态平平但至少没有加重病情。', effects: { fitness: -12, composure: 1, coachRelation: 1 } },
    ],
  }),
  (ctx) => ({
    id: 'locker_room_theft',
    type: 'life',
    phase: 'midseason',
    title: '更衣室失窃事件',
    narrative: `训练结束后你回到更衣室，发现自己的柜子被撬开了——钱包、名表和一部手机不翼而飞。更糟糕的是，好几名队友也遭了殃。俱乐部保安调取监控后锁定了几个可疑人物，但物品一时追不回来。\n\n你心里又气又窝火，这可是你攒了好几个月工资买的表。`,
    options: [
      { label: '报警走法律程序', hint: '合规，可能追回', outcome: '你报了警，警方介入调查。几天后部分物品被追回，但那块表没了踪影。', effects: { money: -80000, composure: 1, reputation: 1 } },
      { label: '让俱乐部内部处理', hint: '低调，可能不了了之', outcome: '你让俱乐部内部处理，保安承诺加强管理但没提赔偿。你心里憋着火。', effects: { money: -120000, morale: -5, teammateRelation: 2 } },
      { label: '自己装监控抓人', hint: '费心，但可能揪出内鬼', outcome: '你自己买了几个隐蔽摄像头装在柜子里，几天后真的拍到了嫌疑人——竟是临时清洁工。', effects: { money: -5000, composure: 1, attrs: { vision: 1 }, reputation: 2 } },
    ],
  }),
  (ctx) => ({
    id: 'pitch_invasion_fan',
    type: 'life',
    phase: 'midseason',
    title: '球迷冲入球场',
    narrative: `比赛第80分钟你正在场边热身准备替补登场，突然一个球迷翻过广告牌冲进球场，直奔你而来。保安还没反应过来，他已经到你面前——你看到他眼里含着泪，手里举着一件你的球衣。\n\n"求你签个名！"他喊道，声音有些颤抖。保安从四面八方涌来，场面一度混乱。`,
    options: [
      { label: '停下给他签名再交保安', hint: '声望++，但可能被罚款', outcome: '你接过球衣签了名，拍了拍他的肩。球迷被保安带走时还在回头感谢你。俱乐部因"纵容球迷闯场"被罚款。', effects: { reputation: 6, morale: 4, money: -5000, composure: 1 } },
      { label: '躲开让保安处理', hint: '合规，无影响', outcome: '你侧身躲开，保安迅速将他控制带离。比赛继续，但你看他失望的眼神心里有些不是滋味。', effects: { reputation: -1, composure: 1 } },
      { label: '帮他求情免于起诉', hint: '声望+++', outcome: '你向俱乐部求情不要起诉这个球迷，只是禁止他入场。球迷在社交媒体发文感谢，你的形象大涨。', effects: { reputation: 8, morale: 3, teammateRelation: 2 } },
    ],
  }),
  (ctx) => ({
    id: 'family_health_emergency',
    type: 'life',
    phase: 'midseason',
    title: '家人的紧急来电',
    narrative: `训练中场休息时，手机疯狂震动——是老家打来的。你接起来，母亲在电话那头哽咽："你爸...住院了，医生说要做手术..."信号不太好，但你能听出她声音里的恐惧和无助。\n\n你的脑子"嗡"了一下，训练的疲惫突然变得无足轻重。主教练在远处喊你归队，你攥着手机不知所措。`,
    options: [
      { label: '立即请假回家照顾', hint: '士气+，但缺席训练', outcome: '你向俱乐部请了三天假连夜赶回家。父亲手术顺利，看到你回来眼眶红了。归队时心里踏实了不少。', effects: { morale: 5, fitness: 8, composure: 'r1-2', money: -20000, coachRelation: -3 } },
      { label: '汇钱回去，训练后探望', hint: '职业态度，但内心煎熬', outcome: '你汇了一笔钱让母亲先垫付，约好休赛期回去探望。训练时心不在焉，被教练骂了几次。', effects: { money: -100000, morale: -6, fitness: -4, attrs: { composure: -1 } } },
      { label: '让家人先处理，自己专心赛季', hint: '理性但可能后悔', outcome: '你让亲戚先帮忙照顾，自己咬牙继续训练比赛。夜里翻来覆去睡不着。', effects: { morale: -8, composure: 1, attrs: { composure: 1 }, fitness: -3 } },
    ],
  }),
]

// ---------- 流动转会类（赛季中传闻 / 租借报价 / 大俱乐部关注） ----------
export const transferRumorEvents = [
  (ctx) => ({
    id: 'big_club_scout_visit',
    type: 'media',
    phase: 'midseason',
    title: '豪门球探现身看台',
    narrative: `今天的比赛看台上，有记者拍到${ctx.opponent.name}对阵时的贵宾席坐着一位西装革履的外国人。赛后经纪人神秘地告诉你："那是某五大联赛豪门的球探，专程来看你的。"\n\n消息很快在更衣室传开，队友们眼神复杂——有祝贺，有羡慕，也有酸意。主帅在发布会上被问到时只说了一句："他现在是我的人。"\n\n你的手机被打爆了，各路媒体都在求证。`,
    options: [
      { label: '低调回应，专注比赛', hint: '教练+，声望+', outcome: '你在采访中说："我只关心下一场比赛。"主帅满意地点点头，球迷也赞赏你的职业。', effects: { reputation: 4, coachRelation: 7, teammateRelation: 3, composure: 1, morale: 2 } },
      { label: '高调表态渴望留洋', hint: '声望++，但俱乐部不满', outcome: '"去欧洲是我的梦想！"你的话登上了头条。球迷兴奋，但俱乐部高层震怒，主帅把你叫去谈话。', effects: { reputation: 8, coachRelation: -8, morale: 3, teammateRelation: -3 } },
      { label: '让经纪人暗中运作', hint: '暧昧，两边观望', outcome: '你不置可否，让经纪人在背后接触欧洲球队。主帅对你态度冷淡了几分，但还没有撕破脸。', effects: { reputation: 2, coachRelation: -4, composure: 1 } },
    ],
  }),
  (ctx) => ({
    id: 'midseason_loan_offer',
    type: 'transfer',
    phase: 'midseason',
    title: '一份租借报价',
    narrative: `冬季转会窗即将关闭，经纪人紧急联系你：一家同城 rival 俱乐部愿意以租借形式签你半年，并且承诺主力位置。租借费不低，你的出场时间在当前俱乐部并不稳定——这是个跳出舒适圈的机会。\n\n但租借去直接竞争对手？这在球迷眼里可能等同于"叛变"。主教练知道后脸色铁青："你确定要去那边？"\n\n你的手机屏幕上，经纪人在等回复。`,
    options: [
      { label: '接受租借争取出场', hint: '出场机会+, 但球迷-', outcome: '你接受了租借。新球队给了你主力位置，但原俱乐部球迷在社交媒体上骂你是"叛徒"。', effects: { reputation: 3, morale: 2, attrs: { positioning: 'r1-2' }, fitness: 5 } },
      { label: '拒绝，留在原队竞争', hint: '忠诚+, 教练+', outcome: '你拒绝了租借报价，选择留下来竞争。主帅对你的忠诚很满意，之后给了你更多机会。', effects: { coachRelation: 8, teammateRelation: 5, reputation: 2, composure: 1 } },
      { label: '要求租借到海外联赛', hint: '冒险，高回报', outcome: '你提出如果租借，希望去海外联赛。经纪人多番运作，最终帮你联系到一支欧洲中游球队。', effects: { reputation: 6, coachRelation: -3, morale: 4, attrs: { vision: 1 } } },
    ],
  }),
  (ctx) => ({
    id: 'transfer_rumor_pressure',
    type: 'media',
    phase: 'midseason',
    title: '转会传闻满天飞',
    narrative: `最近一周，体育媒体铺天盖地都是关于你的转会传闻。有说你即将加盟豪门的，有说你要被甩卖的，甚至有记者编造了你和主帅吵架的"内幕"。你的社交媒体评论区炸了锅，球迷分成两派吵得不可开交。\n\n更衣室里气氛微妙，老队长把你叫到一边："小子，别让这些影响你。"\n\n训练场上，你能感觉到队友看你的眼神在变化。`,
    options: [
      { label: '召开发布会澄清', hint: '声望+，平息风波', outcome: '你召开发布会明确表态："我现在只属于这里。"舆论平息，球迷为你鼓掌。', effects: { reputation: 5, coachRelation: 6, teammateRelation: 4, composure: 1 } },
      { label: '关闭社交媒体，埋头训练', hint: '状态+, 但无公关', outcome: '你关闭了所有社交媒体，专心训练。状态回升，但舆论依然在发酵。', effects: { attrs: { finishing: 'r1-2', composure: 'r1-2' }, fitness: 5, reputation: -1 } },
      { label: '让经纪人发布模糊声明', hint: '暧昧，两边观望', outcome: '经纪人发了一份模棱两可的声明，既没否认也没确认。舆论继续发酵，但你的转会价值被炒高了。', effects: { reputation: 3, coachRelation: -4, morale: -1 } },
    ],
  }),
  (ctx) => ({
    id: 'agent_release_clause_push',
    type: 'transfer',
    phase: 'midseason',
    title: '经纪人建议激活解约金',
    narrative: `经纪人深夜给你打来电话："有一家顶级豪门愿意激活你合同里的解约金条款，转会费创俱乐部纪录。这是千载难逢的机会——去了那里你的曝光度和薪水都会翻倍。"\n\n他压低声音："但俱乐部不想放你，如果硬走，关系就彻底破裂了。你自己决定。"\n\n电话那头的沉默里，你能听见自己心跳的声音。这是一步登天的机会，也可能是一着险棋。`,
    options: [
      { label: '坚持留队，谢绝豪门', hint: '忠诚+++, 俱乐部传奇', outcome: '你告诉经纪人："我答应过球迷和教练。"主帅得知后眼眶湿润，把你当成了未来的队长培养。', effects: { reputation: 10, coachRelation: 12, teammateRelation: 8, morale: 6, composure: 'r1-2' } },
      { label: '接受报价，激活解约金', hint: '身价+, 但可能被骂', outcome: '你决定接受报价。消息传出后，原俱乐部球迷举着横幅抗议，但你获得了梦寐以求的豪门舞台。', effects: { reputation: 5, money: 2000000, coachRelation: -10, teammateRelation: -5, morale: 3 } },
      { label: '提出加薪续约作为条件', hint: '利用报价谈判', outcome: '你用这份报价作为筹码，要求俱乐部加薪续约。俱乐部同意了，但教练看你的眼神多了一丝防备。', effects: { money: 800000, reputation: 2, coachRelation: -5, salary: 0, morale: 4 } },
    ],
  }),
  (ctx) => ({
    id: 'star_teammate_transfer_in',
    type: 'transfer',
    phase: 'midseason',
    title: '大牌队友加盟',
    narrative: `转会窗最后一天，${ctx.player.team}宣布签下一名当打之年的国脚级球员，与你同位置！转会费打破了俱乐部纪录，他一到队就成了绝对核心。训练课上，他的技术和经验确实让你自愧不如。\n\n主教练把你叫到办公室："他的到来会挤压你的出场时间，但也是你学习的好机会。你可以选择租借出去练级，也可以留下来竞争。"\n\n这是一个艰难的抉择。`,
    options: [
      { label: '留下来和他竞争', hint: '成长+, 但出场-', outcome: '你选择留下来和他竞争。虽然出场时间减少，但每次训练都像在上大师课。', effects: { attrs: { finishing: 'r1-2', composure: 'r1-2', positioning: 1 }, teammateRelation: 4, morale: -2 } },
      { label: '主动申请租借练级', hint: '出场+, 但离开舒适区', outcome: '你申请租借到一家中游球队，获得了稳定的主力位置。半个赛季后回归时，你明显成熟了。', effects: { attrs: { positioning: 'r2-3', vision: 1 }, reputation: 3, coachRelation: 3, morale: 2 } },
      { label: '要求踢不同位置', hint: '多面手+, 适应性强', outcome: '你主动提出改踢另一个位置，避开了直接竞争。主帅对你的灵活性很赞赏。', effects: { attrs: { vision: 'r1-2', composure: 1 }, coachRelation: 5, reputation: 2 } },
    ],
  }),
  (ctx) => ({
    id: 'contract_expiry_pressure',
    type: 'transfer',
    phase: 'midseason',
    title: '合同只剩半年',
    narrative: `你的合同将在赛季末到期，到现在俱乐部还没主动提出续约谈判。经纪人提醒你："再不续约，一月起你就可以自由和其他俱乐部签约了。"\n\n训练场上，你能感觉到俱乐部高层在观察你——他们是想续约，还是在等你合同到期免费送走？这种不确定性让你心神不宁。\n\n队友私下议论："俱乐部这是在压价呢。"`,
    options: [
      { label: '主动找高层谈续约', hint: '争取主动权', outcome: '你主动约见了体育总监，明确表达了续约意愿。谈判开启，对方给了你一份还算体面的合同。', effects: { money: 300000, coachRelation: 3, morale: 4, composure: 1 } },
      { label: '让经纪人接触其他俱乐部', hint: '制造竞争, 但风险', outcome: '你让经纪人悄悄接触其他球队。消息泄露后，俱乐部急着送上续约合同，但教练对你冷淡了。', effects: { reputation: 3, coachRelation: -6, morale: 2, money: 200000 } },
      { label: '用表现说话，等俱乐部来找', hint: '可能被冷落', outcome: '你决定用场上表现争取合同。赛季结束前你打出了生涯最佳数据，多家俱乐部开始排队。', effects: { attrs: { finishing: 'r1-2', composure: 1 }, reputation: 5, morale: -2 } },
    ],
  }),
]

// 综合池（按阶段）
export const ALL_POOLS = {
  preseason: preseasonEvents,
  match: matchEvents,
  keymoment: keyMomentEvents,
  relationship: relationshipEvents,
  media: mediaEvents,
  life: lifeEvents,
  incident: incidentEvents,
  transfer: transferRumorEvents,
}

// 从指定池中随机抽取（去重 + 耗尽回退）
// makeCtx: 每次调用返回一个新的上下文（用于为每个match事件生成不同真实对手）
export function pickEvents(pools, count, usedIds, makeCtx) {
  const shuffleArr = (a) => {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  // 生成全部候选（每个用独立ctx，确保match事件的对手名写入叙事）
  const all = []
  for (const pool of pools) {
    for (const factory of pool) {
      all.push(factory(makeCtx()))
    }
  }
  // 优先未用过的
  const unused = shuffleArr(all.filter(e => !usedIds.has(e.id)))
  let picked = unused.slice(0, count)
  // 回退：若不够，从已用过的里补足（跨赛季允许复用，避免无事件可选）
  if (picked.length < count) {
    const used = shuffleArr(all.filter(e => usedIds.has(e.id)))
    picked = picked.concat(used.slice(0, count - picked.length))
  }
  return picked
}
