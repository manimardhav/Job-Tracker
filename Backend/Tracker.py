import json
import os

# This is where all jobs will be saved
FILE_NAME = "jobs.json"

# -----------------------------------------------
# This function LOADS jobs from the file
# If file doesn't exist, it returns empty list
# -----------------------------------------------
def load_jobs():
    if os.path.exists(FILE_NAME):
        with open(FILE_NAME, "r") as f:
            return json.load(f)
    return []

# -----------------------------------------------
# This function SAVES jobs list to the file
# -----------------------------------------------
def save_jobs(jobs):
    with open(FILE_NAME, "w") as f:
        json.dump(jobs, f, indent=4)

# -----------------------------------------------
# This function ADDS a new job
# -----------------------------------------------
def add_job():
    company = input("Company name: ")
    role = input("Job role: ")
    status = input("Status (Applied/Interview/Rejected): ")
    date = input("Date applied (eg: 2024-01-15): ")

    job = {
        "company": company,
        "role": role,
        "status": status,
        "date": date
    }

    jobs = load_jobs()
    jobs.append(job)
    save_jobs(jobs)
    print(f"\n✅ Job at {company} added successfully!\n")

# -----------------------------------------------
# This function SHOWS all saved jobs
# -----------------------------------------------
def view_jobs():
    jobs = load_jobs()

    if len(jobs) == 0:
        print("\n No jobs added yet.\n")
        return

    print("\n--- Your Job Applications ---")
    for i, job in enumerate(jobs, start=1):
        print(f"{i}. {job['company']} | {job['role']} | {job['status']} | {job['date']}")
    print()

# -----------------------------------------------
# This function DELETES a job by number
# -----------------------------------------------
def delete_job():
    view_jobs()                          # First show all jobs
    jobs = load_jobs()

    if len(jobs) == 0:                   # If no jobs, stop here
        return

    try:
        number = int(input("Enter job number to delete: "))
        if number < 1 or number > len(jobs):
            print("Invalid number.\n")
            return

        job_to_delete = jobs[number - 1]
        confirm = input(f"Are you sure you want to delete '{job_to_delete['company']} - {job_to_delete['role']}'? (y/n): ")

        if confirm.lower() == "y":
            jobs.pop(number - 1)
            save_jobs(jobs)
            print(f"\n🗑️ Deleted job at {job_to_delete['company']}\n")
        else:
            print("\n↩️ Delete cancelled.\n")

    except ValueError:
        print("Please enter a valid number.\n")

# -----------------------------------------------
# This function EDITS a job by number
# -----------------------------------------------
def edit_job():
    view_jobs()                          # Show all jobs first
    jobs = load_jobs()

    if len(jobs) == 0:
        return

    try:
        number = int(input("Enter job number to edit: "))
        if number < 1 or number > len(jobs):
            print("Invalid number.\n")
            return

        job = jobs[number - 1]           # Get the job to edit

        print("\nPress Enter to keep current value\n")

        # If user presses Enter without typing, keep old value
        company = input(f"Company [{job['company']}]: ")
        role = input(f"Role [{job['role']}]: ")
        status = input(f"Status [{job['status']}]: ")
        date = input(f"Date [{job['date']}]: ")

        # Only update if user typed something new
        if company: job['company'] = company
        if role: job['role'] = role
        if status: job['status'] = status
        if date: job['date'] = date

        if not company and not role and not status and not date:
            print("\n⚠️ Nothing was changed. You didn't enter any new values.\n")
            return
        
        save_jobs(jobs)
        print(f"\n✅ Job updated successfully!\n")

    except ValueError:
        print("Please enter a valid number.\n")


# -----------------------------------------------
# This is the MAIN MENU - controls everything
# -----------------------------------------------
def main():
    while True:
        print("=== Job Tracker ===")
        print("1. Add a job")
        print("2. View all jobs")
        print("3. Edit a job")
        print("4. Delete a job")
        print("5. Exit")

        choice = input("Choose an option: ")

        if choice == "1":
            add_job()
        elif choice == "2":
            view_jobs()
        elif choice == "3":
            edit_job()
        elif choice == "4":
            delete_job()
        elif choice == "5":
            print("Goodbye!")
            break
        else:
            print("Invalid choice. Try again.\n")
main()