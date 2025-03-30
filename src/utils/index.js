document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove 'active' class from all nav items
            navItems.forEach(navItem => navItem.classList.remove('active'));

            // Add 'active' class to the clicked item
            this.classList.add('active');

            // Here, you would typically load content based on the clicked item
            // For example, you might use the 'data-target' attribute to determine which content to show
            const target = this.dataset.target;
            console.log('Navigating to:', target);

            // In a real application, you might fetch content from the server or update the DOM here
        });
    });
});
