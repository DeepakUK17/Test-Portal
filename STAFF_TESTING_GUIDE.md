# 🎓 KAHE Coding Platform — Staff Testing Guide

Welcome! This guide is designed to help you test the KAHE Coding Platform end-to-end. It will walk you through setting up the academic structure, adding users (Students and Faculty), creating a programming test, and simulating a student taking the test.

---

## 🔑 1. Logging In

The platform operates on a Role-Based Dashboard. Depending on your account, you will be redirected to the Admin, Faculty, or Student panel.
- **URL:** [Your Hosted Application URL]
- **Admin Login:** Ask your IT administrator for the primary admin email and password.

---

## 🏛️ 2. Admin Tasks (Setting Up the Institution)

Before anyone can take a test, the Admin must create the academic structure and add users.

### A. Academic Management
1. From the Admin Dashboard, click on **Academic Structure**.
2. You will see several tabs across the top: `Departments`, `Study Years`, `Semesters`, `Sections`, and `Subjects`.
3. **Create a Department:**
   - Click the `Departments` tab.
   - Enter a name (e.g., *Computer Science*), a code (e.g., *CSE*), and an HOD Name.
   - Click **Add Department**.
4. **Create a Study Year and Semester:**
   - Go to the `Study Years` tab and add Year *1* (or 2, 3, 4).
   - Go to the `Semesters` tab and add Semester *1* (or up to 8).
5. **Create a Section:**
   - Go to the `Sections` tab.
   - Type a section name (e.g., *A*).
   - Select the Department, Study Year, and Semester you just created from the dropdowns.
   - Click **Add Section**.

### B. User Management (Adding Students and Faculty)
1. From the Admin Dashboard, click on **User Management**.
2. **Add a Student:**
   - Under the `Students` tab, click **+ Add Student**.
   - Fill in their Name, Email, Roll Number (must be unique).
   - Select their Department, Study Year, Semester, and Section.
   - Click **Save Student**.
3. **Add a Faculty:**
   - Switch to the `Faculty` tab (near the top).
   - Click **+ Add Faculty**.
   - Fill in their Name, Email, Faculty Code, and Department.
   - Click **Save Faculty**.
4. **Default Passwords:** Newly created users can log in using their email, and the system will guide them to set up a password on their first login.

---

## 👨‍🏫 3. Faculty Tasks (Creating Questions and Tests)

Now, log out of the Admin account and log in using the **Faculty** credentials you just created.

### A. Creating a Question (Question Bank)
1. On the Faculty Dashboard, click on **Question Bank**.
2. Click **+ Add Question** in the top right.
3. Fill out the details:
   - **Title & Description:** e.g., "Two Sum Problem".
   - **Difficulty & Topic:** e.g., Easy, Arrays.
   - **Marks & Limits:** e.g., 10 Marks, 2 Seconds Time Limit.
4. Add **Test Cases** (Inputs and Expected Outputs). You can mark test cases as `Sample` (visible to students), `Hidden`, or `Edge`.
5. Select the allowed programming languages (C, C++, Java, Python) and provide optional boilerplate code.
6. Click **Save Question**.

### B. Creating and Publishing a Test
1. Go back to the dashboard and click **Test Management**.
2. Click **+ Create New Test**.
3. **Step 1: Test Details:** Fill in the Title, Duration (e.g., 60 minutes), maximum marks, and passing percentage.
4. **Step 2: Add Questions:** Select the questions you created from the Question Bank to add them to this test.
5. **Step 3: Security & Assignments:** 
   - Assign the test to a specific **Section**, **Department**, or **Custom Group**.
   - Review the strictness settings (e.g., "Submit automatically after 3 warnings").
6. Click **Publish Test**. It is now live!

---

## 💻 4. Student Experience (Taking the Test)

Log out of the Faculty account and log in using the **Student** credentials you created earlier.

### A. Starting the Exam
1. On the Student Dashboard, you will see the active test assigned to your section.
2. Click **Take Test**.
3. You will see an instruction screen. Review the rules and click **Start Exam**.

### B. The Exam Interface
- **Code Editor:** The center of the screen contains the code editor (similar to VS Code).
- **Run vs Submit:** 
  - Click **Run Code** to compile and test your code against the Sample test cases.
  - Click **Submit Code** to evaluate against the Hidden test cases and finalize your score for that question.

### C. Testing the Proctoring (Anti-Cheat System)
To thoroughly test the platform's security, try the following as a student:
1. **Try Copy-Pasting:** Attempt to copy code from outside and paste it into the editor (using Ctrl+V or Right-Click). The system will strictly block you and show an error.
2. **Try Switching Tabs:** Open a new browser tab or minimize the window. A severe warning will cover your screen: *"Exam rule violation detected!"*
3. **Trigger Auto-Submit:** If you configured the test to allow 3 warnings, intentionally switch tabs 3 times. On the 3rd strike, the system will lock your screen and automatically submit your test, redirecting you to the final result page.

---

## 📊 5. Viewing Reports
1. Log back in as **Faculty**.
2. Click on **Reports & Analytics**.
3. Select the test you just completed to view the Leaderboard, Pass/Fail statistics, and detailed execution logs (including exactly how many tab switches the student attempted).

---
**Happy Testing!** If you encounter any bugs, please note down the steps to reproduce them.
