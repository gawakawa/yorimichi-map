# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
tofu init           # Initialize providers and backend
tofu validate       # Validate configuration syntax
tofu plan           # Preview changes
tofu apply          # Apply changes (requires confirmation)
tofu fmt            # Format .tf files
```

Always run `validate` and `plan` before `apply`.

## Architecture

### Providers

- **Google Cloud** (`hashicorp/google ~> 7.16`) - Primary infrastructure
- **Cloudflare** (`cloudflare/cloudflare ~> 5.17`) - DNS management

### State Management

Remote state stored in GCS bucket `yorimichi-map-tfstate` with prefix `terraform/state`.

### Infrastructure Overview

```
┌─────────────────────────────────────────────────────────────────┐
│ GitHub Actions                                                  │
│   └── Workload Identity Federation (OIDC)                       │
│         └── google_service_account.github_actions               │
│               ├── Artifact Registry Writer                      │
│               └── Cloud Run Developer                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ Artifact Registry (yorimichi-map)                               │
│   ├── frontend image                                            │
│   └── backend image                                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ Cloud Run (asia-northeast1)                                     │
│   ├── yorimichi-map-frontend (:8080)                            │
│   └── yorimichi-map-backend (:8000)                             │
│         └── google_service_account.cloudrun                     │
│               ├── Secret Manager Accessor (DJANGO_SECRET_KEY)   │
│               ├── Secret Manager Accessor (MAPS_API_KEY)        │
│               └── Vertex AI User                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ Cloudflare DNS (i0ta.dev)                                       │
│   ├── yorimichi.i0ta.dev      → frontend                        │
│   └── yorimichi-api.i0ta.dev  → backend                         │
└─────────────────────────────────────────────────────────────────┘
```

### Key Resource Dependencies

- Cloud Run services depend on API enablement (`google_project_service`)
- Images are managed by GitHub Actions via `gcloud run deploy` (Terraform ignores image changes via `lifecycle.ignore_changes`)
- Secrets are created by Terraform but values must be set manually via GCP Console or `gcloud`

### File Organization

| File | Purpose |
|------|---------|
| `cloud-run.tf` | Cloud Run services and runtime service account |
| `workload-identity.tf` | GitHub Actions OIDC federation |
| `artifact-registry.tf` | Container image registry |
| `secrets.tf` | Secret Manager secrets |
| `domain-mapping.tf` | Cloud Run domain mappings |
| `cloudflare.tf` | DNS records |
| `monitoring.tf` | Alert policies and notification channels |
| `budget.tf` | Billing budget alerts |

## Required Credentials

1. **GCP**: Authenticate via `gcloud auth application-default login`
2. **Cloudflare**: Set `cloudflare_api_token` in `terraform.tfvars` (requires Zone:DNS:Edit and Zone:Zone:Read permissions)
