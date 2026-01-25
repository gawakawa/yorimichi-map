resource "google_project_service" "artifactregistry" {
  project            = var.project_id
  service            = "artifactregistry.googleapis.com"
  disable_on_destroy = false
}

resource "google_artifact_registry_repository" "docker" {
  repository_id = "yorimichi-map"
  location      = var.region
  format        = "DOCKER"
  description   = "Docker images for yorimichi-map"

  cleanup_policy_dry_run = false

  cleanup_policies {
    id     = "delete-untagged"
    action = "DELETE"
    condition {
      tag_state  = "UNTAGGED"
      older_than = "604800s" # 7 days
    }
  }

  cleanup_policies {
    id     = "keep-recent-versions"
    action = "KEEP"
    most_recent_versions {
      package_name_prefixes = ["frontend", "backend"]
      keep_count            = 10
    }
  }

  depends_on = [google_project_service.artifactregistry]
}
