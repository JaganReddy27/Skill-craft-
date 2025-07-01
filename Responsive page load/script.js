window.addEventListener('DOMContentLoaded', () => {
    // Initially hide navbar until welcome screen is interacted with
    document.getElementById('navbar').style.display = 'none';

    
});

const sections = document.querySelectorAll('section');

function showSection(id) {
    // Hide the welcome screen when any section link is clicked or "Get Started" is pressed
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('navbar').style.display = 'flex'; // Ensure navbar is visible

    sections.forEach(sec => sec.classList.remove('active'));
    document.getElementById(id).classList.add('active');

    // Scroll to the top of the section (or just below the navbar)
    window.scrollTo({
        top: 0, // Or document.getElementById('navbar').offsetHeight for below navbar
        behavior: 'smooth'
    });
}

document.addEventListener('submit', function (e) {
    if (e.target.closest('.contact-form')) {
        e.preventDefault();
        // Here you would typically send form data to a server
        alert('Thank you for reaching out! Your message has been sent successfully. We will get back to you shortly.');
        e.target.reset(); // Clear the form fields
    }
});