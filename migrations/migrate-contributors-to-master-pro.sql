-- Migration: Convert all contributor users to master with pro license
-- This maintains existing functionality while aligning with new permission model
-- Date: 2025-12-23
-- Related to: License-based access control implementation

-- Update all users with 'contributor' role to 'master' role with 'pro' license
UPDATE users
SET 
    role = 'master',
    license = 'pro',
    updated_at = NOW()
WHERE role = 'contributor';

-- Log the migration
INSERT INTO migration_log (migration_name, executed_at, affected_rows, description)
VALUES (
    'migrate-contributors-to-master-pro',
    NOW(),
    (SELECT COUNT(*) FROM users WHERE role = 'contributor'),
    'Migrated all contributor users to master role with pro license to support new license-based access control'
);

-- Display summary of changes
SELECT 
    'Migration Complete' as status,
    COUNT(*) as users_migrated
FROM users
WHERE role = 'master' AND license = 'pro';
