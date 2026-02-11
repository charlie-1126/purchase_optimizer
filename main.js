// 프리셋 데이터
const presets = {
    hoyoverse: {
        pullCount: 1,
        itemCount: 160,
        packages: [
            { price: 1200, firstReward: 120, normalReward: 60 },
            { price: 5900, firstReward: 600, normalReward: 330 },
            { price: 19000, firstReward: 1960, normalReward: 1090 },
            { price: 37000, firstReward: 3960, normalReward: 2240 },
            { price: 65000, firstReward: 6560, normalReward: 3880 },
            { price: 119000, firstReward: 12960, normalReward: 8080 },
        ],
    },
    endfield: {
        pullCount: 3,
        itemCount: 20,
        packages: [
            { price: 2700, firstReward: 12, normalReward: 6 },
            { price: 11500, firstReward: 42, normalReward: 26 },
            { price: 17000, firstReward: 68, normalReward: 40 },
            { price: 28000, firstReward: 114, normalReward: 68 },
            { price: 45000, firstReward: 184, normalReward: 112 },
            { price: 93000, firstReward: 388, normalReward: 242 },
        ],
    },
};

// 패키지 데이터
let packages = [
    { price: 1200, firstReward: 120, normalReward: 60 },
    { price: 5900, firstReward: 600, normalReward: 330 },
    { price: 19000, firstReward: 1960, normalReward: 1090 },
    { price: 37000, firstReward: 3960, normalReward: 2240 },
    { price: 65000, firstReward: 6560, normalReward: 3880 },
    { price: 119000, firstReward: 12960, normalReward: 8080 },
];

// 각 패키지의 첫결제 여부 (기본값: 모두 첫결제 가능)
let firstPurchaseStatus = new Array(packages.length).fill(false);

// 뽑기권 환산율 (N뽑당 M개)
let pullCount = 1; // 뽑기 횟수
let itemCount = 160; // 개수

// 뽑기권 환산율 업데이트
function updatePullRate() {
    pullCount = parseInt(document.getElementById("pull-count").value) || 1;
    itemCount = parseInt(document.getElementById("item-count").value) || 1;

    // 목표 뽑기권 값이 있으면 개수 재계산
    const targetPulls = parseFloat(document.getElementById("target-pulls").value);
    if (targetPulls && targetPulls > 0) {
        const items = toItems(targetPulls);
        document.getElementById("target-items").value = items;
    }

    renderPackages();
    hideResults();
    document.getElementById("preset-select").value = "custom";
}

// 개수를 뽑기권으로 변환
function toPulls(items) {
    return Math.floor((items * pullCount) / itemCount);
}

// 뽑기권을 개수로 변환
function toItems(pulls) {
    return Math.ceil((pulls * itemCount) / pullCount);
}

// 뽑기권 입력 시 개수 동기화
function syncItemsFromPulls() {
    const pulls = parseFloat(document.getElementById("target-pulls").value);
    if (pulls && pulls > 0) {
        const items = toItems(pulls);
        document.getElementById("target-items").value = items;
    }
}

// 개수 입력 시 뽑기권 동기화
function syncPullsFromItems() {
    const items = parseInt(document.getElementById("target-items").value);
    if (items && items > 0) {
        const pulls = Math.floor((items * pullCount) / itemCount);
        document.getElementById("target-pulls").value = pulls;
    }
}

// 페이지 로드 시 패키지 목록 렌더링
document.addEventListener("DOMContentLoaded", () => {
    renderPackages();
});

// 프리셋 로드
function loadPreset(presetName) {
    if (presetName === "custom") return;

    if (presets[presetName]) {
        const preset = presets[presetName];
        packages = JSON.parse(JSON.stringify(preset.packages));
        pullCount = preset.pullCount;
        itemCount = preset.itemCount;
        firstPurchaseStatus = new Array(packages.length).fill(false);
        document.getElementById("pull-count").value = pullCount;
        document.getElementById("item-count").value = itemCount;
        renderPackages();
        hideResults();
    }
}

// 패키지 추가
function addPackage() {
    packages.push({ price: 1000, firstReward: 100, normalReward: 50 });
    firstPurchaseStatus.push(false);
    renderPackages();
    hideResults();
    document.getElementById("preset-select").value = "custom";
}

// 패키지 삭제
function deletePackage(index) {
    if (packages.length <= 1) {
        alert("최소 1개의 패키지는 필요합니다.");
        return;
    }
    if (confirm("이 패키지를 삭제하시겠습니까?")) {
        packages.splice(index, 1);
        firstPurchaseStatus.splice(index, 1);
        renderPackages();
        hideResults();
        document.getElementById("preset-select").value = "custom";
    }
}

// 패키지 목록 렌더링
function renderPackages() {
    const packagesList = document.getElementById("packages-list");
    packagesList.innerHTML = "";

    packages.forEach((pkg, index) => {
        const isFirstPurchase = firstPurchaseStatus[index];

        const packageDiv = document.createElement("div");
        packageDiv.className = `package-item ${isFirstPurchase ? "first-purchase" : ""}`;
        packageDiv.innerHTML = `
            <div class="package-header">
                <span style="font-size: 1.1em; font-weight: bold;">${pkg.price.toLocaleString()}원 ${isFirstPurchase ? "[초회]" : "[일반]"}</span>
                <button onclick="deletePackage(${index})" class="btn-delete" title="패키지 삭제">×</button>
            </div>
            <div class="reward-inputs">
                <div class="input-row">
                    <label>금액:</label>
                    <input type="number" class="reward-input" value="${pkg.price}" 
                           onchange="updatePackagePrice(${index}, this.value)" min="0">
                    <span>원</span>
                </div>
                <div class="input-row">
                    <label>초회:</label>
                    <input type="number" class="reward-input" value="${pkg.firstReward}" 
                           onchange="updateReward(${index}, 'first', this.value)" min="0">
                    <span>개</span>
                </div>
                <div class="input-row">
                    <label>일반:</label>
                    <input type="number" class="reward-input" value="${pkg.normalReward}" 
                           onchange="updateReward(${index}, 'normal', this.value)" min="0">
                    <span>개</span>
                </div>
                <div class="efficiency-display">
                    <strong>효율:</strong> ${((pkg.normalReward / pkg.price) * 1000).toFixed(2)}개/1000원
                </div>
            </div>
            <div class="first-purchase-checkbox">
                <input type="checkbox" id="first-${index}" ${isFirstPurchase ? "checked" : ""} 
                       onchange="toggleFirstPurchase(${index})">
                <label for="first-${index}">초회</label>
            </div>
        `;
        packagesList.appendChild(packageDiv);
    });

    // 전체 선택 체크박스 상태 동기화
    const selectAllCheckbox = document.getElementById("select-all-checkbox");
    if (selectAllCheckbox) {
        const allSelected = packages.length > 0 && firstPurchaseStatus.every((status) => status);
        selectAllCheckbox.checked = allSelected;
    }
}

// 패키지 금액 업데이트
function updatePackagePrice(index, value) {
    const numValue = parseInt(value) || 0;
    packages[index].price = numValue;
    renderPackages();
    hideResults();
    document.getElementById("preset-select").value = "custom";
}

// 보상 업데이트
function updateReward(index, type, value) {
    const numValue = parseInt(value) || 0;
    if (type === "first") {
        packages[index].firstReward = numValue;
    } else {
        packages[index].normalReward = numValue;
    }
    renderPackages();
    hideResults();
    document.getElementById("preset-select").value = "custom";
}

// 첫결제 상태 토글
function toggleFirstPurchase(index) {
    firstPurchaseStatus[index] = !firstPurchaseStatus[index];
    renderPackages();
    hideResults();
}

// 모든 패키지 초회 선택/해제 토글
function toggleAllFirstPurchase(checked) {
    firstPurchaseStatus = new Array(packages.length).fill(checked);
    renderPackages();
    hideResults();
}

// 주어진 금액으로 최대 개수 계산
function calculateMaxItems() {
    const money = parseInt(document.getElementById("current-money").value);

    if (!money || money < 0) {
        showResult("max-result", "유효한 금액을 입력해주세요.", true);
        return;
    }

    if (money > 10000000) {
        showResult("max-result", "자금은 1000만원을 초과할 수 없습니다.", true);
        return;
    }

    // 동적 프로그래밍으로 최적 조합 찾기
    const result = findOptimalPurchase(money);

    if (result.total === 0) {
        showResult("max-result", "해당 금액으로 구매할 수 있는 패키지가 없습니다.", true);
        return;
    }

    displayMaxResult(result, money);
}

// 최적 구매 조합 찾기
function findOptimalPurchase(budget) {
    // DP 배열: dp[money] = {items, purchases}
    const dp = new Array(budget + 1).fill(null).map(() => ({ items: 0, purchases: [] }));

    for (let money = 1; money <= budget; money++) {
        packages.forEach((pkg, index) => {
            if (pkg.price <= money) {
                // 첫결제 옵션
                if (firstPurchaseStatus[index]) {
                    const items = pkg.firstReward;
                    const prev = dp[money - pkg.price];
                    const total = prev.items + items;

                    // 이미 이 패키지의 첫결제를 했는지 확인
                    const alreadyUsedFirst = prev.purchases.some((p) => p.index === index && p.isFirst);

                    if (!alreadyUsedFirst && total > dp[money].items) {
                        dp[money] = {
                            items: total,
                            purchases: [...prev.purchases, { index, isFirst: true, count: 1 }],
                        };
                    }
                }

                // 일반결제 옵션
                const items = pkg.normalReward;
                const prev = dp[money - pkg.price];
                const total = prev.items + items;

                if (total > dp[money].items) {
                    // 기존 구매 내역에서 같은 패키지 찾기
                    const existingPurchase = prev.purchases.find((p) => p.index === index && !p.isFirst);
                    const newPurchases = prev.purchases.filter((p) => !(p.index === index && !p.isFirst));

                    if (existingPurchase) {
                        newPurchases.push({ index, isFirst: false, count: existingPurchase.count + 1 });
                    } else {
                        newPurchases.push({ index, isFirst: false, count: 1 });
                    }

                    dp[money] = {
                        items: total,
                        purchases: newPurchases,
                    };
                }
            }
        });
    }

    // 결과를 보기 좋게 정리
    const result = dp[budget];
    const organized = organizeResult(result.purchases);

    return {
        total: result.items,
        purchases: organized.purchases,
        spent: organized.spent,
    };
}

// 구매 내역 정리
function organizeResult(purchases) {
    const organized = [];
    let totalSpent = 0;

    purchases.forEach((purchase) => {
        const pkg = packages[purchase.index];
        const cost = pkg.price * purchase.count;
        const items = purchase.isFirst ? pkg.firstReward : pkg.normalReward * purchase.count;

        organized.push({
            price: pkg.price,
            count: purchase.count,
            isFirst: purchase.isFirst,
            items: items,
            cost: cost,
        });

        totalSpent += cost;
    });

    organized.sort((a, b) => {
        if (a.price !== b.price) {
            return b.price - a.price;
        }
        return b.isFirst - a.isFirst;
    });

    return { purchases: organized, spent: totalSpent };
}

// 최대 개수 결과 표시
function displayMaxResult(result, budget) {
    const totalPulls = toPulls(result.total);
    let html = `
        <div class="result-title">최대 획득 가능: ${result.total.toLocaleString()}개 (${totalPulls}뽑)</div>
        <div class="result-details">
            <div style="margin-bottom: 10px; font-weight: bold;">구매 내역:</div>
    `;

    result.purchases.forEach((p) => {
        const type = p.isFirst ? "[첫결제]" : "[일반]";
        html += `
            <div class="result-item">
                ${p.price.toLocaleString()}원 ${type} × ${p.count}회
                = ${p.items.toLocaleString()}개 - ${p.cost.toLocaleString()}원
            </div>
        `;
    });

    html += `
        </div>
        <div class="total-summary">
            총 ${result.spent.toLocaleString()}원 사용<br>
            총 ${result.total.toLocaleString()}개 (${totalPulls}뽑) 획득
        </div>
    `;

    showResult("max-result", html, false);
}

// 목표 개수로 최소 금액 계산
function calculateMinCost() {
    const targetItems = parseInt(document.getElementById("target-items").value);

    if (!targetItems || targetItems < 0) {
        showResult("min-result", "유효한 목표 개수를 입력해주세요.", true);
        return;
    }

    const result = findMinCostForTarget(targetItems);

    if (!result) {
        showResult("min-result", "목표 개수를 달성할 수 없습니다.", true);
        return;
    }

    displayMinResult(result, targetItems);
}

// 목표 개수 달성을 위한 최소 비용 찾기
function findMinCostForTarget(target) {
    const MAX_COST = 10000000; // 최대 1000만원까지 탐색

    // DP: dp[items] = {cost, purchases}
    const dp = new Map();
    dp.set(0, { cost: 0, purchases: [] });

    // BFS 방식으로 탐색
    const queue = [{ items: 0, cost: 0, purchases: [], usedFirst: new Set() }];
    let minResult = null;

    while (queue.length > 0) {
        const current = queue.shift();

        if (current.items >= target) {
            if (!minResult || current.cost < minResult.cost) {
                minResult = current;
            }
            continue;
        }

        if (current.cost >= MAX_COST) continue;

        packages.forEach((pkg, index) => {
            // 첫결제 옵션
            if (firstPurchaseStatus[index] && !current.usedFirst.has(index)) {
                const items = pkg.firstReward;
                const newItems = current.items + items;
                const newCost = current.cost + pkg.price;

                if (newCost < MAX_COST && (!dp.has(newItems) || dp.get(newItems).cost > newCost)) {
                    const newUsedFirst = new Set(current.usedFirst);
                    newUsedFirst.add(index);

                    const newState = {
                        items: newItems,
                        cost: newCost,
                        purchases: [...current.purchases, { index, isFirst: true, count: 1 }],
                        usedFirst: newUsedFirst,
                    };

                    dp.set(newItems, { cost: newCost, purchases: newState.purchases });

                    if (newItems < target) {
                        queue.push(newState);
                    } else if (!minResult || newCost < minResult.cost) {
                        minResult = newState;
                    }
                }
            }

            // 일반결제 옵션
            const items = pkg.normalReward;
            const newItems = current.items + items;
            const newCost = current.cost + pkg.price;

            if (newCost < MAX_COST && (!dp.has(newItems) || dp.get(newItems).cost > newCost)) {
                const existingPurchase = current.purchases.find((p) => p.index === index && !p.isFirst);
                const newPurchases = current.purchases.filter((p) => !(p.index === index && !p.isFirst));

                if (existingPurchase) {
                    newPurchases.push({ index, isFirst: false, count: existingPurchase.count + 1 });
                } else {
                    newPurchases.push({ index, isFirst: false, count: 1 });
                }

                const newState = {
                    items: newItems,
                    cost: newCost,
                    purchases: newPurchases,
                    usedFirst: current.usedFirst,
                };

                dp.set(newItems, { cost: newCost, purchases: newState.purchases });

                if (newItems < target) {
                    queue.push(newState);
                } else if (!minResult || newCost < minResult.cost) {
                    minResult = newState;
                }
            }
        });
    }

    if (!minResult) return null;

    const organized = organizeResult(minResult.purchases);
    return {
        total: minResult.items,
        cost: minResult.cost,
        purchases: organized.purchases,
    };
}

// 최소 금액 결과 표시
function displayMinResult(result, target) {
    const targetPulls = toPulls(target);
    const totalPulls = toPulls(result.total);
    let html = `
        <div class="result-title">필요 금액: ${result.cost.toLocaleString()}원</div>
        <div class="result-details">
            <div style="margin-bottom: 10px; font-weight: bold;">구매 내역:</div>
    `;

    result.purchases.forEach((p) => {
        const type = p.isFirst ? "[첫결제]" : "[일반]";
        html += `
            <div class="result-item">
                ${p.price.toLocaleString()}원 ${type} × ${p.count}회
                = ${p.items.toLocaleString()}개 - ${p.cost.toLocaleString()}원
            </div>
        `;
    });

    html += `
        </div>
        <div class="total-summary">
            목표: ${target.toLocaleString()}개 (${targetPulls}뽑)<br>
            실제 획득: ${result.total.toLocaleString()}개 (${totalPulls}뽑)<br>
            필요 금액: ${result.cost.toLocaleString()}원
        </div>
    `;

    showResult("min-result", html, false);
}

// 결과 표시
function showResult(elementId, content, isError) {
    const resultBox = document.getElementById(elementId);

    if (isError) {
        resultBox.innerHTML = `<div style="color: #e74c3c; font-weight: bold;">${content}</div>`;
    } else {
        resultBox.innerHTML = content;
    }

    resultBox.classList.add("show");
}

// 결과 숨기기
function hideResults() {
    const maxResult = document.getElementById("max-result");
    const minResult = document.getElementById("min-result");

    if (maxResult) {
        maxResult.classList.remove("show");
        maxResult.innerHTML = "";
    }
    if (minResult) {
        minResult.classList.remove("show");
        minResult.innerHTML = "";
    }
}
