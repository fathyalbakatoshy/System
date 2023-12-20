// main.js
document.addEventListener("DOMContentLoaded", () => {
  let monthSelector = document.getElementById("month");
  let yearSelector = document.getElementById("year");

  generateTable();

  monthSelector.addEventListener("change", () => {
    generateTable();
  });

  yearSelector.addEventListener("change", () => {
    generateTable();
  });
});

function generateTable() {
  let monthSelector = document.getElementById("month");
  let yearSelector = document.getElementById("year");
  let dayHeader = document.getElementById("dayHeader");
  let employeeTableBody = document.getElementById("employeeTableBody");

  dayHeader.innerHTML = "";

  let weekdays = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

  if (yearSelector.childElementCount === 0) {
    let currentYear = new Date().getFullYear();
    for (let year = currentYear; year <= currentYear + 5; year++) {
      let option = document.createElement("option");
      option.value = year;
      option.textContent = year;
      yearSelector.appendChild(option);
    }
  }

  if (monthSelector.childElementCount === 0) {
    let months = [
      "يناير",
      "فبراير",
      "مارس",
      "إبريل",
      "مايو",
      "يونيو",
      "يوليو",
      "أغسطس",
      "سبتمبر",
      "أكتوبر",
      "نوفمبر",
      "ديسمبر",
    ];

    for (let month = 0; month < 12; month++) {
      let option = document.createElement("option");
      option.value = month;
      option.textContent = months[month];
      monthSelector.appendChild(option);
    }
  }

  let selectedMonth = parseInt(monthSelector.value);
  let selectedYear = parseInt(yearSelector.value);

  let daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

  let thName = document.createElement("th");
  thName.textContent = "اسم الموظف";
  dayHeader.appendChild(thName);

  for (let i = 1; i <= daysInMonth + 3; i++) {
    let th = document.createElement("th");
    if (i <= daysInMonth) {
      let dayIndex = new Date(selectedYear, selectedMonth, i).getDay();
      // th.textContent = `${weekdays[dayIndex]} يوم ${i}`;
      th.textContent = `${weekdays[dayIndex]} ${i}`
    } else if (i === daysInMonth + 1) {
      th.textContent = "الإجمالي";
    } else if (i === daysInMonth + 2) {
      th.textContent = "ملاحظات";
    } else {
      th.textContent = "حذف";
    }
    dayHeader.appendChild(th);
  }

  employeeTableBody.innerHTML = "";

  let employeesData = getEmployeesData(selectedYear, selectedMonth);
  employeesData.forEach((employee) => {
    let tr = document.createElement("tr");

    let tdName = document.createElement("td");
    tdName.textContent = employee.name;

    let tdDelete = document.createElement("td");
    let deleteButton = document.createElement("button");
    deleteButton.textContent = "حذف";
    deleteButton.classList.add("btn", "btn-danger");
    deleteButton.addEventListener("click", () => deleteEmployee(employee, selectedYear, selectedMonth));
    tdDelete.appendChild(deleteButton);

    tr.appendChild(tdName);

    let monthlyTotal = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      let td = document.createElement("td");
      let status = employee.attendance[day] || "";

      td.textContent = status;

      if (status === "ح") {
        td.classList.add("text-success");
        monthlyTotal++;
      } else if (status === "غ") {
        td.classList.add("text-danger");
      }

      td.addEventListener("click", () =>
        toggleAttendance(employee, day, selectedYear, selectedMonth)
      );
      tr.appendChild(td);
    }

    let totalTd = document.createElement("td");
    totalTd.textContent = monthlyTotal;
    tr.appendChild(totalTd);

    let tdNotes = document.createElement("td");
    let notesInput = document.createElement("input");
    notesInput.type = "text";
    notesInput.value = employee.notes || "";
    notesInput.addEventListener("change", (event) => updateNotes(employee, selectedYear, selectedMonth, event.target.value));
    tdNotes.appendChild(notesInput);
    tr.appendChild(tdNotes);

    tr.appendChild(tdDelete);

    employeeTableBody.appendChild(tr);
  });
}

function deleteEmployee(employee, year, month) {
  let confirmDelete = confirm(`هل أنت متأكد من حذف الموظف ${employee.name}؟`);

  if (confirmDelete) {
    let employeesData = getEmployeesData(year, month);
    let updatedEmployeesData = employeesData.filter(
      (data) => data.name !== employee.name
    );
    setEmployeesData(updatedEmployeesData, year, month);

    generateTable();
  }
}

function toggleAttendance(employee, day, year, month) {
  let attendanceStatus = employee.attendance[day] || "";

  if (attendanceStatus === "ح") {
    employee.attendance[day] = "غ";
  } else {
    employee.attendance[day] = "ح";
  }

  let employeesData = getEmployeesData(year, month);
  let updatedEmployeesData = employeesData.map((data) => {
    if (data.name === employee.name) {
      return employee;
    } else {
      return data;
    }
  });

  setEmployeesData(updatedEmployeesData, year, month);

  generateTable();
}

function updateNotes(employee, year, month, notes) {
  employee.notes = notes;

  let employeesData = getEmployeesData(year, month);
  let updatedEmployeesData = employeesData.map((data) => {
    if (data.name === employee.name) {
      return employee;
    } else {
      return data;
    }
  });

  setEmployeesData(updatedEmployeesData, year, month);

  generateTable();
}

function searchEmployee() {
  let searchInput = document.getElementById("search");
  let searchTerm = searchInput.value.trim().toLowerCase();

  let employeeRows = document.querySelectorAll("#employeeTableBody tr");

  employeeRows.forEach((row) => {
    let employeeName = row.querySelector("td:first-child").textContent.toLowerCase();

    if (employeeName.includes(searchTerm)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}

function getEmployeesData(year, month) {
  let key = `employeesData_${year}_${month}`;
  return JSON.parse(localStorage.getItem(key)) || [];
}

function setEmployeesData(data, year, month) {
  let key = `employeesData_${year}_${month}`;
  localStorage.setItem(key, JSON.stringify(data));
}

function addEmployee() {
  let monthSelector = document.getElementById("month");
  let yearSelector = document.getElementById("year");
  let employeeNameInput = document.getElementById("employeeName");

  let employeesData = getEmployeesData(yearSelector.value, monthSelector.value);
  let employeeName = employeeNameInput.value.trim();

  if (!employeeName) {
    alert("الرجاء إدخال اسم الموظف");
    return;
  }

  let selectedYear = parseInt(yearSelector.value);
  let selectedMonth = parseInt(monthSelector.value);
  let daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

  let employeeData = employeesData.find(
    (employee) => employee.name === employeeName
  ) || {
    name: employeeName,
    attendance: {},
  };

  for (let day = 1; day <= daysInMonth; day++) {
    employeeData.attendance[day] = employeeData.attendance[day] || "";
  }

  let employeeIndex = employeesData.findIndex(
    (emp) => emp.name === employeeName
  );
  if (employeeIndex !== -1) {
    employeesData[employeeIndex] = employeeData;
  } else {
    employeesData.push(employeeData);
  }

  setEmployeesData(employeesData, selectedYear, selectedMonth);

  generateTable();

  employeeNameInput.value = "";
}
