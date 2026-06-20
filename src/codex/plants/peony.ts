import type { CodexGenus } from '../types'

// 작약·모란(Paeonia) — 화훼
//
// 출처 대조(2026-06-20): Missouri Botanical Garden, RHS, American Peony Society(APS),
// 미국 대학 extension(Iowa State·Illinois·Penn State·NC State), POWO/Kew, 국립생물자원관(NIBR),
// 한국 농원(나무사랑원예·심폴·한밭농원 등). 초본/목본 차이·심는 깊이·전정·내한성·한국 유통 품종 검증.
// 주의로 잡은 것: 백작약은 현재 멸종위기종 아님(1998년 옛 지정 해제), 산작약만 II급.
// "콴 드 비"는 캔자스(Kansas)의 오기. 바트젤라(바틀라 아님).

export const peony: CodexGenus = {
  id: 'paeonia',
  name: '작약·모란',
  scientificName: 'Paeonia',
  category: '화훼',
  summary:
    '작약과 모란은 같은 작약속(Paeonia)이지만 성질이 다르다. ★작약은 초본이라 겨울에 줄기가 죽어(가을에 지면까지 자른다) ' +
    '봄에 새로 나고, 모란은 목본이라 줄기가 살아남는다(자르면 안 된다). 둘을 교배한 이토 작약은 모란 같은 큰 꽃에 ' +
    '작약의 습성을 지녔고 지지대가 필요 없다. ★심는 깊이도 정반대다 — 작약은 눈을 얕게(2.5~5cm), 모란은 접목부를 깊게(10~15cm). ' +
    '모두 추위에 강해 중부 노지에 잘 맞고, 오히려 개화에 겨울 추위(저온 휴면)가 필요하다. ' +
    '백작약·산작약은 우리 산에 자생하는 그늘 식물이다.',
  species: [
    // ── 작약 (초본) ──────────────────────────────────────────
    {
      id: 'paeonia-lactiflora',
      genus: '작약·모란',
      name: '작약 (초본작약)',
      scientificName: 'Paeonia lactiflora',
      category: '화훼',
      form: '초본 다년초, 높이 0.5~1m. 겨울에 지상부가 완전히 말라 죽고 봄에 땅속 눈에서 새로 난다.',
      bloomType: '겹꽃·반겹꽃·홑꽃·폭탄형 등 꽃 형태가 다양하다. 모란보다 늦게, 이토 작약보다 먼저 핀다.',
      hardiness:
        '추위에 매우 강하다(USDA 3~8). 오히려 ★개화에 겨울 저온(휴면 냉각)이 필요해서, 겨울이 따뜻한 남부보다 추운 중부가 유리하다. ' +
        '중부 노지에서 보온 없이 월동한다.',
      soil: '비옥하고 부식질 많은, 물 빠짐 좋은 흙. 과습하면 뿌리가 썩는다.',
      water: '중간. 자리 잡으면 어느 정도 가뭄을 견디지만, 꽃봉오리 맺힐 때 너무 마르면 봉오리가 안 벌어진다.',
      light: '양지. 개화하려면 하루 최소 4~6시간 직사광이 필요하다. 그늘이 지나치면 꽃이 안 핀다.',
      care:
        '★심는 깊이가 개화를 좌우한다 — 눈(芽)을 지면 아래 2.5~5cm로 ★얕게 심는다. 더 깊으면 잎만 무성하고 꽃이 안 핀다. ' +
        '가을 낙엽 후 시든 잎·줄기를 지면까지 잘라내고 잔재는 모아 없앤다(잿빛곰팡이 예방). 겹꽃·폭탄형은 꽃이 무거워 쓰러지니 ' +
        '새순 올라올 때 지지대를 미리 세운다. 옮겨심기를 싫어해 한자리에 오래 두는 게 좋다(이식·분주 후 2~3년은 꽃이 부실하다).',
      pest:
        '잿빛곰팡이병(보트리티스)이 가장 흔하다 — 새순이 밑동에서 무르고 봉오리가 검게 마른다. 흰가루병·잎마름(적자색 반점)도 온다. ' +
        '통풍·배수를 좋게 하고 물은 잎이 아닌 흙에 오전에 준다. 가을 잔재 제거가 1차 예방이다.',
      season: '개화 5월(늦봄~초여름).',
      tip:
        '한번 자리 잡으면 수십 년 사는 장수 식물이다. "개미가 있어야 꽃이 핀다"는 속설은 사실이 아니다 — ' +
        '개미는 봉오리의 단물을 먹으러 올 뿐, 꽃은 개미 없이도 잘 벌어진다.',
      varieties: [
        { id: 'paeonia-lactiflora-sarah-bernhardt', name: '사라 베른하르트', scientificName: "Paeonia lactiflora 'Sarah Bernhardt'", trait: '연분홍 겹꽃에 향이 강하다. 한국에서 가장 널리 유통되는 작약이다(RHS 우수상).' },
        { id: 'paeonia-lactiflora-karl-rosenfield', name: '칼 로젠필드', scientificName: "Paeonia lactiflora 'Karl Rosenfield'", trait: '진홍색 겹꽃. 색이 선명하고 줄기가 비교적 곧다.' },
        { id: 'paeonia-lactiflora-festiva-maxima', name: '페스티바 막시마', scientificName: "Paeonia lactiflora 'Festiva Maxima'", trait: '흰 겹꽃 안쪽에 붉은 반점이 점점이 든다. 이르게 피고 향이 좋다(RHS 우수상).' },
        { id: 'paeonia-lactiflora-duchesse-de-nemours', name: '듀체스 드 네무르', scientificName: "Paeonia lactiflora 'Duchesse de Nemours'", trait: '중심이 옅은 노랑빛인 흰 겹꽃. 이르게 피고 향이 좋다(RHS 우수상).' },
        { id: 'paeonia-lactiflora-coral-charm', name: '코랄 참', scientificName: "Paeonia lactiflora 'Coral Charm'", trait: '산호빛으로 피어 아이보리로 바래는 반겹꽃. 이른 시기에 핀다(APS 금상).' },
        { id: 'paeonia-lactiflora-coral-sunset', name: '코랄 선셋', scientificName: "Paeonia lactiflora 'Coral Sunset'", trait: '진한 산호빛에서 크림빛으로 바랜다. 코랄 참과 함께 인기 있는 산호색 작약이다.' },
        { id: 'paeonia-lactiflora-red-charm', name: '레드 참', scientificName: "Paeonia lactiflora 'Red Charm'", trait: '진홍색 폭탄형 겹꽃. 둥글게 솟은 꽃 모양이 인상적이다(APS 금상).' },
        { id: 'paeonia-lactiflora-kansas', name: '캔자스', scientificName: "Paeonia lactiflora 'Kansas'", trait: '수박빛 도는 선명한 적색 겹꽃, 약한 향(APS 금상).' },
        { id: 'paeonia-lactiflora-dr-alexander-fleming', name: '닥터 알렉산더 플레밍', scientificName: "Paeonia lactiflora 'Dr. Alexander Fleming'", trait: '진분홍~연어색 겹꽃에 향이 강하다.' },
      ],
      otherCultivars: ['셜리 템플', '몬스 쥬엘 엘리', '빅 벤', '벅아이 벨', '가데니아', '니폰 뷰티', '핑크 하와이안 코랄'],
    },
    // ── 모란 (목본) ──────────────────────────────────────────
    {
      id: 'paeonia-suffruticosa',
      genus: '작약·모란',
      name: '모란 (목단)',
      scientificName: 'Paeonia suffruticosa',
      category: '화훼',
      form: '낙엽 목본 관목, 높이 1~2.5m. ★작약과 달리 목질 줄기가 겨울에도 지상에 남아, 이듬해 그 가지의 눈에서 잎이 난다.',
      bloomType: '작약류 중 가장 먼저(4월 말~5월 초) 핀다. 꽃이 지름 15~25cm로 작약류 중 최대급이다.',
      hardiness:
        '중부 노지 월동은 무난하다(USDA 4~8). 다만 줄기·꽃눈이 겨우내 밖에 노출되어 ★늦서리·강풍에 꽃눈이 상할 수 있으니, ' +
        '서리 잘 앉는 골짜기나 바람 센 자리는 피한다. (식물 자체가 어는 게 아니라 꽃눈 피해다.)',
      soil: '깊고 비옥한, 물 빠짐 좋은 흙. 과습에 약하다.',
      water: '중간. 자리 잡으면 비교적 가뭄에 견딘다.',
      light: '양지~반음. 한낮 볕이 너무 강하면 오후에 가벼운 그늘이 드는 자리가 꽃을 오래 보게 한다.',
      care:
        '★작약과 정반대로 목질 줄기를 자르지 않는다 — 겨울에 줄기가 살아 있으므로 봄에 베면 안 된다. 시든 꽃과 죽은·상한 가지만 ' +
        '이른 봄이나 개화 후에 가볍게 정리한다. ★대개 작약 뿌리에 접목한 묘라 깊게 심는다 — 접목부를 지면 아래 10~15cm로 묻어 ' +
        '접수가 제 뿌리를 내리게 한다(작약은 얕게, 모란은 깊게).',
      pest: '비교적 병해가 적다. 잿빛곰팡이(모란 시들음병)·줄기마름·뿌리썩음 정도 — 배수·통풍을 좋게 하고 병든 가지·잔재는 없앤다.',
      season: '개화 4월 말~5월 초.',
      tip:
        '한국 정원의 전통 꽃으로 매우 오래 산다(수십 년~100년 이상). 우리 시장에서는 품종명보다 ★꽃색 계통' +
        '(적색·분홍·자색·백색·황색·복색)으로 "목단 3년생"처럼 유통되는 경우가 많다.',
    },
    // ── 이토 작약 (교배) ─────────────────────────────────────
    {
      id: 'paeonia-itoh',
      genus: '작약·모란',
      name: '이토 작약 (교배작약)',
      scientificName: 'Paeonia Itoh Group',
      category: '화훼',
      form: '작약(초본)과 모란(목본)을 교배한 잡종, 높이 0.6~0.9m. 모란 같은 큰 꽃·잎을 가지면서도 ★작약처럼 겨울에 지상부가 죽는다.',
      bloomType:
        '작약류 중 가장 늦게 피어 시즌을 연장한다 — 주봉이 지면 곁봉오리가 이어 피어 한 그루가 3~4주간 핀다. ★작약엔 드문 노란색(바트젤라 등)이 있다.',
      hardiness:
        '추위에 매우 강하다(USDA 3~8). 중부 노지에서 보온 없이 월동·개화한다. 다른 작약처럼 개화에 겨울 저온이 필요한데 중부 겨울이 이를 채운다.',
      soil: '비옥·부식질 많고 물 빠짐 좋은 흙. 과습 금물.',
      water: '중간. 자리 잡으면 비교적 내건성.',
      light: '양지(하루 6시간 이상). 폭염기엔 오후 그늘이 이롭다.',
      care:
        '가을에 작약처럼 지면 높이로 잘라내고 잔재를 없앤다. ★심는 깊이는 작약보다 약간 깊게(눈을 지면 아래 5~8cm) — 작약과 모란의 중간이다. ' +
        '★준목질 줄기가 튼튼해 꽃을 잘 받쳐 지지대가 거의 필요 없다(무거운 겹꽃 작약과 대비되는 큰 장점).',
      pest: '다른 작약과 같다(잿빛곰팡이·흰가루·잎마름). 잡종 강세로 세력이 좋고 병에 비교적 강한 편이나 면역은 아니다.',
      season: '개화 5월 말~6월 초(작약이 질 무렵 시작).',
      tip: '번식이 느려(크라운 나누기) 작약보다 값이 나가지만, 지지대 없이도 모란빛 큰 꽃을 오래 보는 게 매력이다.',
      varieties: [
        { id: 'paeonia-itoh-bartzella', name: '바트젤라', scientificName: "Paeonia Itoh 'Bartzella'", trait: '레몬빛 도는 노란 겹꽃에 밑동 붉은 무늬, 은은한 향. 이토 작약의 대표 품종이다(APS 금상·RHS 우수상). 바츠젤라·바첼라로도 적는다.' },
        { id: 'paeonia-itoh-cora-louise', name: '코라 루이즈', scientificName: "Paeonia Itoh 'Cora Louise'", trait: '흰빛~연분홍 반겹꽃 중심에 라벤더빛 무늬. 향이 있다(RHS 우수상).' },
        { id: 'paeonia-itoh-garden-treasure', name: '가든 트레저', scientificName: "Paeonia Itoh 'Garden Treasure'", trait: '금빛 노랑에 주홍빛 중심이 도는 반겹꽃(APS 금상).' },
        { id: 'paeonia-itoh-scarlet-heaven', name: '스칼렛 헤븐', scientificName: "Paeonia Itoh 'Scarlet Heaven'", trait: '금빛 수술이 도드라지는 진홍색 홑꽃.' },
        { id: 'paeonia-itoh-pastel-splendor', name: '파스텔 스플렌더', scientificName: "Paeonia Itoh 'Pastel Splendor'", trait: '아이보리~연분홍 바탕에 자홍빛 무늬가 드는 홑~반겹꽃.' },
        { id: 'paeonia-itoh-hillary', name: '힐러리', scientificName: "Paeonia Itoh 'Hillary'", trait: '라즈베리빛에서 크림노랑으로 바래는 반겹꽃.' },
      ],
      otherCultivars: ['핑크 아더', '옐로우 워터릴리', '줄리아 로즈'],
    },
    // ── 백작약 (자생) ────────────────────────────────────────
    {
      id: 'paeonia-japonica',
      genus: '작약·모란',
      name: '백작약 (자생)',
      scientificName: 'Paeonia japonica',
      category: '화훼',
      form: '한국 자생 초본 다년초, 높이 40~60cm. 깊은 산 낙엽수림 그늘에 난다.',
      bloomType: '흰 홑꽃이 줄기 끝에 하나씩 핀다(꽃잎 5~7장). 가을에 골돌과가 벌어지며 붉은 껍질 안 검은 씨가 드러난다.',
      hardiness: '한반도 전역 산지에 자생해 중부 노지 월동에 문제없다.',
      soil: '부식질 많고 촉촉하며 물 빠짐 좋은 흙. 서늘한 자리를 좋아한다.',
      water: '촉촉하게. 숲 그늘 식물이라 마름에 약하다.',
      light: '★반음지. 양지를 좋아하는 작약·모란과 달리 나무 그늘 아래가 맞다.',
      care: '자생 초본이라 손이 적게 간다. 가을에 시든 잎·줄기를 정리한다. 종자나 뿌리 나누기로 번식하나 발아가 더디다.',
      pest: '특별히 두드러진 병해는 적다. 과습만 피한다.',
      season: '개화 4~6월.',
      tip: '흔히 "멸종위기 2급"으로 잘못 알려져 있으나 ★현재 법정 보호종은 아니다(1998년 옛 지정이 풀렸다). 멸종위기종은 아래 산작약이다.',
    },
    // ── 산작약 (자생·멸종위기) ───────────────────────────────
    {
      id: 'paeonia-obovata',
      genus: '작약·모란',
      name: '산작약 (자생·멸종위기)',
      scientificName: 'Paeonia obovata',
      category: '화훼',
      form: '한국 자생 초본 다년초, 높이 30~70cm. 산지 숲 그늘에 난다.',
      bloomType: '분홍~적자색 컵 모양 홑꽃이 하나씩 핀다(꽃잎 5~7장). 가을에 광택 나는 검은 씨와 붉은 헛씨가 대비를 이룬다.',
      hardiness: '한국 산지에 자생해 중부 노지 월동에 문제없다.',
      soil: '부식질 많고 촉촉하며 물 빠짐 좋은 흙. 서늘한 그늘.',
      water: '촉촉하게.',
      light: '반음지(숲 그늘).',
      care:
        '★멸종위기 야생생물 II급이라 야생 개체의 채취·이식이 법으로 금지된다 — 반드시 인공증식한 묘목만 들인다. ' +
        '자생 초본이라 자리만 맞으면 손이 적게 간다.',
      pest: '두드러진 병해 적음. 과습 회피.',
      season: '개화 5~6월.',
      tip: '국내 분포지가 30여 곳뿐인 희귀종이다. 백작약(흰꽃)과 달리 분홍·적자색 꽃으로 구별한다.',
    },
  ],
}
