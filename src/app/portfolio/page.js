"use client";

import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import { 
  Mail, 
  MapPin, 
  Phone, 
  Briefcase, 
  Code2, 
  Star,
  Quote,
  Home,
  User,
  Image as ImageIcon,
  MessageSquare
} from "lucide-react";
import styles from "./Portfolio.module.css";
import Link from "next/link";
import { useEffect, useState } from "react";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function PortfolioPage() {
  const [emblaRef] = useEmblaCarousel({ align: "start", dragFree: true });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.aurora} />
      
      <main className={styles.content}>
        
        {/* 1. Hero Section */}
        <motion.section 
          className={styles.hero}
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className={styles.avatarWrapper}>
            <img src="/images/avatar.jpg" alt="Developer Avatar" className={styles.avatar} onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=Developer&background=F3F4F6&color=111827&size=256"; }} />
            <div className={styles.statusBadge}>Available</div>
          </motion.div>
          <motion.h1 variants={fadeInUp} className={styles.name}>Developer Name</motion.h1>
          <motion.p variants={fadeInUp} className={styles.role}>Senior Full-Stack Developer</motion.p>
          
          <motion.div variants={fadeInUp} className={styles.quickActions}>
            <a href="https://github.com" target="_blank" rel="noreferrer" className={styles.actionBtn}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className={styles.actionBtn}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            </a>
            <a href="mailto:hello@example.com" className={styles.actionBtn}><Mail size={20} /></a>
            <a href="https://maps.google.com" target="_blank" rel="noreferrer" className={styles.actionBtn}><MapPin size={20} /></a>
          </motion.div>
        </motion.section>

        {/* 2. About Glass Card */}
        <motion.section 
          id="about"
          className={styles.glassCard}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeInUp}
        >
          <h2 className={styles.sectionTitle}>About Me</h2>
          <div className={styles.aboutList}>
            <div className={styles.aboutItem}>
              <Briefcase className={styles.aboutIcon} size={20} />
              <div className={styles.aboutText}><strong>Pekerjaan</strong> Full-Stack Web Developer</div>
            </div>
            <div className={styles.aboutItem}>
              <MapPin className={styles.aboutIcon} size={20} />
              <div className={styles.aboutText}><strong>Lokasi</strong> Jakarta, Indonesia</div>
            </div>
            <div className={styles.aboutItem}>
              <Mail className={styles.aboutIcon} size={20} />
              <div className={styles.aboutText}><strong>Email</strong> hi.developer@gmail.com</div>
            </div>
            <div className={styles.aboutItem}>
              <Phone className={styles.aboutIcon} size={20} />
              <div className={styles.aboutText}><strong>WhatsApp</strong> +62 812-3456-7890</div>
            </div>
          </div>
          <p style={{ marginTop: "1.5rem", color: "#4B5563", fontSize: "0.95rem", lineHeight: 1.6 }}>
            Saya adalah seorang developer dengan spesialisasi pada ekosistem React dan Node.js. 
            Membangun arsitektur aplikasi modern yang scalable, berkinerja tinggi, dan ramah pengguna.
          </p>
        </motion.section>

        {/* 3. Skills */}
        <motion.section
          id="skills"
          className={styles.glassCard}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
        >
          <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Code2 size={20} /> Technical Skills
          </h2>
          <div className={styles.skillsWrap}>
            {["Next.js 15", "React 19", "TypeScript", "Tailwind CSS", "Node.js", "PostgreSQL", "Prisma", "Framer Motion", "Vercel", "AI Integration", "UI/UX Design", "Docker"].map((skill, idx) => (
              <motion.div key={idx} variants={fadeInUp} className={styles.skillBubble}>
                {skill}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 4. Timeline */}
        <motion.section
          id="timeline"
          className={styles.glassCard}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
        >
          <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Star size={20} /> Experience
          </h2>
          <div className={styles.timeline}>
            <motion.div variants={fadeInUp} className={styles.timelineItem}>
              <div className={styles.timelineDot} />
              <h3 className={styles.timelineTitle}>Senior Full-Stack Engineer</h3>
              <p className={styles.timelineCompany}>Tech Startup Inc. (2024 - Sekarang)</p>
              <p className={styles.timelineDesc}>Memimpin tim pengembangan front-end dan arsitektur Next.js.</p>
            </motion.div>
            <motion.div variants={fadeInUp} className={styles.timelineItem}>
              <div className={styles.timelineDot} />
              <h3 className={styles.timelineTitle}>Web Developer</h3>
              <p className={styles.timelineCompany}>Creative Agency (2022 - 2024)</p>
              <p className={styles.timelineDesc}>Membangun website e-commerce dengan integrasi payment gateway dan performa SEO tinggi.</p>
            </motion.div>
            <motion.div variants={fadeInUp} className={styles.timelineItem}>
              <div className={styles.timelineDot} />
              <h3 className={styles.timelineTitle}>Freelance Developer</h3>
              <p className={styles.timelineCompany}>Self Employed (2020 - 2022)</p>
              <p className={styles.timelineDesc}>Menyelesaikan lebih dari 20 project aplikasi web untuk klien lokal dan internasional.</p>
            </motion.div>
          </div>
        </motion.section>

        {/* 5. Gallery Carousel */}
        <motion.section
          id="gallery"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeInUp}
        >
          <h2 className={styles.sectionTitle} style={{ marginLeft: "1rem" }}>My Workspace</h2>
          <div className={styles.embla} ref={emblaRef}>
            <div className={styles.emblaContainer}>
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className={styles.emblaSlide}>
                  <img src={`https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80&sig=${index}`} alt={`Gallery ${index}`} className={styles.slideImg} />
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 6. Quote */}
        <motion.section
          className={styles.quoteCard}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeInUp}
        >
          <Quote size={40} className={styles.quoteIcon} />
          <p className={styles.quoteText}>
            "Design is not just what it looks like and feels like. Design is how it works."
          </p>
          <div className={styles.quoteAuthor}>— Steve Jobs</div>
        </motion.section>

        {/* 7. Contact */}
        <motion.section
          id="contact"
          className={styles.glassCard}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeInUp}
        >
          <h2 className={styles.sectionTitle}>Let's Work Together</h2>
          <p style={{ color: "#4B5563", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
            Punya ide project luar biasa? Jangan ragu untuk menghubungi saya. Mari wujudkan ide Anda menjadi aplikasi modern berkualitas tinggi.
          </p>
          <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer" className={styles.contactBtn}>
            <MessageSquare size={20} /> Chat via WhatsApp
          </a>
        </motion.section>

        {/* Footer */}
        <footer className={styles.footer}>
          Made with ❤️ AI Supported 2026
        </footer>
      </main>

      {/* Floating macOS Dock */}
      <motion.nav 
        className={styles.dock}
        initial={{ y: 100, opacity: 0, x: "-50%" }}
        animate={{ y: 0, opacity: 1, x: "-50%" }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 20 }}
      >
        <Link href="/" className={styles.dockItem} title="Home"><Home size={22} /></Link>
        <a href="#about" className={styles.dockItem} title="About"><User size={22} /></a>
        <a href="#skills" className={styles.dockItem} title="Skills"><Code2 size={22} /></a>
        <a href="#gallery" className={styles.dockItem} title="Gallery"><ImageIcon size={22} /></a>
      </motion.nav>
    </div>
  );
}
