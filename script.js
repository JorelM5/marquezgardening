// ===================================
// VARIABLES GLOBALES Y CONFIGURACIÓN
// ===================================

const CONFIG = {
    animationDelay: 100,
    scrollOffset: 100,
    debounceDelay: 250,
    mobileBreakpoint: 768,
    whatsappNumber: '15551234567',
    emailJS: {
        serviceID: 'service_marquez',
        templateID: 'template_contact',
        userID: 'user_marquez'
    }
};

// ===================================
// UTILIDADES GENERALES
// ===================================

/**
 * Función debounce para optimizar eventos que se ejecutan frecuentemente
 */
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

/**
 * Función throttle para limitar la frecuencia de ejecución
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Detectar si un elemento está visible en el viewport
 */
function isElementInViewport(el, offset = 0) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 - offset &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Smooth scroll hacia un elemento
 */
function smoothScrollTo(element, offset = 0) {
    const targetPosition = element.offsetTop - offset;
    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
}

/**
 * Mostrar notificación toast
 */
function showToast(message, type = 'success', duration = 5000) {
    // Crear elemento toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Agregar estilos CSS si no existen
    if (!document.querySelector('#toast-styles')) {
        const styles = document.createElement('style');
        styles.id = 'toast-styles';
        styles.textContent = `
            .toast {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-radius: 8px;
                padding: 16px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10000;
                min-width: 300px;
                animation: slideInRight 0.3s ease-out;
                border-left: 4px solid;
            }
            .toast-success { border-left-color: #28a745; }
            .toast-error { border-left-color: #dc3545; }
            .toast-info { border-left-color: #17a2b8; }
            .toast-content { display: flex; align-items: center; gap: 12px; }
            .toast-close { 
                background: none; border: none; cursor: pointer; 
                position: absolute; top: 8px; right: 8px;
                color: #6c757d; font-size: 14px;
            }
            @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        `;
        document.head.appendChild(styles);
    }

    document.body.appendChild(toast);

    // Auto-remove después del tiempo especificado
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.animation = 'slideInRight 0.3s ease-out reverse';
            setTimeout(() => toast.remove(), 300);
        }
    }, duration);
}

// ===================================
// NAVEGACIÓN Y HEADER
// ===================================

class NavigationManager {
    constructor() {
        this.header = document.querySelector('.header');
        this.navbar = document.querySelector('.navbar');
        this.hamburger = document.querySelector('.hamburger');
        this.navMenu = document.querySelector('.nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.lastScrollTop = 0;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.handleActiveSection();
    }

    bindEvents() {
        // Toggle mobile menu
        if (this.hamburger) {
            this.hamburger.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Close mobile menu al hacer click en links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                this.handleNavClick(e);
                this.closeMobileMenu();
            });
        });

        // Scroll effects
        window.addEventListener('scroll', throttle(() => {
            this.handleScroll();
            this.handleActiveSection();
        }, 10));

        // Close mobile menu al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!this.navbar.contains(e.target)) {
                this.closeMobileMenu();
            }
        });

        // Escape key para cerrar menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMobileMenu();
            }
        });
    }

    toggleMobileMenu() {
        this.hamburger.classList.toggle('active');
        this.navMenu.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        if (this.navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    closeMobileMenu() {
        this.hamburger.classList.remove('active');
        this.navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }

    handleNavClick(e) {
        const href = e.target.getAttribute('href');
        
        if (href.startsWith('#')) {
            e.preventDefault();
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerHeight = this.header.offsetHeight;
                smoothScrollTo(targetElement, headerHeight + 20);
            }
        }
    }

    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Header background on scroll
        if (scrollTop > 50) {
            this.header.classList.add('scrolled');
        } else {
            this.header.classList.remove('scrolled');
        }

        // Hide/show header on scroll (optional)
        if (scrollTop > this.lastScrollTop && scrollTop > 200) {
            this.header.style.transform = 'translateY(-100%)';
        } else {
            this.header.style.transform = 'translateY(0)';
        }
        
        this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }

    handleActiveSection() {
        const sections = document.querySelectorAll('section[id]');
        const headerHeight = this.header.offsetHeight;
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top;
            const sectionHeight = rect.height;
            
            if (sectionTop <= headerHeight + 50 && sectionTop + sectionHeight > headerHeight + 50) {
                // Remove active class from all links
                this.navLinks.forEach(link => link.classList.remove('active'));
                
                // Add active class to current section link
                const activeLink = document.querySelector(`.nav-link[href="#${section.id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }
}

// ===================================
// ANIMACIONES EN SCROLL
// ===================================

class ScrollAnimationManager {
    constructor() {
        this.elements = document.querySelectorAll('[data-animate]');
        this.observer = null;
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.observeElements();
    }

    setupIntersectionObserver() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                }
            });
        }, options);
    }

    observeElements() {
        // Auto-add animation attributes to common elements
        const autoAnimateSelectors = [
            '.service-card',
            '.testimonial-card',
            '.gallery-item',
            '.about-feature',
            '.contact-method'
        ];

        autoAnimateSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach((el, index) => {
                if (!el.hasAttribute('data-animate')) {
                    el.setAttribute('data-animate', 'fadeInUp');
                    el.style.transitionDelay = `${index * 100}ms`;
                }
            });
        });

        // Observe all elements with animation data
        document.querySelectorAll('[data-animate]').forEach(el => {
            el.classList.add('animate-on-scroll');
            this.observer.observe(el);
        });
    }

    animateElement(element) {
        const animationType = element.getAttribute('data-animate') || 'fadeInUp';
        element.classList.add('animate', animationType);
        this.observer.unobserve(element);
    }
}

// ===================================
// FORMULARIO DE CONTACTO
// ===================================

class ContactFormManager {
    constructor() {
        this.form = document.querySelector('.contact form');
        this.submitButton = null;
        this.originalButtonText = '';
        
        if (this.form) {
            this.init();
        }
    }

    init() {
        this.submitButton = this.form.querySelector('button[type="submit"]');
        this.originalButtonText = this.submitButton.textContent;
        
        this.bindEvents();
        this.setupValidation();
    }

    bindEvents() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Real-time validation
        const inputs = this.form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    setupValidation() {
        // Add required attribute to fields that need it
        const requiredFields = ['name', 'email', 'phone', 'service', 'message'];
        requiredFields.forEach(fieldName => {
            const field = this.form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                field.setAttribute('required', '');
            }
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';

        // Remove previous errors
        this.clearFieldError(field);

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'Este campo es obligatorio';
        }

        // Email validation
        if (fieldName === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Por favor ingresa un email válido';
            }
        }

        // Phone validation
        if (fieldName === 'phone' && value) {
            const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
            if (!phoneRegex.test(value)) {
                isValid = false;
                errorMessage = 'Por favor ingresa un teléfono válido';
            }
        }

        // Name validation
        if (fieldName === 'name' && value && value.length < 2) {
            isValid = false;
            errorMessage = 'El nombre debe tener al menos 2 caracteres';
        }

        // Message validation
        if (fieldName === 'message' && value && value.length < 10) {
            isValid = false;
            errorMessage = 'El mensaje debe tener al menos 10 caracteres';
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    showFieldError(field, message) {
        const formGroup = field.closest('.form-group');
        formGroup.classList.add('error');
        
        // Remove existing error message
        const existingError = formGroup.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Add new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        formGroup.appendChild(errorDiv);
    }

    clearFieldError(field) {
        const formGroup = field.closest('.form-group');
        formGroup.classList.remove('error');
        
        const errorMessage = formGroup.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        // Validate all fields
        const inputs = this.form.querySelectorAll('input, textarea, select');
        let isFormValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            showToast('Por favor corrige los errores en el formulario', 'error');
            return;
        }

        // Show loading state
        this.setLoadingState(true);

        try {
            // Collect form data
            const formData = new FormData(this.form);
            const data = Object.fromEntries(formData);

            // Here you would normally send to your backend
            // For demo purposes, we'll simulate an API call
            await this.simulateFormSubmission(data);

            // Success
            this.handleSubmissionSuccess();
            
        } catch (error) {
            console.error('Error submitting form:', error);
            this.handleSubmissionError();
        } finally {
            this.setLoadingState(false);
        }
    }

    async simulateFormSubmission(data) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // For demo purposes, let's say it always succeeds
        // In real implementation, replace this with actual API call
        console.log('Form data:', data);
        
        // Example of actual implementation:
        // const response = await fetch('/api/contact', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(data)
        // });
        // if (!response.ok) throw new Error('Network error');
        // return response.json();
    }

    setLoadingState(loading) {
        if (loading) {
            this.submitButton.disabled = true;
            this.submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        } else {
            this.submitButton.disabled = false;
            this.submitButton.textContent = this.originalButtonText;
        }
    }

    handleSubmissionSuccess() {
        showToast('¡Mensaje enviado exitosamente! Te contactaremos pronto.', 'success');
        this.form.reset();
        
        // Clear any remaining errors
        const formGroups = this.form.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            group.classList.remove('error', 'success');
            const errorMsg = group.querySelector('.error-message');
            if (errorMsg) errorMsg.remove();
        });
    }

    handleSubmissionError() {
        showToast('Hubo un error al enviar el mensaje. Por favor intenta nuevamente.', 'error');
    }
}

// ===================================
// GALERÍA DE IMÁGENES
// ===================================

class GalleryManager {
    constructor() {
        this.galleryItems = document.querySelectorAll('.gallery-item');
        this.modal = null;
        this.currentIndex = 0;
        this.images = [];
        
        if (this.galleryItems.length > 0) {
            this.init();
        }
    }

    init() {
        this.collectImages();
        this.bindEvents();
        this.createModal();
    }

    collectImages() {
        this.images = Array.from(this.galleryItems).map(item => {
            const img = item.querySelector('img');
            const overlay = item.querySelector('.gallery-overlay');
            return {
                src: img.src,
                alt: img.alt,
                title: overlay ? overlay.querySelector('h4')?.textContent || '' : '',
                description: overlay ? overlay.querySelector('p')?.textContent || '' : ''
            };
        });
    }

    bindEvents() {
        this.galleryItems.forEach((item, index) => {
            item.addEventListener('click', () => this.openModal(index));
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.openModal(index);
                }
            });
            // Make gallery items focusable
            item.setAttribute('tabindex', '0');
            item.setAttribute('role', 'button');
            item.setAttribute('aria-label', `Ver imagen: ${this.images[index].title}`);
        });
    }

    createModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'gallery-modal';
        this.modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <button class="modal-close" aria-label="Cerrar galería">
                    <i class="fas fa-times"></i>
                </button>
                <button class="modal-prev" aria-label="Imagen anterior">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <button class="modal-next" aria-label="Siguiente imagen">
                    <i class="fas fa-chevron-right"></i>
                </button>
                <div class="modal-image-container">
                    <img class="modal-image" src="" alt="" />
                    <div class="modal-loader">
                        <i class="fas fa-spinner fa-spin"></i>
                    </div>
                </div>
                <div class="modal-info">
                    <h3 class="modal-title"></h3>
                    <p class="modal-description"></p>
                    <div class="modal-counter">
                        <span class="current-index"></span> / <span class="total-images"></span>
                    </div>
                </div>
            </div>
        `;

        // Add modal styles
        const modalStyles = document.createElement('style');
        modalStyles.textContent = `
            .gallery-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: none;
                align-items: center;
                justify-content: center;
            }
            .modal-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                backdrop-filter: blur(5px);
            }
            .modal-content {
                position: relative;
                max-width: 90vw;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
            }
            .modal-close {
                position: absolute;
                top: 15px;
                right: 15px;
                background: rgba(0, 0, 0, 0.7);
                color: white;
                border: none;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                cursor: pointer;
                z-index: 10;
                transition: background 0.3s;
            }
            .modal-close:hover { background: rgba(0, 0, 0, 0.9); }
            .modal-prev, .modal-next {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                background: rgba(0, 0, 0, 0.7);
                color: white;
                border: none;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                cursor: pointer;
                z-index: 10;
                transition: all 0.3s;
                font-size: 18px;
            }
            .modal-prev {
                left: 15px;
            }
            .modal-next {
                right: 15px;
            }
            .modal-prev:hover, .modal-next:hover {
                background: rgba(0, 0, 0, 0.9);
                transform: translateY(-50%) scale(1.1);
            }
            .modal-image-container {
                position: relative;
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 400px;
                background: #f8f9fa;
            }
            .modal-image {
                max-width: 100%;
                max-height: 70vh;
                object-fit: contain;
                border-radius: 8px;
            }
            .modal-loader {
                position: absolute;
                font-size: 24px;
                color: var(--primary-color);
            }
            .modal-info {
                padding: 20px;
                text-align: center;
                border-top: 1px solid #e9ecef;
            }
            .modal-title {
                margin: 0 0 10px 0;
                color: var(--primary-dark);
                font-size: 18px;
            }
            .modal-description {
                margin: 0 0 15px 0;
                color: var(--gray);
                line-height: 1.5;
            }
            .modal-counter {
                font-size: 14px;
                color: var(--gray);
                font-weight: 500;
            }
            @media (max-width: 768px) {
                .modal-content { max-width: 95vw; max-height: 95vh; }
                .modal-prev, .modal-next { width: 40px; height: 40px; font-size: 16px; }
                .modal-close { width: 35px; height: 35px; }
                .modal-info { padding: 15px; }
            }
        `;
        document.head.appendChild(modalStyles);
        document.body.appendChild(this.modal);

        // Bind modal events
        this.modal.querySelector('.modal-close').addEventListener('click', () => this.closeModal());
        this.modal.querySelector('.modal-backdrop').addEventListener('click', () => this.closeModal());
        this.modal.querySelector('.modal-prev').addEventListener('click', () => this.previousImage());
        this.modal.querySelector('.modal-next').addEventListener('click', () => this.nextImage());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.modal.style.display === 'flex') {
                switch (e.key) {
                    case 'Escape':
                        this.closeModal();
                        break;
                    case 'ArrowLeft':
                        this.previousImage();
                        break;
                    case 'ArrowRight':
                        this.nextImage();
                        break;
                }
            }
        });
    }

    openModal(index) {
        this.currentIndex = index;
        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        this.loadImage();
        this.updateInfo();
    }

    closeModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    loadImage() {
        const modalImage = this.modal.querySelector('.modal-image');
        const loader = this.modal.querySelector('.modal-loader');
        const currentImage = this.images[this.currentIndex];

        loader.style.display = 'block';
        modalImage.style.display = 'none';

        modalImage.onload = () => {
            loader.style.display = 'none';
            modalImage.style.display = 'block';
        };

        modalImage.src = currentImage.src;
        modalImage.alt = currentImage.alt;
    }

    updateInfo() {
        const currentImage = this.images[this.currentIndex];
        this.modal.querySelector('.modal-title').textContent = currentImage.title;
        this.modal.querySelector('.modal-description').textContent = currentImage.description;
        this.modal.querySelector('.current-index').textContent = this.currentIndex + 1;
        this.modal.querySelector('.total-images').textContent = this.images.length;
    }

    previousImage() {
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.loadImage();
        this.updateInfo();
    }

    nextImage() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.loadImage();
        this.updateInfo();
    }
}

// ===================================
// BOTÓN BACK TO TOP
// ===================================

class BackToTopManager {
    constructor() {
        this.button = document.getElementById('backToTop');
        if (this.button) {
            this.init();
        }
    }

    init() {
        this.bindEvents();
        this.handleScroll();
    }

    bindEvents() {
        this.button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        window.addEventListener('scroll', throttle(() => {
            this.handleScroll();
        }, 100));
    }

    handleScroll() {
        if (window.pageYOffset > 300) {
            this.button.classList.add('show');
        } else {
            this.button.classList.remove('show');
        }
    }
}

// ===================================
// LAZY LOADING DE IMÁGENES
// ===================================

class LazyLoadManager {
    constructor() {
        this.images = document.querySelectorAll('img[data-src]');
        this.observer = null;
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                    }
                });
            }, {
                rootMargin: '50px'
            });

            this.images.forEach(img => this.observer.observe(img));
        } else {
            // Fallback para navegadores sin soporte
            this.images.forEach(img => this.loadImage(img));
        }
    }

    loadImage(img) {
        img.src = img.dataset.src;
        img.classList.add('loaded');
        
        img.onload = () => {
            img.classList.add('fade-in');
        };

        if (this.observer) {
            this.observer.unobserve(img);
        }
    }
}

// ===================================
// CONTADOR ANIMADO
// ===================================

class CounterManager {
    constructor() {
        this.counters = document.querySelectorAll('.stat-number');
        this.observer = null;
        this.init();
    }

    init() {
        if (this.counters.length === 0) return;

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                }
            });
        }, { threshold: 0.5 });

        this.counters.forEach(counter => this.observer.observe(counter));
    }

    animateCounter(counter) {
        const target = parseInt(counter.textContent.replace(/\D/g, ''));
        const duration = 2000; // 2 segundos
        const increment = target / (duration / 16); // 60fps
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }

            // Formatear el número
            const formatted = Math.floor(current).toLocaleString();
            const originalText = counter.textContent;
            const suffix = originalText.replace(/[\d,]/g, '');
            counter.textContent = formatted + suffix;
        }, 16);

        this.observer.unobserve(counter);
    }
}

// ===================================
// GESTOR DE RENDIMIENTO
// ===================================

class PerformanceManager {
    constructor() {
        this.init();
    }

    init() {
        this.optimizeImages();
        this.preloadCriticalResources();
        this.setupServiceWorker();
    }

    optimizeImages() {
        // Lazy loading para imágenes sin data-src
        const images = document.querySelectorAll('img:not([data-src])');
        images.forEach(img => {
            if (!img.complete) {
                img.loading = 'lazy';
            }
        });
    }

    preloadCriticalResources() {
        // Precargar recursos críticos
        const criticalResources = [
            'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            link.as = 'style';
            document.head.appendChild(link);
        });
    }

    setupServiceWorker() {
        // Registrar Service Worker para cache
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('SW registered: ', registration);
                    })
                    .catch(registrationError => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }
    }
}

// ===================================
// ANALYTICS Y TRACKING
// ===================================

class AnalyticsManager {
    constructor() {
        this.init();
    }

    init() {
        this.trackPageView();
        this.setupEventTracking();
    }

    trackPageView() {
        // Google Analytics 4 (reemplazar con tu ID)
        if (typeof gtag !== 'undefined') {
            gtag('config', 'GA_MEASUREMENT_ID', {
                page_title: document.title,
                page_location: window.location.href
            });
        }
    }

    setupEventTracking() {
        // Track form submissions
        const contactForm = document.querySelector('.contact form');
        if (contactForm) {
            contactForm.addEventListener('submit', () => {
                this.trackEvent('form_submit', 'contact', 'contact_form');
            });
        }

        // Track WhatsApp clicks
        const whatsappButton = document.querySelector('.whatsapp-float');
        if (whatsappButton) {
            whatsappButton.addEventListener('click', () => {
                this.trackEvent('click', 'whatsapp', 'floating_button');
            });
        }

        // Track service card clicks
        const serviceCards = document.querySelectorAll('.service-card');
        serviceCards.forEach((card, index) => {
            card.addEventListener('click', () => {
                const serviceName = card.querySelector('h3').textContent;
                this.trackEvent('click', 'service_card', serviceName);
            });
        });

        // Track social media clicks
        const socialLinks = document.querySelectorAll('.social-links a, .footer-social a');
        socialLinks.forEach(link => {
            link.addEventListener('click', () => {
                const platform = this.getSocialPlatform(link.href);
                this.trackEvent('click', 'social_media', platform);
            });
        });
    }

    trackEvent(action, category, label) {
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: category,
                event_label: label
            });
        }
        
        // También puedes enviar a otros analytics
        console.log('Event tracked:', { action, category, label });
    }

    getSocialPlatform(url) {
        if (url.includes('facebook')) return 'facebook';
        if (url.includes('instagram')) return 'instagram';
        if (url.includes('youtube')) return 'youtube';
        if (url.includes('whatsapp')) return 'whatsapp';
        return 'unknown';
    }
}

// ===================================
// GESTOR DE TESTIMONIOS
// ===================================

class TestimonialsManager {
    constructor() {
        this.container = document.querySelector('.testimonials-grid');
        this.testimonials = [];
        this.currentIndex = 0;
        this.autoRotate = true;
        this.rotateInterval = null;
        
        if (this.container) {
            this.init();
        }
    }

    init() {
        this.collectTestimonials();
        this.setupAutoRotation();
        this.bindEvents();
    }

    collectTestimonials() {
        const testimonialCards = this.container.querySelectorAll('.testimonial-card');
        this.testimonials = Array.from(testimonialCards);
    }

    setupAutoRotation() {
        if (this.testimonials.length > 3) {
            this.startAutoRotation();
        }
    }

    startAutoRotation() {
        this.rotateInterval = setInterval(() => {
            if (this.autoRotate) {
                this.rotateTestimonials();
            }
        }, 5000);
    }

    stopAutoRotation() {
        if (this.rotateInterval) {
            clearInterval(this.rotateInterval);
        }
    }

    bindEvents() {
        // Pausar rotación al hacer hover
        this.container.addEventListener('mouseenter', () => {
            this.autoRotate = false;
        });

        this.container.addEventListener('mouseleave', () => {
            this.autoRotate = true;
        });
    }

    rotateTestimonials() {
        // Implementar rotación suave de testimonios
        // Esta es una implementación básica
        this.testimonials.forEach((testimonial, index) => {
            testimonial.style.opacity = index < 3 ? '1' : '0.3';
        });
    }
}

// ===================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ===================================

class MarquezGardeningApp {
    constructor() {
        this.managers = {};
        this.init();
    }

    init() {
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeManagers());
        } else {
            this.initializeManagers();
        }
    }

    initializeManagers() {
        try {
            // Inicializar todos los gestores
            this.managers.navigation = new NavigationManager();
            this.managers.scrollAnimation = new ScrollAnimationManager();
            this.managers.contactForm = new ContactFormManager();
            this.managers.gallery = new GalleryManager();
            this.managers.backToTop = new BackToTopManager();
            this.managers.lazyLoad = new LazyLoadManager();
            this.managers.counter = new CounterManager();
            this.managers.performance = new PerformanceManager();
            this.managers.analytics = new AnalyticsManager();
            this.managers.testimonials = new TestimonialsManager();

            // Configurar eventos globales
            this.setupGlobalEvents();
            
            console.log('Marquez Gardening website initialized successfully');
        } catch (error) {
            console.error('Error initializing website:', error);
        }
    }

    setupGlobalEvents() {
        // Error handling global
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
        });

        // Handle offline/online events
        window.addEventListener('online', () => {
            showToast('Conexión restaurada', 'success', 3000);
        });

        window.addEventListener('offline', () => {
            showToast('Sin conexión a internet', 'info', 5000);
        });

        // Performance monitoring
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'largest-contentful-paint') {
                        console.log('LCP:', entry.startTime);
                    }
                }
            });
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        }
    }
}

// ===================================
// INICIALIZAR LA APLICACIÓN
// ===================================

// Inicializar la aplicación
const app = new MarquezGardeningApp();

// Exportar para uso en otros scripts si es necesario
window.MarquezGardening = {
    app,
    showToast,
    smoothScrollTo
};
