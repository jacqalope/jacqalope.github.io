const form = document.querySelector('#contact-form');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const payload = {
      name: formData.get('Name') || '',
      email: formData.get('Email') || '',
      subject: formData.get('Subject') || 'Website contact',
      message: formData.get('Message') || '',
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
      const resp = await fetch('/.netlify/functions/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const body = await resp.json();

      if (resp.ok) {
        // replace with your UI success experience
        alert('Thanks for your message, I will try to respond as soon as possible!');
        form.reset();
      } else {
        console.error('Contact error', body);
        alert('Failed to send message. Please try again later.');
      }
    } catch (err) {
      console.error('Network error:', err);
      alert('Network error — please try again later.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send';
    }
  });
}