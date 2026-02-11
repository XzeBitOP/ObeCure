#!/usr/bin/env python3
"""
ObeCure Redeem Code Generator
Generate subscription codes for customers who have paid
"""

import random
import string
import sys

def generate_code(duration_type):
    """
    Generate a 14-character redeem code
    
    Args:
        duration_type: '1' for 1 month, '6' for 6 months, 'Y' for 1 year
    
    Returns:
        14-character code string
    """
    # Characters to use (excluding confusing ones like 0, O, I, l)
    chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    
    # Generate 13 random characters
    code = ''.join(random.choices(chars, k=13))
    
    # Add the duration marker at the end
    code += duration_type.upper()
    
    return code

def main():
    print("=" * 60)
    print("ObeCure Redeem Code Generator")
    print("=" * 60)
    print()
    print("Select subscription duration:")
    print("1. One Month (₹69)")
    print("2. Six Months (₹399)")
    print("3. One Year (₹799)")
    print()
    
    choice = input("Enter your choice (1/2/3): ").strip()
    
    duration_map = {
        '1': ('1', 'One Month', '₹69'),
        '2': ('6', 'Six Months', '₹399'),
        '3': ('Y', 'One Year', '₹799')
    }
    
    if choice not in duration_map:
        print("❌ Invalid choice!")
        sys.exit(1)
    
    marker, duration_name, price = duration_map[choice]
    
    # Generate the code
    code = generate_code(marker)
    
    print()
    print("=" * 60)
    print("✅ Code Generated Successfully!")
    print("=" * 60)
    print()
    print(f"📦 Duration: {duration_name}")
    print(f"💰 Price: {price}")
    print()
    print(f"🎟️  Redeem Code: {code}")
    print()
    print("=" * 60)
    print()
    print("📋 Instructions:")
    print("1. Copy the code above")
    print("2. Send it to the customer via WhatsApp")
    print("3. Customer enters this code in the app")
    print("4. Premium features will be unlocked automatically")
    print()
    print("⚠️  Note: Each code can only be used once!")
    print("=" * 60)

if __name__ == "__main__":
    main()
