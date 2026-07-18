"use client";

import { 
  EnvelopeSimple, 
  MapPin, 
  Phone, 
  Briefcase, 
  Code, 
  Star,
  Quotes,
  House,
  User,
  Image as ImageIcon,
  ChatCircleText,
  GithubLogo,
  LinkedinLogo
} from "@phosphor-icons/react";
import styles from "./Portfolio.module.css";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function PortfolioPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return (
    <div className={styles.pageWrapper}>
      <div className={styles.aurora} />
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        Loading...
      </div>
    </div>
  );

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.aurora} />
      
      <main className={styles.content}>
        
        {/* 1. Hero Section */}
        <section className={`${styles.hero} ${styles.animateFadeInUp}`}>
          <div className={styles.avatarWrapper}>
            <img src="/images/avatar.jpg" alt="Developer Avatar" className={styles.avatar} onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=Developer&background=F3F4F6&color=111827&size=256"; }} />
            <div className={styles.statusBadge}>Available</div>
          </div>
          <h1 className={styles.name}>Developer Name</h1>
          <p className={styles.role}>Senior Full-Stack Developer</p>
          
          <div className={styles.quickActions}>
            <a href="https://github.com" target="_blank" rel="noreferrer" className={styles.actionBtn}>
              <GithubLogo size={20} weight="fill" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className={styles.actionBtn}>
              <LinkedinLogo size={20} weight="fill" />
            </a>
            <a href="mailto:hello@example.com" className={styles.actionBtn}><EnvelopeSimple size={20} weight="fill" /></a>
            <a href="https://maps.google.com" target="_blank" rel="noreferrer" className={styles.actionBtn}><MapPin size={20} weight="fill" /></a>
          </div>
        </section>

        {/* 2. About Glass Card */}
        <section id="about" className={`${styles.glassCard} ${styles.animateFadeInUp}`} style={{ animationDelay: '0.1s' }}>
          <h2 className={styles.sectionTitle}>About Me</h2>
          <div className={styles.aboutList}>
            <div className={styles.aboutItem}>
              <Briefcase className={styles.aboutIcon} size={20} weight="fill" />
              <div className={styles.aboutText}><strong>Pekerjaan</strong> Full-Stack Web Developer</div>
            </div>
            <div className={styles.aboutItem}>
              <MapPin className={styles.aboutIcon} size={20} weight="fill" />
              <div className={styles.aboutText}><strong>Lokasi</strong> Jakarta, Indonesia</div>
            </div>
            <div className={styles.aboutItem}>
              <EnvelopeSimple className={styles.aboutIcon} size={20} weight="fill" />
              <div className={styles.aboutText}><strong>Email</strong> hi.developer@gmail.com</div>
            </div>
            <div className={styles.aboutItem}>
              <Phone className={styles.aboutIcon} size={20} weight="fill" />
              <div className={styles.aboutText}><strong>WhatsApp</strong> +62 812-3456-7890</div>
            </div>
          </div>
          <p style={{ marginTop: "1.5rem", color: "#4B5563", fontSize: "0.95rem", lineHeight: 1.6 }}>
            Saya adalah seorang developer dengan spesialisasi pada ekosistem React dan Node.js. 
            Membangun arsitektur aplikasi modern yang scalable, berkinerja tinggi, dan ramah pengguna.
          </p>
        </section>

        {/* 3. Skills */}
        <section id="skills" className={`${styles.glassCard} ${styles.animateFadeInUp}`} style={{ animationDelay: '0.2s' }}>
          <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Code size={20} weight="fill" /> Technical Skills
          </h2>
          <div className={styles.skillsWrap}>
            {["Next.js 15", "React 19", "TypeScript", "Tailwind CSS", "Node.js", "PostgreSQL", "Prisma", "Vercel", "AI Integration", "UI/UX Design", "Docker"].map((skill, idx) => (
              <div key={idx} className={styles.skillBubble}>
                {skill}
              </div>
            ))}
          </div>
        </section>

        {/* 4. Timeline */}
        <section id="timeline" className={`${styles.glassCard} ${styles.animateFadeInUp}`} style={{ animationDelay: '0.3s' }}>
          <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Star size={20} weight="fill" /> Experience
          </h2>
          <div className={styles.timeline}>
            <div className={styles.timelineItem}>
              <div className={styles.timelineDot} />
              <h3 className={styles.timelineTitle}>Senior Full-Stack Engineer</h3>
              <p className={styles.timelineCompany}>Tech Startup Inc. (2024 - Sekarang)</p>
              <p className={styles.timelineDesc}>Memimpin tim pengembangan front-end dan arsitektur Next.js.</p>
            </div>
            <div className={styles.timelineItem}>
              <div className={styles.timelineDot} />
              <h3 className={styles.timelineTitle}>Web Developer</h3>
              <p className={styles.timelineCompany}>Creative Agency (2022 - 2024)</p>
              <p className={styles.timelineDesc}>Membangun website e-commerce dengan integrasi payment gateway dan performa SEO tinggi.</p>
            </div>
            <div className={styles.timelineItem}>
              <div className={styles.timelineDot} />
              <h3 className={styles.timelineTitle}>Freelance Developer</h3>
              <p className={styles.timelineCompany}>Self Employed (2020 - 2022)</p>
              <p className={styles.timelineDesc}>Menyelesaikan lebih dari 20 project aplikasi web untuk klien lokal dan internasional.</p>
            </div>
          </div>
        </section>

        {/* 5. Gallery Carousel (Native CSS Scroll) */}
        <section id="gallery" className={styles.animateFadeInUp} style={{ animationDelay: '0.4s' }}>
          <h2 className={styles.sectionTitle} style={{ marginLeft: "1rem" }}>My Workspace</h2>
          <div className={styles.galleryScroll}>
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className={styles.galleryItem}>
                <img src={`https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80&sig=${index}`} alt={`Gallery ${index}`} className={styles.slideImg} />
              </div>
            ))}
          </div>
        </section>

        {/* 6. Quote */}
        <section className={`${styles.quoteCard} ${styles.animateFadeInUp}`} style={{ animationDelay: '0.5s' }}>
          <Quotes size={40} weight="fill" className={styles.quoteIcon} />
          <p className={styles.quoteText}>
            "Design is not just what it looks like and feels like. Design is how it works."
          </p>
          <div className={styles.quoteAuthor}>— Steve Jobs</div>
        </section>

        {/* 7. Contact */}
        <section id="contact" className={`${styles.glassCard} ${styles.animateFadeInUp}`} style={{ animationDelay: '0.6s' }}>
          <h2 className={styles.sectionTitle}>Let's Work Together</h2>
          <p style={{ color: "#4B5563", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
            Punya ide project luar biasa? Jangan ragu untuk menghubungi saya. Mari wujudkan ide Anda menjadi aplikasi modern berkualitas tinggi.
          </p>
          <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer" className={styles.contactBtn}>
            <ChatCircleText size={20} weight="fill" /> Chat via WhatsApp
          </a>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          Made with ❤️ AI Supported 2026
        </footer>
      </main>

      {/* Floating macOS Dock */}
      <nav className={`${styles.dock} ${styles.animateDock}`}>
        <Link href="/" className={styles.dockItem} title="Home"><House size={22} weight="fill" /></Link>
        <a href="#about" className={styles.dockItem} title="About"><User size={22} weight="fill" /></a>
        <a href="#skills" className={styles.dockItem} title="Skills"><Code size={22} weight="fill" /></a>
        <a href="#gallery" className={styles.dockItem} title="Gallery"><ImageIcon size={22} weight="fill" /></a>
      </nav>
    </div>
  );
}
