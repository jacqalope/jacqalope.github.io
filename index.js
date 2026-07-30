import Contact from './sections/Contact';
import "normalize.css";
import "./scss/main.ltr.scss";
import "./scss/themes.scss";
import "./scss/purple.scss";
import "./scss/custom.scss";

import imagesLoaded from "imagesloaded";

import SiteState from './js/SiteState';
import Site from './js/Site';

document.addEventListener('DOMContentLoaded', () => {
    // ... any other classes you are initializing ...
    
    // Initialize the contact form logic only if the form exists on the page
    if (document.querySelector('#contact-form')) {
        new Contact();
    }
});

imagesLoaded('.preloadimage', function() {    
    const siteState = new SiteState();
    new Site(siteState);
});
