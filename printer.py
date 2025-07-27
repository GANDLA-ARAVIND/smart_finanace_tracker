
def save_files_data(file_paths, output_file):
    with open(output_file, 'w', encoding='utf-8') as out_file:
        for path in file_paths:
            out_file.write(f"\n\n=== File: {path} ===\n")
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    out_file.write(content)
            except Exception as e:
                out_file.write(f"[Error reading file]: {e}")

if __name__ == "__main__":  # ✅ fixed here
    files = [
r"C:\Users\Dell\Downloads\project-bolt-sb1-dtgxemlg\project\src\components\layout\header.tsx",
r"C:\Users\Dell\Downloads\project-bolt-sb1-dtgxemlg\project\src\components\layout\layout.tsx",
r"C:\Users\Dell\Downloads\project-bolt-sb1-dtgxemlg\project\src\components\layout\sidebar.tsx",
r"C:\Users\Dell\Downloads\project-bolt-sb1-dtgxemlg\project\src\components\theme-provider.tsx",
r"C:\Users\Dell\Downloads\project-bolt-sb1-dtgxemlg\project\src\contexts\auth-context.tsx",
r"C:\Users\Dell\Downloads\project-bolt-sb1-dtgxemlg\project\src\contexts\currency-context.tsx",
r"C:\Users\Dell\Downloads\project-bolt-sb1-dtgxemlg\project\src\contexts\finance-context.tsx",
r"C:\Users\Dell\Downloads\project-bolt-sb1-dtgxemlg\project\src\hooks\use-toast.ts",
r"C:\Users\Dell\Downloads\project-bolt-sb1-dtgxemlg\project\src\lib\utils.ts",
r"C:\Users\Dell\Downloads\project-bolt-sb1-dtgxemlg\project\src\pages\auth\login.tsx",
r"C:\Users\Dell\Downloads\project-bolt-sb1-dtgxemlg\project\src\pages\auth\signup.tsx",
r"C:\Users\Dell\Downloads\project-bolt-sb1-dtgxemlg\project\src\pages\ai-assistant.tsx",
r"C:\Users\Dell\Downloads\project-bolt-sb1-dtgxemlg\project\src\pages\budgets.tsx",
r"C:\Users\Dell\Downloads\project-bolt-sb1-dtgxemlg\project\src\pages\dashboard.tsx",
r"C:\Users\Dell\Downloads\project-bolt-sb1-dtgxemlg\project\src\pages\reports.tsx",
r"C:\Users\Dell\Downloads\project-bolt-sb1-dtgxemlg\project\src\pages\settings.tsx",
r"C:\Users\Dell\Downloads\project-bolt-sb1-dtgxemlg\project\src\pages\transactions.tsx",
r"C:\Users\Dell\Downloads\project-bolt-sb1-dtgxemlg\project\src\App.css",
r"C:\Users\Dell\Downloads\project-bolt-sb1-dtgxemlg\project\src\App.tsx",
r"C:\Users\Dell\Downloads\project-bolt-sb1-dtgxemlg\project\src\index.css",
r"C:\Users\Dell\Downloads\project-bolt-sb1-dtgxemlg\project\src\main.tsx",
r"C:\Users\Dell\Downloads\project-bolt-sb1-dtgxemlg\project\src\vite-env.d.ts",
r"C:\Users\Dell\Downloads\project-bolt-sb1-dtgxemlg\project\components.json",
r"C:\Users\Dell\Downloads\project-bolt-sb1-dtgxemlg\project\index.html",
r"C:\Users\Dell\Downloads\project-bolt-sb1-dtgxemlg\project\package.json",
r"C:\Users\Dell\Downloads\project-bolt-sb1-dtgxemlg\project\tailwind.config.js",
r"C:\Users\Dell\Downloads\project-bolt-sb1-dtgxemlg\project\vite.config.ts",


    ]
    
    output = r"C:\Users\Dell\Downloads\project-bolt-sb1-dtgxemlg\project\output.txt"
    save_files_data(files, output)
    print(f"Data saved to {output}")
