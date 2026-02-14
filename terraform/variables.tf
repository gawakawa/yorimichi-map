variable "project_id" {
  description = "GCP project ID"
  type        = string
  default     = "yorimichi-map-485411"
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "asia-northeast1"
}

variable "zone" {
  description = "GCP zone"
  type        = string
  default     = "asia-northeast1-a"
}

variable "cloudflare_api_token" {
  description = "Cloudflare API token with Zone:DNS:Edit and Zone:Zone:Read permissions"
  type        = string
  sensitive   = true
}

variable "domain_name" {
  description = "Root domain name"
  type        = string
  default     = "i0ta.dev"
}

variable "subdomain" {
  description = "Subdomain prefix for the application"
  type        = string
  default     = "yorimichi"
}

