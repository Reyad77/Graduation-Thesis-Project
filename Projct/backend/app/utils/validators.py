"""
Input validation helpers for the platform.

Provides reusable validation functions for file uploads, phone numbers,
and other user input.
"""

import re
from typing import Tuple

# Allowed file extensions and corresponding MIME types
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
ALLOWED_DOCUMENT_EXTENSIONS = {".pdf", ".doc", ".docx"}
MAX_FILE_SIZE_MB = 10  # Maximum upload size in MB


def validate_file_extension(
    filename: str, allowed_extensions: set[str]
) -> Tuple[bool, str]:
    """Check whether the file extension is allowed.

    Returns:
        (is_valid, error_message)
    """
    if "." not in filename:
        return False, "File has no extension."
    ext = filename.rsplit(".", 1)[-1].lower()
    if f".{ext}" not in allowed_extensions:
        return False, f"Extension '{ext}' is not allowed."
    return True, ""


def validate_image(filename: str) -> Tuple[bool, str]:
    """Validate that the filename has an allowed image extension."""
    return validate_file_extension(filename, ALLOWED_IMAGE_EXTENSIONS)


def validate_document(filename: str) -> Tuple[bool, str]:
    """Validate that the filename has an allowed document extension."""
    return validate_file_extension(filename, ALLOWED_DOCUMENT_EXTENSIONS)


def validate_phone(phone: str) -> bool:
    """Basic phone number validation (allows +, digits, spaces, dashes)."""
    pattern = r"^\+?[\d\s\-()]{7,20}$"
    return bool(re.match(pattern, phone))


def sanitize_html(text: str) -> str:
    """Strip HTML tags from user input to prevent XSS."""
    clean = re.compile(r"<[^>]+>")
    return clean.sub("", text)
