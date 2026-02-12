#!/usr/bin/env python3
import re

# Read the file
with open('src/data/mockOrganizations.ts', 'r') as f:
    content = f.read()

# Replace pattern: add logo after title line
# Pattern: organizationId: N,\n\t\ttitle: '...',
pattern = r'(organizationId: \d+,\n\t\ttitle: [^,]+,)'
replacement = r"\1\n\t\tlogo: '/assets/images/brand/medicrew_blue_logo.png',"

content = re.sub(pattern, replacement, content)

# Write back
with open('src/data/mockOrganizations.ts', 'w') as f:
    f.write(content)

print("Logo fields added successfully!")
