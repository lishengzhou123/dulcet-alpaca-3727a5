// 真实球星数据库 —— 身价排行榜 / 球员简介用
// 每条：name, team, league, pos, age, ovr, value(欧元), nation, traits[], bio
// 身价参考2024-25赛季市场估值量级

export const STAR_PLAYERS = [
  // ===== 英超 =====
  { name: '哈兰德', team: '曼城', league: 'EPL', pos: 'ST', age: 24, ovr: 91, value: 180000000, nation: '挪威', traits: ['强力射门','抢点','头球'], bio: '挪威超级射手，身高臂长却爆发力惊人，禁区内嗅觉顶级，打破英超单赛季进球纪录。' },
  { name: '德布劳内', team: '曼城', league: 'EPL', pos: 'CAM', age: 33, ovr: 88, value: 60000000, nation: '比利时', traits: ['直塞','远射','视野'], bio: '比利时中场大师，传球视野历史级，长传直塞皆绝，曼城王朝核心。' },
  { name: '福登', team: '曼城', league: 'EPL', pos: 'CAM', age: 24, ovr: 88, value: 110000000, nation: '英格兰', traits: ['盘带','沉着','搓射'], bio: '曼城青训瑰宝，技术细腻，左脚搓射一流，英格兰本土希望。' },
  { name: '罗德里', team: '曼城', league: 'EPL', pos: 'CDM', age: 28, ovr: 89, value: 110000000, nation: '西班牙', traits: ['预判','斗士','控球'], bio: '西班牙后腰，金球奖得主，攻防枢纽，单后腰体系标杆。' },
  { name: '萨卡', team: '阿森纳', league: 'EPL', pos: 'RW', age: 23, ovr: 87, value: 120000000, nation: '英格兰', traits: ['搓射','盘带','传中'], bio: '阿森纳青训飞翼，右路内切射门精准，英格兰主力边锋。' },
  { name: '厄德高', team: '阿森纳', league: 'EPL', pos: 'CAM', age: 25, ovr: 87, value: 100000000, nation: '挪威', traits: ['视野','直塞','沉着'], bio: '阿森纳队长，前场组织核心，左脚技术优雅，挪威天才。' },
  { name: '赖斯', team: '阿森纳', league: 'EPL', pos: 'CDM', age: 25, ovr: 87, value: 110000000, nation: '英格兰', traits: ['斗士','拦截','力量'], bio: '英格兰铁腰，攻守兼备，1亿英镑先生，枪手中场屏障。' },
  { name: '萨利巴', team: '阿森纳', league: 'EPL', pos: 'CB', age: 23, ovr: 86, value: 80000000, nation: '法国', traits: ['预判','速度','抢断'], bio: '法国中卫，速度与对抗兼备，阿森纳防线基石。' },
  { name: '萨拉赫', team: '利物浦', league: 'EPL', pos: 'RW', age: 32, ovr: 89, value: 65000000, nation: '埃及', traits: ['搓射','盘带','速度'], bio: '埃及法老，利物浦传奇，英超金靴常客，左脚内切无敌。' },
  { name: '范戴克', team: '利物浦', league: 'EPL', pos: 'CB', age: 33, ovr: 87, value: 35000000, nation: '荷兰', traits: ['力量','预判','头球'], bio: '荷兰铁卫，世界第一中卫之一，对抗与领袖气质顶级。' },
  { name: '麦卡利斯特', team: '利物浦', league: 'EPL', pos: 'CM', age: 25, ovr: 86, value: 80000000, nation: '阿根廷', traits: ['视野','控球','沉着'], bio: '阿根廷世界杯冠军中场，技术全面，红军中场大脑。' },
  { name: '努涅斯', team: '利物浦', league: 'EPL', pos: 'ST', age: 25, ovr: 83, value: 50000000, nation: '乌拉圭', traits: ['速度','冲击','抢点'], bio: '乌拉圭前锋，跑位灵动，门前把握时灵时鬼。' },
  { name: 'B费', team: '曼联', league: 'EPL', pos: 'CAM', age: 30, ovr: 86, value: 60000000, nation: '葡萄牙', traits: ['远射','直塞','视野'], bio: '葡萄牙前腰，曼联核心，远射与直塞俱佳，数据型中场。' },
  { name: '加纳乔', team: '曼联', league: 'EPL', pos: 'LW', age: 20, ovr: 81, value: 45000000, nation: '阿根廷', traits: ['速度','盘带','花式'], bio: '阿根廷边锋新星，速度快花式多，曼联未来希望。' },
  { name: '霍伊伦', team: '曼联', league: 'EPL', pos: 'ST', age: 21, ovr: 80, value: 50000000, nation: '丹麦', traits: ['抢点','冲击','力量'], bio: '丹麦高中锋，身体强壮，曼联锋线未来。' },
  { name: '卡塞米罗', team: '曼联', league: 'EPL', pos: 'CDM', age: 32, ovr: 84, value: 30000000, nation: '巴西', traits: ['拦截','斗士','力量'], bio: '巴西铁腰，皇马五座欧冠功臣，经验丰富。' },
  { name: '帕尔默', team: '切尔西', league: 'EPL', pos: 'CAM', age: 22, ovr: 85, value: 90000000, nation: '英格兰', traits: ['沉着','搓射','视野'], bio: '英格兰天才前腰，切尔西核心，冷静点球手，大心脏。' },
  { name: '恩佐', team: '切尔西', league: 'EPL', pos: 'CM', age: 23, ovr: 83, value: 60000000, nation: '阿根廷', traits: ['视野','控球','传球'], bio: '阿根廷世界杯冠军中场，传球视野出众。' },
  { name: '凯塞多', team: '切尔西', league: 'EPL', pos: 'CDM', age: 22, ovr: 83, value: 70000000, nation: '厄瓜多尔', traits: ['拦截','斗士','抢断'], bio: '厄瓜多尔后腰，1亿英镑先生，蓝军中场屏障。' },
  { name: '孙兴慜', team: '托特纳姆热刺', league: 'EPL', pos: 'LW', age: 32, ovr: 87, value: 45000000, nation: '韩国', traits: ['速度','搓射','盘带'], bio: '亚洲足球旗帜，英超金靴，热刺队长，左脚内切射门顶级。' },
  { name: '麦迪逊', team: '托特纳姆热刺', league: 'EPL', pos: 'CAM', age: 27, ovr: 84, value: 50000000, nation: '英格兰', traits: ['视野','直塞','搓射'], bio: '英格兰前腰，热刺创造力源泉。' },
  { name: '罗梅罗', team: '托特纳姆热刺', league: 'EPL', pos: 'CB', age: 26, ovr: 85, value: 55000000, nation: '阿根廷', traits: ['斗士','抢断','侵略性'], bio: '阿根廷世界杯冠军中卫，防守凶悍。' },
  { name: '伊萨克', team: '纽卡斯尔联', league: 'EPL', pos: 'ST', age: 25, ovr: 85, value: 90000000, nation: '瑞典', traits: ['盘带','沉着','射术'], bio: '瑞典前锋，技术细腻，纽卡锋线支柱。' },
  { name: '吉马良斯', team: '纽卡斯尔联', league: 'EPL', pos: 'CM', age: 26, ovr: 85, value: 70000000, nation: '巴西', traits: ['控球','视野','力量'], bio: '巴西中场，纽卡核心，攻守兼备。' },
  { name: '特里皮尔', team: '纽卡斯尔联', league: 'EPL', pos: 'RB', age: 33, ovr: 82, value: 12000000, nation: '英格兰', traits: ['传中','任意球','视野'], bio: '英格兰边卫，传中与定位球专家。' },
  { name: '沃特金斯', team: '阿斯顿维拉', league: 'EPL', pos: 'ST', age: 28, ovr: 84, value: 55000000, nation: '英格兰', traits: ['速度','抢点','冲击'], bio: '英格兰前锋，维拉锋线箭头，英格兰国脚。' },

  // ===== 西甲 =====
  { name: '姆巴佩', team: '皇家马德里', league: 'LALIGA', pos: 'ST', age: 25, ovr: 91, value: 180000000, nation: '法国', traits: ['速度','强力射门','盘带'], bio: '法国巨星，速度之王，世界杯金靴，皇马新王。' },
  { name: '维尼修斯', team: '皇家马德里', league: 'LALIGA', pos: 'LW', age: 24, ovr: 90, value: 150000000, nation: '巴西', traits: ['盘带','速度','花式'], bio: '巴西飞翼，金球奖热门，左路过人如麻。' },
  { name: '贝林厄姆', team: '皇家马德里', league: 'LALIGA', pos: 'CAM', age: 21, ovr: 90, value: 180000000, nation: '英格兰', traits: ['沉着','前插','视野'], bio: '英格兰天才，皇马新核，前插抢点与组织兼备。' },
  { name: '罗德里戈', team: '皇家马德里', league: 'LALIGA', pos: 'RW', age: 23, ovr: 86, value: 100000000, nation: '巴西', traits: ['盘带','沉着','搓射'], bio: '巴西边锋，欧冠关键先生，大场面球员。' },
  { name: '莱万', team: '巴塞罗那', league: 'LALIGA', pos: 'ST', age: 36, ovr: 87, value: 25000000, nation: '波兰', traits: ['抢点','射术','头球'], bio: '波兰神锋，两届世界杯金靴级射手，巴萨锋霸。' },
  { name: '亚马尔', team: '巴塞罗那', league: 'LALIGA', pos: 'RW', age: 17, ovr: 84, value: 120000000, nation: '西班牙', traits: ['盘带','视野','花式'], bio: '西班牙超新星，欧洲杯横空出世，巴萨未来核心。' },
  { name: '佩德里', team: '巴塞罗那', league: 'LALIGA', pos: 'CM', age: 21, ovr: 86, value: 90000000, nation: '西班牙', traits: ['控球','视野','沉着'], bio: '西班牙金童，巴萨中场大脑，技术细腻。' },
  { name: '加维', team: '巴塞罗那', league: 'LALIGA', pos: 'CM', age: 20, ovr: 83, value: 70000000, nation: '西班牙', traits: ['斗士','控球','侵略性'], bio: '西班牙小将，斗士精神，巴萨中场未来。' },
  { name: '格列兹曼', team: '马德里竞技', league: 'LALIGA', pos: 'CF', age: 33, ovr: 86, value: 30000000, nation: '法国', traits: ['视野','沉着','射术'], bio: '法国世界杯冠军，马竞传奇，全能二前锋。' },
  { name: '阿尔瓦雷斯', team: '马德里竞技', league: 'LALIGA', pos: 'ST', age: 24, ovr: 85, value: 75000000, nation: '阿根廷', traits: ['抢点','沉着','射术'], bio: '阿根廷世界杯冠军，曼城转投马竞，冷静终结者。' },
  { name: '奥布拉克', team: '马德里竞技', league: 'LALIGA', pos: 'GK', age: 31, ovr: 87, value: 40000000, nation: '斯洛文尼亚', traits: ['扑救反应','门将站位','鱼跃'], bio: '斯洛文尼亚门神，世界顶级门将之一。' },
  { name: '久保建英', team: '皇家社会', league: 'LALIGA', pos: 'RW', age: 23, ovr: 82, value: 35000000, nation: '日本', traits: ['盘带','控球','搓射'], bio: '日本天才，皇马青训出身，皇家社会核心。' },

  // ===== 德甲 =====
  { name: '凯恩', team: '拜仁慕尼黑', league: 'BUNDES', pos: 'ST', age: 31, ovr: 90, value: 90000000, nation: '英格兰', traits: ['射术','沉着','视野'], bio: '英格兰队长，热刺传奇转投拜仁，全能中锋标杆。' },
  { name: '穆西亚拉', team: '拜仁慕尼黑', league: 'BUNDES', pos: 'CAM', age: 21, ovr: 87, value: 130000000, nation: '德国', traits: ['盘带','敏捷','花式'], bio: '德国天才，盘带过人如麻，拜仁未来核心。' },
  { name: '基米希', team: '拜仁慕尼黑', league: 'BUNDES', pos: 'CM', age: 29, ovr: 87, value: 50000000, nation: '德国', traits: ['视野','传球','斗士'], bio: '德国全能中场，拜仁领袖，攻守皆能。' },
  { name: '萨内', team: '拜仁慕尼黑', league: 'BUNDES', pos: 'LW', age: 28, ovr: 84, value: 45000000, nation: '德国', traits: ['速度','盘带','强力射门'], bio: '德国边锋，速度与技术兼备。' },
  { name: '维尔茨', team: '勒沃库森', league: 'BUNDES', pos: 'CAM', age: 21, ovr: 87, value: 130000000, nation: '德国', traits: ['视野','盘带','沉着'], bio: '德国超新星，勒沃库森不败夺冠核心，天才前腰。' },
  { name: '格里马尔多', team: '勒沃库森', league: 'BUNDES', pos: 'LB', age: 29, ovr: 85, value: 40000000, nation: '西班牙', traits: ['传中','任意球','速度'], bio: '西班牙边卫，勒沃库森助攻王。' },
  { name: '博尼费斯', team: '勒沃库森', league: 'BUNDES', pos: 'ST', age: 23, ovr: 82, value: 40000000, nation: '尼日利亚', traits: ['力量','抢点','冲击'], bio: '尼日利亚前锋，药厂锋霸。' },
  { name: '阿德耶米', team: '多特蒙德', league: 'BUNDES', pos: 'LW', age: 22, ovr: 83, value: 45000000, nation: '德国', traits: ['速度','盘带','冲击'], bio: '德国快马，欧冠表现亮眼。' },
  { name: '布兰特', team: '多特蒙德', league: 'BUNDES', pos: 'CAM', age: 28, ovr: 84, value: 35000000, nation: '德国', traits: ['视野','直塞','控球'], bio: '德国前腰，多特创造力源泉。' },
  { name: '胡梅尔斯', team: '多特蒙德', league: 'BUNDES', pos: 'CB', age: 35, ovr: 83, value: 8000000, nation: '德国', traits: ['预判','拦截','视野'], bio: '德国老将，世界杯冠军，经验丰富。' },
  { name: '奥彭达', team: '莱比锡红牛', league: 'BUNDES', pos: 'ST', age: 24, ovr: 83, value: 50000000, nation: '比利时', traits: ['速度','抢点','冲击'], bio: '比利时前锋，莱比锡锋线尖刀。' },
  { name: '哈维·西蒙斯', team: '莱比锡红牛', league: 'BUNDES', pos: 'CAM', age: 21, ovr: 85, value: 80000000, nation: '荷兰', traits: ['盘带','视野','沉着'], bio: '荷兰天才，巴黎外租莱比锡，未来之星。' },

  // ===== 意甲 =====
  { name: '劳塔罗', team: '国际米兰', league: 'SERIEA', pos: 'ST', age: 27, ovr: 88, value: 95000000, nation: '阿根廷', traits: ['抢点','沉着','斗士'], bio: '阿根廷世界杯冠军，国米队长，意甲金靴。' },
  { name: '巴雷拉', team: '国际米兰', league: 'SERIEA', pos: 'CM', age: 27, ovr: 87, value: 80000000, nation: '意大利', traits: ['视野','斗士','传球'], bio: '意大利中场，国米大脑，攻守兼备。' },
  { name: '图拉姆', team: '国际米兰', league: 'SERIEA', pos: 'ST', age: 27, ovr: 85, value: 65000000, nation: '法国', traits: ['速度','力量','盘带'], bio: '法国前锋，名宿之子，国米锋线支柱。' },
  { name: '弗拉霍维奇', team: '尤文图斯', league: 'SERIEA', pos: 'ST', age: 24, ovr: 84, value: 55000000, nation: '塞尔维亚', traits: ['射术','强力射门','头球'], bio: '塞尔维亚高中锋，尤文锋霸。' },
  { name: '维阿', team: '尤文图斯', league: 'SERIEA', pos: 'RW', age: 23, ovr: 80, value: 30000000, nation: '美国', traits: ['速度','冲击','盘带'], bio: '美国国脚，名宿之子，尤文边路。' },
  { name: '莱奥', team: 'AC米兰', league: 'SERIEA', pos: 'LW', age: 25, ovr: 86, value: 80000000, nation: '葡萄牙', traits: ['速度','盘带','强力射门'], bio: '葡萄牙边锋，米兰核心，左路过人如麻。' },
  { name: '普利西奇', team: 'AC米兰', league: 'SERIEA', pos: 'RW', age: 26, ovr: 84, value: 50000000, nation: '美国', traits: ['盘带','速度','沉着'], bio: '美国队长，米兰边路创造力。' },
  { name: '迈尼昂', team: 'AC米兰', league: 'SERIEA', pos: 'GK', age: 29, ovr: 87, value: 45000000, nation: '法国', traits: ['扑救反应','开球','门将站位'], bio: '法国门神，世界顶级门将之一。' },
  { name: '奥斯梅恩', team: '那不勒斯', league: 'SERIEA', pos: 'ST', age: 25, ovr: 88, value: 90000000, nation: '尼日利亚', traits: ['速度','力量','抢点'], bio: '尼日利亚锋霸，那不勒斯夺冠功臣。' },
  { name: '克瓦拉茨赫利亚', team: '那不勒斯', league: 'SERIEA', pos: 'LW', age: 23, ovr: 86, value: 85000000, nation: '格鲁吉亚', traits: ['盘带','花式','搓射'], bio: '格鲁吉亚天才，那不勒斯夺冠核心，过人如麻。' },
  { name: '迪巴拉', team: '罗马', league: 'SERIEA', pos: 'CF', age: 30, ovr: 85, value: 30000000, nation: '阿根廷', traits: ['射术','沉着','视野'], bio: '阿根廷前腰，罗马队长，技术细腻。' },
  { name: '佩莱格里尼', team: '罗马', league: 'SERIEA', pos: 'CM', age: 28, ovr: 83, value: 30000000, nation: '意大利', traits: ['视野','传球','远射'], bio: '意大利中场，罗马青训旗帜。' },

  // ===== 法甲 =====
  { name: '登贝莱', team: '巴黎圣日耳曼', league: 'LIGUE1', pos: 'RW', age: 27, ovr: 86, value: 60000000, nation: '法国', traits: ['速度','盘带','花式'], bio: '法国边锋，速度与技术兼备，巴黎核心。' },
  { name: '巴尔科拉', team: '巴黎圣日耳曼', league: 'LIGUE1', pos: 'LW', age: 22, ovr: 84, value: 60000000, nation: '法国', traits: ['速度','盘带','冲击'], bio: '法国新星，巴黎飞翼。' },
  { name: '维蒂尼亚', team: '巴黎圣日耳曼', league: 'LIGUE1', pos: 'CM', age: 24, ovr: 86, value: 70000000, nation: '葡萄牙', traits: ['控球','视野','传球'], bio: '葡萄牙中场，巴黎大脑。' },
  { name: '多纳鲁马', team: '巴黎圣日耳曼', league: 'LIGUE1', pos: 'GK', age: 25, ovr: 87, value: 45000000, nation: '意大利', traits: ['扑救反应','鱼跃','身高'], bio: '意大利门神，欧洲杯MVP，巴黎主力门将。' },
  { name: '本耶德尔', team: '摩纳哥', league: 'LIGUE1', pos: 'ST', age: 33, ovr: 82, value: 12000000, nation: '法国', traits: ['射术','抢点','沉着'], bio: '法国前锋，摩纳哥锋线老将。' },
  { name: '南野拓实', team: '摩纳哥', league: 'LIGUE1', pos: 'CAM', age: 29, ovr: 82, value: 18000000, nation: '日本', traits: ['视野','控球','沉着'], bio: '日本前腰，利物浦转投摩纳哥。' },
  { name: '奥巴梅扬', team: '马赛', league: 'LIGUE1', pos: 'ST', age: 35, ovr: 81, value: 8000000, nation: '加蓬', traits: ['速度','抢点','射术'], bio: '加蓬前锋，阿森纳传奇，马赛锋霸。' },
  { name: '戴维', team: '里尔', league: 'LIGUE1', pos: 'ST', age: 24, ovr: 82, value: 45000000, nation: '加拿大', traits: ['速度','抢点','沉着'], bio: '加拿大前锋，里尔锋线尖刀。' },

  // ===== 中超 =====
  { name: '奥斯卡', team: '上海海港', league: 'CSL', pos: 'CAM', age: 33, ovr: 80, value: 8000000, nation: '巴西', traits: ['视野','直塞','控球'], bio: '巴西前腰，前切尔西核心，中超第一外援。' },
  { name: '武磊', team: '上海海港', league: 'CSL', pos: 'ST', age: 32, ovr: 76, value: 1500000, nation: '中国', traits: ['速度','抢点','跑位'], bio: '中国第一前锋，留洋西甲归来，国足核心。' },
  { name: '王大雷', team: '山东泰山', league: 'CSL', pos: 'GK', age: 35, ovr: 75, value: 800000, nation: '中国', traits: ['扑救反应','开球','领袖'], bio: '中国国门，山东泰山功勋门将。' },
  { name: '克雷桑', team: '山东泰山', league: 'CSL', pos: 'ST', age: 28, ovr: 78, value: 4000000, nation: '巴西', traits: ['力量','射术','盘带'], bio: '巴西前锋，山东泰山锋霸。' },
  { name: '韦世豪', team: '广州队', league: 'CSL', pos: 'LW', age: 29, ovr: 73, value: 600000, nation: '中国', traits: ['盘带','速度','左脚'], bio: '中国边锋，个性鲜明，留洋归来。' },
  { name: '张玉宁', team: '北京国安', league: 'CSL', pos: 'ST', age: 27, ovr: 74, value: 700000, nation: '中国', traits: ['力量','头球','抢点'], bio: '中国高中锋，国安锋霸，国足主力。' },
  { name: '马尔康', team: '武汉三镇', league: 'CSL', pos: 'ST', age: 30, ovr: 76, value: 2000000, nation: '巴西', traits: ['身高','头球','力量'], bio: '巴西高中锋，三镇夺冠功臣。' },
  { name: '斯坦丘', team: '武汉三镇', league: 'CSL', pos: 'CM', age: 31, ovr: 77, value: 2500000, nation: '罗马尼亚', traits: ['任意球','远射','视野'], bio: '罗马尼亚中场，三镇夺冠核心。' },
]

// 杯赛定义
export const CUPS = {
  UCL: {
    name: '欧洲冠军联赛',
    short: '欧冠',
    icon: '🏆',
    color: '#1a237e',
    desc: '欧洲俱乐部最高荣誉，32强小组赛起',
    eligibleLeagues: ['EPL', 'LALIGA', 'BUNDES', 'SERIEA', 'LIGUE1'],
    minLeaguePos: 4, // 联赛前4可参赛
  },
  ACL: {
    name: '亚足联冠军联赛',
    short: '亚冠',
    icon: '🌏',
    color: '#b71c1c',
    desc: '亚洲俱乐部最高荣誉',
    eligibleLeagues: ['CSL'],
    minLeaguePos: 2,
  },
  FACup: {
    name: '中国足协杯',
    short: '足协杯',
    icon: '🥇',
    color: '#ff6f00',
    desc: '中国国内杯赛，中超中甲球队均可参加',
    eligibleLeagues: ['CSL', 'CSL2'],
    minLeaguePos: 99,
  },
}

// 工具：按联赛获取球员
export function playersByLeague(leagueCode) {
  return STAR_PLAYERS.filter(p => p.league === leagueCode)
}

// 工具：按球队获取球员
export function playersByTeam(teamName) {
  return STAR_PLAYERS.filter(p => p.team === teamName)
}

// 工具：查找球员
export function findPlayer(name) {
  return STAR_PLAYERS.find(p => p.name === name)
}

// ===== 动态身价/简介：随赛季年份变化 =====
// 基准年份 2024（STAR_PLAYERS 数据快照）
const STAR_BASE_YEAR = 2024

// 年龄身价系数（峰值24-28，与 player.js 一致）
function starAgeValueFactor(age) {
  if (age <= 17) return 1.7
  if (age <= 19) return 1.55
  if (age <= 21) return 1.35
  if (age <= 23) return 1.2
  if (age <= 27) return 1.1
  if (age === 28) return 1.0
  if (age === 29) return 0.92
  if (age === 30) return 0.78
  if (age === 31) return 0.62
  if (age === 32) return 0.48
  if (age === 33) return 0.36
  if (age <= 35) return 0.26
  if (age <= 37) return 0.16
  return 0.08
}

// 计算真实球员在给定年份的身价（随年龄浮动）
export function dynamicStarValue(p, year) {
  const yearOffset = year - STAR_BASE_YEAR
  const currentAge = p.age + yearOffset
  // 基准身价 = 原身价，乘以当前年龄系数 / 基准年龄系数
  const baseFactor = starAgeValueFactor(p.age)
  const curFactor = starAgeValueFactor(currentAge)
  // OVR 随年龄小幅变化：年轻球员缓慢成长，老将衰退
  let ovrAdj = 0
  if (currentAge <= p.age) ovrAdj = 0
  else if (currentAge <= 24 && p.age <= 24) ovrAdj = Math.min(4, yearOffset)
  else if (currentAge >= 32) ovrAdj = -Math.min(8, (currentAge - 31) * 1.5)
  else ovrAdj = Math.max(-2, Math.min(2, yearOffset * 0.3))
  const curOvr = Math.max(50, Math.min(95, p.ovr + Math.round(ovrAdj)))
  // 身价 = 基准 * (curFactor/baseFactor) * OVR变化溢价
  let v = p.value * (curFactor / baseFactor)
  if (curOvr > p.ovr) v *= 1 + (curOvr - p.ovr) * 0.04
  else if (curOvr < p.ovr) v *= 1 - (p.ovr - curOvr) * 0.05
  return Math.max(500000, Math.round(v))
}

// 计算真实球员在给定年份的年龄
export function dynamicStarAge(p, year) {
  return p.age + (year - STAR_BASE_YEAR)
}

// 计算真实球员在给定年份的OVR
export function dynamicStarOvr(p, year) {
  const yearOffset = year - STAR_BASE_YEAR
  const currentAge = p.age + yearOffset
  let ovrAdj = 0
  if (currentAge <= 24 && p.age <= 24) ovrAdj = Math.min(4, yearOffset)
  else if (currentAge >= 32) ovrAdj = -Math.min(8, (currentAge - 31) * 1.5)
  else ovrAdj = Math.max(-2, Math.min(2, yearOffset * 0.3))
  return Math.max(50, Math.min(95, p.ovr + Math.round(ovrAdj)))
}

// 生成动态简介（原简介 + 当前状态）
export function dynamicStarBio(p, year) {
  const yearOffset = year - STAR_BASE_YEAR
  if (yearOffset === 0) return p.bio
  const curAge = p.age + yearOffset
  let status = ''
  if (curAge >= 35) status = '如今已是职业生涯暮年，经验老道但体能下滑。'
  else if (curAge >= 32) status = '步入生涯后期，状态稳定，仍是球队重要一员。'
  else if (curAge >= 28) status = '正值当打之年，处于职业生涯巅峰期。'
  else if (curAge >= 24) status = '已成长为球队核心，正值黄金年龄。'
  else if (curAge >= 20) status = '持续兑现天赋，稳步成长中。'
  else status = '年少成名，未来可期。'
  return `${p.bio} ${status}`
}
