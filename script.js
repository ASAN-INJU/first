/* =====================================
V12 Ultimate
AI 주식 단타 분석 시스템
script.js
MA5 + MA20 + MA60 + MA120
일목균형표
자동 단타 후보 스캔
===================================== */

/* =====================================
Render API 서버
===================================== */

const API_SERVER =
"https://first-gqm8.onrender.com";

/* =====================================
전역 변수
===================================== */

let stocks = [];

let chart = null;

let isSearching = false;

/* =====================================
페이지 시작
===================================== */

document.addEventListener(
"DOMContentLoaded",
() => {

```
    loadStocks();


    const searchBtn =
        document.getElementById(
            "searchBtn"
        );


    if (searchBtn) {

        searchBtn.addEventListener(
            "click",
            searchStock
        );

    }


    const stockCode =
        document.getElementById(
            "stockCode"
        );


    if (stockCode) {

        stockCode.addEventListener(
            "input",
            autoComplete
        );


        stockCode.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    searchStock();

                }

            }
        );

    }

}
```

);

/* =====================================
종목 리스트 불러오기
===================================== */

async function loadStocks() {

```
try {

    const response =
        await fetch(
            "stocks.json"
        );


    if (!response.ok) {

        throw new Error(
            "stocks.json 불러오기 실패"
        );

    }


    stocks =
        await response.json();


    console.log(
        "종목 리스트 로딩 완료",
        stocks.length
    );

}

catch (error) {

    console.error(
        "종목 리스트 오류",
        error
    );

    stocks = [];

}
```

}

/* =====================================
종목 찾기
이름 또는 코드
===================================== */

function findStock(input) {

```
const keyword =
    String(
        input || ""
    )
    .trim()
    .toLowerCase();


if (
    !keyword
) {

    return null;

}


return stocks.find(
    stock => {

        const name =
            String(
                stock.name || ""
            )
            .trim()
            .toLowerCase();


        const code =
            String(
                stock.code || ""
            )
            .trim()
            .toLowerCase();


        return (
            name === keyword ||
            code === keyword
        );

    }
);
```

}

/* =====================================
자동완성
종목명 + 종목코드 검색
종목 클릭 → 자동 분석
===================================== */

function autoComplete() {

```
const inputElement =
    document.getElementById(
        "stockCode"
    );


const box =
    document.getElementById(
        "suggestions"
    );


if (
    !inputElement ||
    !box
) {

    return;

}


const input =
    inputElement.value
        .trim()
        .toLowerCase();


box.innerHTML =
    "";


if (
    input.length < 1
) {

    return;

}


const result =
    stocks
        .filter(
            stock => {

                const name =
                    String(
                        stock.name || ""
                    )
                    .toLowerCase();


                const code =
                    String(
                        stock.code || ""
                    )
                    .toLowerCase();


                return (

                    name.includes(
                        input
                    )

                    ||

                    code.includes(
                        input
                    )

                );

            }
        )
        .slice(
            0,
            10
        );


result.forEach(
    stock => {

        const div =
            document.createElement(
                "div"
            );


        div.className =
            "suggestion-item";


        div.innerText =
            `${stock.name} (${stock.code})`;


        div.addEventListener(
            "click",
            async () => {

                inputElement.value =
                    stock.name;


                inputElement.dataset.stockName =
                    stock.name;


                inputElement.dataset.stockCode =
                    stock.code;


                box.innerHTML =
                    "";


                console.log(
                    "종목 선택:",
                    stock.name,
                    stock.code
                );


                await searchStock();

            }
        );


        box.appendChild(
            div
        );

    }
);
```

}

/* =====================================
주식 조회
종목명 + 종목코드 검색
===================================== */

async function searchStock() {

```
if (
    isSearching
) {

    console.log(
        "이미 조회 중입니다."
    );

    return;

}


const inputElement =
    document.getElementById(
        "stockCode"
    );


if (
    !inputElement
) {

    alert(
        "종목 입력창을 찾을 수 없습니다."
    );

    return;

}


const input =
    inputElement.value
        .trim();


if (
    !input
) {

    alert(
        "종목명 또는 종목코드를 입력하세요."
    );

    return;

}


/* ---------------------------------
   종목명 또는 코드 검색
--------------------------------- */

const stock =
    findStock(
        input
    );


let code =
    "";


let stockName =
    "";


/* ---------------------------------
   stocks.json 종목 검색
--------------------------------- */

if (
    stock
) {

    code =
        String(
            stock.code
        )
        .trim();


    stockName =
        stock.name;


    console.log(
        "종목 변환 성공:",
        stockName,
        "→",
        code
    );

}


/* ---------------------------------
   자동완성 선택 데이터
--------------------------------- */

else if (
    inputElement.dataset.stockCode
) {

    code =
        inputElement.dataset.stockCode;


    stockName =
        inputElement.dataset.stockName ||
        input;

}


/* ---------------------------------
   6자리 숫자 코드 직접 입력
--------------------------------- */

else if (
    /^\d{6}$/.test(
        input
    )
) {

    code =
        input;


    const codeStock =
        findStock(
            code
        );


    if (
        codeStock
    ) {

        stockName =
            codeStock.name;

    }

}


/* ---------------------------------
   종목을 찾지 못함
--------------------------------- */

else {

    alert(

        "종목을 찾을 수 없습니다.\n\n" +

        "종목명 또는 6자리 종목코드를\n" +

        "정확하게 입력해주세요."

    );

    return;

}


/* ---------------------------------
   최종 코드 검증
--------------------------------- */

if (
    !/^\d{6}$/.test(
        code
    )
) {

    alert(
        "잘못된 종목코드입니다."
    );

    return;

}


/* ---------------------------------
   입력창 표시
--------------------------------- */

inputElement.value =
    code;


inputElement.dataset.stockCode =
    code;


inputElement.dataset.stockName =
    stockName;


console.log(
    "주식 조회 시작:",
    stockName ||
    "종목명 없음",
    code
);


/* ---------------------------------
   API 요청
--------------------------------- */

const apiUrl =
    `${API_SERVER}/api/stock/${encodeURIComponent(code)}`;


console.log(
    "API 요청:",
    apiUrl
);


isSearching =
    true;


try {

    const response =
        await fetch(
            apiUrl,
            {

                method:
                    "GET",

                headers: {

                    "Accept":
                        "application/json"

                }

            }
        );


    console.log(
        "API 응답 상태:",
        response.status
    );


    if (
        !response.ok
    ) {

        throw new Error(
            `서버 응답 오류: ${response.status}`
        );

    }


    const data =
        await response.json();


    console.log(
        "API 데이터:",
        data
    );


    if (
        data.success === false
    ) {

        alert(
            data.message ||
            "주가 조회에 실패했습니다."
        );

        return;

    }


    /* ---------------------------------
       종목명 추가
    --------------------------------- */

    if (
        stockName &&
        !data.name
    ) {

        data.name =
            stockName;

    }


    /* ---------------------------------
       화면 표시
    --------------------------------- */

    displayStock(
        data
    );

}

catch (
    error
) {

    console.error(
        "주식 조회 오류:",
        error
    );


    alert(

        "서버 연결 실패\n\n" +

        "API 서버:\n" +

        API_SERVER +

        "\n\n" +

        "오류:\n" +

        error.message

    );

}

finally {

    isSearching =
        false;

}
```

}

/* =====================================
주식 데이터 화면 표시
MA5 + MA20 + MA60 + MA120
===================================== */

function displayStock(
data
) {

```
/* ---------------------------------
   기본 화면 요소
--------------------------------- */

const stockNameElement =
    document.getElementById(
        "stockName"
    );


const price =
    document.getElementById(
        "price"
    );


const change =
    document.getElementById(
        "change"
    );


const volume =
    document.getElementById(
        "volume"
    );


/* ---------------------------------
   이동평균
--------------------------------- */

const ma5 =
    document.getElementById(
        "ma5"
    );


const ma20 =
    document.getElementById(
        "ma20"
    );


const ma60 =
    document.getElementById(
        "ma60"
    );


const ma120 =
    document.getElementById(
        "ma120"
    );


/* ---------------------------------
   일목균형표
--------------------------------- */

const conversion =
    document.getElementById(
        "conversion"
    );


const base =
    document.getElementById(
        "base"
    );


const spanA =
    document.getElementById(
        "spanA"
    );


const spanB =
    document.getElementById(
        "spanB"
    );


const lagging =
    document.getElementById(
        "lagging"
    );


/* ---------------------------------
   데이터 상태
--------------------------------- */

const priceStatus =
    document.getElementById(
        "priceStatus"
    );


const dailyStatus =
    document.getElementById(
        "dailyStatus"
    );


const ma120Status =
    document.getElementById(
        "ma120Status"
    );


/* ---------------------------------
   종목명
--------------------------------- */

if (
    stockNameElement
) {

    stockNameElement.innerText =
        data.name ||
        data.code ||
        "종목";

}


/* ---------------------------------
   현재가
--------------------------------- */

if (
    price
) {

    price.innerText =
        Number(
            data.price || 0
        )
        .toLocaleString() +
        "원";

}


/* ---------------------------------
   등락률
--------------------------------- */

if (
    change
) {

    const changeValue =
        Number(
            data.change || 0
        );


    change.innerText =
        changeValue +
        "%";

}


/* ---------------------------------
   거래량
--------------------------------- */

if (
    volume
) {

    volume.innerText =
        Number(
            data.volume || 0
        )
        .toLocaleString();

}


/* =================================
   MA5
================================= */

if (
    ma5
) {

    ma5.innerText =
        Number(
            data.ma5 || 0
        ) > 0

            ?

            Number(
                data.ma5
            )
            .toLocaleString()

            :

            "-";

}


/* =================================
   MA20
================================= */

if (
    ma20
) {

    ma20.innerText =
        Number(
            data.ma20 || 0
        ) > 0

            ?

            Number(
                data.ma20
            )
            .toLocaleString()

            :

            "-";

}


/* =================================
   MA60
================================= */

if (
    ma60
) {

    ma60.innerText =
        Number(
            data.ma60 || 0
        ) > 0

            ?

            Number(
                data.ma60
            )
            .toLocaleString()

            :

            "-";

}


/* =================================
   MA120
   서버 → 화면 완전 연결
================================= */

if (
    ma120
) {

    ma120.innerText =
        Number(
            data.ma120 || 0
        ) > 0

            ?

            Number(
                data.ma120
            )
            .toLocaleString()

            :

            "-";

}


/* =================================
   일목균형표
================================= */

const ichimoku =
    data.ichimoku || {};


if (
    conversion
) {

    conversion.innerText =
        Number(
            ichimoku.conversion || 0
        ) > 0

            ?

            Number(
                ichimoku.conversion
            )
            .toLocaleString()

            :

            "-";

}


if (
    base
) {

    base.innerText =
        Number(
            ichimoku.base || 0
        ) > 0

            ?

            Number(
                ichimoku.base
            )
            .toLocaleString()

            :

            "-";

}


if (
    spanA
) {

    spanA.innerText =
        Number(
            ichimoku.spanA || 0
        ) > 0

            ?

            Number(
                ichimoku.spanA
            )
            .toLocaleString()

            :

            "-";

}


if (
    spanB
) {

    spanB.innerText =
        Number(
            ichimoku.spanB || 0
        ) > 0

            ?

            Number(
                ichimoku.spanB
            )
            .toLocaleString()

            :

            "-";

}


if (
    lagging
) {

    lagging.innerText =
        Number(
            ichimoku.lagging || 0
        ) > 0

            ?

            Number(
                ichimoku.lagging
            )
            .toLocaleString()

            :

            "-";

}


/* =================================
   현재가 상태
================================= */

if (
    priceStatus
) {

    priceStatus.innerText =
        data.dataStatus?.price ||
        "UNKNOWN";

}


/* =================================
   일봉 상태
================================= */

if (
    dailyStatus
) {

    dailyStatus.innerText =
        data.dataStatus?.daily ||
        "UNKNOWN";

}


/* =================================
   MA120 상태
================================= */

if (
    ma120Status
) {

    ma120Status.innerText =
        data.dataStatus?.ma120 ||
        (
            Number(
                data.ma120 || 0
            ) > 0

                ?

                "AVAILABLE"

                :

                "UNAVAILABLE"
        );

}


/* =================================
   AI 분석
================================= */

analyzeStock(
    data
);


/* =================================
   차트
================================= */

drawChart(
    data
);
```

}

/* =====================================
AI 단타 분석
MA120은 장기 추세 참고용
===================================== */

function analyzeStock(
data
) {

```
const scoreElement =
    document.getElementById(
        "score"
    );


const recommendElement =
    document.getElementById(
        "recommend"
    );


const analysisElement =
    document.getElementById(
        "analysis"
    );


if (
    !scoreElement ||
    !recommendElement
) {

    return;

}


/* ---------------------------------
   데이터 가져오기
--------------------------------- */

const price =
    Number(
        data.price || 0
    );


const change =
    Number(
        data.change || 0
    );


const volume =
    Number(
        data.volume || 0
    );


const ma5 =
    Number(
        data.ma5 || 0
    );


const ma20 =
    Number(
        data.ma20 || 0
    );


const ma60 =
    Number(
        data.ma60 || 0
    );


const ma120 =
    Number(
        data.ma120 || 0
    );


/* ---------------------------------
   점수
   기존 V12 점수 체계 유지
--------------------------------- */

let score =
    0;


let reasons =
    [];


const validMA =

    ma5 > 0 &&

    ma20 > 0 &&

    ma60 > 0;


/* =================================
   1. 현재가 vs MA5
================================= */

if (
    validMA
) {

    if (
        price >
        ma5
    ) {

        score += 20;

        reasons.push(
            "현재가가 5일선 위"
        );

    }

    else {

        reasons.push(
            "현재가가 5일선 아래"
        );

    }


    /* =================================
       2. MA5 vs MA20
    ================================= */

    if (
        ma5 >
        ma20
    ) {

        score += 20;

        reasons.push(
            "5일선 > 20일선"
        );

    }

    else {

        reasons.push(
            "5일선 < 20일선"
        );

    }


    /* =================================
       3. MA20 vs MA60
    ================================= */

    if (
        ma20 >
        ma60
    ) {

        score += 20;

        reasons.push(
            "20일선 > 60일선"
        );

    }

    else {

        reasons.push(
            "20일선 < 60일선"
        );

    }

}


/* =================================
   4. 등락률
================================= */

if (
    change >= 5
) {

    score += 20;

    reasons.push(
        "등락률 강세 +20"
    );

}

else if (
    change > 2
) {

    score += 10;

    reasons.push(
        "등락률 상승 +10"
    );

}

else if (
    change > 0
) {

    reasons.push(
        "등락률 상승"
    );

}

else {

    reasons.push(
        "등락률 약세"
    );

}


/* =================================
   5. 거래량
================================= */

if (
    volume >= 10000000
) {

    score += 20;

    reasons.push(
        "거래량 매우 활발 +20"
    );

}

else if (
    volume >= 1000000
) {

    score += 10;

    reasons.push(
        "거래량 활발 +10"
    );

}

else {

    reasons.push(
        "거래량 부족"
    );

}


/* =================================
   MA120 장기 추세 참고
   점수에는 아직 반영하지 않음
================================= */

let ma120Trend =
    "MA120 데이터 없음";


if (
    ma120 > 0
) {

    if (
        price >
        ma120
    ) {

        ma120Trend =
            "현재가가 MA120 위";

        reasons.push(
            "장기추세: 현재가 > MA120"
        );

    }

    else {

        ma120Trend =
            "현재가가 MA120 아래";

        reasons.push(
            "장기추세: 현재가 < MA120"
        );

    }

}


/* =================================
   신호 판단
================================= */

let signal =
    "관망";


if (
    !validMA
) {

    signal =
        "데이터부족";

}

else if (
    score >= 80
) {

    signal =
        "매수관심";

}

else if (
    score >= 60
) {

    signal =
        "상승관찰";

}

else if (
    score >= 40
) {

    signal =
        "관망";

}

else {

    signal =
        "약세";

}


/* =================================
   점수 표시
================================= */

scoreElement.innerText =
    score +
    "점";


recommendElement.innerText =
    signal;


/* =================================
   AI 분석 상세 표시
================================= */

if (
    analysisElement
) {

    analysisElement.innerHTML =

        `
        <div>
            <strong>AI 분석 결과</strong>
        </div>

        <div>
            점수 : ${score}점
        </div>

        <div>
            현재가 : ${price.toLocaleString()}원
        </div>

        <div>
            등락률 : ${change}%
        </div>

        <div>
            거래량 : ${volume.toLocaleString()}
        </div>

        <div>
            MA5 : ${
                ma5 > 0
                    ? ma5.toLocaleString()
                    : "-"
            }
        </div>

        <div>
            MA20 : ${
                ma20 > 0
                    ? ma20.toLocaleString()
                    : "-"
            }
        </div>

        <div>
            MA60 : ${
                ma60 > 0
                    ? ma60.toLocaleString()
                    : "-"
            }
        </div>

        <div>
            MA120 : ${
                ma120 > 0
                    ? ma120.toLocaleString()
                    : "-"
            }
        </div>

        <div>
            장기추세 : ${ma120Trend}
        </div>

        <div>
            판정 : ${signal}
        </div>

        <hr>

        <div>
            ${reasons.join("<br>")}
        </div>

        <br>

        <div>
            단타 기준 참고용 분석입니다.
        </div>
        `;

}


console.log(
    "AI ANALYSIS",
    {

        price,

        change,

        volume,

        ma5,

        ma20,

        ma60,

        ma120,

        score,

        signal,

        ma120Trend,

        reasons

    }
);


return {

    score,

    signal,

    ma120,

    ma120Trend,

    reasons

};
```

}

/* =====================================
자동 단타 후보 스캔
가격대 선택 지원
===================================== */

async function scanStocks(
maxPrice = 50000
) {

```
const scanBtn =
    document.getElementById(
        "scanBtn"
    );


const scanResult =
    document.getElementById(
        "scanResult"
    );


const priceLabel =
    `${Number(
        maxPrice
    ).toLocaleString()}원 이하`;


if (scanBtn) {

    scanBtn.disabled =
        true;

    scanBtn.innerText =
        `🔄 ${priceLabel} 종목 찾는 중...`;

}


if (scanResult) {

    scanResult.innerHTML =

        `<div class="scan-loading">
            🔍 ${priceLabel} 단타 종목을 찾고 있습니다.<br>
            잠시만 기다려주세요...
        </div>`;

}


try {

    console.log(
        "AUTO SCAN 요청 시작",
        {
            maxPrice
        }
    );


    const response =
        await fetch(
            `${API_SERVER}/api/scan?maxPrice=${maxPrice}`
        );


    if (
        !response.ok
    ) {

        throw new Error(
            `서버 오류 ${response.status}`
        );

    }


    const data =
        await response.json();


    console.log(
        "AUTO SCAN 결과",
        data
    );


    if (
        !data.success
    ) {

        throw new Error(
            data.message ||
            "자동 스캔 실패"
        );

    }


    if (
        !data.results ||
        data.results.length === 0
    ) {

        if (scanResult) {

            scanResult.innerHTML =

                `<div class="scan-empty">
                    ${priceLabel} 조건에 맞는
                    오늘의 단타 종목이 없습니다.
                </div>`;

        }

        return;

    }


    /* ---------------------------------
       프론트 가격 필터
    --------------------------------- */

    const filteredResults =
        data.results.filter(
            stock => {

                const price =
                    Number(
                        stock.price || 0
                    );


                return (

                    price > 0 &&

                    price <= maxPrice

                );

            }
        );


    if (
        filteredResults.length === 0
    ) {

        if (scanResult) {

            scanResult.innerHTML =

                `<div class="scan-empty">
                    ${priceLabel} 조건에 맞는
                    단타 후보가 없습니다.
                </div>`;

        }

        return;

    }


    if (scanResult) {

        scanResult.innerHTML =

            `<h3>
                🔥 ${priceLabel} 오늘의 단타 후보
            </h3>`;


        filteredResults.forEach(
            (
                stock,
                index
            ) => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "scan-stock";


                item.innerHTML =

                    `
                    <div class="scan-rank">
                        ${index + 1}위
                    </div>


                    <div class="scan-info">

                        <div class="scan-code">

    <div class="scan-stock-name">
        ${stock.name ||
        getStockName(
            stock.code
        ) ||
        "종목명 없음"}
    </div>

    <div class="scan-stock-code">
        ${stock.code}
    </div>

</div>


                        <div class="scan-price">
                            ${
                                Number(
                                    stock.price || 0
                                )
                                .toLocaleString()
                            }원
                        </div>


                        <div class="scan-change">
                            ${
                                Number(
                                    stock.change || 0
                                )
                            }%
                        </div>


                        <div class="scan-ma120">
                            MA120 :
                            ${
                                Number(
                                    stock.ma120 || 0
                                ) > 0

                                    ?

                                Number(
                                    stock.ma120
                                )
                                .toLocaleString()

                                    :

                                "-"
                            }
                        </div>

                    </div>


                    <div class="scan-score">

                        <strong>
                            ${stock.score}점
                        </strong>


                        <span>
                            ${stock.signal}
                        </span>

                    </div>
                    `;


                /* --------------------------------
                   후보 클릭
                -------------------------------- */

                item.addEventListener(
                    "click",
                    () => {

                        const input =
                            document.getElementById(
                                "stockCode"
                            );


                        if (input) {

                            input.value =
                                stock.code;


                            input.dataset.stockCode =
                                stock.code;


                            input.dataset.stockName =
                                stock.name ||
                                getStockName(
                                    stock.code
                                );

                        }


                        searchStock();

                    }
                );


                scanResult.appendChild(
                    item
                );

            }
        );

    }

}

catch (
    error
) {

    console.error(
        "AUTO SCAN ERROR",
        error
    );


    if (scanResult) {

        scanResult.innerHTML =

            `<div class="scan-error">
                자동 스캔 중 오류가 발생했습니다.<br>
                ${error.message}
            </div>`;

    }

}

finally {

    if (scanBtn) {

        scanBtn.disabled =
            false;

        scanBtn.innerText =
            "🔍 오늘의 단타 후보 찾기";

    }

}
```

}

/* =====================================
종목 코드 → 종목명 찾기
===================================== */

function getStockName(
code
) {

```
const stock =
    stocks.find(
        item =>

            String(
                item.code
            ) ===

            String(
                code
            )
    );


if (
    stock
) {

    return stock.name;

}


return code;
```

}

/* =====================================
차트
MA5 + MA20 + MA60 + MA120
실제 차트 데이터가 있을 때 사용
===================================== */

function drawChart(
data
) {

```
const canvas =
    document.getElementById(
        "stockChart"
    );


if (
    !canvas
) {

    return;

}


/* ---------------------------------
   Chart.js가 없으면 종료
--------------------------------- */

if (
    typeof Chart ===
    "undefined"
) {

    console.log(
        "Chart.js가 로드되지 않았습니다."
    );

    return;

}


/* ---------------------------------
   기존 차트 제거
--------------------------------- */

if (
    chart
) {

    chart.destroy();

    chart =
        null;

}


/* ---------------------------------
   현재 조회된 값
   현재 구조에서는 MA 비교용
--------------------------------- */

const price =
    Number(
        data.price || 0
    );


const ma5 =
    Number(
        data.ma5 || 0
    );


const ma20 =
    Number(
        data.ma20 || 0
    );


const ma60 =
    Number(
        data.ma60 || 0
    );


const ma120 =
    Number(
        data.ma120 || 0
    );


chart =
    new Chart(
        canvas,
        {

            type:
                "bar",


            data: {

                labels: [

                    "현재가",

                    "MA5",

                    "MA20",

                    "MA60",

                    "MA120"

                ],


                datasets: [

                    {

                        label:
                            "가격 비교",


                        data: [

                            price,

                            ma5,

                            ma20,

                            ma60,

                            ma120

                        ]

                    }

                ]

            },


            options: {

                responsive:
                    true,


                maintainAspectRatio:
                    false,


                plugins: {

                    legend: {

                        display:
                            true

                    }

                },


                scales: {

                    y: {

                        beginAtZero:
                            false

                    }

                }

            }

        }
    );
```

}
/* =====================================
 V13 자동 급등 감시
===================================== */

let watchTimer=null;


function startWatch(){

    if(watchTimer){

        alert(
        "이미 감시 중입니다."
        );

        return;

    }


    watch();


    watchTimer =
    setInterval(
        watch,
        60000
    );


    alert(
    "1분마다 자동 감시 시작"
    );

}



async function watch(){

try{


const response =
await fetch(
`${API_SERVER}/api/watch`
);


const data =
await response.json();



const box =
document.getElementById(
"watchResult"
);



if(!data.success){

    box.innerHTML =
    "감시 오류";

    return;

}



if(
data.results.length===0
){

    box.innerHTML =
    "현재 조건 종목 없음";

    return;

}



box.innerHTML =
"<h3>🚨 발견 종목</h3>";



data.results.forEach(
stock=>{


box.innerHTML +=

`

<div class="watchStock">

<b>${stock.name}</b><br>

현재가 :
${stock.price.toLocaleString()}원<br>

전일대비 :
${stock.change}%<br>

MA20 대비 :
${stock.avgRate}%<br>

</div>

`;

});


}

catch(error){

console.log(
"watch error",
error
);

}

}
