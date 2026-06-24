import type { CodexGenus } from '../types'

// 장미(Rosa) — 화훼
//
// 출처 대조(2026-06-20): RHS, American Rose Society, David Austin Roses(공식), Missouri
// Botanical Garden, 미국 대학 extension(Iowa State·Illinois·Clemson·OSU·UC IPM), POWO/Kew,
// 한국 농원(나무사랑원예·국제화훼종묘·서림·대림·로즈팜)·농진청/지방농기원·월간가드닝. 계통별
// 개화 습성→전정·중부 노지 월동(접목부 보호)·흑반병·한국 유통 품종 검증.
//
// 검증 정정 반영: 그란디플로라는 미국 분류(RHS 미인정) / 아이스버그 흑반병 양론 / 그레이엄
// 토마스 내병성 보통·아브라함 다비 녹병 약·올리비아 로즈 오스틴 내병성 최상(초보 1순위) /
// 해당화는 장미모자이크병(RRD)에 오히려 저항적(취약 아님), RRD는 한국 무관 / 올드로즈·람블러
// 한국 유통은 매우 제한적(직수입·수집 영역) / 목향장미 중부 내한 경계 / 피에르 드 롱사르 = 에덴.

export const rose: CodexGenus = {
  id: 'rosa',
  name: '장미',
  scientificName: 'Rosa',
  category: '화훼',
  summary:
    '장미는 계통(系統)에 따라 ★꽃 피는 자리와 전정 시기가 갈린다 — 이걸 틀리면 그해 꽃을 못 본다. ' +
    '하이브리드 티·플로리분다·관목장미·사계 덩굴은 새 가지에 피어 늦겨울~이른 봄에 전정하고, ' +
    '람블러·일계성 덩굴·옛 장미(갈리카·다마스크 등)는 묵은 가지에 피어 ★꽃이 진 직후에 전정한다(봄에 자르면 꽃을 없앤다). ' +
    '영국장미(데이비드 오스틴)는 봄에 1/3~1/2만 가볍게 친다. 대부분 접목묘라 중부 노지에선 ★접목부를 흙에 묻고 ' +
    '겨울 밑동을 북주면 안전하다(관목장미·자생종은 무보온도 된다). 공통의 적은 ★흑반병 — 물은 잎이 아닌 흙에 오전에 주고, ' +
    '떨어진 잎은 치운다. 한국엔 데이비드 오스틴 영국장미가 폭넓게 유통되고, 해당화·찔레는 우리 자생 장미다.',
  species: [
    // ── 하이브리드 티 (HT) ───────────────────────────────────
    {
      id: 'rosa-hybrid-tea',
      genus: '장미',
      name: '하이브리드 티 (HT)',
      scientificName: 'Rosa Hybrid Tea group',
      category: '화훼',
      form: '직립형 관목, 보통 높이 1~1.5m. 길고 굵은 줄기 끝에 한 송이씩 큰 꽃(지름 9~15cm)을 단다 — 꽃집 장미·꽃다발의 그 형태.',
      bloomType: '새 가지에 핀다. 사계성이라 피고 쉬고 다시 피는 주기로 반복한다.',
      hardiness:
        '대개 접목묘라 ★접목부가 가장 추위에 약하다 — 중부에선 접목부를 흙 5~10cm 아래로 묻어 심고, 겨울 들머리 땅이 살짝 언 뒤 ' +
        '밑동을 흙으로 30cm가량 북주고 볏짚으로 감싼다. 자근묘는 더 강하다.',
      soil: '비옥하고 물 빠짐 좋은 흙(pH 6.0~6.5). 유기질을 충분히 넣는다.',
      water: '뿌리 쪽 흙에 깊고 고르게, ★오전에 준다(잎이 젖으면 흑반병). 정체수는 피한다.',
      light: '양지 — 하루 6시간 이상 직사광이 좋다(최소 4시간).',
      care:
        '★늦겨울~이른 봄(개나리 필 무렵, 대략 3월 중하순)에 강하게 친다 — 죽은·약한 가지를 먼저 없애고 건강한 줄기 3~5대만 ' +
        '높이 30~45cm로 남긴다. 자를 때 ★바깥쪽 눈 위를 비스듬히 잘라 속을 비워 통풍을 살린다. 시든 꽃은 따 주면 재개화가 빠르다.',
      pest: '★흑반병에 약한 축이라 예방이 중요하다 — 물은 흙에 오전에, 떨어진 잎은 치우고 통풍 좋게 넓게 심는다. 흰가루병·진딧물·응애도 온다.',
      season: '개화 5~6월 1차, 여름~가을 반복(사계성).',
      tip: '향과 꽃 모양이 빼어나지만 손이 가는 계통이다. 병이 잦으니 ★내병성 좋은 품종을 고르면 편하다.',
      varieties: [
        { id: 'rosa-ht-peace', name: '피스', scientificName: "Rosa 'Peace'", trait: '노란빛 바탕에 분홍 가장자리가 어우러지는 대륜. 강건하고 역사적으로 가장 사랑받은 장미다(1945).' },
        { id: 'rosa-ht-mister-lincoln', name: '미스터 링컨', scientificName: "Rosa 'Mister Lincoln'", trait: '진한 적색 대륜에 ★다마스크 향이 강하다.' },
        { id: 'rosa-ht-double-delight', name: '더블 딜라이트', scientificName: "Rosa 'Double Delight'", trait: '크림빛에 붉은 가장자리가 드는 복색, ★향이 강하다. (다만 흰가루·흑반병엔 약한 편이다.)' },
        { id: 'rosa-ht-ingrid-bergman', name: '잉그리드 버그만', scientificName: "Rosa 'Ingrid Bergman'", trait: '벨벳 같은 진홍 대륜. ★내병성이 좋아 기르기 수월하다.' },
        { id: 'rosa-ht-chrysler-imperial', name: '크라이슬러 임페리얼', scientificName: "Rosa 'Chrysler Imperial'", trait: '벨벳 진홍에 시트러스 섞인 강한 향.' },
        { id: 'rosa-ht-pascali', name: '파스칼리', scientificName: "Rosa 'Pascali'", trait: '순백의 단정한 꽃. 흰 장미 절화의 명품이다(향은 약하다).' },
      ],
      otherCultivars: ['트로피카나', '저스트 조이', '프라그란트 클라우드', '바카롤', '스파이스 트와이스'],
    },
    // ── 플로리분다 ───────────────────────────────────────────
    {
      id: 'rosa-floribunda',
      genus: '장미',
      name: '플로리분다',
      scientificName: 'Rosa Floribunda group',
      category: '화훼',
      form: 'HT보다 낮고 풍성한 관목. 한 줄기에 여러 송이가 ★송이로 모여 핀다(꽃은 지름 5~9cm로 HT보다 작다).',
      bloomType: '새 가지에 핀다. 사계성이며 HT보다 거의 끊김 없이 핀다.',
      hardiness: 'HT와 같다 — 접목묘는 접목부를 묻고 겨울 밑동을 북준다. 계통적으로 HT보다 강건한 편이다.',
      soil: '비옥하고 물 빠짐 좋은 흙(pH 6.0~6.5).',
      water: '흙에 깊고 고르게, 오전에 준다(잎 젖음 최소화).',
      light: '양지(하루 6시간 이상).',
      care:
        '★늦겨울~이른 봄에 친다. HT보다 가볍게 — 건강한 줄기를 높이 45~65cm로 남겨 풍성한 부시 형태를 유지한다. 시든 꽃은 송이째 정리한다.',
      pest: '계통적으로 흑반병에 HT보다 강한 편이나 품종 차가 크다. 흑반·흰가루 예방은 동일하다.',
      season: '개화 5~6월부터 가을까지 거의 연속.',
      tip: '많은 꽃이 오래 이어져 화단을 채우기 좋다.',
      varieties: [
        { id: 'rosa-fl-iceberg', name: '아이스버그', scientificName: "Rosa 'Iceberg'", trait: '흰 꽃이 송이로 풍성하게 오래 핀다. 강건해 널리 심지만, ★흑반병엔 약하다는 평도 있어(오래된 품종) 통풍·예방이 좋다.' },
        { id: 'rosa-fl-julia-child', name: '줄리아 차일드', scientificName: "Rosa 'Julia Child'", trait: '버터빛 노란 꽃에 감초 향, ★내병성이 좋고 콤팩트하다.' },
        { id: 'rosa-fl-sexy-rexy', name: '섹시 렉시', scientificName: "Rosa 'Sexy Rexy'", trait: '연분홍 꽃이 다발로 풍성하게, ★내병성이 좋다.' },
        { id: 'rosa-fl-europeana', name: '유로피아나', scientificName: "Rosa 'Europeana'", trait: '진홍 꽃이 큰 송이로. 세계적으로 인기지만 흰가루병엔 다소 약하다.' },
        { id: 'rosa-fl-sunsprite', name: '선스프라이트', scientificName: "Rosa 'Sunsprite'", trait: '진한 노란 꽃에 향이 좋다.' },
      ],
      otherCultivars: ['콘체르티노', '크리스탈 페어리'],
    },
    // ── 그란디플로라 ─────────────────────────────────────────
    {
      id: 'rosa-grandiflora',
      genus: '장미',
      name: '그란디플로라',
      scientificName: 'Rosa Grandiflora group',
      category: '화훼',
      form: 'HT의 긴 줄기·고심형 꽃에 플로리분다의 송이 개화·강건성을 더한 계통, 키가 커서 1.5~2.4m. (★미국 분류로, 영국 RHS는 별도 계통으로 보지 않는다.)',
      bloomType: '새 가지에 핀다. 사계성.',
      hardiness: 'HT와 같다 — 접목부를 묻고 겨울 밑동을 북준다.',
      soil: '비옥하고 물 빠짐 좋은 흙(pH 6.0~6.5).',
      water: '흙에 깊고 고르게, 오전에.',
      light: '양지(하루 6시간 이상).',
      care: '★늦겨울~이른 봄에 강하게 친다 — 키가 큰 만큼 HT보다 조금 높게 건강한 줄기를 남긴다.',
      pest: 'HT처럼 흑반병에 약한 축이라 예방이 필요하다.',
      season: '개화 5~6월부터 가을까지(사계성).',
      tip: '긴 줄기에 큰 꽃이 송이로 달려 시원시원하다.',
      varieties: [
        { id: 'rosa-gr-queen-elizabeth', name: '퀸 엘리자베스', scientificName: "Rosa 'Queen Elizabeth'", trait: '맑은 분홍 고심형 꽃이 긴 줄기에. 강건하고 꽃이 많아 그란디플로라의 시조이자 대표다(1954).' },
      ],
    },
    // ── 폴리안타 ─────────────────────────────────────────────
    {
      id: 'rosa-polyantha',
      genus: '장미',
      name: '폴리안타',
      scientificName: 'Rosa Polyantha group',
      category: '화훼',
      form: '플로리분다보다 작은 관목(보통 1.2m 이하). ★아주 작은 꽃(지름 2.5cm 안팎)이 큰 송이로 무리지어 핀다. 튼튼하고 강건하다.',
      bloomType: '새 가지에 핀다. 사계성으로 거의 끊임없이 핀다.',
      hardiness: '계통적으로 추위에 강한 편이다(품종에 따라 USDA 4~6). 중부 노지에 무난하다.',
      soil: '물 빠짐 좋은 흙. 무던하다.',
      water: '흙에 고르게, 오전에.',
      light: '양지(반나절 이상 볕).',
      care: '늦겨울~이른 봄에 가볍게 정리한다. 손이 덜 가는 계통이다.',
      pest: '대체로 강건하다. 흑반·흰가루 예방은 공통.',
      season: '봄부터 가을까지 연속.',
      tip: '작은 꽃이 끊임없이 피어 화단 가장자리·화분에 좋다.',
      varieties: [
        { id: 'rosa-po-the-fairy', name: '더 페어리', scientificName: "Rosa 'The Fairy'", trait: '연분홍 작은 꽃이 늦여름까지 다발로. 매우 강건하고 손이 덜 간다.' },
        { id: 'rosa-po-cecile-brunner', name: '세실 브루너', scientificName: "Rosa 'Cécile Brünner'", trait: '"스위트하트 로즈" — 연분홍 작은 꽃이 단정하다(1881).' },
      ],
    },
    // ── 관목장미 (모던 슈러브) ───────────────────────────────
    {
      id: 'rosa-shrub',
      genus: '장미',
      name: '관목장미 (슈러브)',
      scientificName: 'Rosa Modern Shrub group',
      category: '화훼',
      form: '풍성하게 자라는 현대 관목장미. ★저관리를 목표로 육종해 진 꽃이 저절로 떨어지고(데드헤딩 거의 불필요) 병에 강하다.',
      bloomType: '새 가지에 핀다. 사계성으로 서리 전까지 거듭 핀다.',
      hardiness:
        '★대부분 자근·강건해 중부 노지에서 보온 없이 월동·개화한다(녹아웃·드리프트 등 USDA 4~9). 첫 겨울 어린 묘만 멀칭해 준다.',
      soil: '물 빠짐만 좋으면 흙을 가리지 않는다.',
      water: '흙에 고르게, 오전에. 자리 잡으면 비교적 가뭄에 견딘다.',
      light: '양지(하루 6시간 이상).',
      care: '★이른 봄에 죽은 가지만 정리하는 가벼운 전정으로 충분하다. 크게 갱신하려면 전체의 1/3쯤 줄인다.',
      pest: '★계통의 강점이 내병성이다 — 흑반·흰가루·녹병에 강해 무농약 재배가 현실적이다.',
      season: '개화 5~6월부터 서리 전까지.',
      tip: '★초보자·바쁜 정원에 가장 권할 만한 계통이다. 병·전정·월동 부담이 가장 적다.',
      varieties: [
        { id: 'rosa-shrub-knock-out', name: '녹아웃', scientificName: "Rosa 'Knock Out'", trait: '체리레드 홑꽃이 서리 전까지 5~6주 주기로 끊임없이 핀다. ★흑반병에 매우 강한 대표 저관리 장미다(USDA 5~9).' },
        { id: 'rosa-shrub-double-knock-out', name: '더블 녹아웃', scientificName: "Rosa 'Double Knock Out'", trait: '녹아웃의 겹꽃형. 같은 강건함에 꽃이 더 풍성하다.' },
        { id: 'rosa-shrub-pink-double-knock-out', name: '핑크 더블 녹아웃', scientificName: "Rosa 'Pink Double Knock Out'", trait: '딥핑크 겹꽃. 녹아웃 계열의 강건함은 그대로다.' },
        { id: 'rosa-shrub-drift', name: '드리프트', scientificName: 'Rosa Drift series', trait: '키 18~60cm로 낮게 퍼지는 지피형 관목장미. 강한 내병성에 진 꽃이 저절로 떨어진다(대부분 USDA 4~11). 코랄·피치·레드·핑크 등 색이 다양하다.' },
        { id: 'rosa-shrub-carefree-beauty', name: '케어프리 뷰티', scientificName: "Rosa 'Carefree Beauty'", trait: '분홍 반겹꽃이 풍성하게. 무농약 저관리 관목장미의 흐름을 연 품종이다.' },
      ],
      otherCultivars: ['써니 녹아웃', '레인보우 녹아웃', '쁘띠 녹아웃', '코랄 드리프트', '피치 드리프트', '레드 드리프트', '핑크 드리프트', '스위트 드리프트', '플라워 카펫'],
    },
    // ── 미니어처 ─────────────────────────────────────────────
    {
      id: 'rosa-miniature',
      genus: '장미',
      name: '미니어처 (미니장미)',
      scientificName: 'Rosa Miniature group',
      category: '화훼',
      form: '모든 부위가 축소된 소형 장미. 화분·화단 가장자리용.',
      bloomType: '새 가지에 핀다. 사계성으로 작은 꽃이 많이 핀다.',
      hardiness: '★대부분 자근묘라 큰 접목 장미보다 추위에 강하다(USDA 4~11). 다만 뿌리가 지표 가까워 한지에선 멀칭을 보태 준다.',
      soil: '물 빠짐 좋은 흙. 화분은 정체수에 주의한다.',
      water: '마르지 않게 고르게, 오전에.',
      light: '양지(하루 6시간 이상).',
      care: '늦겨울~이른 봄에 죽은 가지 정리 후 1/3쯤 가볍게 친다.',
      pest: '큰 장미와 같은 병해(흑반·흰가루)에 걸리고 계통적으로 강한 편은 아니다 — 통풍·예방이 필요하다.',
      season: '봄부터 가을까지.',
      tip: '한국에선 대개 "미니장미"로 화분용 소형 장미로 유통되며, 품종명은 농원마다 다르다.',
    },
    // ── 덩굴장미 (클라이밍) ──────────────────────────────────
    {
      id: 'rosa-climbing',
      genus: '장미',
      name: '덩굴장미 (클라이밍)',
      scientificName: 'Rosa Climbing group',
      category: '화훼',
      form: '굵고 곧은 긴 줄기에 ★크고 향기로운 꽃을 단독·소수로 단다. 스스로 붙지 못하니 트렐리스·담장·아치에 유인·결속한다(2~3.5m).',
      bloomType: '★사계성과 일계성이 다 있다. 사계성은 새 가지에, 일계성은 묵은 가지에 핀다 — 전정 시기가 갈린다.',
      hardiness: '접목묘는 접목부를 묻고 겨울 밑동을 북준다. 자근·강건 품종이 한지에 유리하다. 대륜·노이젯 계열은 다소 추위에 약하다.',
      soil: '비옥하고 물 빠짐 좋은 흙(pH 6.0~6.5).',
      water: '흙에 깊고 고르게, 오전에.',
      light: '양지(하루 6시간 이상, 오전 볕 선호).',
      care:
        '★사계성 덩굴은 늦겨울~이른 봄에 — ★주지(굵은 줄기)를 최대한 수평으로 눕혀 유인하면 정아우세가 풀려 줄기 전체에서 곁가지가 터져 ' +
        '꽃이 많아진다. 곁가지는 2~3눈만 남기고 짧게. ★일계성 덩굴은 꽃이 진 직후에 친다(봄에 자르면 꽃을 없앤다).',
      pest: '현대 덩굴장미는 내병성 육종이 된 것이 많다. 흑반·흰가루 예방은 공통이다.',
      season: '5월 중순~6월 초 집중, 사계성은 가을까지 반복.',
      tip: '★줄기를 수평으로 눕히는 게 개화의 비결이다 — 곧추세우면 꼭대기에만 핀다.',
      varieties: [
        { id: 'rosa-cl-pierre-de-ronsard', name: '피에르 드 롱사르', scientificName: "Rosa 'Pierre de Ronsard'", trait: '연분홍에서 중심이 진해지는 컵형 겹꽃이 묵직하게. "에덴 로즈(에덴 1985)"로도 불리며 ★한국에서 가장 인기 있는 덩굴장미다. 사계성.' },
        { id: 'rosa-cl-new-dawn', name: '뉴 던', scientificName: "Rosa 'New Dawn'", trait: '연분홍 반겹꽃이 부드럽게. 강건하고 ★흑반병에 강해 기르기 쉽다. 사계성.' },
        { id: 'rosa-cl-don-juan', name: '돈 주앙', scientificName: "Rosa 'Don Juan'", trait: '벨벳 진홍 겹꽃에 향이 좋다. 사계성.' },
        { id: 'rosa-cl-golden-showers', name: '골든 샤워', scientificName: "Rosa 'Golden Showers'", trait: '맑은 노란 꽃. 사계성으로 오래 핀다.' },
      ],
      otherCultivars: ['알티시모', '어버브 올'],
    },
    // ── 람블러 ───────────────────────────────────────────────
    {
      id: 'rosa-rambler',
      genus: '장미',
      name: '람블러',
      scientificName: 'Rosa Rambler group',
      category: '화훼',
      form: '길고 유연한 줄기에 ★작은 꽃을 큰 송이로 무리지어 단다. 매우 왕성해 6~10m까지 뻗어 큰 나무·퍼걸러를 덮는다.',
      bloomType: '★대개 일계성 — 초여름에 묵은 가지에서 한 번 흐드러지게 핀다.',
      hardiness: '야생 혈통이라 대체로 매우 강건해 중부 노지에 무난하다.',
      soil: '물 빠짐 좋은 흙. 무던하다.',
      water: '흙에 고르게, 오전에.',
      light: '양지~반양지.',
      care: '★꽃이 진 직후(여름)에 친다 — 묵은 가지에 피므로 봄·겨울에 강전정하면 꽃을 없앤다. 이게 사계성 덩굴과 가장 다른 점이다.',
      pest: '통풍 나쁜 벽에 붙이면 흰가루병이 잘 온다. 우리 장마철 고온다습엔 통풍 설계가 관건이다.',
      season: '초여름 한 번(6월) 대량.',
      tip: '한국엔 정식 유통이 드물어 ★직수입·삽목·나눔으로 구하는 편이다. 우리 자생 돌가시나무(반들가시나무)가 여러 람블러 품종의 모본이다.',
    },
    // ── 영국장미 (데이비드 오스틴) ───────────────────────────
    {
      id: 'rosa-english',
      genus: '장미',
      name: '영국장미 (데이비드 오스틴)',
      scientificName: 'Rosa English Rose (David Austin)',
      category: '화훼',
      form:
        '데이비드 오스틴이 옛 장미와 현대 장미를 교배해 만든 관목장미. ★옛 장미의 풍성한 꽃 모양(로제트·컵)과 강한 향에 ' +
        '현대 장미의 사계 개화를 더했다. 대개 관목이며 길게 키워 짧은 덩굴로 올리기도 한다.',
      bloomType: '대부분 새 가지에 피는 사계성으로, 초여름부터 서리까지 반복한다.',
      hardiness:
        '★대부분 USDA 5~11이라 중부 노지 월동을 믿을 만하다(접목부를 묻고 겨울 밑동을 북주면 안전). ' +
        '★다만 노랑·살구색 계열(그레이엄 토마스·골든 셀러브레이션 등)은 한지에서 다소 약하니 가장 따뜻하고 바람 막힌 자리에 둔다. ' +
        '화분 재배는 뿌리가 추위에 노출돼 더 약하다.',
      soil: '비옥하고 물 빠짐 좋은 흙(pH 6.0~6.5). 유기질을 충분히.',
      water: '흙에 깊고 고르게, 오전에.',
      light: '양지(하루 6시간 이상, 최소 4시간).',
      care:
        '★봄(늦겨울~초봄, 중부는 2월 말~3월)에 전체 높이의 ★1/3~1/2만 가볍게 친다(큰 품종은 1/3). 죽은·약한 가지를 없애고, ' +
        '시든 꽃을 따 주면 반복 개화가 빨라진다.',
      pest:
        '★건강하게 육종돼 흑반·흰가루·녹병에 강한 편이다. 특히 ★올리비아 로즈 오스틴이 내병성이 가장 강한 축이라 초보자에게 1순위다. ' +
        '(그레이엄 토마스는 상징적이지만 내병성은 보통, 아브라함 다비는 녹병에 약한 편이다.)',
      season: '5월 말~6월 1차, 가을까지 반복.',
      tip: '★한국에 약 95~100품종이 폭넓게 유통된다(접목 1년생 묘). 옛 장미의 정취를 원할 때 가장 현실적인 선택이다.',
      varieties: [
        { id: 'rosa-en-olivia-rose-austin', name: '올리비아 로즈 오스틴', scientificName: "Rosa 'Olivia Rose Austin'", trait: '연분홍 로제트에 과일향. ★데이비드 오스틴 중 내병성이 가장 강한 축이라 초보자 1순위다. 개화가 매우 이르다(USDA 5~11).' },
        { id: 'rosa-en-graham-thomas', name: '그레이엄 토마스', scientificName: "Rosa 'Graham Thomas'", trait: '진한 노란 컵형 꽃에 티 향. 유인하면 덩굴로도. ★상징적 품종이나 내병성·반복성은 보통이다.' },
        { id: 'rosa-en-gertrude-jekyll', name: '거트루드 지킬', scientificName: "Rosa 'Gertrude Jekyll'", trait: '진분홍 로제트에 ★올드로즈 향이 매우 강하다(향의 정수로 꼽힌다). 길게 키워 덩굴로도.' },
        { id: 'rosa-en-abraham-darby', name: '아브라함 다비', scientificName: "Rosa 'Abraham Darby'", trait: '살구~복숭아빛 대륜에 강한 과일향. ★흑반·흰가루엔 강하나 녹병엔 약한 편이다.' },
        { id: 'rosa-en-claire-austin', name: '클레어 오스틴', scientificName: "Rosa 'Claire Austin'", trait: '크림빛 흰 꽃에 미르라 향이 강하다. 데이비드 오스틴의 대표 흰 장미로 내병성이 좋다(덩굴로 2.5m).' },
        { id: 'rosa-en-crown-princess-margareta', name: '크라운 프린세스 마가레타', scientificName: "Rosa 'Crown Princess Margareta'", trait: '살구오렌지 로제트에 과일·티 향. 길게 키워 덩굴(1.8~3.6m)로 올리기 좋다.' },
        { id: 'rosa-en-the-generous-gardener', name: '더 제너러스 가드너', scientificName: "Rosa 'The Generous Gardener'", trait: '연분홍 꽃에 올드로즈·머스크·미르라 향. 매우 건강하고 덩굴로도(~4.5m).' },
        { id: 'rosa-en-munstead-wood', name: '먼스테드 우드', scientificName: "Rosa 'Munstead Wood'", trait: '벨벳 진크림슨에 올드로즈·과일향. 콤팩트해 작은 화단에 맞는다.' },
        { id: 'rosa-en-lady-of-shalott', name: '레이디 오브 샬롯', scientificName: "Rosa 'Lady of Shalott'", trait: '오렌지빛 살구 꽃. 강건하고 기르기 쉽다.' },
        { id: 'rosa-en-boscobel', name: '보스코벨', scientificName: "Rosa 'Boscobel'", trait: '산호빛 진분홍 로제트에 미르라 향.' },
        { id: 'rosa-en-heritage', name: '헤리티지', scientificName: "Rosa 'Heritage'", trait: '연분홍 컵형 꽃에 미르라+레몬 향.' },
        { id: 'rosa-en-desdemona', name: '데스데모나', scientificName: "Rosa 'Desdemona'", trait: '흰빛 도는 크림핑크에 향이 강하고 ★건강하다.' },
        { id: 'rosa-en-roald-dahl', name: '로알드 달', scientificName: "Rosa 'Roald Dahl'", trait: '살구빛 꽃에 ★내병성이 우수하다.' },
        { id: 'rosa-en-golden-celebration', name: '골든 셀러브레이션', scientificName: "Rosa 'Golden Celebration'", trait: '진한 노란 대륜에 강한 향. (노랑 계열이라 한지에선 따뜻한 자리에 둔다.)' },
        { id: 'rosa-en-jude-the-obscure', name: '주드 디 옵스큐어', scientificName: "Rosa 'Jude the Obscure'", trait: '살구빛 컵형 꽃에 과일향이 강하다.' },
        { id: 'rosa-en-lady-emma-hamilton', name: '레이디 엠마 해밀턴', scientificName: "Rosa 'Lady Emma Hamilton'", trait: '귤빛 오렌지 꽃에 향이 강하고 잎이 구릿빛으로 돋는다.' },
        { id: 'rosa-en-young-lycidas', name: '영 라이시다스', scientificName: "Rosa 'Young Lycidas'", trait: '진분홍빛 마젠타 로제트에 향이 강하다.' },
        { id: 'rosa-en-mary-rose', name: '메리 로즈', scientificName: "Rosa 'Mary Rose'", trait: '분홍 로제트. 강건하고 꽃이 잘 핀다.' },
        { id: 'rosa-en-darcey-bussell', name: '다아시 부셀', scientificName: "Rosa 'Darcey Bussell'", trait: '진홍 로제트, 콤팩트해 작은 공간에 맞는다(USDA 6~7).' },
        { id: 'rosa-en-winchester-cathedral', name: '윈체스터 캐시드럴', scientificName: "Rosa 'Winchester Cathedral'", trait: '순백의 로제트. 메리 로즈의 흰색 변이로 강건하다.' },
      ],
      otherCultivars: [
        '어 슈롭셔 래드', '밧세바', '벤자민 브리튼', '브라더 캐드펠', '찰스 다윈', '샬롯', '크로커스 로즈', '에글렌타인',
        '엘리자베스', '에밀리 브론테', '유스타시아 바이', '에블린', '젠틀 헤르미온느', '제프 해밀턴', '그레이스', '할로 카',
        '히스클리프', '제임스 골웨이', '주빌리 셀러브레이션', '큐 가든', '엘디 브레이스웨이트', '레이디 솔즈베리', '리치필드 엔젤',
        '몰리뉴', '팻 오스틴', '프린세스 알렉산드라 오브 켄트', '프린세스 앤', '퀸 오브 스웨덴', '셉터드 아일', '샤리파 아스마',
        '사일러스 마너', '스피릿 오브 프리덤', '세인트 스위딘', '스트로베리 힐', '수잔 윌리엄스-엘리스', '티징 조지아',
        '토마스 아 베켓', '트랑퀼리티', '바네사 벨', '와일디브', '월러튼 올드 홀', '폴스타프', '테스 오브 더 더버빌스',
        '더 필그림', '더 포츠 와이프', '더 에인션트 매리너', '더 레이디 가드너', '더 알른윅 로즈', '더 메이플라워',
        '메리 델라니(모티머 새클러)', '가브리엘 오크',
      ],
    },
    // ── 올드 가든 로즈 (OGR) ─────────────────────────────────
    {
      id: 'rosa-old-garden',
      genus: '장미',
      name: '올드 가든 로즈 (옛 장미)',
      scientificName: 'Rosa Old Garden Roses',
      category: '화훼',
      form:
        '1867년(최초의 하이브리드 티 등장) 이전부터 있던 옛 장미 계통들 — 갈리카·다마스크·알바·센티폴리아·모스·부르봉·포틀랜드·차이나·노이젯·티 등. ' +
        '풍성한 꽃 모양과 깊은 향이 특징이다.',
      bloomType:
        '★계통에 따라 갈린다 — 갈리카·다마스크·알바·센티폴리아·모스는 ★일계성(묵은 가지, 초여름 한 번), 부르봉·포틀랜드·차이나·노이젯·티는 반복개화(새 가지)다.',
      hardiness:
        '★갈리카·다마스크·알바·센티폴리아는 매우 강건해(USDA 3~5) 중부 노지에 안전하다. 부르봉·포틀랜드는 중간(보호 권장), ' +
        '★차이나·티·노이젯은 추위에 약해(USDA 6~7) 무방비 월동은 위험하다.',
      soil: '비옥하고 물 빠짐 좋은 흙.',
      water: '흙에 고르게, 오전에.',
      light: '양지(알바는 반양지도 견딘다).',
      care:
        '★일계성(갈리카·다마스크·알바·센티폴리아·모스)은 꽃이 진 뒤에 친다(봄에 자르면 꽃을 없앤다). ' +
        '반복개화(부르봉·차이나·노이젯·티·포틀랜드)는 늦겨울~이른 봄에 현대 장미처럼 친다.',
      pest: '알바·다마스크는 병에 강한 편, 모스는 흰가루병에 약하다. 부르봉은 흑반병에 약한 편이다.',
      season: '일계성은 초여름 한 번, 반복형은 가을까지.',
      tip:
        '★한국엔 명명된 옛 장미 유통이 매우 제한적이다 — "옛 장미의 정취"는 대개 데이비드 오스틴 영국장미로 대신한다. ' +
        '명명 올드로즈는 직수입·수집 영역으로 보면 된다.',
    },
    // ── 원종·자생 장미 ───────────────────────────────────────
    {
      id: 'rosa-species',
      genus: '장미',
      name: '원종·자생 장미',
      scientificName: 'Rosa (species roses)',
      category: '화훼',
      form: '사람이 개량하지 않은 야생 원종 장미. ★대개 홑꽃 5장이고 강건해 손이 거의 안 간다. 장식적인 열매(로즈힙)가 달린다.',
      bloomType: '★대부분 일계성으로 묵은 가지에 초여름 한 번 핀다(해당화는 예외로 반복 핀다).',
      hardiness: '★매우 강건하다 — 특히 우리 자생종(해당화·찔레)은 중부 노지에서 무보온으로 잘 자란다.',
      soil: '무던하고 척박·모래땅도 견딘다(과습은 싫어한다).',
      water: '자리 잡으면 가뭄에 강하다.',
      light: '양지.',
      care: '★거의 전정하지 않는다(죽은 가지만 정리). 자연 수형을 살린다.',
      pest: '흑반·흰가루에 강한 편이다(면역은 아니다). ★해당화는 약제에 잎이 민감하니 무방제를 권한다.',
      season: '초여름(해당화는 5~7월 집중 + 가을까지 산발).',
      tip: '교배 장미의 대목·모본으로도 쓰인다. 우리 자생 장미가 정원의 야성적 멋과 우리 기후 적응을 함께 준다.',
      varieties: [
        {
          id: 'rosa-rugosa',
          name: '해당화',
          scientificName: 'Rosa rugosa',
          trait: '★한국 자생(동·서해안 모래언덕). 크고 향기로운 홍자색 홑꽃이 핀다. ★주름진 두꺼운 잎 덕에 흑반·흰가루에 매우 강하고, 염분·바람·가뭄에 강해 중부에선 사실상 무적이다(과습만 불가).',
          bloomType: '★예외적으로 반복 핀다 — 5~7월 집중, 9~10월까지 산발.',
          tip: '크고 붉은 토마토형 열매는 비타민C가 많아 ★차·잼으로 먹는다. (북미의 장미모자이크병[RRD]은 한국과 무관하며, 해당화는 오히려 저항적이다.) 뿌리로 공격적으로 번지니 필요하면 뿌리막이를 한다.',
        },
        {
          id: 'rosa-multiflora',
          name: '찔레꽃',
          scientificName: 'Rosa multiflora',
          trait: '★한국 전역 야산의 대표 야생장미. 작은 흰 홑꽃이 큰 송이로 5~6월 흐드러지고 향이 강하다. 완전 내한·강건하다.',
          bloomType: '★일계성 — 5~6월 묵은 가지에 한 번.',
          tip: '가을 붉은 열매(營實)는 약재로 쓴다(소량 독성이 있어 법제 후). 재배 장미의 대목으로도 쓰인다. (북미에선 악명 높은 침입종이지만 한국에선 자생·무해하다.)',
        },
        {
          id: 'rosa-xanthina',
          name: '노랑해당화',
          scientificName: 'Rosa xanthina',
          trait: '노란 홑~반겹꽃이 봄에 핀다. 중국 원산의 재배종으로 ★우리 자생은 아니다.',
        },
        {
          id: 'rosa-banksiae',
          name: '목향장미',
          scientificName: 'Rosa banksiae',
          trait: '가시가 거의 없는 덩굴성 원종으로 작은 꽃이 무더기로 핀다. ★중부 내한이 경계선(USDA 7b~8)이라 남향 벽·멀칭 같은 따뜻한 미기후에 기대야 하니, 믿을 만한 내한 덩굴로 보긴 어렵다.',
        },
        {
          id: 'rosa-koreana',
          name: '흰인가목',
          scientificName: 'Rosa koreana',
          trait: '한국 특산의 자생 원종. 흰 홑꽃이 핀다.',
        },
      ],
      otherCultivars: ['생열귀나무', '인가목', '돌가시나무(반들가시나무)'],
    },
    // ── 한국 육성 정원장미 ───────────────────────────────────
    {
      id: 'rosa-korean-bred',
      genus: '장미',
      name: '한국 육성 정원장미',
      scientificName: 'Rosa (Korean-bred garden)',
      category: '화훼',
      form: '농촌진흥청·지방농업기술원과 기업(에버랜드)이 우리 기후에 맞게 육종한 정원용 관목·플로리분다형 장미. ★흑반·흰가루병에 강하도록 개량했다.',
      bloomType: '새 가지에 피는 사계성으로 5~11월 연속 개화한다.',
      hardiness:
        '국내 육성이라 우리 노지 기후에 맞춰졌다(정원형 기준). ★단 국산 장미 다수는 절화·온실용이라, 노지엔 정원형으로 명시된 품종을 고른다.',
      soil: '비옥하고 물 빠짐 좋은 흙.',
      water: '흙에 고르게, 오전에.',
      light: '양지(하루 6시간 이상).',
      care: '관목·플로리분다형은 늦겨울~이른 봄에 가볍게 친다. 시든 꽃을 따면 연속 개화가 좋다.',
      pest: '★흑반·흰가루병 내병성을 강조해 육종한 정원형이라 관리가 수월하다.',
      season: '5~11월 연속.',
      tip: "★우리 기후·병해에 맞춰 나온 장미라 중부 노지에 잘 맞는다. 전남농업기술원·전남대 등이 관목형 정원장미를 내놓았고, 에버랜드는 '에버로즈' 브랜드로 40여 품종을 육성해 일본에 수출하기도 했다.",
      varieties: [
        { id: 'rosa-kr-grand-march', name: '그랜드마치', scientificName: "Rosa 'Grand March'", trait: '전남농업기술원이 2011년 낸 정원장미. 분홍빛 도는 흰 중형 꽃이 가지마다 많이(가지당 ~13송이) 5~11월 이어 핀다. ★흑반·흰가루병에 강하다.' },
        { id: 'rosa-kr-prince-garden', name: '프린스가든', scientificName: "Rosa 'Prince Garden'", trait: '전남농업기술원이 2012년 낸 플로리분다형 정원장미. 얕은 컵형 꽃에 향이 있고 ★병해에 강해 연속 개화한다.' },
        { id: 'rosa-kr-everrose', name: '에버로즈(에버랜드)', trait: "에버랜드(삼성물산 리조트부문)가 2013년부터 육성한 한국 정원장미 브랜드다 — 단일 품종이 아니라 약 40개 품종을 묶는 이름이며, 국립종자원에 30여 품종이 등록됐다. 장미축제 30주년을 계기로 육종가 하호수 등이 2만 회 넘는 인공교배로 만들었고, 노지 정원용 묘목으로 보급된다. ★'한국 기후에 맞춰 내한·내병·저관리로 육종했다'고 알려졌으나, 내한 온도·병 저항 등급 같은 수치는 공개되지 않았으니 재배는 일반 정원장미 기준을 따른다. 네덜란드 절화 'Ever Red'·덴마크 분화 'Evera'와는 다른 장미다." },
        { id: 'rosa-kr-perfume-everscape', name: '퍼퓸 에버스케이프', trait: "에버로즈의 대표 품종이다. 형광에 가까운 진분홍(핫핑크) 겹꽃이 피고 ★오전뿐 아니라 오후에도 향이 강하다. 봄부터 가을까지 거듭 피는 사계성이다. 2022년 일본 기후세계장미대회에서 금상 등 4관왕에 올랐고, '첫 한국 육성 정원장미'로 일본에 수출됐다." },
      ],
      otherCultivars: ['가든드림', '초아', '마이플라밍고', '펄레이스', '해피나라'],
    },
  ],
}
