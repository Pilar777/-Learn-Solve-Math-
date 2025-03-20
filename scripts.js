function toggleMenu() {
    const menuDropdown = document.getElementById("menuDropdown");
    if (menuDropdown.style.display === "block") {
        menuDropdown.style.display = "none";
    } else {
        menuDropdown.style.display = "block";
    }
}

// Close the dropdown if the user clicks outside of it
window.onclick = function (event) {
    if (!event.target.matches('.menu-dots')) {
        const menuDropdown = document.getElementById("menuDropdown");
        if (menuDropdown.style.display === "block") {
            menuDropdown.style.display = "none";
        }
    }
};