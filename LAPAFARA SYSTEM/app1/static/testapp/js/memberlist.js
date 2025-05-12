//FUNCTION OF LISTING MEMBER.HTML START
document.addEventListener("DOMContentLoaded", function () {
    const memberForm = document.getElementById("memberForm");
    const memberTableBody = document.getElementById("memberTableBody");



    // Load members from the backend (instead of localStorage)
        function loadMembers() {
            fetch('/api/members/')  // Make sure this URL points to an API endpoint that returns the list of members
                .then(response => response.json())
                .then(members => {
                    memberTableBody.innerHTML = "";
                    members.forEach((member, index) => {
                        const row = `
                            <tr>
                                <td><img src="${member.photo}" alt="Member Photo" class="member-photo" width="50"></td>
                                <td>${member.first_name} ${member.middle_name} ${member.last_name}</td>
                                <td>${member.gender}</td>
                                <td>${member.birth_date}</td>
                                <td>${member.address}</td>
                                <td>${member.email}</td>
                                <td>${member.contact_number}</td>
                                <td>${member.employment_date}</td>
                                <td>
                                    <button onclick="editMember(${index})" class="edit-btn">Edit</button>
                                    <button onclick="deleteMember(${index})" class="delete-btn">Delete</button>
                                </td>
                            </tr>`;
                        memberTableBody.innerHTML += row;
                    });
                })
                .catch(error => console.error("Error loading members:", error));
        }

    function addMember(event) {
        event.preventDefault();
    
        const firstName = document.getElementById("first-name").value;
        const middleName = document.getElementById("middle-name").value;
        const lastName = document.getElementById("last-name").value;
        const gender = document.getElementById("gender").value;
        const birthDate = document.getElementById("birth-date").value;
        const address = document.getElementById("address").value;
        const email = document.getElementById("email").value;
        const contactNumber = document.getElementById("contact-number").value;
        const employmentDate = document.getElementById("employment-date").value;
        const photoUpload = document.getElementById("photo-upload");
    
        const formData = new FormData();
        formData.append('first_name', firstName);
        formData.append('middle_name', middleName);
        formData.append('last_name', lastName);
        formData.append('gender', gender);
        formData.append('birth_date', birthDate);
        formData.append('address', address);
        formData.append('email', email);
        formData.append('contact_number', contactNumber);
        formData.append('employment_date', employmentDate);
        
        if (photoUpload.files[0]) {
            formData.append('photo', photoUpload.files[0]);
        }
    
        // Sending the data to Django via AJAX
        fetch('/add_member/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value // CSRF token for security
            }
        })
        .then(response => response.json()) // Assuming your Django view returns a JSON response
        .then(data => {
            if (data.success) {
                alert("Member added successfully!");
                document.getElementById("memberForm").reset(); // Reset form after successful submission
                loadMembers(); // Reload members from localStorage if needed
            } else {
                alert("Error adding member: " + data.message);
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("There was an error submitting the form.");
        });
    }
    
    //delete member
    window.deleteMember = function (index) {
        let members = JSON.parse(localStorage.getItem("members")) || [];
        members.splice(index, 1);
        localStorage.setItem("members", JSON.stringify(members));
        loadMembers();
    };

    if (memberForm) {
        memberForm.addEventListener("submit", addMember);
    }
    loadMembers();

    // Function to edit a member (redirect to member.html)
    window.editMember = function (index) {
        console.log("Edit button clicked for member index:", index);
        localStorage.setItem("editIndex", index);
        window.location.href = "/member/";
    };

    // Load members when the page is loaded
    loadMembers();
});
//FUNCTION OF LISTING MEMBER.HTML END


//SEARCH BAR START
function searchMembers() {
    let input = document.getElementById("searchInput").value.toLowerCase();
    let members = JSON.parse(localStorage.getItem("members")) || [];
    let memberTableBody = document.getElementById("memberTableBody");

    memberTableBody.innerHTML = ""; // Clear the table before updating

    members.forEach((member, index) => {
        let fullName = `${member.firstName} ${member.middleName} ${member.lastName}`.toLowerCase();
        if (fullName.includes(input)) {
            const row = `<tr>
                <td><img src="${member.photo}" alt="Member Photo" class="member-photo" width="50"></td>
                <td>${member.firstName} ${member.middleName} ${member.lastName}</td>
                <td>${member.gender}</td>
                <td>${member.birthDate}</td>
                <td>${member.address}</td>
                <td>${member.email}</td>
                <td>${member.contactNumber}</td>
                <td>${member.employmentDate}</td>
                <td><button onclick="editMember(${index})">Edit</button></td>
                <td><button onclick="deleteMember(${index})">Delete</button></td>
            </tr>`;
            memberTableBody.innerHTML += row;
        }
    });
}

//SEARCH BAR END

//DOWNLOAD EXCEL 
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("downloadExcelBtn").addEventListener("click", downloadExcel);
});

function downloadExcel() {
    let members = JSON.parse(localStorage.getItem("members")) || [];

    if (members.length === 0) {
        alert("No members available to download.");
        return;
    }

    let data = members.map(member => ({
        "First Name": member.firstName,
        "Middle Name": member.middleName,
        "Last Name": member.lastName,
        "Gender": member.gender,
        "Birth Date": member.birthDate,
        "Address": member.address,
        "Email": member.email,
        "Contact Number": member.contactNumber,
        "Employment Date": member.employmentDate
    }));

    // Convert JSON data to a worksheet
    let worksheet = XLSX.utils.json_to_sheet(data);
    let workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Members");

    // Save the file
    XLSX.writeFile(workbook, "MemberList.xlsx");
}

//EDIT
window.editMember = function (index) {
    localStorage.setItem("editIndex", index); // Store the index in localStorage
    window.location.href = "member.html"; // Redirect to the member editing page
};

//EDIT END


function showNotification(message) {
    const container = document.getElementById('showpop');
    const notification = document.createElement('div');
    notification.classList.add('not');
    notification.textContent = message;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => notification.remove(), 500);
    }, 1000);
}