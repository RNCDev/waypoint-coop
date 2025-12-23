# Seed Images Directory

This directory contains image files that will be uploaded to the database for organizations and users.

## Directory Structure

```
prisma/seed-images/
├── organizations/     # Organization logo images
│   ├── org_waypoint.png
│   ├── org_ohio.jpg
│   └── ...
└── users/             # User profile pictures
    ├── user_alice.jpeg
    ├── user_bob.png
    └── ...
```

## Usage

1. **Add your image files** to the appropriate subdirectory (`organizations/` or `users/`)

2. **Update the mappings** in `prisma/seed-images.ts`:
   - Add entries to `ORGANIZATION_IMAGES` array for organization logos
   - Add entries to `USER_IMAGES` array for user profile pictures

   Example:
   ```typescript
   const ORGANIZATION_IMAGES: ImageMapping[] = [
     { organizationId: 'org_waypoint', filename: 'waypoint-logo.png', mimeType: 'image/png' },
     { organizationId: 'org_ohio', filename: 'ohio-pension.jpg', mimeType: 'image/jpeg' },
   ]

   const USER_IMAGES: ImageMapping[] = [
     { userId: 'user_alice', filename: 'alice-admin.jpeg', mimeType: 'image/jpeg' },
     { userId: 'user_bob', filename: 'bob-gp.png', mimeType: 'image/png' },
   ]
   ```

3. **Run the seed images script**:
   ```bash
   npm run db:seed-images
   ```

## Supported Image Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)
- SVG (.svg) - for organizations only

## File Size Limits

- **Organization images**: Maximum 2MB
- **User profile pictures**: Maximum 1MB

## Notes

- The script will automatically detect MIME types from file extensions if not specified
- Images are stored as binary data in the database (`imageData`/`pictureData` fields)
- The script can be run multiple times - it will update existing images
- Make sure to run `npm run db:seed` first to create the organizations and users

