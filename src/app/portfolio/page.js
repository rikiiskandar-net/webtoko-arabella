"use client";

import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import { Outfit } from "next/font/google";
import { 
  GithubLogo, 
  LinkedinLogo, 
  InstagramLogo, 
  FacebookLogo, 
  WhatsappLogo,
  EnvelopeSimple,
  MapPin,
  Phone,
  Briefcase,
  CodeBlock,
  Star,
  Quotes,
  House,
  User,
  Image as ImageIcon,
  DownloadSimple
} from "@phosphor-icons/react";
import styles from "./Portfolio.module.css";
import Link from "next/link";
import { useEffect, useState } from "react";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"] });

export default function PortfolioPage() {
  const [mounted, setMounted] = useState(false);
  const [emblaRef] = useEmblaCarousel({ dragFree: true, containScroll: "trimSnaps" });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return (
    <div className={`${styles.pageWrapper} ${outfit.className}`}>
      <div className={styles.aurora} />
    </div>
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  return (
    <div className={`${styles.pageWrapper} ${outfit.className}`}>
      <div className={styles.aurora} />
      
      <motion.main 
        className={styles.content}
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        
        {/* 1. Hero Bento */}
        <motion.section className={styles.heroBento} variants={itemVariants}>
          <div className={`${styles.bentoCard} ${styles.heroMain}`}>
            <motion.div 
              className={styles.avatarWrapper}
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <img src="/images/avatar.jpg" alt="Developer Avatar" className={styles.avatar} onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=Riki+Iskandar&background=7C3AED&color=fff&size=256"; }} />
              <div className={styles.statusBadge}>Available for Hire</div>
            </motion.div>
            
            <div className={styles.greeting}>Hi there! 👋</div>
            <h1 className={styles.name}>I&apos;m Riki Iskandar</h1>
            <p className={styles.role}>Senior Full-Stack Developer</p>
            
            <div className={styles.ctaGroup}>
              <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer" className={styles.btnPrimary}>
                Let&apos;s Talk <WhatsappLogo size={20} weight="bold" />
              </a>
              <a href="/cv.pdf" target="_blank" rel="noreferrer" className={styles.btnOutline}>
                <DownloadSimple size={20} weight="bold" /> Resume
              </a>
            </div>
          </div>
          
          <div className={styles.quickActionsBento}>
            <a href="https://github.com" target="_blank" rel="noreferrer" className={styles.actionBtnCard}>
              <GithubLogo size={32} weight="duotone" color="#F8FAFC" />
              GitHub
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className={styles.actionBtnCard}>
              <LinkedinLogo size={32} weight="duotone" color="#38BDF8" />
              LinkedIn
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className={styles.actionBtnCard}>
              <InstagramLogo size={32} weight="duotone" color="#EC4899" />
              Instagram
            </a>
            <a href="mailto:hi.rikiiskandar@gmail.com" className={styles.actionBtnCard}>
              <EnvelopeSimple size={32} weight="duotone" color="#10B981" />
              Email
            </a>
          </div>
        </motion.section>

        {/* 2. Grid Row: About & Skills */}
        <div className={styles.bentoGridRow}>
          {/* About Me */}
          <motion.section id="about" className={styles.bentoCard} variants={itemVariants}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.titleIcon}><User size={24} weight="duotone" /></div>
              About Me
            </h2>
            <div className={styles.aboutList}>
              <div className={styles.aboutItem}>
                <div className={styles.aboutIconWrap}><Briefcase size={22} weight="duotone" /></div>
                <div className={styles.aboutText}>
                  <span className={styles.aboutLabel}>Pekerjaan</span>
                  <span className={styles.aboutValue}>Full-Stack Web Developer</span>
                </div>
              </div>
              <div className={styles.aboutItem}>
                <div className={styles.aboutIconWrap}><MapPin size={22} weight="duotone" /></div>
                <div className={styles.aboutText}>
                  <span className={styles.aboutLabel}>Lokasi</span>
                  <span className={styles.aboutValue}>Jakarta, Indonesia</span>
                </div>
              </div>
              <div className={styles.aboutItem}>
                <div className={styles.aboutIconWrap}><Phone size={22} weight="duotone" /></div>
                <div className={styles.aboutText}>
                  <span className={styles.aboutLabel}>Telepon</span>
                  <span className={styles.aboutValue}>+62 812-3456-7890</span>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Skills */}
          <motion.section id="skills" className={styles.bentoCard} variants={itemVariants}>
            <h2 className={styles.sectionTitle}>
              <div className={styles.titleIcon} style={{ color: '#A855F7' }}><CodeBlock size={24} weight="duotone" /></div>
              Tech Stack
            </h2>
            <div className={styles.skillsWrap}>
              {["React 19", "Next.js 15", "TypeScript", "Node.js", "TailwindCSS", "Framer Motion", "Supabase", "PostgreSQL", "Git", "Figma", "Docker"].map((skill, idx) => (
                <div key={idx} className={styles.skillBubble}>
                  {skill}
                </div>
              ))}
            </div>
          </motion.section>
        </div>

        {/* 3. Timeline */}
        <motion.section id="timeline" className={styles.bentoCard} variants={itemVariants}>
          <h2 className={styles.sectionTitle}>
            <div className={styles.titleIcon} style={{ color: '#F59E0B' }}><Star size={24} weight="duotone" /></div>
            Experience
          </h2>
          <div className={styles.timeline}>
            <div className={styles.timelineItem}>
              <div className={styles.timelineDot} />
              <h3 className={styles.timelineTitle}>Senior Full-Stack Engineer</h3>
              <p className={styles.timelineCompany}>Tech Startup Inc. (2024 - Sekarang)</p>
              <p className={styles.timelineDesc}>Memimpin arsitektur modern Next.js dan microservices, menghasilkan performa web luar biasa dan UX interaktif.</p>
            </div>
            <div className={styles.timelineItem}>
              <div className={styles.timelineDot} />
              <h3 className={styles.timelineTitle}>Web Developer</h3>
              <p className={styles.timelineCompany}>Creative Agency (2022 - 2024)</p>
              <p className={styles.timelineDesc}>Membangun website e-commerce dengan sistem manajemen inventaris canggih dan integrasi payment gateway.</p>
            </div>
          </div>
        </motion.section>

        {/* 4. Gallery Carousel */}
        <motion.section id="gallery" variants={itemVariants}>
          <h2 className={styles.sectionTitle} style={{ paddingLeft: "1.5rem" }}>
            <div className={styles.titleIcon} style={{ color: '#10B981' }}><ImageIcon size={24} weight="duotone" /></div>
            My Workspace
          </h2>
          <div className={styles.galleryScroll} ref={emblaRef}>
            <div style={{ display: 'flex', gap: '1.5rem', width: '100%' }}>
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className={styles.galleryItem}>
                  <img src={`https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80&sig=${index}`} alt={`Gallery ${index}`} className={styles.slideImg} />
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 5. Quote */}
        <motion.section className={`${styles.bentoCard} ${styles.quoteCard}`} variants={itemVariants}>
          <Quotes size={80} weight="duotone" className={styles.quoteIcon} />
          <p className={styles.quoteText}>
            "Design is not just what it looks like and feels like. Design is how it works."
          </p>
          <div className={styles.quoteAuthor}>— Steve Jobs</div>
        </motion.section>

        {/* 6. Contact */}
        <motion.section id="contact" className={styles.bentoCard} variants={itemVariants} style={{ textAlign: 'center' }}>
          <h2 className={styles.sectionTitle} style={{ justifyContent: 'center' }}>Let's Work Together</h2>
          <p style={{ color: "#94A3B8", fontSize: "1.1rem", marginBottom: "2.5rem", maxWidth: "600px", margin: "0 auto 2.5rem" }}>
            Punya ide project luar biasa? Jangan ragu untuk menghubungi saya. Mari wujudkan ide Anda menjadi aplikasi modern berkualitas tinggi.
          </p>
          <div className={styles.contactGroup}>
            <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer" className={styles.contactBtn} style={{ background: '#10B981' }}>
              <WhatsappLogo size={22} weight="fill" /> WhatsApp
            </a>
            <a href="mailto:hi.rikiiskandar@gmail.com" className={styles.contactBtn} style={{ background: '#3B82F6' }}>
              <EnvelopeSimple size={22} weight="bold" /> Email Me
            </a>
          </div>
        </motion.section>

        {/* Footer */}
        <motion.footer className={styles.footer} variants={itemVariants}>
          Made with ❤️ AI Supported 2026
        </motion.footer>
      </motion.main>

      {/* Floating Dock */}
      <motion.nav 
        className={styles.dock}
        initial={{ opacity: 0, y: 100, x: "-50%" }}
        animate={{ opacity: 1, y: 0, x: "-50%" }}
        transition={{ type: "spring", stiffness: 50, damping: 15, delay: 0.5 }}
      >
        <Link href="/" className={styles.dockItem} title="Home"><House size={24} weight="duotone" /></Link>
        <a href="#about" className={styles.dockItem} title="About"><User size={24} weight="duotone" /></a>
        <a href="#skills" className={styles.dockItem} title="Skills"><CodeBlock size={24} weight="duotone" /></a>
        <a href="#gallery" className={styles.dockItem} title="Gallery"><ImageIcon size={24} weight="duotone" /></a>
      </motion.nav>
    </div>
  );
}
