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

variable "billing_account_id" {
  description = "GCP billing account ID (format: XXXXXX-XXXXXX-XXXXXX)"
  type        = string
  sensitive   = true
}

variable "frontend_image_tag" {
  description = "Frontend container image tag (commit SHA)"
  type        = string
}

variable "backend_image_tag" {
  description = "Backend container image tag (commit SHA)"
  type        = string
}
