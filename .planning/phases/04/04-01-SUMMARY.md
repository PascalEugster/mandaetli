# Plan 04-01 Summary: OG Images, Metadata, Copy-Link

## Status: Complete

## What was built
- Dynamic OG images for person, organization, party, and netzwerk routes using `next/og` ImageResponse
- Enhanced `generateMetadata` on all profile pages with openGraph and twitter card properties
- Root layout `metadataBase` set to `https://mandaetli.ch`
- Toast component with global `toast()` function and auto-dismiss
- CopyLinkButton component in TopBar using navigator.clipboard API

## Key files
- `src/app/person/[slug]/opengraph-image.tsx`
- `src/app/organization/[slug]/opengraph-image.tsx`
- `src/app/party/[slug]/opengraph-image.tsx`
- `src/app/netzwerk/opengraph-image.tsx`
- `src/components/ui/toast.tsx`
- `src/components/layout/CopyLinkButton.tsx`

## Commit: 8ce63e0
