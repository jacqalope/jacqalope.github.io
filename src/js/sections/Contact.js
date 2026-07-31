console.log("Contact.js is successfully loaded!");

import { 
    getEl,
    queryAll,
    appendEl,
    insertAfter
} from '../helpers';

export default class Contact {
    constructor() {
        this.DOM = {};
        this.DOM.contactForm = getEl('#contact-form');
        this.DOM.contactFormFieldEls = queryAll('#contact-form .form__field');
        this.DOM.contactFormSubmitButton = getEl('#contact-form__submit-button');

        this.contactFormInvalidsFieldsList = [];
        this.contactFormData = {
            name: {
                validate: function (val) {
                    return val.trim().length > 0;
                },
                isValid: false,
                label: 'Name',
            },
            email: {
                validate: function (val) {
                    const emailReg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

                    return emailReg.test(val);
                },
                isValid: false,
                label: 'Email',
            },
            message: {
                validate: function (val) {
                    return val.trim().length > 0;
                },
                isValid: false,
                label: 'Message',
            },
        }

        this.init();
    }

    init() {
        // If the contact form isn't present on the page, do nothing.
        if (!this.DOM.contactForm) return;

        this.addListeners();        
    }

    addListeners() {
        this.DOM.contactForm.addEventListener('submit', this.onSubmitContactForm.bind(this));
    }

    onSubmitContactForm(event) {
        event.preventDefault();
        this.clearAllFormErros();
        this.contactFormInvalidsFieldsList = [];
    
        this.DOM.contactFormFieldEls.forEach(input => {
            const fieldName = input.getAttribute('name');
    
            this.contactFormData[fieldName].isValid = this.contactFormData[fieldName].validate(input.value.trim());
    
            if (!this.contactFormData[fieldName].isValid) {
    
                this.showContactFormError(input, input.dataset.errorMessage);
    
                this.contactFormInvalidsFieldsList.push(this.contactFormData[fieldName].label);
            }
        });
    
        if (this.isContactFormValid()) {
            [
                'form__message--visible',
                'form__message--error',
                'form__message--success'
            ].forEach(className => getEl('#form-live-region').classList.remove(className));
            this.sendContactEmail();
        }        
    }

    clearAllFormErros() {
        const liveRegion = getEl('#form-live-region');
        const formErrorMessage = queryAll('.form__error-message');
        const formErrorIcons = queryAll('.form__error-icon');
    
        [
            'form__message--visible',
            'form__message--error',
            'form__message--success'
        ].forEach(className => liveRegion.classList.remove(className));
    
        liveRegion.innerHTML = '';
    
        queryAll('.form__field').forEach(field => {
            field.classList.remove('form__field--error');
            field.setAttribute("aria-invalid", null);
            field.setAttribute("aria-describedby", null);
            field.parentElement.classList.remove("form-group--error");
        });
    
        if (formErrorMessage.length) {
            formErrorMessage.forEach(errorEl => errorEl.remove());
        }
    
        if (formErrorIcons.length) {
            formErrorIcons.forEach(errorIcon => errorIcon.remove());
        }
    }

    showContactFormError(inputEl, errorMessage) {
        const formLiveRegionEl = getEl('#form-live-region');
        const errorEl = `<span id="${inputEl.id}-error" class="form__error-message">${errorMessage}</span>`;
    
        inputEl.classList.add('form__field--error');
        inputEl.setAttribute("aria-invalid", "true");
        insertAfter(inputEl, errorEl);
        inputEl.setAttribute("aria-describedby", inputEl.id + "-error");
        inputEl.parentElement.classList.add("form-group--error");
    
        if (formLiveRegionEl.innerHTML.length == 0) {
            appendEl(formLiveRegionEl, `<p><strong>${formLiveRegionEl.dataset.errorInstruction}:</strong></p>`);
            appendEl(formLiveRegionEl, `<span class="material-icons form__live-region-icon" aria-hidden="true">error</span>`);
            formLiveRegionEl.classList.remove('form__message--success');
            [
                'form__message--visible',
                'form__message--error',
            ].forEach(className => formLiveRegionEl.classList.add(className));
        }
    
        appendEl(formLiveRegionEl, `<a href="#${inputEl.id}">${errorMessage}</a><br>`);
    }   

    isContactFormValid() {
        return this.contactFormInvalidsFieldsList.length === 0;
    }

    // Send via Formspree (client-side). The form element should include a data-formspree-endpoint attribute
    // e.g. <form id="contact-form" data-formspree-endpoint="https://formspree.io/f/yourFormID"> ... </form>
    async sendContactEmail() {
        this.DOM.contactFormSubmitButton.classList.add('button--spinner');

        // collect form values
        const payload = {};
        this.DOM.contactFormFieldEls.forEach(input => {
            payload[input.name] = input.value.trim();
        });

        // get Formspree endpoint from data attribute
        const endpoint = this.DOM.contactForm.dataset.formspreeEndpoint;

        const formLiveRegionEl = getEl('#form-live-region');

        if (!endpoint || endpoint.indexOf('formspree.io') === -1) {
            // helpful error message for missing configuration
            [
                'form__message--visible',
                'form__message--error'
            ].forEach(className => formLiveRegionEl.classList.add(className));

            formLiveRegionEl.innerHTML = "<strong>Formspree endpoint not configured. Add data-formspree-endpoint to the form.</strong>";
            appendEl(formLiveRegionEl, `<span class="material-icons form__live-region-icon" aria-hidden="true">error</span>`);
            this.DOM.contactFormSubmitButton.classList.remove('button--spinner');
            return;
        }

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                [
                    'form__message--visible',
                    'form__message--error'
                ].forEach(className => formLiveRegionEl.classList.add(className));

                // Formspree returns errors array sometimes
                const errorMessage = (data && (data.error || (data.errors && data.errors.map(e => e.message).join(', ')))) || 'Failed to send message';
                formLiveRegionEl.innerHTML = "<strong>" + errorMessage + "</strong>";
                appendEl(formLiveRegionEl, `<span class="material-icons form__live-region-icon" aria-hidden="true">error</span>`);
            } else {
                [
                    'form__message--Visible',
                    'form__message--success'
                ].forEach(className => formLiveRegionEl.classList.add(className));

                formLiveRegionEl.innerHTML = "<strong>" + (data && (data.message || 'Message sent')) + "</strong>";
                appendEl(formLiveRegionEl, `<span class="material-icons form__live-region-icon" aria-hidden="true">check_circle</span>`);

                this.DOM.contactFormFieldEls.forEach(field => field.value = '');
            }
        } catch (err) {
            console.error('Contact submit error:', err);

            [
                'form__message--visible',
                'form__message--error'
            ].forEach(className => formLiveRegionEl.classList.add(className));
            formLiveRegionEl.innerHTML = "<strong>Network error. Try again later.</strong>";
            appendEl(formLiveRegionEl, `<span class="material-icons form__live-region-icon" aria-hidden="true">error</span>`);
        } finally {
            this.DOM.contactFormSubmitButton.classList.remove('button--spinner');
        }
    }
}
