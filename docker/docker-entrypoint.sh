#!/bin/bash
set -e

# Function to remove 'enc' from the filename and handle .env file prefixes
get_decrypted_filename() {
    local original_file="$1"
    
    # Remove the '.enc' from the filename
    local filename_without_enc="${original_file//.enc/}"
    filename_without_enc="${filename_without_enc/$ENVIRONMENT/}"
    
    echo "$filename_without_enc"
}

# Skip decrypt process if SOPS_AGE_KEY variable is not set
if [ -z "$SOPS_AGE_KEY" ]; then
    echo "Skip decrypt secret because SOPS_AGE_KEY variable is empty"
else
    # Ensure ENVIRONMENT variable is set
    if [ -z "$ENVIRONMENT" ]; then
        echo "Error: ENVIRONMENT variable is not set. Please set it to either 'development' or 'production'."
        exit 1
    fi

    # Directory to search for files
    SEARCH_DIR="/app"  # Default to current directory if not provided

    # Find all files matching the pattern *.enc.*
    find "$SEARCH_DIR" -type f -name "$ENVIRONMENT.enc.*" | while read -r encrypted_file; do
        # Get the decrypted filename
        decrypted_file=$(get_decrypted_filename "$encrypted_file")
        
        # Decrypt the file using sops and save to the new file
        echo "Decrypting $encrypted_file to $decrypted_file"
        if sops -d "$encrypted_file" > "$decrypted_file"; then
            echo "Successfully decrypted: $decrypted_file"
            rm -f "$encrypted_file"
        else
            echo "Failed to decrypt: $encrypted_file"
        fi
    done
fi

exec "$@"
