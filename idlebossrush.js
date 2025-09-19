    import gsap from 'https://cdn.skypack.dev/gsap';
    const boss = document.getElementById('boss');
    const healthBar = document.getElementById('bossHealthBar');
    const healthText = document.getElementById('bossHealthText');
    const message = document.getElementById('defeatedText');
    const soundBtn = document.getElementById('soundBtn');
    const soundInfo = document.getElementById('soundInfo');
    const timerElement = document.getElementById('timer');

    const sounds = {
      arrow: document.getElementById('arrowSound'),
      fireball: document.getElementById('fireballSound'),
      sword: document.getElementById('swordSound'),
      vanish: document.getElementById('vanishSound'),
      victory: document.getElementById('victorySound')
    };

    let soundEnabled = true;
    let audioUnlocked = false;
    let bossHP = 50;
    const bossMaxHP = 50;
    let bossDead = false;

    let timeLeft = 60 * 60;
    function updateTimer() {
      const seconds = Math.floor(timeLeft / 60);
      const frames = timeLeft % 60;
      timerElement.textContent = `${seconds}:${frames.toString().padStart(2, '0')}`;
      if (timeLeft > 0) timeLeft--;
    }

    const stickmen = [];
    const heroes = [
      { type: 'archer', x: 300 },
      { type: 'archer', x: 360 },
      { type: 'mage', x: 540, onWall: true },
      { type: 'mage', x: 600, onWall: true },
      { type: 'warrior', x: 740 },
      { type: 'warrior', x: 800 }
    ];

    heroes.forEach(hero => {
      const stick = document.createElement('div');
      stick.classList.add('stick');
      stick.style.left = `${hero.x}px`;
      stick.style.bottom = `${hero.onWall ? 120 + 260 : 120}px`;

      const head = document.createElement('div');
      head.classList.add('head');

      const body = document.createElement('div');
      body.classList.add('body');

      stick.appendChild(head);
      stick.appendChild(body);
      document.getElementById('game').appendChild(stick);

      stickmen.push({ element: stick, type: hero.type, cooldown: 0, x: hero.x });
    });

    function update() {
      if (!bossDead) {
        updateTimer();
        stickmen.forEach(stick => {
          if (stick.cooldown <= 0) {
            attackBoss(stick);
            stick.cooldown = stick.type === 'mage' ? 160 : stick.type === 'archer' ? 200 : 240;
          } else {
            stick.cooldown -= 1;
          }
        });
      }
      requestAnimationFrame(update);
    }

    function attackBoss(stick) {
      if (bossDead) return;
      const damage = 1;
      const projectile = document.createElement('div');
      projectile.classList.add('projectile');

      projectile.textContent =
        stick.type === 'mage' ? '🔥' :
        stick.type === 'archer' ? '🏹' : '⚔️';

      playSound(stick.type);

      let startX = stick.x;
      let startY = parseInt(stick.element.style.bottom) + 48;
      projectile.style.left = startX + 'px';
      projectile.style.bottom = startY + 'px';
      document.getElementById('game').appendChild(projectile);

      const bossX = boss.offsetLeft + boss.offsetWidth / 2;
      const bossY = window.innerHeight - boss.offsetTop - boss.offsetHeight / 2;
      const dx = bossX - startX;
      const dy = bossY - startY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const speed = 2;
      const stepX = dx / dist * speed;
      const stepY = dy / dist * speed;

      const move = () => {
        startX += stepX;
        startY += stepY;
        projectile.style.left = startX + 'px';
        projectile.style.bottom = startY + 'px';
        if (Math.abs(startX - bossX) < 10 && Math.abs(startY - bossY) < 20) {
          projectile.remove();
          bossHP -= damage;
          bossHP = Math.max(0, bossHP);
          healthBar.style.width = (bossHP / bossMaxHP * 100) + "%";
          healthText.textContent = `${bossHP} / ${bossMaxHP}`;
          if (bossHP === 0 && !bossDead) {
            bossDead = true;
            boss.textContent = "💀";
            boss.style.background = "#444";
            playSound("vanish");
            message.style.display = "block";
            gsap.delayedCall(3, () => {
              boss.classList.add("fade-out");
              playSound("victory");
            });
          }
        } else {
          requestAnimationFrame(move);
        }
      };
      move();
    }

    function playSound(type) {
      if (!soundEnabled) return;
      const s = {
        mage: 'fireball',
        archer: 'arrow',
        warrior: 'sword',
        vanish: 'vanish',
        victory: 'victory'
      }[type] || type;
      const audio = sounds[s];
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        audio.play().catch(() => {});
        if (s === 'arrow' || s === 'fireball') {
          setTimeout(() => {
            audio.pause();
            audio.currentTime = 0;
          }, 5000);
        }
      }
    }

    document.body.addEventListener("click", () => {
      if (!audioUnlocked) {
        Object.values(sounds).forEach(s => {
          s.play().catch(() => {});
          s.pause();
          s.currentTime = 0;
        });
        audioUnlocked = true;
        soundBtn.style.display = "inline-block";
        soundInfo.style.display = "none";
      }
    });

    soundBtn.addEventListener("click", () => {
      soundEnabled = !soundEnabled;
      soundBtn.textContent = soundEnabled ? "🔊 Sound ON" : "🔇 Sound OFF";
    });

    update();
