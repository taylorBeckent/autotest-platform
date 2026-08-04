import { parse } from 'querystring';
import pathRegexp from 'path-to-regexp';

/* eslint no-useless-escape:0 import/prefer-default-export:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;
export const isUrl = path => reg.test(path);
export const isAntDesignPro = () => {
  if (ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION === 'site') {
    return true;
  }

  return window.location.hostname === 'preview.pro.ant.design';
}; // 给官方演示站点用，用于关闭真实开发环境不需要使用的特性

export const isAntDesignProOrDev = () => {
  const { NODE_ENV } = process.env;

  if (NODE_ENV === 'development') {
    return true;
  }

  return isAntDesignPro();
};
export const getPageQuery = () => parse(window.location.href.split('?')[1]);
/**
 * props.route.routes
 * @param router [{}]
 * @param pathname string
 */

export const getAuthorityFromRouter = (router = [], pathname) => {
  const authority = router.find(
    ({ routes, path = '/', target = '_self' }) =>
      (path && target !== '_blank' && pathRegexp(path).exec(pathname)) ||
      (routes && getAuthorityFromRouter(routes, pathname)),
  );
  if (authority) return authority;
  return undefined;
};
export const getRouteAuthority = (path, routeData) => {
  let authorities;
  routeData.forEach(route => {
    // match prefix
    if (pathRegexp(`${route.path}/(.*)`).test(`${path}/`)) {
      if (route.authority) {
        authorities = route.authority;
      } // exact match

      if (route.path === path) {
        authorities = route.authority || authorities;
      } // get children authority recursively

      if (route.routes) {
        authorities = getRouteAuthority(path, route.routes) || authorities;
      }
    }
  });
  return authorities;
};

//.解构每层树节点
export function getTestCaseDirectory(data) {
  if (!data) return;
  return data.map(x => {
    const { id, folderName, parentId, systemId, path, tier } = x;
    return {
      title: folderName,
      key: id.toString(),
      parentId,
      systemId,
      path,
      tier,
      checkable: tier === '1'
    };
  });
}

//.uuid生成器
export const generateUUID = () => {
  let timestamp = new Date().getTime();
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (timestamp + Math.random() * 16) % 16 | 0;
    timestamp = Math.floor(timestamp / 16);
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
};

//.手机号生成器
export const generatePhoneNum = () => {
  const prefix = '1' + Math.floor(Math.random() * 7 + 3);
  let phoneNum = prefix;
  for (let i = 0; i < 9; i++) {
    phoneNum += Math.floor(Math.random() * 10);
  }
  return phoneNum;
}

//.下拉内容转换器
export const optionTransform = (inputVal, separator) => {
  let arr = [];
  let middleVal = inputVal.split('\n');
  middleVal.map(item => {
    let obj = {};
    obj.label = item.trim();
    let code = item.split(separator);
    obj.value = code[0].trim();
    arr.push(obj);
  })
  return arr;
};
export const accTypeTransformFun = (value) => {
  let str = ''
  const globalList = [
    'ALB--所有币种',
    'AUD--澳大利亚元',
    'CAD--加拿大元',
    'CHF--瑞士法郎',
    'CNY--人民币',
    'DKK--丹麦克郎',
    'EUR--欧元',
    'FRN--所有外币',
    'GBP--英镑',
    'HKD--香港元',
    'JPY--日元',
    'MOP--澳门元',
    'NOK--挪威克郎',
    'NZD--新西兰元',
    'SEK--瑞典克郎',
    'SGD--新加坡元',
    'TWD--新台湾元',
    'USD--美元',
    'AFA--阿富汗尼',
    'ALL--列克',
    'DZD--阿尔及利亚第纳尔',
    'ADP--安道尔比赛塔',
    'AON--新克瓦查',
    'AZM--阿塞拜疆马纳特',
    'ARS--阿根廷比索',
    'ATS--先令',
    'BSD--巴哈尔元',
    'BHD--巴林第纳尔',
    'BDT--塔卡',
    'AMD--亚美尼亚达姆',
    'BBD--巴巴多斯元',
    'BEF--比利时法郎',
    'BMD--百慕大元',
    'BTN--努尔特鲁姆',
    'BOB--玻利维亚比索',
    'BWP--普拉',
    'BZD--伯利兹元',
    'BND--文莱元',
    'BGL--列弗',
    'MMK--缅元',
    'BIF--布隆迪法郎',
    'KHR--瑞尔',
    'CVE--佛得角埃斯库多',
    'KYD--开曼群岛元',
    'LKR--斯里兰卡卢比',
    'CLP--智利比索',
    'COP--哥伦比亚比索',
    'KMF--科摩罗法郎',
    'ZRN--新扎伊尔',
    'CRC--哥斯达黎加科郎',
    'HRK--克罗地亚库纳',
    'CUP--古巴比索',
    'CYP--塞浦路斯镑',
    'CZK--捷克克郎',
    'DOP--多米尼加比索',
    'ECS--苏克雷',
    'SVC--萨尔瓦多科郎',
    'ETB--埃塞俄比亚比尔',
    'ERN--厄立特里亚',
    'EEK--克罗姆',
    'FKP--福克兰群岛镑',
    'FJD--斐济元',
    'FIM--马克',
    'FRF--法国法郎',
    'DJF--吉布提法郎',
    'GMD--达拉西',
    'DEM--德国马克 Germany Deutsche Mark',
    'GHC--塞地',
    'GIP--直布罗陀镑',
    'GRD--德拉克马',
    'GTQ--格查尔',
    'GNF--几内亚法郎',
    'GYD--圭亚那元',
    'HTG--古德',
    'HNL--伦皮拉',
    'HUF--福林',
    'ISK--冰岛克郎',
    'INR--印度卢比',
    'IDR--印度尼西亚卢比',
    'IRR--伊郎里亚尔',
    'IQD--伊拉克第纳尔',
    'IEP--爱尔兰镑',
    'ILS--锡克尔',
    'ITL--意大利里拉',
    'JMD--牙买加元',
    'KZT--坚戈',
    'JOD--约旦第纳尔',
    'KES--肯尼亚先令',
    'KPW--北朝鲜圆',
    'KRW--圆',
    'KWD--科威特第纳尔',
    'KGS--索姆',
    'LAK--基普',
    'LBP--黎巴嫩镑',
    'LSL--罗提',
    'LVL--拉托维亚拉特',
    'LRD--利比里亚元',
    'LYD--利比亚第纳尔',
    'LTL--立陶宛',
    'LUF--卢森堡法郎',
    'MGF--马尔加什法郎',
    'MWK--克瓦查',
    'MYR--马来西亚林吉特',
    'MVR--卢菲亚',
    'MTL--马尔他里拉',
    'MRO--乌吉亚',
    'MUR--毛里求斯卢比',
    'MXN--墨西哥比索',
    'MNT--图格里克',
    'MDL--摩尔瓦多列伊',
    'MAD--摩洛哥迪拉姆',
    'MZM--麦梯卡尔',
    'OMR--阿曼里亚尔',
    'NAD--纳米比亚元',
    'NPR--尼泊尔卢比',
    'NLG--荷兰盾',
    'ANG--荷属安的列斯盾',
    'AWG--阿鲁巴盾',
    'VUV--瓦图',
    'NIO--金科多巴',
    'NGN--奈拉',
    'PKR--巴基斯坦卢比',
    'PAB--巴波亚',
    'PGK--基那',
    'PYG--瓜拉尼',
    'PEN--索尔',
    'PHP--菲律宾比索',
    'PLZ--兹罗提',
    'PTE--葡萄牙埃斯库多',
    'GWP--几内亚比绍比索',
    'TPE--东帝汶埃斯库多',
    'QAR--卡塔尔里亚尔',
    'ROL--列伊',
    'RWF--卢旺达法郎',
    'SHP--圣赫勒拿镑',
    'STD--多布拉',
    'SAR--沙特里亚尔',
    'SCR--塞舌尔卢比',
    'SLL--利昂',
    'SKK--斯洛伐克克郎',
    'VND--盾',
    'SIT--托拉尔',
    'SOS--索马里先令',
    'ZAR--兰特',
    'ZWD--津巴布韦元',
    'ESP--西班牙比赛塔',
    'SDD--苏丹第纳尔',
    'SRG--苏里南盾',
    'SZL--里兰吉尼',
    'SYP--叙利亚镑',
    'TJR--塔吉克卢布',
    'THB--铢',
    'TOP--邦加',
    'TTD--特立尼达和多巴哥元',
    'AED--UAE迪拉姆',
    'TND--突尼斯第纳尔',
    'TRL--土耳其里拉',
    'TMM--马纳特',
    'UGX--乌干达先令',
    'UAK--库邦',
    'MKD--第纳尔',
    'RUB--俄罗斯卢布',
    'EGP--埃及镑',
    'TZS--坦桑尼亚先令',
    'UYU--乌拉圭比索',
    'UZS--乌兹别克斯坦苏姆',
    'VEB--博利瓦',
    'WST--塔拉',
    'YER--也门里亚尔',
    'YUN--南斯拉夫第纳尔',
    'YUM--南斯拉夫 Yugoslavia New Dinar',
    'ZMK--克瓦查',
    'SBD--所罗门群岛元',
    'BYN--白俄罗斯卢布',
    'TMT--土库曼斯坦马纳特',
    'GHS--新加纳塞第',
    'VEF--委内瑞拉玻利瓦尔',
    'RSD--塞尔维亚第纳尔',
    'MZN--莫桑比克梅蒂卡尔',
    'AZN--土库曼斯坦马纳特',
    'RON--罗马尼亚新列伊',
    'TRY--土耳其里拉',
    'XAF--CFA法郎BEAC',
    'XCD--东加勒比元',
    'XOF--CFA法郎BCEAO',
    'XPF--CFP法郎',
    'XEU--欧洲货币单位(E.C.U.)',
    'XBA--欧洲混合单位(EURCO)',
    'XBB--欧洲货币(单位EMU.-6)',
    'XBC--欧洲账户9单位(E.U.A.-9)',
    'XB5--欧洲账户17单位(E.U.A.-17)',
    'XAU--黄金',
    'XDR--特别提款权',
    'XAG--银',
    'XPT--铂白金',
    'XTS--记账美元',
    'XPD--钯',
    'ZMW--赞比亚克瓦查',
    'MGA--Malagasy Ariary',
    'AFN--阿富汗阿富汗尼',
    'TJS--塔吉克斯坦索莫尼',
    'AOA--安哥拉宽扎',
    'BYR--白俄罗斯卢布',
    'BGN--保加利亚列瓦',
    'CDF--刚果民主共和国刚果法郎',
    'BAM--波斯尼亚和黑塞哥维那可兑换马克',
    'MXV--墨西哥Unidad de Inversion',
    'UAH--乌克兰赫里夫娜',
    'GEL--格鲁吉亚拉里',
    'ECV--UVC',
    'BOV--Mvdol',
    'PLN--兹罗提',
    'BRL--巴西瑞尔',
    'CLF--发展单位',
    'ZAL--（金融兰特）',
    'XFO--黄金法郎',
    'XFU--UIC法郎',
    'USN--美元次日',
    'USS--美元同日',
    'ASF--记账瑞士法郎',
  ]
  globalList.map(item => {
    if (item.includes(value)) {
      let code = item.split('--');
      str = code[1].trim();
    }
  })
  return str;
};



//.映射关系转换器
export const mapTransform = (inputVal, separator) => {
  let obj = {};
  let middleVal = inputVal.split('\n');
  middleVal.map(item => {
      let code = item.split(separator);
      obj[code[0].trim()] = code[1].trim();
      // obj.label = code[0].trim();
      // obj.value = item.trim();
  })
  return obj;
};
