import os
import fnmatch
import shutil

def remove_files_or_folders(base_dir, name_pattern=None, folder_pattern=None):
    """
    Remove files or folders in the base directory and subdirectories based on a filename pattern or folder name pattern.

    Args:
        base_dir (str): The base directory where the search starts.
        name_pattern (str): A pattern to match filenames (e.g., '*.log', '*test*').
        folder_pattern (str): A pattern to match folder names (e.g., '*backup*').
    """
    for root, dirs, files in os.walk(base_dir, topdown=False):  # Use topdown=False to safely remove folders
        # If folder pattern is provided, remove matching folders and all their contents
        if folder_pattern:
            for dir_name in dirs:
                if fnmatch.fnmatch(dir_name, folder_pattern):
                    folder_path = os.path.join(root, dir_name)
                    shutil.rmtree(folder_path)  # Remove the entire folder
                    print(f"Removed folder and its contents: {folder_path}")

        # If filename pattern is provided, remove matching files
        if name_pattern:
            for file in files:
                if fnmatch.fnmatch(file, name_pattern):
                    file_path = os.path.join(root, file)
                    os.remove(file_path)
                    print(f"Removed file: {file_path}")

if __name__ == "__main__":
    # Request user input for base directory, filename pattern, and folder pattern
    base_directory = input("Enter the base directory (e.g., 'src'): ").strip()
    filename_pattern = input("Enter a file name pattern (e.g., '*.log' or leave blank if not needed): ").strip()
    foldername_pattern = input("Enter a folder name pattern (e.g., '*backup*' or leave blank if not needed): ").strip()

    # If both filename_pattern and foldername_pattern are empty, exit the script
    if not filename_pattern and not foldername_pattern:
        print("No pattern provided. Nothing to remove.")
    else:
        # Call the remove function with user-provided input
        remove_files_or_folders(base_directory, filename_pattern if filename_pattern else None, foldername_pattern if foldername_pattern else None)

