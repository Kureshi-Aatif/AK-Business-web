const express = require('express');
const router = express.Router();
const config = require('../config');
const { validateInquiry, validateContact } = require('../validation');
const { submissionRateLimiter, antiSpamCheck, verifyCsrfToken } = require('../security');
const { db, hashIp, generateReference } = require('../db');
const { sendInquiryEmails, sendContactEmails } = require('../mailer');
const { getAllPosts, getPostBySlug } = require('../blog');

// Services definition
const SERVICES_DATA = {
  'web-design': {
    slug: 'web-design',
    title: 'Modern Web Design & Development in Surat',
    badge: 'Core Expertise',
    primaryKeyword: 'e-commerce website development Surat',
    metaTitle: 'E-Commerce Website Development & Web Design Surat | AK Digital',
    metaDesc: 'Custom website development and e-commerce stores in Surat, Gujarat. Fast loading speed, mobile responsive design, and WhatsApp checkout integration.',
    heroSubtitle: 'High-speed, custom-crafted websites that captivate visitors, establish rock-solid credibility, and turn clicks into loyal paying clients.',
    illustration: '/img/illustrations/web-design.svg',
    chips: ['Mobile-First', 'Sub-second Load Speed', 'SEO-Ready Structure', 'Clean Code'],
    offerings: [
      {
        title: 'Custom Brand Websites',
        desc: 'Tailor-made designs created from scratch to embody your company’s unique value, eliminating generic cookie-cutter templates.'
      },
      {
        title: 'Mobile-First Responsive Layouts',
        desc: 'Flawlessly optimized for smartphones, tablets, laptops, and ultra-wide screens with fluid typography and intuitive touch targets.'
      },
      {
        title: 'Product Catalogues & Showcases',
        desc: 'Structured digital catalogues with categories, crisp media galleries, and direct WhatsApp inquiry buttons for each item.'
      },
      {
        title: 'High-Conversion Landing Pages',
        desc: 'Targeted single-page funnels engineered with persuasive copy hierarchy, speed, and clear calls-to-action that maximize ad ROI.'
      },
      {
        title: 'Full E-commerce Stores',
        desc: 'Secure storefronts featuring product inventories, shopping carts, checkout workflows, and seamless payment gateways (UPI, cards).'
      },
      {
        title: 'AI-Powered Speed & Code Quality',
        desc: 'Built using modern AI web development tooling paired with rigorous manual code review for unmatched performance scores.'
      }
    ],
    perfectFor: [
      'Retailers & Local Businesses',
      'Manufacturers & Wholesalers',
      'Doctors, Clinics & Hospitals',
      'Coaching Institutes & Academies',
      'Real Estate Developers',
      'Restaurants & Cafes',
      'Independent Consultants & Freelancers'
    ],
    techStack: ['Node.js & Express', 'Semantic HTML5', 'Vanilla CSS Custom Properties', 'Lightweight SQLite', 'Cloudflare CDN'],
    relatedPlan: 'Standard Catalogue',
    relatedPosts: [
      { title: 'How Much Does a Website Cost in India? 2026 Price Breakdown', slug: 'how-much-does-a-website-cost-in-india' },
      { title: 'The Ultimate 25-Point Website Launch Checklist for Business Owners', slug: 'website-checklist-before-launch' }
    ]
  },
  'digital-marketing': {
    slug: 'digital-marketing',
    title: 'Performance Digital Marketing & Local SEO in Surat',
    badge: 'Growth Engine',
    primaryKeyword: 'Google Ads and Meta Ads agency Surat',
    metaTitle: 'Google Ads, Meta Ads & SEO Services in Surat | AK Digital',
    metaDesc: 'Scale your business with top Google Ads and Meta Ads management in Surat. Local SEO, Google Business Profile ranking, and direct WhatsApp lead funnels.',
    heroSubtitle: 'Dominate Google local search, capture qualified buyer intent, and scale your brand with laser-targeted customer acquisition.',
    illustration: '/img/illustrations/digital-marketing.svg',
    chips: ['Google Maps Top 3', 'Local SEO Dominance', 'WhatsApp Lead Funnels', 'Verified ROI'],
    offerings: [
      {
        title: 'Google Business Profile Optimization',
        desc: 'Complete setup, category optimization, review strategies, and citation building to get your business into the local 3-pack.'
      },
      {
        title: 'On-Page & Technical SEO',
        desc: 'Keyword research, meta structure, Open Graph tags, schema.org LocalBusiness markups, and site speed tuning for sustained organic rank.'
      },
      {
        title: 'Direct WhatsApp Lead Funnels',
        desc: 'Automated click-to-WhatsApp links and pre-filled message triggers embedded on every page for immediate prospect discussions.'
      },
      {
        title: 'Targeted Social Media Ads',
        desc: 'Laser-focused Meta (Instagram & Facebook) and Google Search campaigns targeting customers specifically within Surat and across Gujarat.'
      },
      {
        title: 'Conversion Rate Optimization (CRO)',
        desc: 'A/B testing, heatmap analysis, and message refinement that turns standard passive visitors into active inquiries.'
      },
      {
        title: 'Transparent Performance Analytics',
        desc: 'Clear monthly dashboards displaying phone calls, WhatsApp inquiries, visitor numbers, and cost-per-lead metrics without confusing jargon.'
      }
    ],
    perfectFor: [
      'Local Service Providers',
      'Jewellers & Textile Merchants',
      'Industrial Suppliers',
      'Home Decor & Interior Studios',
      'Fitness Gyms & Wellness Centers',
      'Automotive Garages & Detailers'
    ],
    techStack: ['Google Search Console', 'Google Analytics 4', 'Meta Business Manager', 'Local Schema Markup', 'WhatsApp Cloud API'],
    relatedPlan: 'Standard Catalogue',
    relatedPosts: [
      { title: 'How to Set Up and Optimize Your Google Business Profile', slug: 'how-to-set-up-google-business-profile' },
      { title: 'Step-by-Step Guide: How to Rank in the Top 3 on Google Maps in Surat', slug: 'how-to-rank-on-google-maps' }
    ]
  },
  'graphic-design': {
    slug: 'graphic-design',
    title: 'Brand Identity & Graphic Design Studio in Surat',
    badge: 'Visual Identity',
    primaryKeyword: 'logo design Surat',
    metaTitle: 'Logo Design & Brand Identity Graphic Designer Surat | AK Digital',
    metaDesc: 'Professional logo design and creative graphic design in Surat. Business cards, menus, social media banners, and cohesive brand systems that command trust.',
    heroSubtitle: 'Establish undeniable credibility with striking logos, sleek marketing collateral, and a cohesive brand identity that commands attention.',
    illustration: '/img/illustrations/graphic-design.svg',
    chips: ['Vector Precision', 'Brand Guidelines', 'Print & Digital Formats', 'Commercial Rights'],
    offerings: [
      {
        title: 'Logo Design & Visual Identity',
        desc: 'Distinctive, memorable brand marks designed with strict geometric balance, color palettes, and comprehensive usage guides.'
      },
      {
        title: 'Stationery & Corporate Collateral',
        desc: 'High-end business cards, letterheads, invoice templates, and branded envelopes tailored for premium physical impressions.'
      },
      {
        title: 'Social Media Creatives & Ad Sets',
        desc: 'Engaging Instagram feed posts, carousels, and story templates created to stop scrollers and maintain strong brand consistency.'
      },
      {
        title: 'Marketing Flyers, Brochures & Menus',
        desc: 'Persuasive print-ready tri-fold brochures, sales flyers, restaurant menus, and product spec sheets formatted with CMYK precision.'
      },
      {
        title: 'Packaging & Label Artwork',
        desc: 'Shelf-ready box and label designs crafted for retail products, apparel tags, FMCG containers, and cosmetic packaging.'
      },
      {
        title: 'Vector Artwork & Icon Sets',
        desc: 'Custom UI iconography, vector illustrations, and brand mascots optimized for high-density screens and print reproduction.'
      }
    ],
    perfectFor: [
      'New Startups & Ventures',
      'Fashion Boutiques & Textile Labels',
      'Cafes, Cloud Kitchens & Bakers',
      'Corporate Law & Tax Firms',
      'Consumer Packaged Goods'
    ],
    techStack: ['Adobe Illustrator', 'Photoshop', 'Figma', 'CMYK & RGB Color Profiles', 'Print-Ready PDF Specs'],
    relatedPlan: 'Starter Website',
    relatedPosts: [
      { title: 'Why Every Local Business in Surat Needs a Website in 2026', slug: 'why-local-business-needs-a-website' },
      { title: 'How Much Does a Website Cost in India? 2026 Price Breakdown', slug: 'how-much-does-a-website-cost-in-india' }
    ]
  },
  'video-editing': {
    slug: 'video-editing',
    title: 'High-Retention Video Editing & Motion Graphics in Surat',
    badge: 'Viral Engagement',
    primaryKeyword: 'video editing services Surat',
    metaTitle: 'Video Editing Services & Reels Editing in Surat | AK Digital',
    metaDesc: 'Top video editing services in Surat. Dynamic Instagram reels, YouTube video editing, motion graphics, and corporate promotional videos that hook audiences.',
    heroSubtitle: 'Turn raw camera clips into dynamic, scroll-stopping video assets engineered for maximum retention, algorithmic reach, and conversions.',
    illustration: '/img/illustrations/video-editing.svg',
    chips: ['Hook Optimization', 'Kinetic Typography', 'Sound Design & SFX', 'Color Grading'],
    offerings: [
      {
        title: 'Instagram Reels & YouTube Shorts',
        desc: 'Fast-paced, hook-optimized short videos designed for algorithmic reach, complete with stylish kinetic subtitles and trending audio.'
      },
      {
        title: 'Corporate & Brand Promo Videos',
        desc: 'High-end brand showcase films highlighting your facility, team, craftsmanship, or portfolio of completed client projects.'
      },
      {
        title: 'Product Demonstration Videos',
        desc: 'Clear, compelling product walkthroughs highlighting key benefits, unboxings, and practical usage demonstrations.'
      },
      {
        title: 'Client Testimonial & Case Story Videos',
        desc: 'Polished client interviews that build social proof, overcoming prospective buyer hesitation and validating your expertise.'
      },
      {
        title: 'Motion Graphics & Logo Stings',
        desc: 'Animated logo intros, lower-thirds, CTA overlays, and transition graphics that give your video content a broadcast-grade finish.'
      },
      {
        title: 'Sound Design & Audio Mastering',
        desc: 'Pristine voice isolation, subtle background scoring, and crisp sound effects that elevate audience immersion.'
      }
    ],
    perfectFor: [
      'Content Creators & Influencers',
      'E-commerce & Direct-to-Consumer Brands',
      'Real Estate Agencies',
      'Event Venues & Banquet Halls',
      'Educational Creators'
    ],
    techStack: ['DaVinci Resolve Studio', 'Premiere Pro', 'After Effects', 'High-Fidelity Audio Mastering'],
    relatedPlan: 'Standard Catalogue',
    relatedPosts: [
      { title: 'How to Generate High-Intent Leads from Your Website Using WhatsApp', slug: 'how-to-get-leads-from-website-using-whatsapp' },
      { title: 'Why Every Local Business in Surat Needs a Website in 2026', slug: 'why-local-business-needs-a-website' }
    ]
  },
  'business-solutions': {
    slug: 'business-solutions',
    title: 'Custom Business Solutions & Digital Automation in Surat',
    badge: 'Operations Streamlined',
    primaryKeyword: 'online business setup',
    metaTitle: 'Online Business Setup & Digital Solutions Surat | AK Digital',
    metaDesc: 'Streamline operations with custom online business setup, WhatsApp automation bots, lead dashboards, and payment gateways tailored for Surat businesses.',
    heroSubtitle: 'Eliminate tedious manual overhead with automated WhatsApp messaging, custom lead funnels, and tailored web applications.',
    illustration: '/img/illustrations/business-solutions.svg',
    chips: ['Automated Lead Sync', 'WhatsApp API Bots', 'Custom Dashboards', 'Zero Manual Errors'],
    offerings: [
      {
        title: 'WhatsApp Automation & Chatbots',
        desc: 'Automatic instant greetings, catalog triggers, and automated lead capture when customers message your official WhatsApp line.'
      },
      {
        title: 'Lead Management Dashboards',
        desc: 'Centralized admin panels where incoming inquiries are organized, searchable, filterable, and exportable to CSV at any time.'
      },
      {
        title: 'Payment Gateway & UPI Integration',
        desc: 'Frictionless QR and payment gateway links allowing clients to settle invoices, pay advance retainers, or buy products instantly.'
      },
      {
        title: 'Custom Booking & Appointment Systems',
        desc: 'Interactive booking calendars that eliminate phone tag, sending instant confirmation emails and WhatsApp notifications.'
      },
      {
        title: 'Inventory & Catalogue Syncing',
        desc: 'Lightweight internal tools to update prices, stock, and descriptions across your web catalogue without complex IT hurdles.'
      },
      {
        title: 'Cloud Deployment & Monitoring',
        desc: 'End-to-end server deployment on high-uptime infrastructure with automated SSL certificates, daily backups, and security defenses.'
      }
    ],
    perfectFor: [
      'Growing SMEs & Family Businesses',
      'Distributors & Stockists',
      'Service Centers & Repair Shops',
      'Professional Consultancies',
      'Trading Companies'
    ],
    techStack: ['Node.js Backend APIs', 'SQLite / PostgreSQL Databases', 'Webhook Integrations', 'Docker Containers', 'PM2'],
    relatedPlan: 'E-commerce Solution',
    relatedPosts: [
      { title: 'Shopify vs. WordPress for Small Businesses in India', slug: 'shopify-vs-wordpress-for-small-business' },
      { title: 'How to Generate High-Intent Leads from Your Website Using WhatsApp', slug: 'how-to-get-leads-from-website-using-whatsapp' }
    ]
  }
};

// Common navigation helper
function getCommonNav(activePath) {
  return [
    { label: 'Home', href: '/', active: activePath === '/' },
    { label: 'Why a Website', href: '/why-website', active: activePath === '/why-website' },
    { label: 'Plans & Pricing', href: '/plans', active: activePath === '/plans' },
    { label: 'Services', href: '/services', active: activePath.startsWith('/services') },
    { label: 'FAQ', href: '/faq', active: activePath === '/faq' },
    { label: 'Blog', href: '/blog', active: activePath.startsWith('/blog') },
    { label: 'Inquiry', href: '/inquiry', active: activePath === '/inquiry' },
    { label: 'Contact', href: '/contact', active: activePath === '/contact' }
  ];
}

// 1. Home
router.get('/', (req, res) => {
  res.render('pages/home', {
    pageTitle: 'Website Design Company in Surat | AK Digital Studio',
    metaDesc: 'AK Digital Studio is a premier website design company in Surat, Gujarat. High-speed websites, Google Maps local SEO, and digital growth starting at ₹4,999.',
    canonical: `${config.siteUrl}/`,
    activePath: '/',
    navItems: getCommonNav('/'),
    business: config.business,
    ogImage: `${config.siteUrl}/img/og-default.svg`,
    breadcrumbs: [{ label: 'Home', href: '/' }]
  });
});

// 2. Why a Website
router.get('/why-website', (req, res) => {
  res.render('pages/why-website', {
    pageTitle: 'Why a Local Business Needs a Website | AK Digital Studio',
    metaDesc: 'Turn local clicks into paying clients. Discover why Surat businesses need a fast, mobile-friendly website to rank on Google Maps and drive 24/7 sales.',
    canonical: `${config.siteUrl}/why-website`,
    activePath: '/why-website',
    navItems: getCommonNav('/why-website'),
    business: config.business,
    ogImage: `${config.siteUrl}/img/og-default.svg`,
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Why a Website', href: '/why-website' }
    ]
  });
});

// 3. Plans & Pricing
router.get('/plans', (req, res) => {
  res.render('pages/plans', {
    pageTitle: 'Website Under 5000 Rupees & Transparent Plans Surat | AK Digital',
    metaDesc: 'Affordable website design plans in Surat starting at ₹4,999 onwards. Starter, Standard Catalogue, and E-commerce packages with 1 year setup support.',
    canonical: `${config.siteUrl}/plans`,
    activePath: '/plans',
    navItems: getCommonNav('/plans'),
    business: config.business,
    ogImage: `${config.siteUrl}/img/og-plans.svg`,
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Plans & Pricing', href: '/plans' }
    ]
  });
});

// 4. Services Index
router.get('/services', (req, res) => {
  res.render('pages/services', {
    pageTitle: 'Digital Marketing Agency & Web Services Surat | AK Digital',
    metaDesc: 'Complete digital agency services in Surat: custom website design, Google Ads, Meta marketing, logo branding, reels video editing, and business automation.',
    canonical: `${config.siteUrl}/services`,
    activePath: '/services',
    navItems: getCommonNav('/services'),
    business: config.business,
    servicesList: Object.values(SERVICES_DATA),
    ogImage: `${config.siteUrl}/img/og-default.svg`,
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Services', href: '/services' }
    ]
  });
});

// 4b. Individual Service Pages
router.get('/services/:slug', (req, res, next) => {
  const service = SERVICES_DATA[req.params.slug];
  if (!service) return next();

  res.render('pages/service-detail', {
    pageTitle: service.metaTitle,
    metaDesc: service.metaDesc,
    canonical: `${config.siteUrl}/services/${service.slug}`,
    activePath: `/services/${service.slug}`,
    navItems: getCommonNav(`/services/${service.slug}`),
    business: config.business,
    service,
    ogImage: `${config.siteUrl}/img/og-default.svg`,
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Services', href: '/services' },
      { label: service.title, href: `/services/${service.slug}` }
    ]
  });
});

// 5. Local Landing Page: Website Design Surat
router.get('/website-design-surat', (req, res) => {
  res.render('pages/local-landing', {
    pageTitle: 'Website Design Gujarat & Web Development Surat | AK Digital',
    metaDesc: 'Looking for the best website design company in Surat, Gujarat? Custom business sites, fast loading, Google SEO, and WhatsApp leads starting at ₹4,999.',
    canonical: `${config.siteUrl}/website-design-surat`,
    activePath: '/website-design-surat',
    navItems: getCommonNav('/services'),
    business: config.business,
    city: 'Surat',
    region: 'Gujarat',
    landingType: 'web-design',
    headline: 'High-Impact Website Design & Custom Web Development in Surat, Gujarat',
    subheadline: 'Engineered specifically for Surat textile manufacturers, diamond jewelers, retail stores, and service professionals who demand speed and qualified leads.',
    primaryKeyword: 'website design Gujarat',
    features: [
      { title: 'Lightning Speed', desc: 'Sub-second mobile loading speed tested across Indian cellular networks.' },
      { title: 'Direct WhatsApp Leads', desc: 'Click-to-chat triggers embedded across your catalog to convert local visitors instantly.' },
      { title: 'Google Maps 3-Pack SEO', desc: 'Structured schema and local citations to place your Surat shop at the top of Google.' },
      { title: 'Turnkey Support', desc: '1 year of setup support and client guidance included with every build.' }
    ],
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Website Design Surat', href: '/website-design-surat' }
    ]
  });
});

// 5b. Local Landing Page: Digital Marketing Surat
router.get('/digital-marketing-surat', (req, res) => {
  res.render('pages/local-landing', {
    pageTitle: 'SEO Services Surat & Digital Marketing Agency | AK Digital',
    metaDesc: 'Results-driven SEO services and digital marketing in Surat. Dominate Google search, run profitable Meta ads, and generate verified customer leads.',
    canonical: `${config.siteUrl}/digital-marketing-surat`,
    activePath: '/digital-marketing-surat',
    navItems: getCommonNav('/services'),
    business: config.business,
    city: 'Surat',
    region: 'Gujarat',
    landingType: 'digital-marketing',
    headline: 'Result-Driven Local SEO & Performance Digital Marketing in Surat',
    subheadline: 'Capture high-intent local buyers in Surat, Adajan, Vesu, and Ring Road searching Google Maps and social media for your exact services.',
    primaryKeyword: 'SEO services Surat',
    features: [
      { title: 'Google Business Profile Setup', desc: 'Full optimization of your local listing to rank in the coveted Surat 3-pack.' },
      { title: 'High-ROI Meta & Google Ads', desc: 'Laser-targeted paid ads focused on customer acquisition without budget waste.' },
      { title: 'Local Schema & Citations', desc: 'Strict NAP consistency across top Indian business directories.' },
      { title: 'Transparent Lead Analytics', desc: 'Clear reporting on phone calls, WhatsApp inquiries, and cost-per-lead.' }
    ],
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Digital Marketing Surat', href: '/digital-marketing-surat' }
    ]
  });
});

// 5c. Local Landing Page: Video Editing Surat
router.get('/video-editing-surat', (req, res) => {
  res.render('pages/local-landing', {
    pageTitle: 'Reels Video Editing & Video Editor in Surat | AK Digital',
    metaDesc: 'Professional reels video editing and commercial video editing studio in Surat. Hook-driven Instagram reels, YouTube shorts, and corporate promo films.',
    canonical: `${config.siteUrl}/video-editing-surat`,
    activePath: '/video-editing-surat',
    navItems: getCommonNav('/services'),
    business: config.business,
    city: 'Surat',
    region: 'Gujarat',
    landingType: 'video-editing',
    headline: 'High-Retention Reels & Commercial Video Editing Studio in Surat',
    subheadline: 'Craft scroll-stopping short videos, product demos, and brand stories engineered for viral algorithmic reach across Instagram and YouTube.',
    primaryKeyword: 'reels video editing',
    features: [
      { title: 'Kinetic Subtitles & Hooks', desc: 'Engaging typography and fast visual hooks that boost watch-time retention.' },
      { title: 'Sound Design & Mastering', desc: 'Crystal clear voice isolation, trending audio tracks, and impactful SFX.' },
      { title: 'Product & Catalog Showcases', desc: 'Crisp showcase videos tailored for textile collections, jewelry, and e-commerce.' },
      { title: 'Fast Turnaround', desc: 'Standard 48-to-72 hour delivery on short-form social reels packages.' }
    ],
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Video Editing Surat', href: '/video-editing-surat' }
    ]
  });
});

// 6. FAQ Hub
router.get('/faq', (req, res) => {
  const faqs = [
    {
      q: 'How much does a website design cost in Surat?',
      a: 'At AK Digital Studio, our transparent website packages start at ₹4,999 for a high-speed Starter Website (up to 5 pages), ₹9,999 for a Standard Catalogue website (up to 10 pages and 20 products), and ₹14,999 for complete E-commerce solutions. There are no hidden software fees or forced monthly platform rents.'
    },
    {
      q: 'How long does it take to design and launch my website?',
      a: 'A standard Starter Website is typically completed within 3 to 5 business days. Catalogue websites take 7 to 10 days, while full E-commerce stores with payment gateways take 12 to 15 days, provided all brand photos and content are provided promptly.'
    },
    {
      q: 'Are domain names and cloud hosting included in the package?',
      a: 'Domain registration (.com or .in) and cloud hosting are billed separately based on your preferred provider (typically ₹2,500 – ₹4,500 per year via Hostinger, MilesWeb, or AWS). We configure and connect your domain, SSL certificates, and hosting free of charge with all packages.'
    },
    {
      q: 'Will my website appear on Google Search and Google Maps?',
      a: 'Yes! Every website we develop includes on-page technical SEO, semantic HTML5 structure, Open Graph tags, and LocalBusiness schema markup. We also offer dedicated Google Business Profile setup to help you rank in the Google Maps local 3-pack.'
    },
    {
      q: 'Will my website look good and load fast on mobile phones?',
      a: 'Absolutely. We follow a strict mobile-first design process. Over 85% of web traffic in India comes from mobile devices, so our layouts are tested rigorously at 375px and 768px resolutions to guarantee sub-second load times on Indian 4G/5G networks.'
    },
    {
      q: 'Can customers order or inquire directly through WhatsApp?',
      a: 'Yes! We embed click-to-WhatsApp buttons and dynamic pre-filled text triggers across every product and service page. When a client clicks the button, WhatsApp opens instantly with a customized inquiry ready to send.'
    },
    {
      q: 'What kind of support is provided after the website launch?',
      a: 'All our website plans include 1 year of complimentary setup support, covering minor text adjustments, routine security updates, and technical troubleshooting.'
    },
    {
      q: 'Can I accept online payments like UPI, Google Pay, and credit cards?',
      a: 'Yes. For catalogue and e-commerce websites, we integrate secure Indian payment gateways (such as Razorpay, Cashfree, or PhonePe) supporting instant UPI payments, QR codes, credit/debit cards, and net banking with zero setup commissions.'
    },
    {
      q: 'Do you design bilingual websites (English and Gujarati/Hindi)?',
      a: 'Yes! We can create multi-language or bilingual layouts upon request to help your business connect authentically with local audiences across Gujarat.'
    },
    {
      q: 'What do I need to provide to get started?',
      a: 'Simply share your company name, logo (or we can design one), your product/service details, photos, and your official contact phone number. We handle everything else from layout to deployment.'
    }
  ];

  res.render('pages/faq', {
    pageTitle: 'Frequently Asked Questions | AK Digital Studio Surat',
    metaDesc: 'Got questions about website costs, timelines, hosting, SEO, or WhatsApp integration in Surat? Read 10 genuine answers from AK Digital Studio.',
    canonical: `${config.siteUrl}/faq`,
    activePath: '/faq',
    navItems: getCommonNav('/faq'),
    business: config.business,
    faqs,
    ogImage: `${config.siteUrl}/img/og-default.svg`,
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'FAQ', href: '/faq' }
    ]
  });
});

// 7. Blog Hub & Posts
router.get('/blog', (req, res) => {
  const posts = getAllPosts();
  res.render('pages/blog-index', {
    pageTitle: 'AK Digital Studio Insights: Guides for Local Business Growth',
    metaDesc: 'Practical guides and insights on website design, local SEO, Google Maps rankings, and digital lead generation for small businesses in Surat, Gujarat.',
    canonical: `${config.siteUrl}/blog`,
    activePath: '/blog',
    navItems: getCommonNav('/blog'),
    business: config.business,
    posts,
    ogImage: `${config.siteUrl}/img/og-blog.svg`,
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Blog', href: '/blog' }
    ]
  });
});

router.get('/blog/:slug', (req, res, next) => {
  const post = getPostBySlug(req.params.slug);
  if (!post) return next();

  res.render('pages/blog-post', {
    pageTitle: `${post.metaTitle || post.title} | AK Digital Studio`,
    metaDesc: post.metaDesc,
    canonical: `${config.siteUrl}/blog/${post.slug}`,
    activePath: '/blog',
    navItems: getCommonNav('/blog'),
    business: config.business,
    post,
    ogImage: `${config.siteUrl}/img/og-blog.svg`,
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Blog', href: '/blog' },
      { label: post.title, href: `/blog/${post.slug}` }
    ]
  });
});

// 8. Inquiry Form
router.get('/inquiry', (req, res) => {
  res.render('pages/inquiry', {
    pageTitle: 'Request a Project Quote & Consultation | AK Digital Studio',
    metaDesc: 'Request a customized quote for website design, digital marketing, or video editing. Receive a response within 24 hours from AK Digital Studio in Surat.',
    canonical: `${config.siteUrl}/inquiry`,
    activePath: '/inquiry',
    navItems: getCommonNav('/inquiry'),
    business: config.business,
    preselectedPlan: req.query.plan || '',
    preselectedService: req.query.service || '',
    errors: {},
    oldData: {},
    successRef: null,
    ogImage: `${config.siteUrl}/img/og-default.svg`,
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Request a Quote', href: '/inquiry' }
    ]
  });
});

// Progressive Enhancement POST for Inquiry
router.post('/inquiry', submissionRateLimiter, antiSpamCheck, verifyCsrfToken, validateInquiry, async (req, res) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMap = {};
    errors.array().forEach((err) => {
      errorMap[err.path] = err.msg;
    });

    return res.render('pages/inquiry', {
      pageTitle: 'Request a Project Quote | AK Digital Studio',
      metaDesc: 'Request a customized quote for website design.',
      canonical: `${config.siteUrl}/inquiry`,
      activePath: '/inquiry',
      navItems: getCommonNav('/inquiry'),
      business: config.business,
      preselectedPlan: req.body.interest || '',
      preselectedService: '',
      errors: errorMap,
      oldData: req.body,
      successRef: null,
      breadcrumbs: [
        { label: 'Home', href: '/' },
        { label: 'Request a Quote', href: '/inquiry' }
      ]
    });
  }

  try {
    const reference = generateReference('INQ');
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const ip_hash = hashIp(ip);

    const stmt = db.prepare(`
      INSERT INTO inquiries (
        reference, name, email, phone, business_name, business_type,
        interest, budget, timeline, details, contact_method,
        utm_source, utm_medium, utm_campaign, ip_hash
      ) VALUES (
        @reference, @name, @email, @phone, @business_name, @business_type,
        @interest, @budget, @timeline, @details, @contact_method,
        @utm_source, @utm_medium, @utm_campaign, @ip_hash
      )
    `);

    stmt.run({
      reference,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      business_name: req.body.business_name || '',
      business_type: req.body.business_type || '',
      interest: req.body.interest,
      budget: req.body.budget || '',
      timeline: req.body.timeline || '',
      details: req.body.details,
      contact_method: req.body.contact_method || 'WhatsApp',
      utm_source: (req.body.utm_source || '').slice(0, 100),
      utm_medium: (req.body.utm_medium || '').slice(0, 100),
      utm_campaign: (req.body.utm_campaign || '').slice(0, 100),
      ip_hash
    });

    sendInquiryEmails({ ...req.body, reference }).catch(console.error);

    return res.render('pages/inquiry', {
      pageTitle: 'Quote Request Received | AK Digital Studio',
      metaDesc: 'Thank you for contacting AK Digital Studio.',
      canonical: `${config.siteUrl}/inquiry`,
      activePath: '/inquiry',
      navItems: getCommonNav('/inquiry'),
      business: config.business,
      preselectedPlan: '',
      preselectedService: '',
      errors: {},
      oldData: {},
      successRef: reference,
      breadcrumbs: [
        { label: 'Home', href: '/' },
        { label: 'Request a Quote', href: '/inquiry' }
      ]
    });
  } catch (err) {
    console.error('Inquiry form submission error:', err);
    return res.render('pages/inquiry', {
      pageTitle: 'Request a Project Quote | AK Digital Studio',
      metaDesc: 'Request a customized quote for website design.',
      canonical: `${config.siteUrl}/inquiry`,
      activePath: '/inquiry',
      navItems: getCommonNav('/inquiry'),
      business: config.business,
      preselectedPlan: '',
      preselectedService: '',
      errors: { form: 'A server error occurred. Please try again or message on WhatsApp.' },
      oldData: req.body,
      successRef: null,
      breadcrumbs: [
        { label: 'Home', href: '/' },
        { label: 'Request a Quote', href: '/inquiry' }
      ]
    });
  }
});

// 9. Contact Page
router.get('/contact', (req, res) => {
  res.render('pages/contact', {
    pageTitle: 'Contact AK Digital Studio | Web Agency in Surat, Gujarat',
    metaDesc: 'Contact AK Digital Studio in Surat. Call +91 76984 50003, chat on WhatsApp, or send a message for web design and digital marketing support.',
    canonical: `${config.siteUrl}/contact`,
    activePath: '/contact',
    navItems: getCommonNav('/contact'),
    business: config.business,
    errors: {},
    oldData: {},
    successRef: null,
    ogImage: `${config.siteUrl}/img/og-default.svg`,
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Contact', href: '/contact' }
    ]
  });
});

// Progressive Enhancement POST for Contact
router.post('/contact', submissionRateLimiter, antiSpamCheck, verifyCsrfToken, validateContact, async (req, res) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMap = {};
    errors.array().forEach((err) => {
      errorMap[err.path] = err.msg;
    });

    return res.render('pages/contact', {
      pageTitle: 'Contact Us | AK Digital Studio Surat, Gujarat',
      metaDesc: 'Get in touch with AK Digital Studio.',
      canonical: `${config.siteUrl}/contact`,
      activePath: '/contact',
      navItems: getCommonNav('/contact'),
      business: config.business,
      errors: errorMap,
      oldData: req.body,
      successRef: null,
      breadcrumbs: [
        { label: 'Home', href: '/' },
        { label: 'Contact', href: '/contact' }
      ]
    });
  }

  try {
    const reference = generateReference('CNT');
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const ip_hash = hashIp(ip);

    const stmt = db.prepare(`
      INSERT INTO contacts (reference, name, email, phone, subject, message, ip_hash)
      VALUES (@reference, @name, @email, @phone, @subject, @message, @ip_hash)
    `);

    stmt.run({
      reference,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone || '',
      subject: req.body.subject,
      message: req.body.message,
      ip_hash
    });

    sendContactEmails({ ...req.body, reference }).catch(console.error);

    return res.render('pages/contact', {
      pageTitle: 'Message Received | AK Digital Studio',
      metaDesc: 'Thank you for contacting AK Digital Studio.',
      canonical: `${config.siteUrl}/contact`,
      activePath: '/contact',
      navItems: getCommonNav('/contact'),
      business: config.business,
      errors: {},
      oldData: {},
      successRef: reference,
      breadcrumbs: [
        { label: 'Home', href: '/' },
        { label: 'Contact', href: '/contact' }
      ]
    });
  } catch (err) {
    console.error('Contact form submission error:', err);
    return res.render('pages/contact', {
      pageTitle: 'Contact Us | AK Digital Studio Surat, Gujarat',
      metaDesc: 'Get in touch with AK Digital Studio.',
      canonical: `${config.siteUrl}/contact`,
      activePath: '/contact',
      navItems: getCommonNav('/contact'),
      business: config.business,
      errors: { form: 'A server error occurred. Please try again or WhatsApp us.' },
      oldData: req.body,
      successRef: null,
      breadcrumbs: [
        { label: 'Home', href: '/' },
        { label: 'Contact', href: '/contact' }
      ]
    });
  }
});

// 10. Legal pages
router.get('/privacy', (req, res) => {
  res.render('pages/privacy', {
    pageTitle: 'Privacy Policy & DPDP Compliance | AK Digital Studio',
    metaDesc: 'Privacy Policy of AK Digital Studio. We adhere to India Digital Personal Data Protection (DPDP) principles: consent, purpose limitation, and deletion on request.',
    canonical: `${config.siteUrl}/privacy`,
    activePath: '/privacy',
    navItems: getCommonNav('/privacy'),
    business: config.business,
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Privacy Policy', href: '/privacy' }
    ]
  });
});

router.get('/terms', (req, res) => {
  res.render('pages/terms', {
    pageTitle: 'Terms & Conditions | AK Digital Studio',
    metaDesc: 'Terms of service, project timelines, deliverables, and engagement policies for AK Digital Studio.',
    canonical: `${config.siteUrl}/terms`,
    activePath: '/terms',
    navItems: getCommonNav('/terms'),
    business: config.business,
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Terms & Conditions', href: '/terms' }
    ]
  });
});

// 11. Dynamic Sitemap.xml (Includes all static pages, services, local landings & blog articles)
router.get('/sitemap.xml', (req, res) => {
  const staticRoutes = [
    { loc: '', changefreq: 'weekly', priority: '1.0' },
    { loc: '/why-website', changefreq: 'monthly', priority: '0.8' },
    { loc: '/plans', changefreq: 'weekly', priority: '0.9' },
    { loc: '/services', changefreq: 'weekly', priority: '0.8' },
    { loc: '/services/web-design', changefreq: 'weekly', priority: '0.8' },
    { loc: '/services/digital-marketing', changefreq: 'weekly', priority: '0.8' },
    { loc: '/services/graphic-design', changefreq: 'weekly', priority: '0.8' },
    { loc: '/services/video-editing', changefreq: 'weekly', priority: '0.8' },
    { loc: '/services/business-solutions', changefreq: 'weekly', priority: '0.8' },
    { loc: '/website-design-surat', changefreq: 'weekly', priority: '0.9' },
    { loc: '/digital-marketing-surat', changefreq: 'weekly', priority: '0.9' },
    { loc: '/video-editing-surat', changefreq: 'weekly', priority: '0.9' },
    { loc: '/faq', changefreq: 'monthly', priority: '0.7' },
    { loc: '/blog', changefreq: 'daily', priority: '0.8' },
    { loc: '/inquiry', changefreq: 'monthly', priority: '0.7' },
    { loc: '/contact', changefreq: 'monthly', priority: '0.7' },
    { loc: '/privacy', changefreq: 'yearly', priority: '0.3' },
    { loc: '/terms', changefreq: 'yearly', priority: '0.3' }
  ];

  const blogPosts = getAllPosts();
  const now = new Date().toISOString().split('T')[0];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

  staticRoutes.forEach((route) => {
    xml += '  <url>\n';
    xml += `    <loc>${config.siteUrl}${route.loc}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  blogPosts.forEach((post) => {
    xml += '  <url>\n';
    xml += `    <loc>${config.siteUrl}/blog/${post.slug}</loc>\n`;
    xml += `    <lastmod>${post.date || now}</lastmod>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.7</priority>\n';
    xml += '  </url>\n';
  });

  xml += '</urlset>';

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.status(200).send(xml);
});

// 12. Robots.txt
router.get('/robots.txt', (req, res) => {
  const content = [
    'User-agent: *',
    'Allow: /',
    `Disallow: ${config.adminRoutePath}`,
    'Disallow: /api',
    '',
    `Sitemap: ${config.siteUrl}/sitemap.xml`
  ].join('\n');

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.status(200).send(content);
});

module.exports = router;
