import re


def sanitize_component_name(name: str) -> str:
    """
    Convert any string into a valid PascalCase React component name.
    
    Examples:
        "Customer's" -> "Customers"
        "Nav-Gradient" -> "NavGradient"
        "image_content" -> "ImageContent"
        "FAQ" -> "FAQ"
    """
    # Remove all special characters except spaces, hyphens, underscores
    name = re.sub(r"[^\w\s-]", "", name)
    
    # Split on spaces, hyphens, underscores
    words = re.split(r"[\s\-_]+", name)
    
    # Convert to PascalCase
    pascal_case = "".join(word.capitalize() for word in words if word)
    
    # Ensure it starts with uppercase letter
    if not pascal_case:
        pascal_case = "Component"
    elif not pascal_case[0].isupper():
        pascal_case = pascal_case[0].upper() + pascal_case[1:]
    
    return pascal_case
