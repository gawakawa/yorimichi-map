terraform {
  required_version = ">= 1.0"

  backend "gcs" {
    bucket = "yorimichi-map-tfstate"
    prefix = "terraform/state"
  }

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 7.16"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.17"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.7"
    }
  }
}
