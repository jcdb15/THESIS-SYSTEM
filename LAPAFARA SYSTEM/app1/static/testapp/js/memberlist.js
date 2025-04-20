//FUNCTION OF LISTING MEMBER.HTML START
document.addEventListener("DOMContentLoaded", function () {
    const memberForm = document.getElementById("memberForm");
    const memberTableBody = document.getElementById("memberTableBody");



    function loadMembers() {
        let members = JSON.parse(localStorage.getItem("members")) || [];
        memberTableBody.innerHTML = "";
        members.forEach((member, index) => {
            const row = `<tr>
                <td><img src="${member.photo}" alt="Member Photo" class="member-photo" width="50"></td>
                <td>${member.firstName} ${member.middleName} ${member.lastName}</td>
                <td>${member.gender}</td>
                <td>${member.birthDate}</td>
                <td>${member.address}</td>
                <td>${member.email}</td>
                <td>${member.contactNumber}</td>
                <td>${member.employmentDate}</td>
                <td>
                    <button onclick="editMember(${index})" class="edit-btn">Edit</button>
                    <button onclick="deleteMember(${index})" class="delete-btn">Delete</button>
                </td>
            </tr>`;
            memberTableBody.innerHTML += row;
        });
    }

    function addMember() {
        const formData = new FormData(document.getElementById("memberForm"));
    
        fetch('/add_member/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('notification').textContent = data.message;
                document.getElementById('memberForm').reset(); // Reset form after success
            } else {
                document.getElementById('notification').textContent = `Error: ${data.message}`;
            }
        })
        .catch(error => {
            document.getElementById('notification').textContent = "There was an error processing your request.";
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