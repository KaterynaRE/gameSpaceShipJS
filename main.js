const canvas = document.getElementById('canvasGame');
const ctx = canvas.getContext('2d');

const idBullet = document.getElementById('patronId');
let bulletShoot = 5;  // кількість патронів спочатку

let hearts = 3;       // кількість сердець спочатку
const idHeartImg = document.getElementById('heartID');

let collisionWithObstacle = false;  //змінна для перевірки зіткнення з перешкодами

let sootCount = 0;  //кількість вистрілених патронів
const divGameOver = document.getElementById('divGameOver');
const pDiv = document.getElementById('pDiv');
divGameOver.style.display = 'none';
divGameOver.appendChild(pDiv);

const btnStart = document.getElementById('btnStart');

const trashImg = new Image();
trashImg.src = "spaceship_88903.svg";

let scoreUser = document.getElementById('scoreUser');
let score = 0;
let scoreMainDiv = document.getElementById('scoreMain');
let scoreMain = 0;


//рандом для зірок-------------
function random(n) {
    return Math.random() * n;  //повертає випадкове число в діапазоні від 0 до n
}

const stars = new Array(200).fill().map(() => ({
    x: random(canvas.width),  //задає випадкову координату по осі x в межах ширини canvas.
    y: random(canvas.height),  // вмежах висоти //
    r: random(1) + 0.5, // Радіус зірки  як випадкове значення в діапазоні від 0.5 до 1.5 (включно).
    dx: random(0.3) - 0.1, // Крок руху по осі X
    dy: random(0.3) - 0.1, // Крок руху по осі Y
    color: 'white'
}));

// Функція для малювання зірок
function drawStars() {

    stars.forEach(star => {
        // Оновлюємо позиції зірок за їх швидкостями
        star.x += star.dx;
        star.y += star.dy;

        // Якщо зірка виходить за межі екрану, переносимо її на протилежну сторону
        if (star.x > canvas.width) star.x = 0;  // за правий край
        if (star.y > canvas.height) star.y = 0;

        // Малюємо зірку
        ctx.beginPath();             // новий шлях для малювання
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);  // Малюємо зірку як коло координати, радіус та кут
        ctx.fillStyle = star.color;  // замальовуємо зірки
        ctx.shadowBlur = 4;          //  розмиття тіні
        ctx.shadowColor = "white";   //  колір тіні
        ctx.fill();                  // заповнюємо зірку кольором
        ctx.closePath();             // закр шлях
    });
}

// Основний цикл анімації Зірок
function animate() {
    drawStars();
    requestAnimationFrame(animate);
}
//---------------------

//---------------------Гравець корабель
const imgPlayerMain = new Image();
imgPlayerMain.src = "spaceship_96124.png";
const player = {
    x: canvas.width / 2 - 30,  // Початкова позиція по осі X
    y: canvas.height - 40,     // Початкова позиція по осі Y
    dx: 5,                      // Крок руху по осі X
    imgPlayerMain: imgPlayerMain,
    width: 80,
    height: 80
}
//---------------------- Масив для зберігання перешкод
const img1Obstacles = new Image();  //створили нові об'єкти Img
const img2Obstacles = new Image();
const img3Obstacles = new Image();
img1Obstacles.src = "free-icon-asteroid-2530826.png";
img2Obstacles.src = "free-icon-asteroid-4698808.png";
img3Obstacles.src = "free-icon-asteroids-12373766.png";

const obstacleImages = [img1Obstacles, img2Obstacles, img3Obstacles];  // Масив, усіх завантажених зображень перешкод для рандому
const obstacles = [];    //масив для зберігання всіх перешкод

const obstacleWidth = 35;      // Ширина перешкоди
const obstacleHeight = 35;     // Висота перешкоди
let obstacleSpeed = 4;       // Швидкість падіння перешкод
let gameInterval;                       // Інтервал для оновлення гри
let isGameOver = false;        // Прапорець, що відображає стан гри (закінчена чи ні)

//--------------патрони те що збираємо
const bulletArray = [];
const imgBullet = new Image();
imgBullet.src = "free-icon-bullets-1406917.png";
const bulletWidth = 30;
const bulletHeight = 30;
let bulletSpeed = 4;  //швидкість руху патронів

//--------------патрони які вистрілили
const bulletArrayShoot = [];
const imgBulletShoot = new Image();
imgBulletShoot.src = "free-icon-bullet-2218103.png";
const bulletWidthShoot = 30;
const bulletHeightShoot = 30;
let bulletSpeedShoot = 25;

//--------------серце для збирання
const heartArray = [];
const imgHeart = new Image();
imgHeart.src = "free-icon-heart-2589175.png";
const heartWidth = 30;
const heartHeight = 30;
let heartSpeed = 3;


//-------------відображення патронів для збору
function drawBullet(imgBullet) {
    ctx.drawImage(imgBullet.image, imgBullet.x, imgBullet.y, bulletWidth, bulletHeight);
}

//-------------відображення патронів для вистрілу
function drawBulletShoot(imgBulletShoot) {
    ctx.save();  // зберігаємо поточний стан контексту щоб всі зміни які роблю не вплинули на інші частини малювання
    // переміщаємо контекст до центру патрона
    ctx.translate(imgBulletShoot.x + bulletWidthShoot / 2, imgBulletShoot.y + bulletHeightShoot / 2);
    // повертаємо контекст
    ctx.rotate(Math.PI / -2);
    // малюємо патрон, віднімаючи половину ширини і висоти для центрування
    ctx.drawImage(imgBulletShoot.image, -bulletWidthShoot / 2, -bulletHeightShoot / 2, bulletWidthShoot, bulletHeightShoot);
    ctx.restore();  // відновлюємо попередній стан контексту до того стану, в якому він був до останнього ctx.save().
}

//------------відображення серця
function drawHeart(imgHeart) {
    ctx.drawImage(imgHeart.image, imgHeart.x, imgHeart.y, heartWidth, heartHeight);
}

//---------------Функція для відображення гравця на екрані
function drawPlayer() {
    return ctx.drawImage(player.imgPlayerMain, player.x, player.y, player.width, player.height);
}

//----------------Функція для відображення перешкоди на екрані
function drawObstacle(obstacle) {
    ctx.drawImage(obstacle.image, obstacle.x, obstacle.y, obstacleWidth, obstacleHeight);
}

//-------------- Функція для створення нової перешкоди
function createObstacle() {
    // рандомна позиція по осі X, яка забезпечує, що перешкода з'являється всередині меж канвасу
    const x = Math.random() * (canvas.width - obstacleWidth);  // випадкова позиція по осі X
    // вибір рандом зображення перешкоди з масиву доступних зображень
    const image = obstacleImages[Math.floor(Math.random() * obstacleImages.length)];  // випадкове зображення
    obstacles.push({x, y: 0, image});  // водаємо перешкоду до масиву
}

//-------------функція для створення патронів для збору
function createBullet() {
    const x = Math.random() * (canvas.width - bulletWidth);  // випадкова позиція по осі X
    const image = imgBullet;
    bulletArray.push({x, y: 0, image});  // додаємо патрони до масиву
}

//-------------функція для створення патронів для вистрілу
function createBulletShoot() {
    const x = player.x + player.width / 2 - bulletWidthShoot / 2; // встановлюємо патрон по центру гравця
    const y = player.y; // початкова позиція Y - та ж, що і у гравця
    const image = imgBulletShoot;
    bulletArrayShoot.push({x, y, image});
}

//-------------функція для створення сердец
function createHeart() {
    const x = Math.random() * (canvas.width - heartWidth);  // випадкова позиція по осі X
    const image = imgHeart;
    heartArray.push({x, y: 0, image});  // додаємо до масиву
}

//---------------------// Функція для оновлення позицій перешкод
function updateObstacles() {
    obstacles.forEach((obstacle, index) => {
        obstacle.y += obstacleSpeed;  // Переміщуємо перешкоду вниз
        if (obstacle.y + obstacleHeight > canvas.height) {  // Якщо перешкода вийшла за межі екрану
            obstacles.splice(index, 1);  // Видаляємо одну її з масиву
        }
    });
}

//---------функція для оновлення патронів які збираємо
function updateBullet() {
    bulletArray.forEach((bullet, index) => {
        bullet.y += bulletSpeed;  // Переміщуємо патрони вниз
        if (bullet.y + bulletHeight > canvas.height) {  // Якщо патрони вийшли за межі екрану
            bulletArray.splice(index, 1);  // Видаляємо цю картинку з масиву
        }
    });
}

//---------функція для оновлення патронів вистрілу
function updateBulletShoot() {
    bulletArrayShoot.forEach((bullet, index) => {
        bullet.y -= bulletSpeedShoot;  // переміщуємо патрони вгору
        if (bullet.y + bulletHeightShoot < 0) {  // якщо патрони вийшли за верхню межу екрану
            bulletArrayShoot.splice(index, 1);  // видаляємо з масиву
        }
    });
}

//---------функція для оновлення сердечок
function updateHeart() {
    heartArray.forEach((heart, index) => {
        heart.y += heartSpeed;  // переміщуємо вниз по осі У
        if (heart.y + heartHeight > canvas.height) {  // якщо вийшли за межі екрану
            heartArray.splice(index, 1);  // видаляємо його з масиву
        }
    });
}


// Функція для перевірки зіткнення гравця з перешкодою
function checkCollision() {
    for (let i = 0; i < obstacles.length; i++) {
        const obstacle = obstacles[i];
        // перевірка чи області гравця і перешкоди перетинаються.
        if (
            player.x < obstacle.x + obstacleWidth &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacleHeight &&
            player.y + player.height > obstacle.y
        ) {
            collisionWithObstacle = true;
            if (collisionWithObstacle) {  //якщо зіткнення відбулось
                player.imgPlayerMain.src = trashImg.src;
                // встановлення таймера
                setTimeout(() => {
                    console.log("Відновлюємо зображення");
                    player.imgPlayerMain.src = "spaceship_96124.png";
                }, 250);

                hearts -= 1;  //зменшили кількість сердець
                // отримали доступ до зображення за id
                const idHeartImg = document.getElementById('heartID');
                const heartImages = idHeartImg.querySelectorAll('img.heartClass');
                // видалили останнє серце з екрану
                if (heartImages.length > 0) {
                    const lastHeart = heartImages[heartImages.length - 1];
                    idHeartImg.removeChild(lastHeart);
                }
                // Якщо кількість сердець стає рівною або меншою нуля, гра закінчується
                if (hearts <= 0) {
                    isGameOver = true;
                    updateMainScore();
                    player.imgPlayerMain.src = "spaceship_88903.svg";
                    setTimeout(() => {
                        clearInterval(gameInterval);
                        divGameOver.appendChild(pDiv);
                        divGameOver.style.display = 'inline';
                    }, 350);
                }
            }
            // Видаляємо перешкоду після зіткнення  та меншуємо
            obstacles.splice(i, 1);
            i--;
        }
    }
}

//---------функція для перевірки збору сердечок
function checkCollisionHeart() {
    if (hearts < 5) {
        for (let i = 0; i < heartArray.length; i++) {
            const heartArElement = heartArray[i];
            // якщо області гравця і сердечка перетинаються.
            if (
                player.x < heartArElement.x + heartWidth &&
                player.x + player.width > heartArElement.x &&
                player.y < heartArElement.y + heartHeight &&
                player.y + player.height > heartArElement.y
            ) {
                collisionWithObstacle = false;  // перешкоду пропускаємо
                hearts += 1;  // якщо зіткнення відбулося, + 1 серце та нижче домальовуємо зображення
                const newHeart = document.createElement('img');
                newHeart.src = "free-icon-heart-2589175.png";
                newHeart.classList.add('heartClass');
                idHeartImg.appendChild(newHeart);  // додаємо нове серц
                heartArray.splice(i, 1);  // дидаляємо серце з масиву
                i--;
            }
        }
    }
}

//---------функція для перевірки збору патронів
function checkCollisionBullet() {
    for (let i = 0; i < bulletArray.length; i++) {
        const bulletArrayElement = bulletArray[i];
        if (
            player.x < bulletArrayElement.x + bulletWidth &&
            player.x + player.width > bulletArrayElement.x &&
            player.y < bulletArrayElement.y + bulletHeight &&
            player.y + player.height > bulletArrayElement.y
        ) {
            bulletShoot += 5;  // якщо зіткнення відбулося, + 5 патронів
            idBullet.innerText = bulletShoot;  // оновити кількість патронів на екрані
            bulletArray.splice(i, 1); //видалити патрон з масиву, щоб він більше не відображався
            i--; // Зменшити індекс, оскільки масив став коротшим
        }
    }
}

//---------функція для перевірки вистрілених патронів
function checkCollisionBulletShoot() {
    for (let i = 0; i < bulletArrayShoot.length; i++) {  // перебираємо всі патрони
        const shootElement = bulletArrayShoot[i];
        // перевірка зіткнення кожного патрона з кожною перешкодою
        for (let j = 0; j < obstacles.length; j++) {
            const obstacle = obstacles[j];
            if (
                shootElement.x < obstacle.x + obstacleWidth &&
                shootElement.x + bulletWidthShoot > obstacle.x &&
                shootElement.y < obstacle.y + obstacleHeight &&
                shootElement.y + bulletHeightShoot > obstacle.y
            ) {
                score += 10;
                console.log('Новий рахунок:', score);
                scoreUser.innerText = score;

                // якщо патрон потрапляє в перешкоду
                obstacles.splice(j, 1);  // видаляємо перешкоду з масиву
                j--; // зменшуємо індекс, оскільки масив перешкод став коротшим
                bulletArrayShoot.splice(i, 1);  // видаляємо патрон з масиву
                i--; // те саме
                break; // переходимо до наступного патрона
            }
        }
    }
}

//-----
// Функція для руху гравця вліво або вправо
function movePlayer(event) {
    event.preventDefault();
    if (event.key === 'ArrowLeft' && player.x > 0) {  // Якщо натиснута ліва стрілка
        player.x -= player.dx;  // Рух вліво
    }
    if (event.key === 'ArrowRight' && player.x + player.width < canvas.width) {  // Якщо натиснута права стрілка
        player.x += player.dx;  // Рух вправо
    }
    if (event.key === ' ' && bulletShoot > 0) {
        if (bulletShoot > 0) {
            createBulletShoot();
            bulletShoot--;
            console.log(`Патрони залишились: ${bulletShoot}`);
            idBullet.innerText = bulletShoot;
            sootCount++;

            if (sootCount === 10) {
                player.dx += 1;
                obstacleSpeed += 2;
                bulletSpeed += 2;
                bulletSpeedShoot += 2;
                heartSpeed += 2;
                sootCount = 0;
            }
        }
    }
}

// Функція для малювання всіх елементів на екрані
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // Очищаємо екран
    drawStars();
    drawPlayer();  // Малюємо гравця
    obstacles.forEach(drawObstacle);  // Малюємо всі перешкоди
    bulletArray.forEach(drawBullet);
    bulletArrayShoot.forEach(drawBulletShoot);
    heartArray.forEach(drawHeart);
}

//  Функція для оновлення стану гри
function update() {
    if (!isGameOver) {
        updateObstacles();  // Оновлюємо позиції перешкод
        checkCollision();   // Перевіряємо на зіткнення
        updateBullet();
        checkCollisionBullet();
        updateBulletShoot();
        checkCollisionBulletShoot();
        updateHeart();
        checkCollisionHeart();
        draw();             // Малюємо всі елементи на екрані
    }
}

function updateMainScore() {
    scoreMain += score;
    scoreMainDiv.innerHTML = scoreMain;
}

//Функція для запуску гри
function startGame() {
    score = 0;
    scoreUser.innerText = 0;
    // скидання всіх параметрів гри
    player.x = canvas.width / 2 - 15;
    player.y = canvas.height - 90;
    bulletShoot = 5;
    idBullet.innerText = bulletShoot;
    hearts = 3;
    const idHeartImg = document.getElementById('heartID');
    idHeartImg.innerHTML = ''; // Очистити всі зображення сердечок
    for (let i = 0; i < hearts; i++) {
        const newHeart = document.createElement('img');
        newHeart.src = "free-icon-heart-2589175.png";
        newHeart.classList.add('heartClass');
        idHeartImg.appendChild(newHeart);
    }

    obstacles.length = 0;
    bulletArray.length = 0;
    bulletArrayShoot.length = 0;
    heartArray.length = 0;
    isGameOver = false; // встановити прапорець гри знов на не геймОвер

    // запуск анімації та інтервалу гри
    animate();
    gameInterval = setInterval(() => {
        update();
        if (Math.random() < 0.05) {
            createObstacle();
        }
        if (Math.random() < 0.02) {
            createBullet();
        }
        if (Math.random() < 0.02) {
            createHeart();
        }
    }, 100); // Оновлення кожні 100 мілісекунд
}

// Слухач подій для обробки натискань клавіш
document.addEventListener('keydown', movePlayer);
btnStart.addEventListener('click', function () {
    divGameOver.style.display = 'none';
    startGame(); // Запускає гру знову
});




