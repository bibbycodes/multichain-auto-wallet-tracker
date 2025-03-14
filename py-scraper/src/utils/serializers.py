from typing import Any, Dict
from datetime import datetime

def serialize_datetime(obj: Any) -> str:
    """Serialize datetime objects to ISO format string"""
    if isinstance(obj, datetime):
        return obj.isoformat()
    return str(obj)

def get_all_attributes(obj: Any) -> Dict[str, Any]:
    """
    Get all attributes from an object
    Includes both public attributes and those starting with '_'
    """
    data = {}
    for attr in dir(obj):
        if not attr.startswith('__') and not callable(getattr(obj, attr)):
            try:
                value = getattr(obj, attr)
                # Handle datetime objects
                if isinstance(value, datetime):
                    value = serialize_datetime(value)
                # Handle nested objects
                elif hasattr(value, '__dict__'):
                    value = get_all_attributes(value)
                # Handle lists of objects
                elif isinstance(value, list):
                    value = [
                        get_all_attributes(item) if hasattr(item, '__dict__') else item 
                        for item in value
                    ]
                data[attr] = value
            except Exception as e:
                data[attr] = f"Error accessing attribute: {str(e)}"
    return data 