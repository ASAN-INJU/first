/* =====================================
   V12 Ultimate
   Service Worker
   PWA Offline Cache
===================================== */


const CACHE_NAME = "v12-ultimate-v1";


const FILES_TO_CACHE = [

    "./",

    "./index.html",

    "./style.css",

    "./script.js",

    "./stocks.json",

    "./manifest.json"

];




// 설치

self.addEventListener(
"install",
event => {


    event.waitUntil(

        caches.open(
            CACHE_NAME
        )
        .then(
            cache => {

                return cache.addAll(
                    FILES_TO_CACHE
                );

            }
        )

    );


    self.skipWaiting();

});







// 활성화

self.addEventListener(
"activate",
event => {


    event.waitUntil(

        caches.keys()
        .then(
            keys => {


                return Promise.all(

                    keys.map(

                        key => {


                            if(
                                key !== CACHE_NAME
                            ){

                                return caches.delete(
                                    key
                                );

                            }


                        }

                    )

                );


            }

        )

    );


    self.clients.claim();

});








// 요청 처리

self.addEventListener(
"fetch",
event => {


    event.respondWith(

        caches.match(
            event.request
        )
        .then(

            response => {


                return response || fetch(
                    event.request
                );


            }

        )

    );


});
