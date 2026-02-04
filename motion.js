/**
 * ALTHR Motion Background System v4.0 (Performance Optimized)
 * Optimized Viewport-Fixed Neural Engine
 */

class AlthrMotion {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'althr-motion-canvas';
        this.ctx = this.canvas.getContext('2d');
        document.body.prepend(this.canvas);

        this.particles = [];
        this.mouseX = -1000;
        this.mouseY = -1000;
        this.frameCount = 0;

        this.setupCanvas();
        this.createParticles();
        this.animate();

        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY; // Relative to viewport now
        });
    }

    setupCanvas() {
        // PERFORMANCE FIX: Viewport-fixed canvas instead of full-page
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100vw';
        this.canvas.style.height = '100vh';
        this.canvas.style.zIndex = '0';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.opacity = '0.45';
        this.resize();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        // Total world height
        this.worldHeight = document.documentElement.scrollHeight;
    }

    createParticles() {
        this.particles = [];
        const isMobile = window.innerWidth < 768;
        const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

        // Use worldHeight for distribution but viewport for density
        const worldArea = (window.innerWidth * document.documentElement.scrollHeight) / 1000000;
        let density = 150; // Optimized base density
        let maxCount = 800; // Safer cap for general performance

        if (isMobile) {
            density = 50;
            maxCount = 200;
        } else if (isTablet) {
            density = 90;
            maxCount = 400;
        }

        const count = Math.min(Math.floor(worldArea * density), maxCount);
        this.isLowPower = isMobile;

        for (let i = 0; i < count; i++) {
            const sizeSeed = Math.random();
            let size, type;

            if (sizeSeed > 0.98) { size = Math.random() * 4 + 3; type = 'planetary'; }
            else if (sizeSeed > 0.90) { size = Math.random() * 2 + 1.5; type = 'bright'; }
            else if (sizeSeed > 0.60) { size = Math.random() * 1 + 0.8; type = 'dust'; }
            else { size = Math.random() * 0.6 + 0.2; type = 'nebula'; }

            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.worldHeight, // Distributed across whole page
                vx: (Math.random() - 0.5) * 2.0,
                vy: (Math.random() - 0.5) * 2.0,
                size: size,
                type: type,
                brightness: Math.random() * 0.5 + 0.3,
                pulse: Math.random() * 0.015 + 0.005,
                jitter: Math.random() * 0.08
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const scrollY = window.scrollY;
        const vh = this.canvas.height;
        const buffer = 300; // Pixel buffer around viewport for smooth entry/exit

        this.particles.forEach((p, i) => {
            // CULLING & UPDATES: Only update physics for particles near viewport
            const isInCullingRange = p.y > scrollY - 1000 && p.y < scrollY + vh + 1000;

            if (isInCullingRange) {
                p.vx += (Math.random() - 0.5) * p.jitter;
                p.vy += (Math.random() - 0.5) * p.jitter;

                const speedLimit = 3.0;
                if (p.vx > speedLimit) p.vx = speedLimit;
                if (p.vx < -speedLimit) p.vx = -speedLimit;
                if (p.vy > speedLimit) p.vy = speedLimit;
                if (p.vy < -speedLimit) p.vy = -speedLimit;

                p.x += p.vx;
                p.y += p.vy;

                // Wrap around world bounds
                if (p.x < 0) p.x = this.canvas.width;
                if (p.x > this.canvas.width) p.x = 0;
                if (p.y < 0) p.y = this.worldHeight;
                if (p.y > this.worldHeight) p.y = 0;

                p.brightness += p.pulse;
                if (p.brightness > 1 || p.brightness < 0.2) p.pulse *= -1;

                // DRAWING: Only draw if within viewport + buffer
                if (p.y > scrollY - buffer && p.y < scrollY + vh + buffer) {
                    const drawY = p.y - scrollY; // Translate to viewport space

                    // Draw Glow
                    if (p.type === 'planetary' || p.type === 'bright') {
                        const gradient = this.ctx.createRadialGradient(p.x, drawY, 0, p.x, drawY, p.size * 4);
                        gradient.addColorStop(0, `rgba(0, 240, 255, ${p.brightness * 0.2})`);
                        gradient.addColorStop(1, 'rgba(0, 240, 255, 0)');
                        this.ctx.fillStyle = gradient;
                        this.ctx.beginPath();
                        this.ctx.arc(p.x, drawY, p.size * 4, 0, Math.PI * 2);
                        this.ctx.fill();
                    }

                    // Draw Core
                    this.ctx.fillStyle = p.type === 'planetary' ? '#fff' : `rgba(0, 240, 255, ${p.brightness})`;
                    this.ctx.beginPath();
                    this.ctx.arc(p.x, drawY, p.size, 0, Math.PI * 2);
                    this.ctx.fill();

                    // Mouse Interaction
                    const mdx = p.x - this.mouseX;
                    const mdy = drawY - this.mouseY;
                    const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

                    if (mdist < 200) {
                        const alpha = (1 - mdist / 200) * 0.4;
                        this.ctx.strokeStyle = `rgba(212, 175, 55, ${alpha})`;
                        this.ctx.lineWidth = 1.2;
                        this.ctx.beginPath();
                        this.ctx.moveTo(p.x, drawY);
                        this.ctx.lineTo(this.mouseX, this.mouseY);
                        this.ctx.stroke();

                        p.x -= mdx * 0.005;
                        p.y -= mdy * 0.005;
                    }

                    // Optimized Internal Connections
                    if (!this.isLowPower && i % 5 === 0) {
                        for (let j = i + 1; j < this.particles.length; j += 8) {
                            const p2 = this.particles[j];
                            // Only connect if p2 is also in viewport buffer
                            if (p2.y > scrollY - buffer && p2.y < scrollY + vh + buffer) {
                                const dx = p.x - p2.x;
                                const dy = p.y - p2.y;
                                const distSq = dx * dx + dy * dy;
                                const maxDistSq = 80 * 80;

                                if (distSq < maxDistSq) {
                                    const dist = Math.sqrt(distSq);
                                    this.ctx.strokeStyle = `rgba(0, 240, 255, ${(1 - dist / 80) * 0.06})`;
                                    this.ctx.lineWidth = 0.2;
                                    this.ctx.beginPath();
                                    this.ctx.moveTo(p.x, drawY);
                                    this.ctx.lineTo(p2.x, p2.y - scrollY);
                                    this.ctx.stroke();
                                }
                            }
                        }
                    }
                }
            }
        });

        if (this.frameCount % 200 === 0) {
            this.worldHeight = document.documentElement.scrollHeight;
        }
        this.frameCount++;
        requestAnimationFrame(() => this.animate());
    }
}

// Keep TextReveal exactly as is, it's efficient via IntersectionObserver
class TextReveal {
    constructor() {
        this.options = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-active');
                    this.observer.unobserve(entry.target);
                }
            });
        }, this.options);
        this.init();
    }
    init() {
        const targets = document.querySelectorAll('h1, h2, h3, h4, h5, p, section > div, .frosted-glass');
        targets.forEach((el, i) => {
            const types = ['reveal-slide-up', 'reveal-slide-right', 'reveal-zoom-in', 'reveal-skew'];
            const type = types[i % types.length];
            el.classList.add('reveal-init', type);
            el.style.transitionDelay = `${(i % 5) * 100}ms`;
            this.observer.observe(el);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AlthrMotion();
    new TextReveal();
});
