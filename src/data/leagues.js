// 真实联赛与球队数据（含部分真实球星用于氛围）
// 每支球队：name, league, country, reputation(声望1-100), strength(整体实力OVR级), starPlayers[]

export const LEAGUES = {
  CSL: { name: '中国足球超级联赛', short: '中超', country: '中国', tier: 1, color: '#e60012' },
  CSL2: { name: '中国足球甲级联赛', short: '中甲', country: '中国', tier: 2, color: '#ff6600' },
  EPL: { name: '英格兰足球超级联赛', short: '英超', country: '英格兰', tier: 1, color: '#3d195b' },
  CHAMP: { name: '英格兰冠军联赛', short: '英冠', country: '英格兰', tier: 2, color: '#ff7f00' },
  LALIGA: { name: '西班牙足球甲级联赛', short: '西甲', country: '西班牙', tier: 1, color: '#ee8707' },
  LALIGA2: { name: '西班牙足球乙级联赛', short: '西乙', country: '西班牙', tier: 2, color: '#ffa726' },
  BUNDES: { name: '德国足球甲级联赛', short: '德甲', country: '德国', tier: 1, color: '#d20515' },
  BUNDES2: { name: '德国足球乙级联赛', short: '德乙', country: '德国', tier: 2, color: '#e53935' },
  SERIEA: { name: '意大利足球甲级联赛', short: '意甲', country: '意大利', tier: 1, color: '#008fd7' },
  SERIEB: { name: '意大利足球乙级联赛', short: '意乙', country: '意大利', tier: 2, color: '#29b6f6' },
  LIGUE1: { name: '法国足球甲级联赛', short: '法甲', country: '法国', tier: 1, color: '#091c3e' },
  LIGUE2: { name: '法国足球乙级联赛', short: '法乙', country: '法国', tier: 2, color: '#1565c0' },
  EREDIVISIE: { name: '荷兰足球甲级联赛', short: '荷甲', country: '荷兰', tier: 1, color: '#ff6600' },
  LIGA_PT: { name: '葡萄牙足球超级联赛', short: '葡超', country: '葡萄牙', tier: 1, color: '#00a651' },
  LIGUE_1_BE: { name: '比利时足球甲级联赛', short: '比甲', country: '比利时', tier: 1, color: '#ffb71c' },
  J1: { name: '日本职业足球甲级联赛', short: 'J1联赛', country: '日本', tier: 1, color: '#0070c0' },
  K1: { name: '韩国K联赛1', short: 'K1联赛', country: '韩国', tier: 1, color: '#cd2e3a' },
  SaudiL: { name: '沙特阿拉伯职业足球联赛', short: '沙特联', country: '沙特阿拉伯', tier: 1, color: '#006c35' },
  MLS: { name: '美国职业足球大联盟', short: '美职联', country: '美国', tier: 1, color: '#23395d' },
  Brasileirao: { name: '巴西足球甲级联赛', short: '巴甲', country: '巴西', tier: 1, color: '#009c3b' },
  ARG: { name: '阿根廷足球甲级联赛', short: '阿超', country: '阿根廷', tier: 1, color: '#75aadb' },
  SuperLig: { name: '土耳其足球超级联赛', short: '土超', country: '土耳其', tier: 1, color: '#e30a17' },
}

export const TEAMS = [
  // ===== 中超 =====
  { name: '广州队', league: 'CSL', country: '中国', reputation: 78, strength: 72, starPlayers: ['韦世豪', '杨立瑜'], city: '广州', stadium: '天河体育中心', founded: 1954, desc: '八冠王豪门，曾称霸亚洲足坛，青训体系完善，近年深耕本土年轻球员。' },
  { name: '山东泰山', league: 'CSL', country: '中国', reputation: 80, strength: 75, starPlayers: ['王大雷', '克雷桑'], city: '济南', stadium: '济南奥体中心', founded: 1993, desc: '山东足球旗帜，五夺中超冠军，以稳健防守和青训著称，足坛老牌劲旅。' },
  { name: '上海海港', league: 'CSL', country: '中国', reputation: 80, strength: 76, starPlayers: ['奥斯卡', '武磊'], city: '上海', stadium: '浦东足球场', founded: 2005, desc: '上港集团旗下，近年崛起的新贵，曾打破恒大垄断夺冠，武磊母队。' },
  { name: '北京国安', league: 'CSL', country: '中国', reputation: 78, strength: 73, starPlayers: ['张玉宁', '侯永永'], city: '北京', stadium: '工人体育场', founded: 1992, desc: '首都球队，"国安永远争第一"的口号响彻足坛，传统豪门之一。' },
  { name: '上海申花', league: 'CSL', country: '中国', reputation: 76, strength: 72, starPlayers: ['于汉超', '马莱莱'], city: '上海', stadium: '上海体育场', founded: 1993, desc: '上海滩老牌球队，甲A元年的代表，底蕴深厚，球迷文化浓厚。' },
  { name: '武汉三镇', league: 'CSL', country: '中国', reputation: 74, strength: 71, starPlayers: ['马尔康', '斯坦丘'], city: '武汉', stadium: '武汉体育中心', founded: 2009, desc: '中超新贵，升班马即夺冠的奇迹缔造者，外援配置出色。' },
  { name: '成都蓉城', league: 'CSL', country: '中国', reputation: 72, strength: 70, starPlayers: ['罗慕洛', '费利佩'], city: '成都', stadium: '凤凰山体育公园', founded: 2018, desc: '西南足球代表，凤凰山魔鬼主场闻名，球市火爆。' },
  { name: '浙江队', league: 'CSL', country: '中国', reputation: 70, strength: 69, starPlayers: ['穆谢奎', '莱昂纳多'], city: '杭州', stadium: '黄龙体育中心', founded: 1998, desc: '浙江绿城青训出身，技术流打法，培养众多国脚。' },
  { name: '河南队', league: 'CSL', country: '中国', reputation: 68, strength: 67, starPlayers: ['阿德里安', '黄紫昌'], city: '郑州', stadium: '航海体育场', founded: 1994, desc: '中原足球代表，作风顽强，"专治各种不服"的硬汉球队。' },
  { name: '天津津门虎', league: 'CSL', country: '中国', reputation: 67, strength: 66, starPlayers: ['王秋明', '贝里奇'], city: '天津', stadium: '泰达足球场', founded: 1998, desc: '津门足球旗帜，曾获足协杯冠军，北方传统球队。' },
  // 中甲
  { name: '青岛西海岸', league: 'CSL2', country: '中国', reputation: 55, strength: 60, starPlayers: ['瓦尔科维奇'], city: '青岛', stadium: '西海岸大学城体育场', founded: 2013, desc: '青岛新军，立志冲超的海岸球队。' },
  { name: '石家庄功夫', league: 'CSL2', country: '中国', reputation: 50, strength: 58, starPlayers: ['南小亨'], city: '石家庄', stadium: '裕彤体育中心', founded: 2010, desc: '河北球队，中甲中游力量。' },

  // ===== 英超 =====
  { name: '曼城', league: 'EPL', country: '英格兰', reputation: 96, strength: 90, starPlayers: ['哈兰德', '德布劳内', '福登', '罗德里'], city: '曼彻斯特', stadium: '伊蒂哈德球场', founded: 1880, desc: '瓜迪奥拉执教的英超霸主，传控足球巅峰代表，近年统治英格兰足坛。' },
  { name: '阿森纳', league: 'EPL', country: '英格兰', reputation: 92, strength: 86, starPlayers: ['萨卡', '厄德高', '赖斯', '萨利巴'], city: '伦敦', stadium: '酋长球场', founded: 1886, desc: '北伦敦豪门，不败夺冠传奇，青年军崛起，阿尔特塔带队复兴。' },
  { name: '利物浦', league: 'EPL', country: '英格兰', reputation: 93, strength: 87, starPlayers: ['萨拉赫', '范戴克', '麦卡利斯特', '努涅斯'], city: '利物浦', stadium: '安菲尔德球场', founded: 1892, desc: '红军六冠王欧冠豪门，You\'ll Never Walk Alone的歌声响彻安菲尔德。' },
  { name: '曼联', league: 'EPL', country: '英格兰', reputation: 90, strength: 82, starPlayers: ['B费', '加纳乔', '霍伊伦', '卡塞米罗'], city: '曼彻斯特', stadium: '老特拉福德球场', founded: 1878, desc: '二十冠王英超历史最成功球队，弗格森王朝缔造红魔传奇。' },
  { name: '切尔西', league: 'EPL', country: '英格兰', reputation: 89, strength: 82, starPlayers: ['帕尔默', '恩佐', '凯塞多', '杰克逊'], city: '伦敦', stadium: '斯坦福桥球场', founded: 1905, desc: '西伦敦蓝军，欧冠冠军，金元足球代表，近年大力投资青年军。' },
  { name: '托特纳姆热刺', league: 'EPL', country: '英格兰', reputation: 87, strength: 82, starPlayers: ['孙兴慜', '麦迪逊', '罗梅罗', '维尔纳'], city: '伦敦', stadium: '热刺球场', founded: 1882, desc: '北伦敦球队，凯恩孙兴慜黄金组合闻名，新球场现代化标杆。' },
  { name: '纽卡斯尔联', league: 'EPL', country: '英格兰', reputation: 84, strength: 80, starPlayers: ['伊萨克', '吉马良斯', '特里皮尔'], city: '纽卡斯尔', stadium: '圣詹姆斯公园球场', founded: 1892, desc: '沙特财团入主后的新贵，喜鹊军团，圣詹姆斯公园气氛热烈。' },
  { name: '阿斯顿维拉', league: 'EPL', country: '英格兰', reputation: 80, strength: 78, starPlayers: ['沃特金斯', '马丁内斯'], city: '伯明翰', stadium: '维拉公园球场', founded: 1874, desc: '欧冠老牌冠军，维拉公园历史厚重，埃梅里带队重返欧洲赛场。' },

  // ===== 西甲 =====
  { name: '皇家马德里', league: 'LALIGA', country: '西班牙', reputation: 97, strength: 90, starPlayers: ['姆巴佩', '维尼修斯', '贝林厄姆', '罗德里戈'], city: '马德里', stadium: '伯纳乌球场', founded: 1902, desc: '十五冠王欧冠之王，世界最伟大俱乐部，银河战舰星光熠熠。' },
  { name: '巴塞罗那', league: 'LALIGA', country: '西班牙', reputation: 95, strength: 87, starPlayers: ['莱万', '亚马尔', '佩德里', '加维'], city: '巴塞罗那', stadium: '蒙特惠奇奥林匹克体育场', founded: 1899, desc: '梦之队传控足球鼻祖，拉玛西亚青训摇篮，"不仅仅是一家俱乐部"。' },
  { name: '马德里竞技', league: 'LALIGA', country: '西班牙', reputation: 90, strength: 84, starPlayers: ['格列兹曼', '阿尔瓦雷斯', '奥布拉克'], city: '马德里', stadium: '大都会球场', founded: 1903, desc: '西蒙尼打造的铁血军团，床单军团，防守反击的标杆球队。' },
  { name: '皇家社会', league: 'LALIGA', country: '西班牙', reputation: 82, strength: 79, starPlayers: ['久保建英', '奥亚萨瓦尔'], city: '圣塞巴斯蒂安', stadium: '阿诺埃塔球场', founded: 1909, desc: '巴斯克球队，青训出色，技术细腻，久保建英的母队。' },
  { name: '比利亚雷亚尔', league: 'LALIGA', country: '西班牙', reputation: 76, strength: 75, starPlayers: ['赫拉德·莫雷诺'], city: '比利亚雷亚尔', stadium: '陶瓷球场', founded: 1923, desc: '黄色潜水艇，小城大梦想，曾杀入欧冠四强。' },

  // ===== 德甲 =====
  { name: '拜仁慕尼黑', league: 'BUNDES', country: '德国', reputation: 95, strength: 88, starPlayers: ['凯恩', '穆西亚拉', '基米希', '萨内'], city: '慕尼黑', stadium: '安联球场', founded: 1900, desc: '南部之星，德甲十一连冠霸主，六冠王伟业，德国足球象征。' },
  { name: '勒沃库森', league: 'BUNDES', country: '德国', reputation: 88, strength: 85, starPlayers: ['维尔茨', '格里马尔多', '博尼费斯'], city: '勒沃库森', stadium: '拜耳竞技场', founded: 1904, desc: '药厂球队，哈维·阿隆索带队不败夺冠缔造奇迹，德国足球新势力。' },
  { name: '多特蒙德', league: 'BUNDES', country: '德国', reputation: 88, strength: 83, starPlayers: ['阿德耶米', '布兰特', '胡梅尔斯'], city: '多特蒙德', stadium: '信号伊度纳公园', founded: 1909, desc: '黄黑军团，欧洲第一魔鬼主场，南看台黄色墙震撼人心。' },
  { name: '莱比锡红牛', league: 'BUNDES', country: '德国', reputation: 84, strength: 81, starPlayers: ['奥彭达', '哈维·西蒙斯'], city: '莱比锡', stadium: '红牛竞技场', founded: 2009, desc: '红牛集团旗下新贵，现代化管理标杆，青训+数据驱动的代表。' },

  // ===== 意甲 =====
  { name: '国际米兰', league: 'SERIEA', country: '意大利', reputation: 91, strength: 86, starPlayers: ['劳塔罗', '巴雷拉', '图拉姆'], city: '米兰', stadium: '梅阿查球场', founded: 1908, desc: '蓝黑军团，三冠王伟业缔造者，米兰城德比主角，意甲传统豪门。' },
  { name: '尤文图斯', league: 'SERIEA', country: '意大利', reputation: 90, strength: 84, starPlayers: ['弗拉霍维奇', '图拉姆', '维阿'], city: '都灵', stadium: '安联球场', founded: 1897, desc: '老妇人，意甲九连冠王朝缔造者，意大利足球历史最成功俱乐部。' },
  { name: 'AC米兰', league: 'SERIEA', country: '意大利', reputation: 88, strength: 83, starPlayers: ['莱奥', '普利西奇', '迈尼昂'], city: '米兰', stadium: '圣西罗球场', founded: 1899, desc: '红黑军团，七冠欧冠之王，米兰德比另一主角，卡卡舍甫琴科的母队。' },
  { name: '那不勒斯', league: 'SERIEA', country: '意大利', reputation: 86, strength: 82, starPlayers: ['奥斯梅恩', '克瓦拉茨赫利亚'], city: '那不勒斯', stadium: '马拉多纳球场', founded: 1926, desc: '马拉多纳母队，南方足球骄傲，33年后重夺意甲冠军感动全城。' },
  { name: '罗马', league: 'SERIEA', country: '意大利', reputation: 84, strength: 80, starPlayers: ['迪巴拉', '佩莱格里尼'], city: '罗马', stadium: '奥林匹克球场', founded: 1927, desc: '红狼军团，永恒之城球队，穆里尼奥曾带队夺得欧会杯冠军。' },

  // ===== 法甲 =====
  { name: '巴黎圣日耳曼', league: 'LIGUE1', country: '法国', reputation: 94, strength: 87, starPlayers: ['登贝莱', '巴尔科拉', '维蒂尼亚', '多纳鲁马'], city: '巴黎', stadium: '王子公园球场', founded: 1970, desc: '卡塔尔财团入主后的法甲霸主，姆巴佩母队，立志欧冠突破。' },
  { name: '摩纳哥', league: 'LIGUE1', country: '法国', reputation: 82, strength: 79, starPlayers: ['本耶德尔', '南野拓实'], city: '摩纳哥', stadium: '路易二世球场', founded: 1924, desc: '公国球队，黑店出名，培养无数球星，2017年惊艳欧冠四强。' },
  { name: '马赛', league: 'LIGUE1', country: '法国', reputation: 82, strength: 78, starPlayers: ['奥巴梅扬', '恩里克'], city: '马赛', stadium: '韦洛德罗姆球场', founded: 1899, desc: '法国唯一欧冠冠军，地中海港口城市球队，球迷文化狂热。' },
  { name: '里尔', league: 'LIGUE1', country: '法国', reputation: 78, strength: 76, starPlayers: ['戴维'], city: '里尔', stadium: '皮埃尔·莫鲁瓦球场', founded: 1944, desc: '北方球队，青训出色，2021年力压巴黎夺得法甲冠军。' },

  // ===== 英冠 =====
  { name: '利兹联', league: 'CHAMP', country: '英格兰', reputation: 70, strength: 73, starPlayers: ['萨默维尔'], city: '利兹', stadium: '埃兰路球场', founded: 1919, desc: '白衣军团，贝尔萨时期的疯狗战术闻名，曾斩落豪门。' },
  { name: '莱斯特城', league: 'CHAMP', country: '英格兰', reputation: 72, strength: 74, starPlayers: ['瓦尔迪'], city: '莱斯特', stadium: '皇权球场', founded: 1884, desc: '2016年英超奇迹缔造者，小球队的童话，狐狸城。' },
  { name: '南安普顿', league: 'CHAMP', country: '英格兰', reputation: 68, strength: 70, starPlayers: ['沃德-普劳斯'], city: '南安普顿', stadium: '圣玛丽球场', founded: 1885, desc: '南岸球队，青训培养贝尔沃尔科特等名将。' },
  { name: '米德尔斯堡', league: 'CHAMP', country: '英格兰', reputation: 65, strength: 68, city: '米德尔斯堡', stadium: '河畔球场', founded: 1876, desc: '英格兰东北球队，曾力夺联赛杯冠军。' },

  // ===== 荷甲 =====
  { name: '阿贾克斯', league: 'EREDIVISIE', country: '荷兰', reputation: 86, strength: 82, starPlayers: ['布罗贝', '塔迪奇'], city: '阿姆斯特丹', stadium: '约翰·克鲁伊夫竞技场', founded: 1900, desc: '4冠欧洲之王，全攻全守足球鼻祖，青训世界第一。' },
  { name: '埃因霍温', league: 'EREDIVISIE', country: '荷兰', reputation: 83, strength: 80, starPlayers: ['德容', '蒂尔曼'], city: '埃因霍温', stadium: '飞利浦球场', founded: 1913, desc: '飞利浦家族球队，荷兰传统豪门，培养无数顶级射手。' },
  { name: '费耶诺德', league: 'EREDIVISIE', country: '荷兰', reputation: 80, strength: 78, starPlayers: ['圣地亚哥·西门尼斯'], city: '鹿特丹', stadium: '德库伊普球场', founded: 1908, desc: '荷兰杯赛之王，2002年联盟杯冠军，鹿特丹德比。' },

  // ===== 葡超 =====
  { name: '本菲卡', league: 'LIGA_PT', country: '葡萄牙', reputation: 84, strength: 80, starPlayers: ['迪马利亚', '若昂·内维斯'], city: '里斯本', stadium: '光明球场', founded: 1904, desc: '红鹰葡萄牙豪门，葡萄牙最成功俱乐部之一。' },
  { name: '波尔图', league: 'LIGA_PT', country: '葡萄牙', reputation: 85, strength: 81, starPlayers: ['佩佩'], city: '波尔图', stadium: '巨龙球场', founded: 1893, desc: '巨龙！波尔图2004年欧冠冠军，穆里尼奥起家的球队。' },
  { name: '葡萄牙体育', league: 'LIGA_PT', country: '葡萄牙', reputation: 78, strength: 77, starPlayers: ['哲凯赖什'], city: '里斯本', stadium: '阿尔瓦拉德球场', founded: 1906, desc: 'C罗的青训母队，里斯本绿白。' },

  // ===== 比甲 =====
  { name: '布鲁日', league: 'LIGUE_1_BE', country: '比利时', reputation: 78, strength: 76, city: '布鲁日', stadium: '扬·布雷德尔球场', founded: 1891, desc: '比利时传统豪门，常年参加欧冠。' },
  { name: '安德莱赫特', league: 'LIGUE_1_BE', country: '比利时', reputation: 76, strength: 75, city: '布鲁塞尔', stadium: '乐透公园球场', founded: 1908, desc: '比利时首都豪门，紫色军团。' },
  { name: '亨克', league: 'LIGUE_1_BE', country: '比利时', reputation: 72, strength: 73, city: '亨克', stadium: '菲尼克斯球场', founded: 1988, desc: '比利时新锐，培养德布劳内库尔图瓦等巨星。' },

  // ===== 沙特联 =====
  { name: '利雅得胜利', league: 'SaudiL', country: '沙特阿拉伯', reputation: 86, strength: 83, starPlayers: ['C罗', '马内'], city: '利雅得', stadium: '阿瓦里公园球场', founded: 1955, desc: '沙特土豪，C罗沙特新旅程，中东金元足球新势力。' },
  { name: '利雅得新月', league: 'SaudiL', country: '沙特阿拉伯', reputation: 86, strength: 84, starPlayers: ['内马尔', '米林科维奇', '马尔科姆'], city: '利雅得', stadium: '法赫德国王国际体育场', founded: 1957, desc: '沙特豪门，亚洲俱乐部之王，2023夏窗壕购。' },
  { name: '吉达联合', league: 'SaudiL', country: '沙特阿拉伯', reputation: 82, strength: 80, starPlayers: ['本泽马', '坎特'], city: '吉达', stadium: '阿卜杜拉国王体育城', founded: 1927, desc: '吉达豪门，本泽马坎特加盟。' },
  { name: '吉达国民', league: 'SaudiL', country: '沙特阿拉伯', reputation: 78, strength: 77, starPlayers: ['菲尔米诺'], city: '吉达', stadium: '普林斯阿卜杜拉·阿尔·费萨尔球场', founded: 1937, desc: '沙特传统球队，菲尔米诺加盟。' },

  // ===== J联赛 =====
  { name: '川崎前锋', league: 'J1', country: '日本', reputation: 72, strength: 72, city: '川崎', stadium: '等等力陆上竞技场', founded: 1955, desc: 'J联赛近年霸主，传控足球代表。' },
  { name: '横滨水手', league: 'J1', country: '日本', reputation: 70, strength: 70, city: '横滨', stadium: '日产体育场', founded: 1972, desc: '前利物浦门将南雄太母队，J联赛传统劲旅。' },
  { name: '浦和红钻', league: 'J1', country: '日本', reputation: 70, strength: 70, city: '埼玉', stadium: '埼玉2002体育场', founded: 1950, desc: '浦和球迷亚洲第一，曾夺亚冠。' },
  { name: '神户胜利船', league: 'J1', country: '日本', reputation: 70, strength: 69, starPlayers: ['伊涅斯塔'], city: '神户', stadium: '神户综合运动公园', founded: 1966, desc: '伊涅斯塔老东家，日本土豪球队。' },

  // ===== K联赛 =====
  { name: '全北现代', league: 'K1', country: '韩国', reputation: 72, strength: 71, city: '全州', stadium: '全州世界杯体育场', founded: 1994, desc: '韩国霸主，亚冠两次冠军。' },
  { name: '首尔FC', league: 'K1', country: '韩国', reputation: 68, strength: 68, city: '首尔', stadium: '首尔世界杯体育场', founded: 1983, desc: '首都球队，首尔德比赛场火爆。' },
  { name: '蔚山现代', league: 'K1', country: '韩国', reputation: 70, strength: 70, city: '蔚山', stadium: '蔚山文殊足球竞技场', founded: 1983, desc: '2020亚冠冠军，韩国豪强。' },

  // ===== 土超 =====
  { name: '加拉塔萨雷', league: 'SuperLig', country: '土耳其', reputation: 78, strength: 77, starPlayers: ['伊卡尔迪'], city: '伊斯坦布尔', stadium: '土耳其电信竞技场', founded: 1905, desc: '土耳其豪门，土耳其三强之一，地狱主场。' },
  { name: '费内巴切', league: 'SuperLig', country: '土耳其', reputation: 76, strength: 76, city: '伊斯坦布尔', stadium: '萨拉科格鲁球场', founded: 1907, desc: '金丝雀，伊斯坦布尔传统球队。' },
  { name: '贝西克塔斯', league: 'SuperLig', country: '土耳其', reputation: 74, strength: 75, city: '伊斯坦布尔', stadium: '沃达丰公园球场', founded: 1903, desc: '黑鹰，伊斯坦布尔三强。' },
  { name: '特拉布宗体育', league: 'SuperLig', country: '土耳其', reputation: 68, strength: 70, city: '特拉布宗', stadium: 'Şenol Güneş体育中心', founded: 1967, desc: '黑海沿岸劲旅，黑马频出。' },

  // ===== 美职联 =====
  { name: '迈阿密国际', league: 'MLS', country: '美国', reputation: 82, strength: 76, starPlayers: ['梅西', '布斯克茨', '苏亚雷斯'], city: '迈阿密', stadium: '洛克哈特体育场', founded: 2018, desc: '贝克汉姆持股，梅西率队首夺联赛杯，美职联新贵。' },
  { name: '洛杉矶银河', league: 'MLS', country: '美国', reputation: 72, strength: 70, starPlayers: ['基耶利尼'], city: '洛杉矶', stadium: '尊严健康体育公园', founded: 1995, desc: '贝克汉姆曾效力，美职联老牌球队。' },
  { name: '纽约红牛', league: 'MLS', country: '美国', reputation: 68, strength: 68, city: '新泽西', stadium: '红牛竞技场', founded: 1995, desc: '亨利曾效力，纽约都会区球队。' },
  { name: '亚特兰大联', league: 'MLS', country: '美国', reputation: 70, strength: 69, city: '亚特兰大', stadium: '梅赛德斯-奔驰体育场', founded: 2014, desc: '美职联上座率奇迹，球市火爆。' },
  { name: '洛杉矶FC', league: 'MLS', country: '美国', reputation: 70, strength: 70, city: '洛杉矶', stadium: '加州银行体育场', founded: 2014, desc: '美职联新豪门，贝尔曾效力。' },

  // ===== 巴甲 =====
  { name: '弗拉门戈', league: 'Brasileirao', country: '巴西', reputation: 82, strength: 78, city: '里约热内卢', stadium: '马拉卡纳球场', founded: 1895, desc: '巴西国民俱乐部，内马尔的青训球队，南美解放者杯冠军。' },
  { name: '帕尔梅拉斯', league: 'Brasileirao', country: '巴西', reputation: 80, strength: 78, city: '圣保罗', stadium: '安联公园球场', founded: 1914, desc: '巴西联赛新贵，近年统治巴甲冠军。' },
  { name: '科林蒂安', league: 'Brasileirao', country: '巴西', reputation: 78, strength: 75, city: '圣保罗', stadium: '科林蒂安竞技场', founded: 1910, desc: '罗纳尔多母队，世俱杯冠军。' },
  { name: '圣保罗', league: 'Brasileirao', country: '巴西', reputation: 76, strength: 74, city: '圣保罗', stadium: '莫伦比球场', founded: 1930, desc: '三届解放者杯冠军，巴西传统豪门。' },

  // ===== 阿超 =====
  { name: '河床', league: 'ARG', country: '阿根廷', reputation: 82, strength: 78, city: '布宜诺斯艾利斯', stadium: '纪念碑球场', founded: 1901, desc: '阿根廷百年豪门，超级德比主角之一。' },
  { name: '博卡青年', league: 'ARG', country: '阿根廷', reputation: 84, strength: 80, city: '布宜诺斯艾利斯', stadium: '糖果盒球场', founded: 1905, desc: '马拉多纳母队，糖果盒球场闻名全球。' },
  { name: '阿韦亚内达竞技', league: 'ARG', country: '阿根廷', reputation: 70, strength: 70, city: '阿韦亚内达', stadium: '总统球场', founded: 1903, desc: '阿根廷传统强队。' },
  // ===== 西乙 / 德乙 / 意乙 / 法乙（部分球队 =====
  { name: '西班牙人', league: 'LALIGA2', country: '西班牙', reputation: 70, strength: 72, starPlayers: ['武磊(曾效力)'], city: '巴塞罗那', stadium: '科尔内拉-埃尔普拉特球场', founded: 1900, desc: '加泰罗尼亚球队，武磊曾随队降入西乙后又重返西甲。' },
  { name: '萨拉戈萨', league: 'LALIGA2', country: '西班牙', reputation: 68, strength: 68, city: '萨拉戈萨', stadium: '罗马雷达球场', founded: 1932, desc: '西班牙老牌球队，曾夺国王杯。' },
  { name: '汉堡', league: 'BUNDES2', country: '德国', reputation: 68, strength: 70, city: '汉堡', stadium: '人民公园球场', founded: 1887, desc: '前欧冠得主，德甲恐龙降级。' },
  { name: '沙尔克04', league: 'BUNDES2', country: '德国', reputation: 72, strength: 71, city: '盖尔森基兴', stadium: '费尔廷斯竞技场', founded: 1904, desc: '鲁尔区豪门，鲁尔德比。' },
  { name: '帕尔马', league: 'SERIEB', country: '意大利', reputation: 70, strength: 70, city: '帕尔马', stadium: '塔尔迪尼球场', founded: 1913, desc: '90年代意甲七姐妹之一，布冯克雷斯波母队。' },
  { name: '热那亚', league: 'SERIEB', country: '意大利', reputation: 68, strength: 68, city: '热那亚', stadium: '费拉里斯球场', founded: 1893, desc: '意大利历史最悠久的足球俱乐部之一。' },
  { name: '波尔多', league: 'LIGUE2', country: '法国', reputation: 66, strength: 65, city: '波尔多', stadium: '大西洋马特穆特体育场', founded: 1881, desc: '法国传统球队，曾六夺法甲冠军。' },
  { name: '圣埃蒂安', league: 'LIGUE2', country: '法国', reputation: 68, strength: 66, city: '圣埃蒂安', stadium: '热奥弗鲁瓦-基查尔球场', founded: 1919, desc: '十冠王法甲豪门，绿军。' },
]

// 国家队
export const NATIONAL_TEAM = {
  name: '中国国家男子足球队',
  short: '中国队',
  reputation: 70,
}

// 转会市场声望门槛：要被某联赛球队看中，球员需达到的OVR/声望
export const LEAGUE_TRANSFER_THRESHOLD = {
  CSL: 50,
  CSL2: 40,
  CHAMP: 65,
  LALIGA2: 63,
  BUNDES2: 62,
  SERIEB: 62,
  LIGUE2: 60,
  J1: 58,
  K1: 56,
  LIGUE_1_BE: 64,
  EREDIVISIE: 66,
  LIGA_PT: 66,
  Brasileirao: 66,
  SuperLig: 64,
  ARG: 66,
  MLS: 58,
  SaudiL: 70,
  LIGUE1: 70,
  SERIEA: 70,
  BUNDES: 70,
  LALIGA: 72,
  EPL: 73,
}

// 工具：按联赛筛选球队
export function teamsByLeague(leagueCode) {
  return TEAMS.filter(t => t.league === leagueCode)
}

// 工具：根据OVR+声望获取可能下家的联赛集合
export function reachableLeagues(ovr, reputation) {
  const res = []
  for (const [code, thr] of Object.entries(LEAGUE_TRANSFER_THRESHOLD)) {
    if (ovr + reputation * 0.1 >= thr) res.push(code)
  }
  return res
}

// ===== 球队配色与缩写（FC26 风格队徽用） =====
// primary: 主色，secondary: 副色，accent: 强调色（文字/描边）
const TEAM_STYLES = {
  // 中超
  '广州队': { abbr: '广', primary: '#c8102e', secondary: '#fff', accent: '#c8102e' },
  '山东泰山': { abbr: '鲁', primary: '#ff8a00', secondary: '#fff', accent: '#ff8a00' },
  '上海海港': { abbr: '港', primary: '#e50012', secondary: '#000', accent: '#ffd700' },
  '北京国安': { abbr: '京', primary: '#006633', secondary: '#ffd700', accent: '#006633' },
  '上海申花': { abbr: '沪', primary: '#00468b', secondary: '#ff6900', accent: '#00468b' },
  '武汉三镇': { abbr: '汉', primary: '#003da5', secondary: '#ffd700', accent: '#003da5' },
  '成都蓉城': { abbr: '蓉', primary: '#c8102e', secondary: '#fff', accent: '#ff8200' },
  '浙江队': { abbr: '浙', primary: '#007b3d', secondary: '#fff', accent: '#007b3d' },
  '河南队': { abbr: '豫', primary: '#c8102e', secondary: '#ffd700', accent: '#c8102e' },
  '天津津门虎': { abbr: '津', primary: '#0051a8', secondary: '#ffd700', accent: '#0051a8' },
  // 英超
  '曼城': { abbr: '城', primary: '#6cabdd', secondary: '#1c2e5b', accent: '#6cabdd' },
  '阿森纳': { abbr: '枪', primary: '#ef0107', secondary: '#fff', accent: '#ef0107' },
  '利物浦': { abbr: '红', primary: '#c8102e', secondary: '#febf0f', accent: '#c8102e' },
  '曼联': { abbr: '魔', primary: '#da291c', secondary: '#fbe122', accent: '#da291c' },
  '切尔西': { abbr: '蓝', primary: '#034694', secondary: '#dde0e7', accent: '#034694' },
  '托特纳姆热刺': { abbr: '刺', primary: '#132257', secondary: '#fff', accent: '#f7c873' },
  '纽卡斯尔联': { abbr: '鹊', primary: '#241f20', secondary: '#fff', accent: '#241f20' },
  '阿斯顿维拉': { abbr: '维', primary: '#670e1e', secondary: '#95bfe5', accent: '#670e1e' },
  // 西甲
  '皇家马德里': { abbr: '皇', primary: '#fff', secondary: '#febe10', accent: '#00529f' },
  '巴塞罗那': { abbr: '萨', primary: '#a50044', secondary: '#004d98', accent: '#edbb00' },
  '马德里竞技': { abbr: '竞', primary: '#cb3524', secondary: '#272e61', accent: '#cb3524' },
  '皇家社会': { abbr: '社', primary: '#0046ab', secondary: '#fff', accent: '#0046ab' },
  '比利亚雷亚尔': { abbr: '潜', primary: '#ffdf00', secondary: '#005187', accent: '#005187' },
  // 德甲
  '拜仁慕尼黑': { abbr: '仁', primary: '#dc052d', secondary: '#fff', accent: '#0066b2' },
  '勒沃库森': { abbr: '药', primary: '#e32219', secondary: '#000', accent: '#e32219' },
  '多特蒙德': { abbr: '蜂', primary: '#fde100', secondary: '#000', accent: '#fde100' },
  '莱比锡红牛': { abbr: '牛', primary: '#dd0032', secondary: '#fff', accent: '#002f5f' },
  // 意甲
  '国际米兰': { abbr: '蓝', primary: '#0068a8', secondary: '#000', accent: '#ffd700' },
  '尤文图斯': { abbr: '妇', primary: '#000', secondary: '#fff', accent: '#ffd700' },
  'AC米兰': { abbr: '米', primary: '#fb090b', secondary: '#000', accent: '#ffd700' },
  '那不勒斯': { abbr: '那', primary: '#12a0d6', secondary: '#1b2b5b', accent: '#12a0d6' },
  '罗马': { abbr: '狼', primary: '#8e1f2f', secondary: '#fdb913', accent: '#8e1f2f' },
  // 法甲
  '巴黎圣日耳曼': { abbr: '巴', primary: '#004170', secondary: '#da291c', accent: '#fff' },
  '摩纳哥': { abbr: '摩', primary: '#c8102e', secondary: '#fff', accent: '#ffd700' },
  '马赛': { abbr: '马', primary: '#2458ff', secondary: '#fff', accent: '#2458ff' },
  '里尔': { abbr: '里', primary: '#c8102e', secondary: '#002654', accent: '#c8102e' },
  // 沙特联
  '利雅得胜利': { abbr: '胜', primary: '#ffd700', secondary: '#004c97', accent: '#ffd700' },
  '利雅得新月': { abbr: '月', primary: '#004170', secondary: '#ffd700', accent: '#004170' },
  '吉达联合': { abbr: '联', primary: '#fcd116', secondary: '#fff', accent: '#c8102e' },
  '吉达国民': { abbr: '吉', primary: '#006400', secondary: '#fff', accent: '#006400' },
}

// 国家队配色（国际赛事队徽/球衣用）
const NATION_STYLES = {
  '中国': { abbr: '中', primary: '#c8102e', secondary: '#ffd700', accent: '#c8102e' },
  '日本': { abbr: '日', primary: '#000', secondary: '#bc002d', accent: '#fff' },
  '韩国': { abbr: '韩', primary: '#c60c30', secondary: '#fff', accent: '#0047a0' },
  '沙特阿拉伯': { abbr: '沙', primary: '#006c35', secondary: '#fff', accent: '#006c35' },
  '澳大利亚': { abbr: '澳', primary: '#00843d', secondary: '#ffcd00', accent: '#00843d' },
  '伊朗': { abbr: '伊', primary: '#239f40', secondary: '#fff', accent: '#da0000' },
  '卡塔尔': { abbr: '卡', primary: '#8a1538', secondary: '#fff', accent: '#8a1538' },
  '巴西': { abbr: '巴', primary: '#009c3b', secondary: '#ffdf00', accent: '#002776' },
  '阿根廷': { abbr: '阿', primary: '#75aadb', secondary: '#fff', accent: '#fbbf00' },
  '法国': { abbr: '法', primary: '#002395', secondary: '#fff', accent: '#ed2939' },
  '英格兰': { abbr: '英', primary: '#fff', secondary: '#ce1126', accent: '#00247d' },
  '德国': { abbr: '德', primary: '#000', secondary: '#dd0000', accent: '#ffce00' },
  '西班牙': { abbr: '西', primary: '#c60b1e', secondary: '#ffc400', accent: '#c60b1e' },
  '意大利': { abbr: '意', primary: '#008fd7', secondary: '#fff', accent: '#008fd7' },
  '葡萄牙': { abbr: '葡', primary: '#006600', secondary: '#ff0000', accent: '#ffcc00' },
  '荷兰': { abbr: '荷', primary: '#ff6600', secondary: '#00247d', accent: '#ff6600' },
  '比利时': { abbr: '比', primary: '#ff0000', secondary: '#fae042', accent: '#000' },
  '克罗地亚': { abbr: '克', primary: '#fff', secondary: '#ff0000', accent: '#00247d' },
  '摩洛哥': { abbr: '摩', primary: '#c1272d', secondary: '#006233', accent: '#c1272d' },
  '塞内加尔': { abbr: '塞', primary: '#00853f', secondary: '#fdef42', accent: '#e31b23' },
  '乌拉圭': { abbr: '乌', primary: '#0038a8', secondary: '#fff', accent: '#fcd116' },
  '墨西哥': { abbr: '墨', primary: '#006847', secondary: '#fff', accent: '#ce1126' },
  '美国': { abbr: '美', primary: '#3c3b6e', secondary: '#fff', accent: '#b22234' },
  '加拿大': { abbr: '加', primary: '#ff0000', secondary: '#fff', accent: '#ff0000' },
  '瑞士': { abbr: '瑞', primary: '#d52b1e', secondary: '#fff', accent: '#d52b1e' },
  '丹麦': { abbr: '丹', primary: '#c8102e', secondary: '#fff', accent: '#c8102e' },
  '瑞典': { abbr: '典', primary: '#006aa7', secondary: '#fecc00', accent: '#fecc00' },
  '波兰': { abbr: '波', primary: '#fff', secondary: '#dc143c', accent: '#dc143c' },
  '哥伦比亚': { abbr: '哥', primary: '#fcd116', secondary: '#003893', accent: '#ce1126' },
  '智利': { abbr: '智', primary: '#0039a6', secondary: '#fff', accent: '#d52b1e' },
  '厄瓜多尔': { abbr: '厄', primary: '#ffd700', secondary: '#003893', accent: '#ce1126' },
  '秘鲁': { abbr: '秘', primary: '#d91023', secondary: '#fff', accent: '#d91023' },
  '土耳其': { abbr: '土', primary: '#e30a17', secondary: '#fff', accent: '#e30a17' },
  '希腊': { abbr: '希', primary: '#0d5eaf', secondary: '#fff', accent: '#0d5eaf' },
  '塞尔维亚': { abbr: '塞', primary: '#c6363c', secondary: '#0c4076', accent: '#fff' },
  '乌克兰': { abbr: '乌', primary: '#0057b8', secondary: '#ffd700', accent: '#ffd700' },
  '奥地利': { abbr: '奥', primary: '#ed2939', secondary: '#fff', accent: '#ed2939' },
  '挪威': { abbr: '挪', primary: '#ba0c2f', secondary: '#fff', accent: '#00205b' },
  '威尔士': { abbr: '威', primary: '#00ad2c', secondary: '#fff', accent: '#00ad2c' },
  '喀麦隆': { abbr: '喀', primary: '#007a5e', secondary: '#ce1126', accent: '#fcd116' },
  '加纳': { abbr: '加', primary: '#006b3f', secondary: '#fcd116', accent: '#ce1126' },
  '尼日利亚': { abbr: '尼', primary: '#008751', secondary: '#fff', accent: '#008751' },
  '科特迪瓦': { abbr: '迪', primary: '#009e60', secondary: '#f77f00', accent: '#d21034' },
  '突尼斯': { abbr: '突', primary: '#e70013', secondary: '#fff', accent: '#e70013' },
  '埃及': { abbr: '及', primary: '#ce1126', secondary: '#fff', accent: '#000' },
  '南非': { abbr: '南', primary: '#007749', secondary: '#ffb81c', accent: '#de3831' },
  '越南': { abbr: '越', primary: '#da251d', secondary: '#ffd700', accent: '#da251d' },
  '泰国': { abbr: '泰', primary: '#a51931', secondary: '#f4f5f8', accent: '#241d49' },
  '印度尼西亚': { abbr: '印', primary: '#ff0000', secondary: '#fff', accent: '#ff0000' },
  '马来西亚': { abbr: '马', primary: '#cc0001', secondary: '#fff', accent: '#010066' },
  '新加坡': { abbr: '新', primary: '#ed2939', secondary: '#fff', accent: '#ed2939' },
  '菲律宾': { abbr: '菲', primary: '#0038a8', secondary: '#fff', accent: '#ce1126' },
  '乌兹别克斯坦': { abbr: '乌', primary: '#0099b5', secondary: '#fff', accent: '#1eb53a' },
  '约旦': { abbr: '约', primary: '#007a3d', secondary: '#fff', accent: '#c8102e' },
  '叙利亚': { abbr: '叙', primary: '#ce1126', secondary: '#fff', accent: '#000' },
  '黎巴嫩': { abbr: '黎', primary: '#ed1c24', secondary: '#fff', accent: '#00a859' },
  '伊拉克': { abbr: '拉', primary: '#ce1126', secondary: '#fff', accent: '#007a3d' },
  '阿联酋': { abbr: '联', primary: '#00732f', secondary: '#fff', accent: '#ff0000' },
  '阿曼': { abbr: '阿', primary: '#fff', secondary: '#d21034', accent: '#008000' },
  '巴林': { abbr: '巴', primary: '#ce1126', secondary: '#fff', accent: '#ce1126' },
  '科威特': { abbr: '科', primary: '#007a3d', secondary: '#fff', accent: '#ce1126' },
  '巴勒斯坦': { abbr: '勒', primary: '#ce1126', secondary: '#000', accent: '#007a3d' },
  '印度': { abbr: '印', primary: '#ff9933', secondary: '#fff', accent: '#138808' },
}

// 默认配色：若 TEAM_STYLES 查不到则兜底（取球队名首字，联赛色做主色）
export function getTeamStyle(teamName, leagueCode) {
  if (TEAM_STYLES[teamName]) return TEAM_STYLES[teamName]
  const leagueColor = LEAGUES[leagueCode]?.color || '#6c7a8c'
  const abbr = teamName?.charAt(teamName.length - 1) || '足'
  return { abbr, primary: leagueColor, secondary: '#fff', accent: leagueColor }
}

export function getNationStyle(nationName) {
  if (NATION_STYLES[nationName]) return NATION_STYLES[nationName]
  const abbr = nationName?.charAt(0) || '足'
  return { abbr, primary: '#c8102e', secondary: '#ffd700', accent: '#c8102e' }
}

// 根据中文姓名提取头像首字（姓氏+名字首字，最多2字）
export function nameAvatarChars(name) {
  if (!name) return '球'
  const trimmed = name.trim()
  if (trimmed.length <= 2) return trimmed
  // 3字姓名取后两字（更具辨识度），4字及以上取前2字
  return trimmed.length === 3 ? trimmed.slice(1) : trimmed.slice(0, 2)
}
