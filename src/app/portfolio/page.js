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
  MessageCircle,
  Download
} from "lucide-react";
import { 
  GithubLogo, 
  LinkedinLogo, 
  InstagramLogo, 
  FacebookLogo, 
  WhatsappLogo 
} from "@phosphor-icons/react";
import styles from "./Portfolio.module.css";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function PortfolioPage() {
  const [mounted, setMounted] = useState(false);
  const [emblaRef] = useEmblaCarousel({ dragFree: true, containScroll: "trimSnaps" });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return (
    <div className={styles.pageWrapper}>
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
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 70, damping: 15 } }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.aurora} />
      
      <motion.main 
        className={styles.content}
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        
        {/* 1. Hero Section */}
        <motion.section className={styles.hero} variants={itemVariants}>
          <motion.div 
            className={styles.avatarWrapper}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <img src="/images/avatar.jpg" alt="Developer Avatar" className={styles.avatar} onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=Riki+Iskandar&background=F3F4F6&color=111827&size=256"; }} />
            <div className={styles.statusBadge}>Available</div>
          </motion.div>
          <h1 className={styles.name}>Riki Prawiro Joni Iskandar</h1>
          <p className={styles.role}>Senior Full-Stack Developer</p>
          
          <div className={styles.ctaGroup}>
            <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer" className={styles.btnPrimary}>
              Contact Me
            </a>
            <a href="/cv.pdf" target="_blank" rel="noreferrer" className={styles.btnOutline}>
              <Download size={18} /> Download CV
            </a>
          </div>

          <div className={styles.quickActions}>
            <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer" className={styles.actionBtn}>
              <WhatsappLogo size={22} color="#10B981" weight="fill" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className={styles.actionBtn}>
              <InstagramLogo size={22} color="#E1306C" weight="fill" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className={styles.actionBtn}>
              <FacebookLogo size={22} color="#1877F2" weight="fill" />
            </a>
            <a href="mailto:hi.rikiiskandar@gmail.com" className={styles.actionBtn}>
              <Mail size={22} color="#EA4335" />
            </a>
            <a href="https://maps.google.com" target="_blank" rel="noreferrer" className={styles.actionBtn}>
              <MapPin size={22} color="#3B82F6" />
            </a>
          </div>
        </motion.section>

        {/* 2. About Glass Card */}
        <motion.section id="about" className={styles.glassCard} variants={itemVariants}>
          <h2 className={styles.sectionTitle}>
            <User size={24} /> About Me
          </h2>
          <div className={styles.aboutGrid}>
            <div className={styles.aboutItem}>
              <User className={styles.aboutIcon} size={20} />
              <div className={styles.aboutText}><strong>Nama</strong> Riki Prawiro Joni Iskandar</div>
            </div>
            <div className={styles.aboutItem}>
              <Briefcase className={styles.aboutIcon} size={20} />
              <div className={styles.aboutText}><strong>Pekerjaan</strong> Full-Stack Web Developer</div>
            </div>
            <div className={styles.aboutItem}>
              <MapPin className={styles.aboutIcon} size={20} />
              <div className={styles.aboutText}><strong>Alamat</strong> Jakarta, Indonesia</div>
            </div>
            <div className={styles.aboutItem}>
              <Mail className={styles.aboutIcon} size={20} />
              <div className={styles.aboutText}><strong>Email</strong> hi.rikiiskandar@gmail.com</div>
            </div>
            <div className={styles.aboutItem}>
              <Phone className={styles.aboutIcon} size={20} />
              <div className={styles.aboutText}><strong>Nomor HP</strong> +62 812-3456-7890</div>
            </div>
          </div>
          <div className={styles.aboutDesc}>
            Saya adalah seorang developer dengan spesialisasi pada ekosistem <b>React</b> dan <b>Node.js</b>. 
            Fokus utama saya adalah membangun arsitektur aplikasi modern yang <i>scalable</i>, berkinerja tinggi, dan memiliki UI/UX yang ramah pengguna.
          </div>
        </motion.section>

        {/* 3. Skills */}
        <motion.section id="skills" className={styles.glassCard} variants={itemVariants}>
          <h2 className={styles.sectionTitle}>
            <Code2 size={24} /> Technical Skills
          </h2>
          <div className={styles.skillsWrap}>
            {["HTML", "CSS", "Tailwind v4", "React 19", "Next.js 15", "TypeScript", "Node.js", "Supabase", "PostgreSQL", "Git", "Docker", "Linux", "UI/UX", "AI Integration", "Security"].map((skill, idx) => (
              <div key={idx} className={styles.skillBubble}>
                {skill}
              </div>
            ))}
          </div>
        </motion.section>

        {/* 4. Timeline */}
        <motion.section id="timeline" className={styles.glassCard} variants={itemVariants}>
          <h2 className={styles.sectionTitle}>
            <Star size={24} /> Experience
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
        </motion.section>

        {/* 5. Gallery Carousel */}
        <motion.section id="gallery" variants={itemVariants}>
          <h2 className={styles.sectionTitle} style={{ marginLeft: "1rem" }}>
            <ImageIcon size={24} /> My Workspace
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

        {/* 6. Quote */}
        <motion.section className={styles.quoteCard} variants={itemVariants}>
          <Quote size={120} strokeWidth={1} className={styles.quoteIcon} />
          <p className={styles.quoteText}>
            &quot;Design is not just what it looks like and feels like. Design is how it works.&quot;
          </p>
          <div className={styles.quoteAuthor}>— Steve Jobs</div>
        </motion.section>

        {/* 7. Contact */}
        <motion.section id="contact" className={styles.glassCard} variants={itemVariants}>
          <h2 className={styles.sectionTitle}>Let&apos;s Work Together</h2>
          <p style={{ color: "#52525B", fontSize: "1rem", marginBottom: "2rem" }}>
            Punya ide project luar biasa? Jangan ragu untuk menghubungi saya. Mari wujudkan ide Anda menjadi aplikasi modern berkualitas tinggi.
          </p>
          <div className={styles.contactGroup}>
            <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer" className={styles.contactBtn} style={{ color: '#10B981' }}>
              <WhatsappLogo size={22} weight="fill" /> WhatsApp
            </a>
            <a href="mailto:hi.rikiiskandar@gmail.com" className={styles.contactBtn} style={{ background: '#09090B', color: 'white', borderColor: '#09090B' }}>
              <Mail size={22} /> Email Me
            </a>
            <a href="tel:+6281234567890" className={styles.contactBtn}>
              <Phone size={22} /> Panggil
            </a>
          </div>
        </motion.section>

        {/* Footer */}
        <motion.footer className={styles.footer} variants={itemVariants}>
          Made with ❤️ AI Supported 2026
        </motion.footer>
      </motion.main>

      {/* Floating macOS Dock */}
      <motion.nav 
        className={styles.dock}
        initial={{ opacity: 0, y: 100, x: "-50%" }}
        animate={{ opacity: 1, y: 0, x: "-50%" }}
        transition={{ type: "spring", stiffness: 50, damping: 15, delay: 0.5 }}
      >
        <Link href="/" className={styles.dockItem} title="Home"><Home size={22} /></Link>
        <a href="#about" className={styles.dockItem} title="About"><User size={22} /></a>
        <a href="#skills" className={styles.dockItem} title="Skills"><Code2 size={22} /></a>
        <a href="#gallery" className={styles.dockItem} title="Gallery"><ImageIcon size={22} /></a>
      </motion.nav>
    </div>
  );
}
