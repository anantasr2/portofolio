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
    initRoleTypewriter();
    initExperienceHorizontalScroll();
    initProjectsFastSnap();
});

/* ==========================================================================
   1. DYNAMIC ROLE TYPEWRITER ANIMATION
   ========================================================================== */
function initRoleTypewriter() {
    const roles = [
        "Machine Learning Engineer",
        "Data Engineer",
        "Data Analyst",
        "Business Intelligence",
        "Business Research"
    ];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typingElement = document.getElementById("dynamic-role-text");

    if (!typingElement) return;

    function typeRole() {
        const currentRole = roles[roleIndex];
        if (isDeleting) {
            typingElement.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingElement.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
        }

        let typeSpeed = isDeleting ? 40 : 80;

        if (!isDeleting && charIndex === currentRole.length) {
            typeSpeed = 1800; // Pause when word is completely typed
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typeSpeed = 350; // Pause before starting next word
        }

        setTimeout(typeRole, typeSpeed);
    }

    setTimeout(typeRole, 500);
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

        // Trigger subtle page-turn animation on the target slide border box
        const slideBorder = projectCards[idx].querySelector('.project-slide-border');
        if (slideBorder) {
            slideBorder.classList.remove('animate-page-turn-next', 'animate-page-turn-prev');
            void slideBorder.offsetWidth; // Force reflow
            slideBorder.classList.add(direction === 'next' ? 'animate-page-turn-next' : 'animate-page-turn-prev');
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
        title: "LightRetina-XAI / TilikMata",
        subtitle: "Explainable AI (XAI) Framework for Medical Diagnostic Imaging",
        tech: ["Python", "PyTorch", "Grad-CAM", "XAI", "FastAPI", "React"],
        github: "https://github.com/anantasr",
        demo: "https://github.com/anantasr",
        description: "LightRetina-XAI provides transparent, interpretable deep learning models tailored for retinal fundus photography analysis. Built with Grad-CAM saliency mapping and decision confidence scoring to enable trusted AI-assisted clinical diagnosis.",
        highlights: [
            "Achieved 96.4% diagnostic accuracy across multi-class retinal condition datasets.",
            "Implemented real-time visual heatmaps for clinical decision explanation.",
            "Designed low-latency inference pipeline optimized for edge deployments."
        ]
    },
    jordan: {
        title: "Jordan Citra Niaga",
        subtitle: "Enterprise Data Integration & Inventory Analytics System",
        tech: ["SQL", "ETL", "Python", "Dashboard", "PostgreSQL", "Tailwind CSS"],
        github: "https://github.com/anantasr",
        demo: "https://github.com/anantasr",
        description: "An end-to-end data pipeline and intelligence portal consolidating multi-branch supply chain records, inventory movements, and automated daily reconciliations.",
        highlights: [
            "Automated 100% daily transaction and inventory reconciliation.",
            "Reduced manual reporting turnarounds from 4 hours to real-time dashboards.",
            "Developed proactive threshold alerting for low-stock and dead-stock management."
        ]
    },
    panganet: {
        title: "PANGANET",
        subtitle: "Predictive Analytics Platform for Food Security & Supply Forecasting",
        tech: ["Machine Learning", "Time-Series Forecasting", "React", "Python", "FastAPI"],
        github: "https://github.com/anantasr",
        demo: "https://github.com/anantasr",
        description: "A data intelligence platform for regional commodity pricing and food distribution forecasting, using ARIMA/XGBoost models to assist local governance decision making.",
        highlights: [
            "15% improvement in commodity price volatility prediction accuracy.",
            "Interactive regional heatmap for supply deficit and surplus identification.",
            "Adopted for analytical pilot studies in agricultural strategic planning."
        ]
    },
    aerovision: {
        title: "AeroVision AI",
        subtitle: "UAV Aerial Computer Vision & Edge Agricultural Analytics",
        tech: ["YOLOv8", "Computer Vision", "Python", "OpenCV", "TensorRT", "Edge AI"],
        github: "https://github.com/anantasr",
        demo: "https://github.com/anantasr",
        description: "Aerial autonomous computer vision platform mounted on agricultural drones to perform high-resolution pest detection, canopy segmentation, and automated crop stress mapping.",
        highlights: [
            "Real-time object detection reaching 45 FPS on NVIDIA Jetson edge devices.",
            "Accurate early blight and disease identification across 50+ hectares of field crops.",
            "Automated GPS-tagged geo-spatial health overlays for precision agriculture."
        ]
    },
    smartgov: {
        title: "SmartGov Regional BI Portal",
        subtitle: "Municipal Socio-Economic Big Data Dashboard",
        tech: ["Power BI", "SQL Server", "Geospatial GIS", "DAX", "ETL Pipelines"],
        github: "https://github.com/anantasr",
        demo: "https://github.com/anantasr",
        description: "Centralized analytical command center unifying municipal socio-economic indicators, regional budget allocations, and poverty rate trajectories across 27 administrative sub-districts.",
        highlights: [
            "Consolidated over 15 disparate departmental data sources into a unified analytical warehouse.",
            "Enabled drill-down geospatial demographic clustering for data-driven municipal budget planning.",
            "Adopted by regional stakeholders for quarterly socio-economic policy briefings."
        ]
    },
    neuropulse: {
        title: "NeuroPulse EEG AI Analyzer",
        subtitle: "Deep Neural Network for Electroencephalogram Waveform Diagnosis",
        tech: ["Deep Learning", "Signal Processing", "PyTorch", "MNE-Python", "Transformers"],
        github: "https://github.com/anantasr",
        demo: "https://github.com/anantasr",
        description: "Biomedical neural network architecture combining spatial convolutional layers and temporal Transformers for automated feature extraction from multichannel brainwave signals.",
        highlights: [
            "94.8% classification sensitivity on seizure detection and sleep staging benchmarks.",
            "Automated wave filtering and artifact removal utilizing Wavelet transforms.",
            "Interactive doctor console for signal annotation and confidence metric reviews."
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

