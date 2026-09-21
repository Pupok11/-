(function() {
    'use strict';

    function initForm() {
        const form = document.getElementById('contact-form');
        const success = document.getElementById('form-success');
        const successTimer = document.getElementById('success-timer');
        if (!form || !success) return;

        function validateField(field) {
            const value = field.value.trim();
            const type = field.type;
            if (field.required && !value) { field.classList.add('has-error'); return false; }
            if (type === 'email' && value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) { field.classList.add('has-error'); return false; }
            }
            if (type === 'tel' && value) {
                const phoneRegex = /^[\d\s\+\-\(\)]{7,}$/;
                if (!phoneRegex.test(value)) { field.classList.add('has-error'); return false; }
            }
            field.classList.remove('has-error');
            return true;
        }

        form.querySelectorAll('input, textarea, select').forEach(field => {
            field.addEventListener('input', () => field.classList.remove('has-error'));
            field.addEventListener('blur', () => { if (field.value.trim()) validateField(field); });
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            let isValid = true;
            form.querySelectorAll('input[required], textarea[required]').forEach(field => {
                if (!validateField(field)) isValid = false;
            });
            if (!isValid) {
                form.style.animation = 'shake 0.4s';
                setTimeout(() => { form.style.animation = ''; }, 400);
                return;
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.querySelector('.btn__text')?.textContent || 'Отправить';
            const btnText = submitBtn.querySelector('.btn__text');
            const btnArrow = submitBtn.querySelector('.arrow');
            if (btnText) btnText.textContent = 'Отправка...';
            if (btnArrow) btnArrow.textContent = '○';
            submitBtn.classList.add('is-loading');
            submitBtn.disabled = true;

            setTimeout(() => {
                form.style.opacity = '0';
                form.style.transform = 'translateY(-20px)';
                setTimeout(() => {
                    form.style.display = 'none';
                    success.classList.add('is-visible');
                    if (btnText) btnText.textContent = originalText;
                    if (btnArrow) btnArrow.textContent = '→';
                    submitBtn.classList.remove('is-loading');
                    submitBtn.disabled = false;
                    let count = 8;
                    if (successTimer) successTimer.textContent = count;
                    const interval = setInterval(() => {
                        count--;
                        if (successTimer) successTimer.textContent = count;
                        if (count <= 0) {
                            clearInterval(interval);
                            success.classList.remove('is-visible');
                            setTimeout(() => {
                                form.style.display = 'block';
                                form.style.opacity = '1';
                                form.style.transform = 'translateY(0)';
                                form.reset();
                            }, 400);
                        }
                    }, 1000);
                    window.dispatchEvent(new CustomEvent('formSuccess'));
                }, 500);
            }, 1200);
        });

        if (!document.getElementById('shake-keyframes')) {
            const style = document.createElement('style');
            style.id = 'shake-keyframes';
            style.textContent = `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    20% { transform: translateX(-8px); }
                    40% { transform: translateX(8px); }
                    60% { transform: translateX(-5px); }
                    80% { transform: translateX(5px); }
                }
                .has-error { border-bottom-color: #D44A3A !important; }
            `;
            document.head.appendChild(style);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initForm);
    } else {
        initForm();
    }
})();