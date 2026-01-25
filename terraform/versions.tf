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
  }
}
