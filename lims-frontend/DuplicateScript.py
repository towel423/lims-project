import os
import shutil
import re


def copy_and_rename(src_folder, module_name, copy_as):
    # Walk through the src folder
    for root, dirs, files in os.walk(src_folder):
        # Loop over directories and files
        for name in dirs + files:
            # Check if the module_name is part of the current file/folder name (case insensitive)
            if module_name.lower() in name.lower():
                # Create the new name by replacing module_name with copy_as
                new_name = name.replace(module_name, copy_as)

                # Build full source and destination paths
                source_path = os.path.join(root, name)
                relative_path = os.path.relpath(
                    root, src_folder
                )  # Get relative path from src folder
                destination_dir = os.path.join(src_folder, relative_path)
                destination_path = os.path.join(destination_dir, new_name)

                # Ensure destination directory exists
                os.makedirs(destination_dir, exist_ok=True)

                # Check if the destination path already exists, skip if it does
                if os.path.exists(destination_path):
                    print(f"Skipping: {destination_path} already exists.")
                    continue

                # Check if it's a directory or file
                if os.path.isdir(source_path):
                    # Instead of copying the whole directory, copy only its contents into a single folder
                    copy_dir = os.path.join(
                        destination_dir, copy_as
                    )  # Folder where all contents go
                    os.makedirs(copy_dir, exist_ok=True)

                    # Loop through the items inside the directory
                    for item in os.listdir(source_path):
                        item_source_path = os.path.join(source_path, item)
                        item_destination_path = os.path.join(copy_dir, item)

                        # Check if the item is a directory or file and copy accordingly
                        if os.path.isdir(item_source_path):
                            shutil.copytree(item_source_path, item_destination_path)
                            print(
                                f"Copied directory: {item_source_path} -> {item_destination_path}"
                            )
                        else:
                            shutil.copy2(item_source_path, item_destination_path)
                            print(
                                f"Copied file: {item_source_path} -> {item_destination_path}"
                            )

                            # After copying the file, replace module_name inside the file
                            replace_in_file(item_destination_path, module_name, copy_as)
                else:
                    # Copy file to new location with the renamed file
                    shutil.copy2(source_path, destination_path)
                    print(f"Copied file: {source_path} -> {destination_path}")

                    # After copying the file, replace module_name inside the file
                    replace_in_file(destination_path, module_name, copy_as)


def capitalize_first_letter(text):
    """
    Ensures the first letter of the string is uppercase, and the rest remains as-is.
    """
    return text[0].upper() + text[1:] if text else text


def replace_in_file(file_path, old_text, new_text):
    """
    Reads the file at file_path, replaces all occurrences of old_text with new_text,
    and saves the updated content back to the file.
    """
    try:
        # Open the file for reading
        with open(file_path, "r") as file:
            content = file.read()

        # Replace the old_text with new_text
        content = content.replace(old_text, new_text)
        content = content.replace(old_text.lower(), new_text.lower())
        content = content.replace(
            capitalize_first_letter(old_text.lower()),
            capitalize_first_letter(new_text.lower()),
        )

        with open(file_path, "w") as file:
            file.write(content)

        print(f"Replaced occurrences in: {file_path}")

    except Exception as e:
        print(f"Error processing {file_path}: {e}")


if __name__ == "__main__":
    # Request user input for Module and CopyAs
    module_name = input("Enter the Module name to search for: ")
    copy_as = input("Enter the new name (CopyAs): ")

    # Specify the source folder (change to your actual path if necessary)
    src_folder = os.path.join(
        os.getcwd(), "src"
    )  # Example points to src folder under current directory

    # Call the function
    copy_and_rename(src_folder, module_name, copy_as)
