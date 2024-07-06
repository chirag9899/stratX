import { useEffect, useRef } from "react";
import { ConnectWallet } from "@thirdweb-dev/react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import { customFraxtal } from "../customFraxtal";

import { createThirdwebClient } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { ConnectButton, darkTheme } from "thirdweb/react";
import { createWallet, walletConnect } from "thirdweb/wallets";

const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID,
});
const chain = defineChain({
  id: 9018,
  name: "Virtual Fraxtal",
  rpc: "https://virtual.fraxtal.rpc.tenderly.co/7c8a4a67-11d3-4223-82cf-2a6c2cf0e1c7",

  testnet: true,
  nativeCurrency: {
    name: "VFRAX",
    symbol: "vFRAX",
    decimals: 18,
  },
});

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  walletConnect(),
];

const Login: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles: Particle[] = [];
    let particleCount = calculateParticleCount();

    class Particle {
      x: number;
      y: number;
      speed: number;
      opacity: number;
      fadeDelay: number;
      fadeStart: number;
      fadingOut: boolean;

      constructor() {
        this.x = 0;
        this.y = Math.random() * canvas.height;
        this.speed = Math.random() / 5 + 0.1;
        this.opacity = 1;
        this.fadeDelay = Math.random() * 600 + 100;
        this.fadeStart = Date.now() + this.fadeDelay;
        this.fadingOut = false;
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.speed = Math.random() / 5 + 0.1;
        this.opacity = 1;
        this.fadeDelay = Math.random() * 600 + 100;
        this.fadeStart = Date.now() + this.fadeDelay;
        this.fadingOut = false;
      }

      update() {
        this.y -= this.speed;
        if (this.y < 0) {
          this.reset();
        }

        if (!this.fadingOut && Date.now() > this.fadeStart) {
          this.fadingOut = true;
        }

        if (this.fadingOut) {
          this.opacity -= 0.008;
          if (this.opacity <= 0) {
            this.reset();
          }
        }
      }

      draw() {
        if (ctx) {
          ctx.fillStyle = `rgba(${255 - (Math.random() * 255) / 2}, 255, 255, ${this.opacity})`;
          ctx.fillRect(this.x, this.y, 0.4, Math.random() * 2 + 1);
        }
      }
    }

    function initParticles() {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }

    function animate() {
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((particle) => {
          particle.update();
          particle.draw();
        });
        requestAnimationFrame(animate);
      }
    }

    function calculateParticleCount() {
      return Math.floor((canvas.width * canvas.height) / 6000);
    }

    function onResize() {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        particleCount = calculateParticleCount();
        initParticles();
      }
    }

    window.addEventListener("resize", onResize);

    initParticles();
    animate();

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.spotlight}>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
      <canvas id="particleCanvas" ref={canvasRef}></canvas>
      <div className={styles.accentLines}>
        <div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
      <div className={styles.heroSubP}>
        <p>Introducing</p>
      </div>
      <div className={styles.hero}>
        <div className={styles.heroT}>
          <h2>StratX</h2>
          <h2>StratX</h2>
        </div>
      </div>
      <p className={styles.heroP}>
        The world's best platform, <br />
        Make no-Code custom strategies quickly.
      </p>

      <div className={styles.mountains}>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div className={styles.heroSpacer}></div>
      <div className={styles.contentSection}>
        <div className={styles.contentAcc}>
          <div></div>
          <div></div>
        </div>
        <p className={styles.subt}>Revolutionary by design</p>
        <h3 className={styles.title}>
          Harness, Empower
          <br />
          Unmatched Versatility
        </h3>
        <p className={styles.subp}>
          At the core lies our revolutionary framework, <br />
          ensuring adaptability across all application architectures.
        </p>
        <div className={styles.contactBtn} >
          <div className="m-10">
          <ConnectButton
            onConnect={() => navigate("/home")}
            client={client}
            chains={[chain]}
            wallets={wallets}
            theme={darkTheme({})}
          />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
