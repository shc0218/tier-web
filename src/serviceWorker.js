// src/serviceWorker.js

// 서비스 워커 등록 함수
const register = (config) => {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
        // 서비스 워커가 브라우저에서 지원되는지 확인
        window.addEventListener('load', () => {
            const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

            if (navigator.serviceWorker.ready) {
                console.log('Service Worker is already registered.');
            } else {
                navigator.serviceWorker
                    .register(swUrl)
                    .then((registration) => {
                        console.log('Service Worker registered with scope: ', registration.scope);
                    })
                    .catch((error) => {
                        console.error('Service Worker registration failed: ', error);
                    });
            }
        });
    }
};

// 서비스 워커가 등록되지 않았을 때의 기본 처리
const unregister = () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
            registration.unregister();
        });
    }
};

// 서비스 워커를 등록하거나 해제하는 함수 반환
export { register, unregister };
