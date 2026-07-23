/* =====================================
   V12 Ultimate
   AI 주식 단타 분석 시스템
   script.js
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
);


/* =====================================
   종목 리스트 불러오기
===================================== */

async function loadStocks() {

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

}


/* =====================================
   종목 찾기
   이름 또는 코드
===================================== */

function findStock(input) {

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

}


/* =====================================
   자동완성
   종목명 + 종목코드 검색
===================================== */

function autoComplete() {

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
                () => {

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

                }
            );


            box.appendChild(
                div
            );

        }
    );

}


/* =====================================
   주식 조회
   종목명 + 종목코드 검색
===================================== */

async function searchStock() {

    /* ---------------------------------
       중복 검색 방지
    --------------------------------- */

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


    let input =
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

    let stock =
        findStock(
            input
        );


    let code =
        "";


    let stockName =
        "";


    /* ---------------------------------
       stocks.json에서 종목 찾음
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
       자동완성 선택 데이터 사용
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

        console.log(
            "INVALID STOCK INPUT",
            input
        );


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

        console.log(
            "INVALID STOCK CODE",
            code
        );


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

}


/* =====================================
   주식 데이터 화면 표시
===================================== */

function displayStock(
    data
) {

    /* ---------------------------------
       화면 요소
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
       데이터 상태 요소
    --------------------------------- */

    const priceStatus =
        document.getElementById(
            "priceStatus"
        );


    const dailyStatus =
        document.getElementById(
            "dailyStatus"
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


    /* ---------------------------------
       MA5
    --------------------------------- */

    if (
        ma5
    ) {

        ma5.innerText =
            data.ma5 > 0

                ?

                Number(
                    data.ma5
                )
                .toLocaleString()

                :

                "-";

    }


    /* ---------------------------------
       MA20
    --------------------------------- */

    if (
        ma20
    ) {

        ma20.innerText =
            data.ma20 > 0

                ?

                Number(
                    data.ma20
                )
                .toLocaleString()

                :

                "-";

    }


    /* ---------------------------------
       MA60
    --------------------------------- */

    if (
        ma60
    ) {

        ma60.innerText =
            data.ma60 > 0

                ?

                Number(
                    data.ma60
                )
                .toLocaleString()

                :

                "-";

    }
/* ---------------------------------
   일목균형표
--------------------------------- */

const ichimoku =
    data.ichimoku || {};

if (conversion) {
    conversion.innerText =
        ichimoku.conversion > 0
            ? Number(
                ichimoku.conversion
            ).toLocaleString()
            : "-";
}

if (base) {
    base.innerText =
        ichimoku.base > 0
            ? Number(
                ichimoku.base
            ).toLocaleString()
            : "-";
}

if (spanA) {
    spanA.innerText =
        ichimoku.spanA > 0
            ? Number(
                ichimoku.spanA
            ).toLocaleString()
            : "-";
}

if (spanB) {
    spanB.innerText =
        ichimoku.spanB > 0
            ? Number(
                ichimoku.spanB
            ).toLocaleString()
            : "-";
}

if (lagging) {
    lagging.innerText =
        ichimoku.lagging > 0
            ? Number(
                ichimoku.lagging
            ).toLocaleString()
            : "-";
}

    /* ---------------------------------
       현재가 상태
    --------------------------------- */

    if (
        priceStatus
    ) {

        priceStatus.innerText =
            data.dataStatus?.price ||
            "UNKNOWN";

    }


    /* ---------------------------------
       일봉 상태
    --------------------------------- */

    if (
        dailyStatus
    ) {

        dailyStatus.innerText =
            data.dataStatus?.daily ||
            "UNKNOWN";

    }


    /* ---------------------------------
       AI 분석
    --------------------------------- */

    analyzeStock(
        data
    );


    /* ---------------------------------
       차트
    --------------------------------- */

    drawChart(
        data
    );

}


/* =====================================
   자동 단타 후보 스캔
===================================== */

async function scanStocks() {

    const scanBtn =
        document.getElementById(
            "scanBtn"
        );


    const scanResult =
        document.getElementById(
            "scanResult"
        );


    // -----------------------------------
    // 스캔 시작
    // -----------------------------------

    if (scanBtn) {

        scanBtn.disabled =
            true;

        scanBtn.innerText =
            "🔄 단타 종목 찾는 중...";

    }


    if (scanResult) {

        scanResult.innerHTML =

            `<div class="scan-loading">
                🔍 단타 조건에 맞는 종목을 찾고 있습니다.<br>
                잠시만 기다려주세요...
            </div>`;

    }


    try {

        console.log(
            "AUTO SCAN 요청 시작"
        );


        // -----------------------------------
        // 서버 자동 스캔 요청
        // -----------------------------------

        const response =
            await fetch(
                `${API_SERVER}/api/scan`
            );


        console.log(
            "AUTO SCAN 응답",
            response.status
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


        // -----------------------------------
        // 결과 확인
        // -----------------------------------

        if (
            !data.success
        ) {

            throw new Error(
                data.message ||
                "자동 스캔 실패"
            );

        }


        // -----------------------------------
        // 후보 없음
        // -----------------------------------

        if (
            !data.results ||
            data.results.length === 0
        ) {

            if (scanResult) {

                scanResult.innerHTML =

                    `<div class="scan-empty">
                        오늘 단타 조건에 맞는 종목이 없습니다.
                    </div>`;

            }

            return;

        }


        // -----------------------------------
        // 후보 화면 출력
        // -----------------------------------

        if (scanResult) {

            scanResult.innerHTML =

                `<h3>
                    🔥 오늘의 단타 후보
                </h3>`;


            data.results.forEach(
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
                                ${getStockName(stock.code)}
                                (${stock.code})
                            </div>


                            <div class="scan-price">
                                ${Number(
                                    stock.price || 0
                                ).toLocaleString()}원
                            </div>


                            <div class="scan-change">
                                ${Number(
                                    stock.change || 0
                                )}%
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


                    // --------------------------------
                    // 후보 클릭
                    // --------------------------------

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

}


/* =====================================
   종목 코드 → 종목명 찾기
===================================== */

function getStockName(code) {

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


    if (stock) {

        return stock.name;

    }


    return code;

}
/* =====================================
   AI 단타 분석
===================================== */

function analyzeStock(data) {

    const scoreElement =
        document.getElementById("score");

    const recommendElement =
        document.getElementById("recommend");


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
        Number(data.price || 0);

    const change =
        Number(data.change || 0);

    const volume =
        Number(data.volume || 0);

    const ma5 =
        Number(data.ma5 || 0);

    const ma20 =
        Number(data.ma20 || 0);

    const ma60 =
        Number(data.ma60 || 0);
/* ---------------------------------
   일목균형표 데이터
--------------------------------- */

const ichimoku =
    data.ichimoku || {};

const conversion =
    Number(
        ichimoku.conversion || 0
    );

const base =
    Number(
        ichimoku.base || 0
    );

const spanA =
    Number(
        ichimoku.spanA || 0
    );

const spanB =
    Number(
        ichimoku.spanB || 0
    );

const lagging =
    Number(
        ichimoku.lagging || 0
    );

    /* ---------------------------------
       AI 점수
    --------------------------------- */

    let score = 0;


    /* 현재가 > 5일선 */

    if (
        price > 0 &&
        ma5 > 0 &&
        price > ma5
    ) {

        score += 20;

    }


    /* 5일선 > 20일선 */

    if (
        ma5 > 0 &&
        ma20 > 0 &&
        ma5 > ma20
    ) {

        score += 20;

    }


    /* 20일선 > 60일선 */

    if (
        ma20 > 0 &&
        ma60 > 0 &&
        ma20 > ma60
    ) {

        score += 20;

    }


    /* 등락률 상승 */

    if (
        change > 2
    ) {

        score += 20;

    }


    /* 거래량 증가 */

    if (
        volume > 1000000
    ) {

        score += 20;

    }
/* ---------------------------------
   일목균형표 분석
--------------------------------- */

let ichimokuSignal =
    "일목균형표 데이터 없음";


if (
    conversion > 0 &&
    base > 0 &&
    spanA > 0 &&
    spanB > 0
) {

    if (
        price > conversion &&
        price > base &&
        conversion > base &&
        spanA > spanB
    ) {

        ichimokuSignal =
            "☁️ 일목균형표 강세";

    }

    else if (
        price > conversion &&
        price > base
    ) {

        ichimokuSignal =
            "📈 일목균형표 상승";

    }

    else if (
        price < conversion &&
        price < base
    ) {

        ichimokuSignal =
            "📉 일목균형표 약세";

    }

    else {

        ichimokuSignal =
            "⏸️ 일목균형표 중립";

    }

}

    /* ---------------------------------
       신호 판단
    --------------------------------- */

    let signal = "";


    if (
        score >= 80
    ) {

        signal =
            "🔥 강한 매수 관심";

    }

    else if (
        score >= 60
    ) {

        signal =
            "📈 상승 관찰";

    }

    else if (
        score >= 40
    ) {

        signal =
            "👀 관심 종목";

    }

    else if (
        score >= 20
    ) {

        signal =
            "⚠️ 신중 관찰";

    }

    else {

        signal =
            "⏸️ 관망";

    }

/* ---------------------------------
   일목균형표 최종 판단
--------------------------------- */

let finalSignal =
    signal;


/* 강한 매수 조건 */

if (
    score >= 80 &&
    ichimokuSignal ===
        "☁️ 일목균형표 강세"
) {

    finalSignal =
        "🔥 강한 매수 관심 + 일목 강세";

}


/* 상승 관찰 조건 */

else if (
    score >= 60 &&
    (
        ichimokuSignal ===
            "☁️ 일목균형표 강세" ||

        ichimokuSignal ===
            "📈 일목균형표 상승"
    )
) {

    finalSignal =
        "📈 상승 관찰 + 일목 상승";

}
    /* ---------------------------------
       화면 표시
    --------------------------------- */

    scoreElement.innerText =
        `${score}점`;


    recommendElement.innerText =
        signal;


    /* ---------------------------------
       콘솔 확인
    --------------------------------- */

    console.log(
        "AI 분석 결과",
        {
            score,
            signal,
            price,
            change,
            volume,
            ma5,
            ma20,
            ma60
        }
    );

}
