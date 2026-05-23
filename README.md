# 🛡️ Merge Defense (머지 디펜스)

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/ko/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/ko/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/ko/docs/Web/JavaScript)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

> **동일한 레벨의 타워를 머지(Merge)하여 한계를 돌파하라!**  
> 밀려오는 적들을 막아내며 성을 지켜내는 중독성 넘치는 웹 기반 2D 합성 디펜스 게임입니다.

---

## 📖 목차
1. [🎮 프로젝트 소개](#-프로젝트-소개)
2. [🔄 게임 플레이 흐름 (Game Flow)](#-게임-플레이-흐름-game-flow)
3. [🕹️ 플레이 방법 (How to Play)](#️-플레이-방법-how-to-play)
4. [📐 게임 시스템 및 공식 명세 (Specifications & Formulas)](#-게임-시스템-및-공식-명세-specifications--formulas)
5. [🏗️ 시스템 아키텍처 및 소스 코드 명세 (Architecture & Code Specification)](#-시스템-아키텍처-및-소스-코드-명세-architecture--code-specification)
6. [🚀 실행 방법 (How to Run)](#-실행-방법-how-to-run)

---

## 🎮 프로젝트 소개

**Merge Defense**는 HTML5, CSS3, 그리고 순수 JavaScript(Vanilla JS)만으로 개발된 반응형 클라이언트 사이드 디펜스 게임입니다. 

기존의 정형화된 타워 디펜스 룰에서 벗어나, 하단 대기소에서 스폰된 타워를 서로 **드래그 앤 드롭(Drag & Drop)하여 합성(Merge)**함으로써 타워의 성능을 폭발적으로 증가시키는 합성 시스템을 기반으로 합니다. 

플레이어는 무작위로 부여되는 **성(Star) 등급**과 **7종의 강력한 고유 속성(물, 불, 폭탄, 공, 힘, 벽, 피)**을 스마트하게 조합하여, 점점 빠르고 강해지는 적들의 파상 공세로부터 성(Castle)을 수호하며 생존 시간을 극대화해야 합니다.

### ✨ 주요 특징
* **직관적인 드래그 앤 드롭 병합**: 동일 레벨의 타워 두 개를 드롭하여 상위 레벨의 새로운 타워로 진화시키는 직관적인 UX를 선사합니다.
* **복합 상속 시스템**: 머지할 때 재료가 가진 최대 성(Star) 등급과 특수 속성이 지능적으로 상속 및 병합됩니다.
* **다양한 업그레이드 트리**: 타워의 개별 능력치(공격 속도, 힘, 사거리) 강화와 동시에 전체 타워에 영향을 미치는 글로벌 영구 업그레이드가 공존합니다.
* **실시간 배속 기능**: 1배속, 2배속, 5배속 모드를 순환하며 빠른 템포와 느린 템포를 자유롭게 전환할 수 있습니다.

---

## 🔄 게임 플레이 흐름 (Game Flow)

게임의 전체적인 플레이 흐름과 컴포넌트 간 상호작용은 다음과 같습니다.

```mermaid
graph TD
    A["👤 로그인 화면 (index.html)"] -->|닉네임 입력 & LocalStorage 저장| B["🎮 메인 게임 화면 (main.html)"]
    B --> C["🔧 하단 대기소 (create-bar)"]
    C -->|골드 소모| D["✨ 타워 스폰 (Spawn Tower)"]
    D -->|동일 레벨 타워 겹치기| E["🧬 레벨 업 및 속성/성급 병합 (Merge)"]
    E --> D
    D -->|드래그 앤 드롭| F["⚔️ 게임 보드 배치 (Installed)"]
    F -->|드래그 앤 드롭 회수| D
    
    G["👾 우측 경계면 적 스폰"] -->|성(Castle)을 향해 이동| H["🏰 성(Castle) 충돌지점"]
    F -->|자동 탐색 & 투사체 발사| I["💥 적 타격 및 특수 효과 적용"]
    I -->|체력 소모| J{"적 사망?"}
    J -->|Yes| K["💰 골드 획득 (Lv² $)"]
    J -->|No| G
    
    K -->|골드 누적| L["📈 개별/글로벌/성 업그레이드"]
    L --> D
    
    H -->|성 체력 감소| M{"성 HP <= 0?"}
    M -->|Yes| N["💀 게임 오버 화면 (fail.html)"]
    M -->|No| H
    
    N -->|Try Again 클릭| A
```

---

## 🕹️ 플레이 방법 (How to Play)

### 1. 게임 시작 및 준비
1. https://mergedefense.netlify.app 에 접속하여 플레이어의 닉네임을 입력하고 **Start** 버튼을 누릅니다.
2. 닉네임은 브라우저의 `localStorage`에 영구 기록되며, main.html 화면 상단 왼쪽에 닉네임이 출력됩니다.  

### 2. 타워 관리 (생성, 합성, 배치)
* **타워 생성**: 하단의 **[Lv 생성]** 버튼을 누르면 골드가 차감되며 대기소(`create-bar`)에 새로운 무작위 등급/속성의 타워가 나타납니다.
* **생성 단계 향상**: **[생성 단계 향상]** 버튼을 구매하면 생성되는 기본 타워의 레벨(Lv)이 증가하여, 합성 단계를 대폭 단축할 수 있습니다.
* **배치 및 회수**:
  * 대기소의 타워를 드래그하여 상단 게임 화면(`game-board`)의 원하는 좌표에 드롭하면 **설치(Installed)** 상태가 되며 즉시 적을 공격합니다.
  * 이미 배치된 타워를 다시 드래그하여 하단 대기소로 내려놓으면 안전하게 보관(회수)할 수 있습니다.
  * 설치 가능한 포탑 수는 기본 **10개**이며, **[설치 최대치]** 업그레이드로 1개씩 늘릴 수 있습니다.
* **타워 머지(Merge)**: 
  * 대기소 내에서 **동일 레벨**의 두 타워를 드래그하여 겹쳐 놓으면 레벨이 **+1** 상승한 강력한 타워로 자동 융합됩니다.
* **타임 재화**:
  * 설치된 포탑은 각자 독립적인 **타임** 재화를 가집니다.
  * 설치 중인 포탑은 1초마다 타임을 1씩 획득하며, 해당 포탑이 적을 처치하면 적의 레벨만큼 타임을 추가로 획득합니다.
  * 포탑 업그레이드 창에서 골드 업그레이드와 같은 성능의 타임 업그레이드를 구매할 수 있으며, 비용은 현재 해당 업그레이드 레벨 + 1 만큼의 타임입니다. 골드 업그레이드의 x1/x10/x100 선택값이 타임 업그레이드에도 같이 적용됩니다.
  * 타임으로 포탑 성급을 올릴 수 있습니다. 2성은 50타임, 3성은 300타임, 4성은 1800타임, 5성은 8000타임이 필요합니다.
* **장비 관리**:
  * 적 처치 시 **30% 확률**로 장비가 드랍되며, 하단 바 좌측 상단의 **[포탑] / [아이템]** 토글로 보관 중인 포탑과 장비 목록을 전환할 수 있습니다.
  * 설치된 포탑의 업그레이드 창에 있는 장비 슬롯으로 장비를 드래그하면 장착됩니다. 포탑 선택 중에는 전투만 일시정지되고 하단 아이템 바는 계속 조작할 수 있습니다. 장착된 슬롯을 클릭하면 장비를 다시 아이템 목록으로 회수합니다.
  * 같은 종류의 장비끼리는 드래그 앤 드롭으로 합성할 수 있습니다. 효과가 각각 `a%`, `b%`라면 결과 장비는 `min(a, b)%`부터 `(a + b)%` 사이의 무작위 효과를 가집니다.

### 3. 공격과 방어
* **자동 전투**: 게임 보드에 설치된 타워는 자신의 사거리 범위 내에 있는 가장 가까운 적을 조준해 지속적으로 투사체를 발사합니다.
* **성(Castle) 수호**: 우측 끝에서 출현하여 좌측 성 방어 기지로 진격하는 적들이 성벽에 도달하면 성의 체력(`Hp`)이 실시간으로 감소합니다. 성의 체력이 0 이하가 되면 fail.html 게임 오버 페이지로 강제 이동됩니다.

### 4. 강력한 시너지 업그레이드
* **개별 업그레이드**: 게임 보드에 설치된 타워를 마우스로 클릭하면 상세 업그레이드 모달이 오픈됩니다. 이곳에서 **[공격 속도 향상]**, **[공격 힘 향상]**, **[공격 범위 향상]**을 단독으로 적용할 수 있습니다.
* **글로벌 업그레이드**: 하단 패널에 위치한 버튼들로 게임 내에 존재하는 **모든 타워의 전체 속도, 전체 힘, 전체 사거리**를 동시에 영구 강화합니다.
* **치명타 업그레이드**: 기본 치명타 확률은 **10%**, 기본 치명타 피해는 **2배**입니다. 치명타 확률은 최대 100%까지 올릴 수 있습니다.
* **장비 슬롯 해금**: 첫 번째 슬롯은 기본 해금되며, 두 번째 슬롯은 해당 포탑의 개별 업그레이드 합계가 **10 이상**, 세 번째 슬롯은 **100 이상**일 때 해금됩니다.
* **성 체력 향상**: 성의 최대 Hp 한계를 늘리고 즉시 Hp를 치유하여 위기 상황을 극복할 수 있습니다.
* **배속 모드**: 전략적인 컨트롤이 급박하거나 지루한 구간을 빠르게 넘기고 싶다면 **[1배속]** 버튼을 클릭해 1배속, 2배속, 5배속 순서로 게임 속도를 전환할 수 있습니다.

---

## 📐 게임 시스템 및 공식 명세 (Specifications & Formulas)

본 게임은 정교하게 설계된 수학적 공식을 바탕으로 밸런싱되어 있습니다. 일반적인 플레이 정보뿐 아니라 파고들기 요소를 위한 핵심 규칙들을 명세합니다.

### 1. 타워 성(Star) 등급 시스템
타워 생성 시 무작위 확률로 결정되며, 타워 테두리와 하단의 별 문양 색상(Gold, Green, Purple, Red)으로 구분됩니다.

| 성(Star) 등급 | 생성 확률 | 데미지 배율 (Damage Multiplier) | 시각적 특징 (CSS Badge) |
| :---: | :---: | :---: | :---: |
| **1성 (★)** | **89.9%** | **1배** | 기본 옐로우-골드 뱃지 |
| **2성 (★★)** | **9.0%** | **2배** | 에메랄드 그린 뱃지 |
| **3성 (★★★)** | **1.0%** | **3배** | 퍼플-아메지스트 뱃지 |
| **4성 (★★★★)** | **0.1%** | **5배** | 오렌지-루비 골드 뱃지 |
| **5성 (★★★★★)** | **타임 업그레이드 전용** | **12배** | 블루-바이올렛 뱃지 |

> **⚠️ 머지 규칙**: 머지할 때 재료가 되는 두 타워 중 **가장 높은 성(Star) 등급**이 진화하는 상위 타워로 그대로 유전(계승)됩니다. (예: 2성 Lv.1 + 1성 Lv.1 = 2성 Lv.2)

### 2. 타워 7대 고유 속성 (Attributes)
타워 생성 시 **40%의 확률**로 속성 타워가 스폰되며, 머지 시 고유한 상속 법칙을 따릅니다.

| 속성 아이콘/배경 | 속성 이름 | 특수 효과 (Passive Effect) | 상세 사양 |
| :---: | :---: | :---: | :---: |
| <span style="background:#1c7ed6; padding:2px 6px; border-radius:4px; font-weight:bold;">물 (Water)</span> | **빙결/둔화** | 피격된 적을 일정 시간 동안 슬로우 상태로 만듭니다. | 3초 동안 대상 적의 이동 속도 **50% 감소** (중첩 불가) |
| <span style="background:#e03131; padding:2px 6px; border-radius:4px; font-weight:bold;">불 (Fire)</span> | **도트 피해** | 적에게 강력한 발화 화염 효과를 부여합니다. | 3초간 매 초마다 **타워 기본 데미지의 25%**에 달하는 고정 도트 피해 |
| <span style="background:#495057; padding:2px 6px; border-radius:4px; font-weight:bold;">폭탄 (Bomb)</span>| **광역 폭발** | 단일 공격 대신 타격 지점 주변에 폭풍을 일으킵니다. | 피격 대상 반경 **130px** 이내의 모든 적에게 **데미지 70%**의 스플래시 피해 |
| <span style="background:#862e9c; padding:2px 6px; border-radius:4px; font-weight:bold;">공 (Ball)</span> | **광속 성장** | 압도적인 초고속 공격 주기를 보유하지만 치명적인 대가가 따릅니다. | **공격 속도 2배 증가** (주기 50% 단축)<br>**⚠️ 패널티: 타격당한 적을 10% 확률로 3성 등급까지 진화** |
| <span style="background:#f08c00; padding:2px 6px; border-radius:4px; font-weight:bold;">힘 (Power)</span> | **공격 증폭** | 포탑의 기본 화력을 크게 끌어올립니다. | **공격력 2배 증가** |
| <span style="background:#795548; padding:2px 6px; border-radius:4px; font-weight:bold;">벽 (Wall)</span> | **완전 저지** | 공격 주기는 느리지만 적의 이동을 완전히 봉쇄합니다. | **공격 속도 2배 감소**<br>피격된 적을 **3초간 정지** |
| <span style="background:#c92a2a; padding:2px 6px; border-radius:4px; font-weight:bold;">피 (Blood)</span> | **흡혈 수리** | 공격력은 낮지만 성을 회복합니다. | **공격력 50% 감소**<br>준 피해량의 **10%**만큼 성 체력 회복 |

> **🔮 속성 상속 병합 법칙 (Merge Logic)**:
> 1. 재료 타워 중 단 하나라도 `공(Ball)` 속성이 존재할 경우: **무조건 `공(Ball)` 속성**으로 병합됩니다. (최우선순위)
> 2. `공`이 없고 한쪽만 속성을 가지고 있을 경우: **속성이 있는 쪽**으로 온전히 유전됩니다.
> 3. 양쪽 모두 다른 일반 속성(물, 불, 폭탄, 힘, 벽, 피)을 갖고 있을 경우: **드래그를 시도한 첫 번째 재료 타워의 속성**이 우선 유전됩니다.

### 3. 수치 연산 공식 (Mathematical Formulas)

#### 📊 타워 능력치 관련 공식
* **타워 기본 데미지 (Base Damage)**
  $$BaseDamage = \lfloor Lv^{1.5} \rfloor \times 10$$
* **타워 최종 공격력 (Final Damage)**
  $$Damage = \lfloor BaseDamage \times StarMultiplier \times (1 + PowerUpgrade \times 0.35 + GlobalPowerUpgrade \times 0.2) \rfloor$$
  *(단 개별 공격력 업그레이드 시 35%씩 복리 누적, 글로벌 공격력 업그레이드 시 20%씩 복리 누적)*
* **타워 사거리 (Range)**
  $$Range = 400 + RangeUpgrade \times 60 + GlobalRangeUpgrade \times 40 \text{ (px)}$$
* **타워 공격 주기 (Attack Interval)**
  $$Interval = \frac{\max(250\text{ms}, 1000\text{ms} - SpeedUpgrade \times 120\text{ms} - GlobalSpeedUpgrade \times 80\text{ms}) \times AttributeMultiplier}{GameSpeed}$$
  *(단 `공(Ball)` 속성일 경우 $AttributeMultiplier = 0.5$, 일반 상태일 경우 $1.0$. 배속은 $GameSpeed = 1.0, 2.0, 5.0$ 중 하나로 적용)*
  *(단 5성 포탑은 공격 속도가 추가로 1.5배 증가합니다.)*

#### 💰 비용(Cost) 설계 공식
* **타워 1회 소환 비용**
  $$CreateCost = \lceil SpawnLv^{2.6} \rceil \text{ ($)}$$
* **소환 단계 레벨업 비용**
  $$UpgradeCreateCost = SpawnLv^4 \times 5 \text{ ($)}$$
* **타워 개별 스탯 업그레이드 비용**
  $$UpgradeCost = Lv \times (CurrentUpgrade + 1)^2 \times 5 \text{ ($)}$$
* **글로벌 영구 업그레이드 비용 (속도/힘/사거리)**
  $$GlobalUpgradeCost = (GlobalUpgradeLevel + 1)^2 \times 25 \text{ ($)}$$
* **성 최대 체력 향상 비용**
  $$CastleUpgradeCost = (CastleUpgradeLevel + 1)^2 \times 30 \text{ ($)}$$
* **설치 최대치 향상 비용**
  $$TowerLimitUpgradeCost = 10 \times 10^{TowerLimitUpgradeLevel} \text{ ($)}$$
* **치명타 확률 향상 비용**
  $$CriticalChanceCost = 8 \times 8^{CriticalChanceUpgradeLevel} \text{ ($)}$$
* **치명타 피해 향상 비용**
  $$CriticalDamageCost = 7 \times 7^{CriticalDamageUpgradeLevel} \text{ ($)}$$

### 4. 장비 시스템
적 처치 시 30% 확률로 장비가 생성되며, 각 장비의 효과 수치는 **3%~45%** 사이에서 무작위로 결정됩니다.
같은 장비끼리 합성하면 기존 두 장비의 효과 수치를 기반으로 더 강한 장비가 생성됩니다.

| 장비 | 효과 |
| :---: | :--- |
| **기름** | 공격 속도 증가 |
| **조준경** | 공격 범위 증가 |
| **화약** | 공격 파워 증가 |
| **무게추** | 폭탄 속성의 범위 공격 반경 증가 |
| **바늘** | 치명타 확률 3%~10% 증가. 단, 총 치명타 확률은 100%를 넘지 않음 |
| **망치** | 치명타 피해량 3%~45% 증가 |

---

## 👾 적(Enemy) 시스템 사양

적들은 라운드가 흐를수록(누적 스폰 수) 기하급수적으로 단단해지고 강력해집니다.

### 1. 스폰 및 성장 규칙
* **스폰 속도**: 2.5초마다 1마리씩 우측 경계에서 무작위 Y축 좌표를 가지고 기습 출현합니다.
* **레벨 스케일링**: 현재까지 스폰된 적들의 고유 ID가 증가함에 따라 적의 레벨 한계선이 유동적으로 상승합니다.
  $$Lv_{max} = \lfloor \frac{enemyId}{10} \rfloor + 1$$
  스폰되는 적의 레벨은 $1$부터 $Lv_{max}$ 사이의 무작위 값으로 결정됩니다.

### 2. 적 스탯 공식
* **기본 체력 (Base HP)**
  * 일반 레벨:
    $$BaseHP = Lv^2 \times 100$$
  * **보스 몬스터 (레벨이 5의 배수일 때)**: 체력이 레벨에 비례하여 초증폭되고 추가로 2배 증가합니다.
    $$BaseHP = Lv^2 \times 100 \times Lv \times 2 = Lv^3 \times 200$$
* **최종 체력 (Final HP)**
  $$HP = BaseHP \times StarMultiplier$$
  *(성급 등급에 따라 1성: 1배, 2성: 2배, 3성: 4배, 4성: 8배로 극심하게 상승)*
* **성 공격 피해량 (Castle Damage)**
  $$CastleDamage = Lv \times StarDamageMultiplier$$
  *(성급 등급에 따라 1성: 1배, 2성: 2배, 3성: 4배, 4성: 8배)*
* **이동 속도 (Movement Speed)**
  * 기본 속도: `1.5`
  * **4의 배수 레벨 몬스터 (특수 스피더)**: 기본 속도가 **`2.3`**으로 비정상적으로 빠릅니다. (물 속성의 빙결 둔화로 저지하는 것이 핵심입니다)
  * **5의 배수 레벨 몬스터**는 이동 속도가 50% 감소하며, 각 레벨별로 게임 중 한 번만 생성됩니다.

### 3. 골드 보상
적 처치 시 지급되는 현상금은 레벨의 제곱에 비례합니다.
$$Reward = Lv^2 \text{ ($)}$$
보상은 20% 확률로 3배, 2% 확률로 20배까지 증가합니다.

---

## 🏰 성(Castle) 방어 기지 사양
* **기본 최대 체력**: `1000 Hp`
* **체력 증설**: 성 체력 업그레이드 시 최대 체력이 **`250 Hp`**씩 추가 적립되며, 동시에 성의 현재 체력이 **`250 Hp`** 즉시 긴급 수리(회복)됩니다.
* **자연 치유 (Hp Regene)**: 1초에 한 번씩 최대 Hp의 **1%**에 달하는 내구도가 무상으로 자연 자동 복구됩니다.

---

## 🏗️ 시스템 아키텍처 및 소스 코드 명세 (Architecture & Code Specification)

### 📁 프로젝트 디렉토리 구조
```bash
mergedefense/
├── index.html       # 게임 인트로 및 닉네임 입력 컨트롤러
├── main.html        # 메인 게임 필드 마크업 및 전체적인 HUD 요소 구조화
├── fail.html        # 게임 오버 시 닉네임 리셋 및 재도전 연동 인터페이스
├── style.css        # 게임의 SFx 그라디언트 테마, 모달 패널, 특수 별빛 이펙트
├── script.js        # 게임 물리 연산, 충돌체 감지, 프레임 루프 제어 엔진
├── defense.png      # 좌측 기지 성벽 이미지 애셋
├── img/             # 타워 레벨별(1~n) 리소스 디렉토리
└── enemyImg/        # 몬스터 레벨별(1~n) 리소스 디렉토리
```

### ⚙️ 핵심 비동기 게임 루프 (Javascript Event Loop)
`script.js` 내부에 설계된 게임 루프는 병렬 멀티 타이머 구조로 설계되어 프레임 누수를 극 최소화하고 렌더링 부하를 줄였습니다.

1. **물리 충돌 & 공격 서치 루프 (`towerAttackLoop`)**: 
   * **`100ms`** 주기로 필드의 모든 타워를 전수조사합니다.
   * `getBoundingClientRect()` 연산으로 사거리 원형 평면 범위에 들어온 가장 오래된 타겟 적을 서칭하여 감지합니다.
   * 타겟 감지 성공 시, `fireBullet` 함수를 기동하여 투사체를 생성하고 몬스터 위치까지 프레임당 **`16ms`** 속도로 선형 추적(Vector Physics)하여 충돌시킵니다.
2. **배속 동기화 기술 (`toggleSpeedMode` / `resetGameIntervals`)**:
   * 게임 속도를 조정할 때 비동기 타이머의 지연(Lag)이 생기지 않도록 `gameSpeed` 전역 변수의 비율에 맞춘 동적 클리어 공식을 탑재했습니다.
   * 배속 스위칭 순간 기존의 모든 Interval들을 한 차례 파괴(`clearInterval`)하고, `100 / gameSpeed`, `2500 / gameSpeed` 처럼 유동 계산된 간격으로 루프들을 실시간 재구축(Re-orchestration)합니다.

### 🔍 주요 핵심 코드 함수 명세

* **`createTower(lv, star, attribute)`**
  새로운 타워 객체의 원형 데이터를 생성하는 팩토리 함수입니다. 무작위 확률 함수를 통해 성급과 고유 속성을 주입받습니다.
* **`spawnEnemy()`**
  스케일링 레벨 한도 내에서 몬스터 객체와 DOM을 동적으로 조립 및 생성하여 우측 경계선에 배치하고, `moveEnemy` 스레드를 기동시킵니다.
* **`moveEnemy(enemyDiv, targetX, targetY, speed)`**
  좌측 성곽 좌표를 목표 벡터로 설정한 뒤, **16ms** 단위로 X/Y 방향 벡터를 단위화하여 미끄러지듯 전진시킵니다. 물 속성의 둔화 상태(slowUntil)를 실시간 판독하여 프레임 속도를 50% 제어합니다. 성벽 도달 시 **1초 쿨다운**을 기반으로 데미지를 누적시킵니다.
* **`makeDraggable(elem)`**
  HTML5 Drag & Drop 이벤트를 활용해 요소에 드래그 자격을 부여하며, 타워 간 충돌을 인식하여 동일 레벨일 시 기존 DOM들을 청소하고 상위 레벨 타워를 스폰시키는 머지 코어 핸들러입니다.
* **`applyTowerHit(fromTower, targetEnemy)`**
  투사체가 몬스터 바디에 도달했을 때 실 연산되는 피격 핸들러입니다. 공격 타워의 고유 속성을 조건문으로 즉각 해독하여 `applyFireDamage`(화염 도트), `applyBombDamage`(광역 타격), `promoteEnemyToThreeStar`(공 패널티 폭주)를 분기 처리합니다.

---

## 🚀 실행 방법 (How to Run)

https://mergedefense.netlify.app/

### Supabase 랭킹 설정
`supabase-config.js`에 Supabase 프로젝트 URL과 publishable key를 입력하면 랭킹 저장/조회가 활성화됩니다.

```js
window.SUPABASE_CONFIG = {
  url: 'https://YOUR_PROJECT.supabase.co',
  publicKey: 'YOUR_SUPABASE_PUBLISHABLE_KEY',
  rankingsTable: 'rankings'
};
```

필요한 테이블 예시는 다음과 같습니다.

```sql
create table rankings (
  id bigint generated by default as identity primary key,
  name text not null,
  survival_time integer not null,
  created_at timestamptz not null default now()
);
```

---

*본 프로젝트의 무단 복제 및 상업적 악용을 금하며, 재배포 및 코드 수정 시 MIT 라이선스를 준수해 주시기 바랍니다.*  
*개발 관련 건의 및 버그 피드백은 담당 개발자에게 이슈 등록을 통해 접수해 주십시오.*
