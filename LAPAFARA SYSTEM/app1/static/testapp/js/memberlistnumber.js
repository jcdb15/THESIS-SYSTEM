document.addEventListener("DOMContentLoaded", function () {
    function updateMemberCount() {
        let tableBody = document.getElementById("memberTableBody");

        if (tableBody) {
            let memberCount = tableBody.getElementsByTagName("tr").length;
            localStorage.setItem("memberCount", memberCount);
        }
    }

    function displayMemberCount() {
        let storedCount = localStorage.getItem("memberCount");
        let memberCountElement = document.getElementById("memberCount");

        if (storedCount && memberCountElement) {
            memberCountElement.textContent = storedCount;
        }
    }

    // Run updateMemberCount when the table updates dynamically
    function observeTableChanges() {
        let tableBody = document.getElementById("memberTableBody");

        if (tableBody) {
            let observer = new MutationObserver(() => {
                updateMemberCount();
            });

            observer.observe(tableBody, { childList: true, subtree: true });
        }
    }

    // Execute on the right pages
    if (document.getElementById("memberTableBody")) {
        updateMemberCount();
        observeTableChanges(); // Start observing for new members
    }

    if (document.getElementById("memberCount")) {
        displayMemberCount();
    }
});
