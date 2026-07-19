/* =====================================
   V12 Ultimate
   AI 주식 단타 분석 시스템
   script.js
===================================== */


// Render API 주소
const API_SERVER =
"https://v11-api-server.onrender.com";


// 종목 데이터
let stocks = [];


// 차트 객체
let chart = null;



// 페이지 시작
document.addEventListener(
"DOMContentLoaded",
()=>{


    loadStocks();


    document
    .getElementById("searchBtn")
    .addEventListener(
        "click",
        searchStock
    );


    document
    .getElementById("stockCode")
    .addEventListener(
        "input",
        autoComplete
    );


});





// ===================================
// 종목 리스트 불러오기
// ===================================

async function loadStocks(){


    try{


        const res =
        await fetch(
            "stocks.json"
        );


        stocks =
        await res.json();


    }

    catch(e){

        console.log(
            "stocks.json 없음"
        );

    }


}





// ===================================
// 자동완성
// ===================================


function autoComplete(){


    const input =
    document
    .getElementById("stockCode")
    .value
    .trim();


    const box =
    document
    .getElementById("suggestions");


    box.innerHTML="";


    if(
        input.length < 1
    ){

        return;

    }



    const result =
    stocks
    .filter(
        s=>
        s.name.includes(input)
        ||
        s.code.includes(input)
    )
    .slice(0,10);



    result.forEach(
    stock=>{


        const div =
        document.createElement(
            "div"
        );


        div.className =
        "suggestion-item";


        div.innerHTML =
        `${stock.name}
        (${stock.code})`;



        div.onclick =
        ()=>{


            document
            .getElementById(
                "stockCode"
            )
            .value =
            stock.code;


            box.innerHTML="";


        };


        box.appendChild(div);


    });


}






// ===================================
// 주식 조회
// ===================================


async function searchStock(){



    const code =
    document
    .getElementById(
        "stockCode"
    )
    .value
    .trim();



    if(!code){

        alert(
            "종목코드를 입력하세요"
        );

        return;

    }



    try{


        const response =
        await fetch(
        `${API_SERVER}/api/stock/${code}`
        );


        const data =
        await response.json();



        console.log(data);



        if(
            data.success === false
        ){

            alert(
                "조회 실패"
            );

            return;

        }



        displayStock(
            data
        );


    }


    catch(error){


        console.error(error);


        alert(
            "서버 연결 실패"
        );


    }



}







// ===================================
// 화면 표시
// ===================================


function displayStock(data){



    document
    .getElementById(
        "stockName"
    )
    .innerText =
    data.name || "종목";



    document
    .getElementById(
        "price"
    )
    .innerText =
    Number(
        data.price || 0
    )
    .toLocaleString()
    +"원";



    document
    .getElementById(
        "change"
    )
    .innerText =
    data.change || 0
    +"%";



    document
    .getElementById(
        "volume"
    )
    .innerText =
    Number(
        data.volume || 0
    )
    .toLocaleString();



    document
    .getElementById(
        "ma5"
    )
    .innerText =
    data.ma5 || "-";



    document
    .getElementById(
        "ma20"
    )
    .innerText =
    data.ma20 || "-";



    document
    .getElementById(
        "ma60"
    )
    .innerText =
    data.ma60 || "-";



    analyzeStock(data);



    drawChart(data);



}








// ===================================
// AI 단타 점수
// ===================================


function analyzeStock(data){



    let score = 50;



    const change =
    Number(
        data.change || 0
    );



    const volume =
    Number(
        data.volume || 0
    );



    if(change > 2){

        score +=10;

    }



    if(change < -3){

        score -=10;

    }



    if(volume > 1000000){

        score +=10;

    }



    if(score >100){

        score=100;

    }


    if(score <0){

        score=0;

    }




    document
    .getElementById(
        "score"
    )
    .innerText =
    score+"점";



    let text="관망";


    if(score>=80){

        text="🔥 매수 관심";

    }

    else if(score>=60){

        text="관심 종목";

    }

    else{

        text="대기";

    }



    document
    .getElementById(
        "recommend"
    )
    .innerText =
    text;



    document
    .getElementById(
        "analysis"
    )
    .innerText =
    `
AI 분석 결과

점수 : ${score}점

등락률 : ${change}%

거래량 : ${volume.toLocaleString()}

단타 기준으로 참고용 분석입니다.
`;



}







// ===================================
// 차트
// ===================================


function drawChart(data){



    const ctx =
    document
    .getElementById(
        "priceChart"
    );



    if(chart){

        chart.destroy();

    }



    chart =
    new Chart(
        ctx,
        {

            type:"line",

            data:{

                labels:[
                    "현재"
                ],

                datasets:[

                    {

                    label:"현재가",

                    data:[
                        data.price
                    ]

                    }

                ]

            },

            options:{

                responsive:true

            }

        }

    );


}
