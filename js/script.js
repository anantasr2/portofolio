/**
 * Portfolio Interactive Scripts — Ananta Surya Pratama
 * Handles:
 * 1. Dynamic Role Typewriter Animation
 * 2. Work Experience Vertical-to-Horizontal Pinned Scrolling (Responsive & Dynamic count)
 * 3. Selected Projects Full-Screen Fast Snapping
 * 4. Certifications Show More / Less Toggle
 * 5. Case Study Modal Details
 * 6. Navbar Scroll Blur
 */

document.addEventListener('DOMContentLoaded', () => {
    initModernRoleMorph();
    initExperienceHorizontalScroll();
    initProjectsFastSnap();
    initBottomDockNavigation();
});

/* ==========================================================================
   1. MODERN DYNAMIC ROLE MORPH ANIMATION (SLIDE-FADE FLIP)
   ========================================================================== */
function initModernRoleMorph() {
    const roles = [
        "Machine Learning Engineer",
        "Data Engineer",
        "Data Analyst",
        "Business Intelligence Specialist",
        "Business Research Analyst"
    ];
    let roleIndex = 0;
    const roleElem = document.getElementById("dynamic-role-text");
    if (!roleElem) return;

    roleElem.style.transition = "transform 0.38s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.38s ease, filter 0.38s ease";
    roleElem.style.display = "inline-block";

    function morphToNextRole() {
        roleElem.style.opacity = "0";
        roleElem.style.transform = "translateY(-12px)";
        roleElem.style.filter = "blur(6px)";

        setTimeout(() => {
            roleIndex = (roleIndex + 1) % roles.length;
            roleElem.textContent = roles[roleIndex];
            roleElem.style.transform = "translateY(12px)";

            setTimeout(() => {
                roleElem.style.opacity = "1";
                roleElem.style.transform = "translateY(0)";
                roleElem.style.filter = "blur(0px)";
            }, 50);
        }, 380);
    }

    setInterval(morphToNextRole, 2600);
}

/* ==========================================================================
   2. WORK EXPERIENCE VERTICAL SCROLL -> HORIZONTAL PINNED MOVEMENT
   ========================================================================== */
function initExperienceHorizontalScroll() {
    const expWrapper = document.getElementById('experience');
    const expTrack = document.getElementById('experience-track');
    const expIndicator = document.getElementById('exp-current-indicator');
    const expProgressBar = document.getElementById('experience-progress-bar');
    
    if (!expWrapper || !expTrack) return;

    // Dynamically calculate based on number of experience card items
    const cards = expTrack.querySelectorAll('.experience-card-item');
    const totalCards = cards.length || 7;

    // Set wrapper height and track width dynamically
    expWrapper.style.minHeight = `${totalCards * 100}vh`;
    expTrack.style.width = `${totalCards * 100}vw`;

    function updateHorizontalPosition() {
        const rect = expWrapper.getBoundingClientRect();
        const wrapperHeight = expWrapper.offsetHeight;
        const windowHeight = window.innerHeight;
        const maxScroll = wrapperHeight - windowHeight;

        // How much vertical scroll has occurred past top of experience container
        const scrolledPastTop = -rect.top;

        if (scrolledPastTop <= 0) {
            // Before entering or at the very start of experience
            expTrack.style.transform = `translate3d(0px, 0px, 0px)`;
            if (expIndicator) expIndicator.textContent = "01";
            if (expProgressBar) expProgressBar.style.width = `${100 / totalCards}%`;
        } else if (scrolledPastTop >= maxScroll) {
            // Reached the end of all experience cards -> ready to release to next section
            const maxTranslate = (totalCards - 1) * window.innerWidth;
            expTrack.style.transform = `translate3d(-${maxTranslate}px, 0px, 0px)`;
            if (expIndicator) expIndicator.textContent = String(totalCards).padStart(2, '0');
            if (expProgressBar) expProgressBar.style.width = "100%";
        } else {
            // While locked/pinned inside Work Experience -> Horizontal translation
            const progress = scrolledPastTop / maxScroll;
            const maxTranslate = (totalCards - 1) * window.innerWidth;
            const currentTranslate = progress * maxTranslate;

            expTrack.style.transform = `translate3d(-${currentTranslate}px, 0px, 0px)`;

            // Update 01 - 07 indicator and progress bar
            const currentCardIndex = Math.min(totalCards, Math.floor(progress * totalCards) + 1);
            if (expIndicator) expIndicator.textContent = String(currentCardIndex).padStart(2, '0');
            if (expProgressBar) expProgressBar.style.width = `${Math.max(100 / totalCards, progress * 100)}%`;
        }
    }

    // Bind with requestAnimationFrame for 60fps smoothness
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateHorizontalPosition();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    window.addEventListener('resize', () => {
        expTrack.style.width = `${totalCards * 100}vw`;
        updateHorizontalPosition();
    }, { passive: true });

    updateHorizontalPosition();
}

/* ==========================================================================
   3. SELECTED PROJECTS FAST FULL-SCREEN SNAP
   ========================================================================== */
function initProjectsFastSnap() {
    const projectCards = Array.from(document.querySelectorAll('.project-snap-card'));
    if (!projectCards.length) return;

    let isSnapping = false;
    let snapTimeout = null;

    /**
     * Find the index of the project card that is "active" (closest to being
     * fully in view at the top of the viewport). A card is considered active
     * when its top edge is within ±50% of the viewport height from the top.
     */
    function getActiveIndex() {
        let bestIdx = -1;
        let bestDistance = Infinity;
        projectCards.forEach((card, idx) => {
            const top = card.getBoundingClientRect().top;
            const dist = Math.abs(top);
            if (dist < bestDistance) {
                bestDistance = dist;
                bestIdx = idx;
            }
        });
        // Only consider a card "active" if it's reasonably close to viewport top
        if (bestDistance > window.innerHeight * 0.6) return -1;
        return bestIdx;
    }

    /**
     * Check whether the projects snap zone is currently controlling the viewport.
     * Returns true when at least one project card is close to the top of the
     * viewport (i.e. user is scrolled into the projects area).
     */
    function isInProjectsZone() {
        return getActiveIndex() !== -1;
    }

    function snapTo(idx, direction = 'next') {
        if (isSnapping) return;
        isSnapping = true;
        clearTimeout(snapTimeout);

        // Stationary Outer Card: Apply smooth content-reveal transition on inner content body
        const contentBody = projectCards[idx].querySelector('.slide-content-body');
        if (contentBody) {
            contentBody.classList.remove('animate-content-reveal-next', 'animate-content-reveal-prev');
            void contentBody.offsetWidth; // Force reflow
            contentBody.classList.add(direction === 'next' ? 'animate-content-reveal-next' : 'animate-content-reveal-prev');
        }

        projectCards[idx].scrollIntoView({ behavior: 'smooth', block: 'start' });
        snapTimeout = setTimeout(() => { isSnapping = false; }, 600);
    }

    /* ---- Wheel (desktop) ---- */
    window.addEventListener('wheel', (e) => {
        if (!isInProjectsZone()) return;

        const activeIdx = getActiveIndex();
        if (activeIdx === -1) return;

        const activeCard = projectCards[activeIdx];
        const cardTop = activeCard.getBoundingClientRect().top;
        const isAligned = Math.abs(cardTop) < 100;

        const scrollingDown = e.deltaY > 0;
        const scrollingUp   = e.deltaY < 0;

        if (scrollingDown) {
            // Allow user to scroll into project 1 naturally before snap engages
            if (activeIdx === 0 && !isAligned && cardTop > 0) {
                return;
            }
            if (activeIdx < projectCards.length - 1) {
                e.preventDefault();
                snapTo(activeIdx + 1, 'next');
            }
        } else if (scrollingUp) {
            // Allow user to scroll into project 7 naturally from below before snap engages
            if (activeIdx === projectCards.length - 1 && !isAligned && cardTop < 0) {
                return;
            }
            if (activeIdx > 0) {
                e.preventDefault();
                snapTo(activeIdx - 1, 'prev');
            }
        }
    }, { passive: false });

    /* ---- Touch (mobile) ---- */
    let touchStartY = 0;
    let touchHandled = false;

    window.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
        touchHandled = false;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
        if (touchHandled || !isInProjectsZone()) return;

        const deltaY = touchStartY - e.changedTouches[0].clientY;
        if (Math.abs(deltaY) < 40) return; // Too small swipe, ignore

        const activeIdx = getActiveIndex();
        if (activeIdx === -1) return;

        const activeCard = projectCards[activeIdx];
        const cardTop = activeCard.getBoundingClientRect().top;
        const isAligned = Math.abs(cardTop) < 100;

        if (deltaY > 0) {
            if (activeIdx === 0 && !isAligned && cardTop > 0) return;
            if (activeIdx < projectCards.length - 1) {
                touchHandled = true;
                snapTo(activeIdx + 1, 'next');
            }
        } else if (deltaY < 0) {
            if (activeIdx === projectCards.length - 1 && !isAligned && cardTop < 0) return;
            if (activeIdx > 0) {
                touchHandled = true;
                snapTo(activeIdx - 1, 'prev');
            }
        }
    }, { passive: true });
}


/* ==========================================================================
   4. CERTIFICATIONS 21 CARDS TOGGLE
   ========================================================================== */
let certsExpanded = false;
function toggleCertifications() {
    const extraCerts = document.querySelectorAll('.extra-cert');
    const text = document.getElementById('toggleCertText');
    const icon = document.getElementById('toggleCertIcon');

    certsExpanded = !certsExpanded;

    extraCerts.forEach((el, idx) => {
        if (certsExpanded) {
            el.classList.remove('hidden');
            setTimeout(() => {
                el.classList.remove('opacity-0');
            }, idx * 25);
        } else {
            el.classList.add('opacity-0');
            setTimeout(() => {
                el.classList.add('hidden');
            }, 300);
        }
    });

    if (certsExpanded) {
        if (text) text.textContent = "Tampilkan Lebih Sedikit (6)";
        if (icon) icon.textContent = "expand_less";
    } else {
        if (text) text.textContent = "Lihat Semua Sertifikasi (21)";
        if (icon) icon.textContent = "expand_more";
        const certSection = document.getElementById('certifications');
        if (certSection) certSection.scrollIntoView({ behavior: 'smooth' });
    }
}

/* ==========================================================================
   5. CASE STUDY MODAL DATA FOR 7 PROJECTS
   ========================================================================== */
const projectData = {
    lightretina: {
        title: "TilikMata",
        subtitle: "Explainable AI (XAI) Framework for Medical Diagnostic Imaging",
        tech: ["Python", "PyTorch", "Grad-CAM", "XAI", "FastAPI", "ONNX"],
        github: "https://github.com/anantasr2/TilikMata",
        demo: "https://github.com/anantasr",
        description: "TilikMata is a lightweight Explainable AI system for early diabetic retinopathy screening, combining RepViT, Grad-CAM, and clinical decision support to deliver severity prediction, visual explanations, risk assessment, and follow-up recommendations through a web-based platform.",
        highlights: [
            "Achieved 83.33% accuracy and 86.26% macro recall with RepViT, leading across four lightweight models.",
            "Reduced model size by 94.4%, from 18.45 MB to 1.03 MB with FP16 quantization.",
            "Accelerated inference by 44.5%, from 48.80 ms to 27.10 ms without performance loss.",
            "Integrated Grad-CAM, risk assessment, and clinical decision support into a deployable web screening system."
        ]
    },
    jordan: {
        title: "ThermaX",
        subtitle: "AI-Powered Thermal Stability Prediction for Zn-MOF",
        tech: ["PYTHON", "SCIKIT-LEARN", "MLP", "QSPR", "SHAP", "MATERIALS INFORMATICS"],
        github: "https://github.com/anantasr",
        demo: "https://github.com/anantasr",
        description: "ThermaX applies a Multilayer Perceptron (MLP) within a QSPR framework to predict the thermal stability of Zn-MOF materials from four structural descriptors: zinc content, nitrogen atoms, ligand fragments, and heteroatom interactions. The model compares different neural network configurations and uses SHAP analysis to identify the structural factors most influential to thermal stability, providing a computational approach to support faster and more efficient material design.",
        highlights: [
            "Achieved R² of 0.9991 with the optimal 9-neuron MLP model.",
            "Reached 0.0020 MAE and 0.0022 RMSE, demonstrating highly accurate TS prediction.",
            "Identified nN and Het as the most influential structural features using SHAP analysis.",
            "Enabled faster computational screening of Zn-MOF thermal stability to support material design."
        ]
    },
    panganet: {
        title: "PANGANET",
        subtitle: "AI-Powered Food Security Decision Support",
        tech: ["Machine Learning","SCIKIT-LEARN", "XGBOOST", "K-MEDOIDS", "DATA ANALYTICS"],
        github: "https://github.com/anantasr",
        demo: "https://github.com/anantasr",
        description: "PANGANET (Pangan Analytics Network) is a web-based platform that turns socioeconomic data from 514 Indonesian districts and cities into actionable food-security insights. By combining K-Medoids clustering and XGBoost prediction, it maps regional conditions, forecasts the Food Security Index, identifies key influencing factors, and provides data-driven recommendations to support smarter policy decisions.",
        highlights: [
            "Mapped 514 Indonesian districts and cities into three food-security clusters using K-Medoids.",
            "Achieved up to 97.73% R² on testing with XGBoost for regional IKP prediction.",
            "Identified key socioeconomic factors influencing food security across different regional clusters.",
            "Developed an interactive decision-support platform with prediction, regional analysis, and policy recommendations."
        ]
    },
    aerovision: {
        title: "NeoBatik",
        subtitle: "Real-Time AI for Indonesian Batik Motif Recognition",
        tech: ["PYTHON", "TENSORFLOW", "MOBILENETV2", "CNN", "COMPUTER VISION"],
        github: "https://github.com/anantasr2/batik-app",
        demo: "https://github.com/anantasr",
        description: "NeoBatik is a real-time computer vision system that recognizes Indonesian batik motifs from images and live camera feeds. Powered by MobileNetV2, the system combines lightweight deep learning with an interactive desktop application to deliver fast and practical motif recognition for cultural education and preservation.",
        highlights: [
            "Achieved 94% classification accuracy across four Indonesian batik motifs.",
            "Maintained 89%+ accuracy in real-time testing, demonstrating robust performance under varying conditions.",
            "Implemented real-time camera recognition with instant motif prediction and probability scores.",
            "Built an interactive desktop application with image upload, live recognition, and model evaluation reports."
        ]
    },
    smartgov: {
        title: "DrowsySense",
        subtitle: "Real-Time AI for Driver Drowsiness Detection",
        tech: ["PYTHON", "YOLOv8", "ULTRALYTICS", "COMPUTER VISION", "STREAMLIT"],
        github: "https://github.com/anantasr2/Driver-Drowsiness-Detection",
        demo: "https://github.com/anantasr",
        description: "DrowsySense is a real-time computer vision application that uses YOLOv8 to detect and classify driver facial conditions into Normal, Yawning, and Microsleep. Deployed through Streamlit, the system processes camera frames in real time, displays detection results with bounding boxes and confidence scores, and triggers an audio warning when drowsiness or microsleep is detected.",
        highlights: [
            "Achieved 95.6% precision and 97.5% recall in drowsiness detection.",
            "Reached 98.2% mAP50 across three drowsiness-related classes.",
            "Achieved 1.07 ms average inference time, enabling real-time detection.",
            "Integrated real-time detection with audio alerts through a Streamlit application."
        ]
    },
    neuropulse: {
        title: "Organicstation",
        subtitle: "Organic E-Commerce & Product Discovery Platform",
        tech: ["Deep Learning", "Signal Processing", "PyTorch", "MNE-Python", "Transformers"],
        github: "https://github.com/anantasr",
        demo: "https://github.com/anantasr",
        description: "Organicstation is a web-based storefront that brings organic food, beverages, skincare, and herbal products into a single digital shopping experience. The platform features product discovery, pricing, product highlights, customer testimonials, purchasing actions, and direct contact support, creating a simple end-to-end experience for users exploring and purchasing natural products.",
        highlights: [
            "Built a complete product catalog featuring organic food, beverages, skincare, and herbal products.",
            "Implemented product discovery and purchasing flows through product listings and “Buy Now” actions.",
            "Designed a customer-focused experience with testimonials, product highlights, and service information."


        ]
    },
    optiroute: {
        title: "OptiRoute AI Engine",
        subtitle: "Capacitated Vehicle Routing & Dynamic Dispatch AI",
        tech: ["Genetic Algorithms", "Python", "FastAPI", "PostGIS", "OR-Tools"],
        github: "https://github.com/anantasr",
        demo: "https://github.com/anantasr",
        description: "Intelligent combinatorial optimization engine solving dynamic multi-vehicle routing problems with time-window constraints, load balancing, and traffic-aware dispatching.",
        highlights: [
            "Reduced fleet fuel expenditure and mileage travel time by 18.5%.",
            "Real-time route recalculation capability handling up to 500 delivery nodes in under 2 seconds.",
            "REST API integration with third-party logistics dispatch systems."
        ]
    }
};

function openModal(projectId) {
    const data = projectData[projectId];
    if (!data) return;
    const content = document.getElementById('modalContent');
    if (!content) return;

    content.innerHTML = `
        <div class="flex items-center justify-between mb-2">
            <span class="font-label-sm text-accent tracking-[0.25em] uppercase text-xs font-bold flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-accent animate-pulse"></span> Case Study Brief
            </span>
        </div>
        <h3 class="font-serif text-3xl md:text-4xl font-bold text-on-surface mb-2 leading-tight">${data.title}</h3>
        <p class="font-label-sm text-secondary text-sm font-medium mb-5">${data.subtitle}</p>
        
        <div class="flex flex-wrap gap-2 mb-6">
            ${data.tech.map(t => `<span class="bg-surface-container-high/80 text-on-surface px-3 py-1 rounded-md text-xs font-mono font-medium border border-outline-variant/60 uppercase tracking-wider">${t}</span>`).join('')}
        </div>

        <div class="space-y-4 text-secondary leading-relaxed text-sm md:text-base border-t border-outline-variant/40 pt-5">
            <p class="text-on-surface/90 font-normal leading-relaxed">${data.description}</p>
            <div class="pt-2">
                <h4 class="font-label-sm uppercase tracking-widest text-xs text-on-surface font-bold mb-3 flex items-center gap-2">
                    <span class="material-symbols-outlined text-base text-accent">stars</span>
                    <span>Key Outcomes & Impact</span>
                </h4>
                <ul class="space-y-2.5 list-none">
                    ${data.highlights.map(h => `<li class="flex gap-3 text-sm text-secondary"><span class="text-accent font-bold mt-0.5 flex-shrink-0">—</span> <span>${h}</span></li>`).join('')}
                </ul>
            </div>
        </div>

        <div class="mt-8 pt-6 border-t border-outline-variant/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <span class="text-xs font-mono uppercase tracking-widest text-secondary/60 flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Live Resources
            </span>
            <div class="flex items-center gap-3">
                <a href="${data.github}" target="_blank" class="inline-flex items-center justify-center gap-2 bg-[#111111] text-white hover:bg-accent px-5 py-2.5 rounded-xl font-label-sm text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-sm hover:shadow">
                    <span class="material-symbols-outlined text-base">code</span>
                    <span>GitHub Repository</span>
                </a>
                <a href="${data.demo}" target="_blank" class="inline-flex items-center justify-center gap-2 border border-outline-variant bg-surface-container-low text-on-surface hover:border-accent hover:text-accent px-5 py-2.5 rounded-xl font-label-sm text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-sm hover:shadow">
                    <span class="material-symbols-outlined text-base">open_in_new</span>
                    <span>Live Demo</span>
                </a>
            </div>
        </div>
    `;
    const modal = document.getElementById('caseStudyModal');
    const box = document.getElementById('modalBox');
    if (modal && box) {
        modal.classList.remove('opacity-0', 'pointer-events-none');
        box.classList.remove('scale-95');
        box.classList.add('scale-100');
    }
}

function closeModal() {
    const modal = document.getElementById('caseStudyModal');
    const box = document.getElementById('modalBox');
    if (modal && box) {
        modal.classList.add('opacity-0', 'pointer-events-none');
        box.classList.add('scale-95');
        box.classList.remove('scale-100');
    }
}

// Close on backdrop click
document.addEventListener('click', (e) => {
    const modal = document.getElementById('caseStudyModal');
    if (e.target === modal) {
        closeModal();
    }
});

/* ==========================================================================
   6. FLOATING BOTTOM DOCK NAVIGATION & SCROLLSPY
   ========================================================================== */
function initBottomDockNavigation() {
    const dockItems = document.querySelectorAll('.dock-item');
    if (!dockItems.length) return;

    const sections = [
        { id: 'top', elem: document.getElementById('top') },
        { id: 'about', elem: document.getElementById('about') },
        { id: 'experience', elem: document.getElementById('experience') },
        { id: 'projects', elem: document.getElementById('projects') },
        { id: 'skills', elem: document.getElementById('skills') },
        { id: 'certifications', elem: document.getElementById('certifications') },
        { id: 'contact', elem: document.getElementById('contact') }
    ];

    function updateActiveDock() {
        const scrollPos = window.scrollY + window.innerHeight / 3;

        let currentSectionId = 'top';
        for (const sec of sections) {
            if (sec.elem) {
                const top = sec.elem.offsetTop;
                const height = sec.elem.offsetHeight;
                if (scrollPos >= top && scrollPos < top + height) {
                    currentSectionId = sec.id;
                }
            }
        }

        dockItems.forEach(item => {
            const itemSec = item.getAttribute('data-section');
            if (itemSec === currentSectionId || (currentSectionId === 'certifications' && itemSec === 'skills')) {
                item.classList.add('active-dock');
            } else {
                item.classList.remove('active-dock');
            }
        });
    }

    window.addEventListener('scroll', updateActiveDock, { passive: true });
    updateActiveDock();
}

