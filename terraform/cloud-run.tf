# Cloud Run API
resource "google_project_service" "run" {
  service            = "run.googleapis.com"
  disable_on_destroy = false
}

# Vertex AI API
resource "google_project_service" "aiplatform" {
  service            = "aiplatform.googleapis.com"
  disable_on_destroy = false
}

# Cloud Run runtime service account
resource "google_service_account" "cloudrun" {
  account_id   = "cloudrun-runtime"
  display_name = "Cloud Run Runtime Service Account"
}

# Grant Artifact Registry Reader role to Cloud Run service account
resource "google_project_iam_member" "cloudrun_artifact_reader" {
  project = var.project_id
  role    = "roles/artifactregistry.reader"
  member  = "serviceAccount:${google_service_account.cloudrun.email}"
}

# Grant Vertex AI User role to Cloud Run service account
resource "google_project_iam_member" "cloudrun_vertex_ai_user" {
  project = var.project_id
  role    = "roles/aiplatform.user"
  member  = "serviceAccount:${google_service_account.cloudrun.email}"
}

# Frontend Cloud Run service
resource "google_cloud_run_v2_service" "frontend" {
  name                = "yorimichi-map-frontend"
  location            = var.region
  ingress             = "INGRESS_TRAFFIC_ALL"
  deletion_protection = true

  template {
    service_account = google_service_account.cloudrun.email

    containers {
      # Initial placeholder image; actual deployments are done via gcloud run deploy in GitHub Actions
      image = "${var.region}-docker.pkg.dev/${var.project_id}/yorimichi-map/frontend:initial"

      ports {
        container_port = 8080
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }

      startup_probe {
        http_get {
          path = "/"
          port = 8080
        }
        initial_delay_seconds = 0
        period_seconds        = 10
        failure_threshold     = 3
      }
    }

    scaling {
      min_instance_count = 0
      max_instance_count = 10
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }

  depends_on = [google_project_service.run]

  lifecycle {
    ignore_changes = [
      template[0].containers[0].image,
      template[0].revision,
    ]
  }
}

# Backend Cloud Run service
resource "google_cloud_run_v2_service" "backend" {
  name                = "yorimichi-map-backend"
  location            = var.region
  ingress             = "INGRESS_TRAFFIC_ALL"
  deletion_protection = true

  template {
    service_account = google_service_account.cloudrun.email

    containers {
      # Initial placeholder image; actual deployments are done via gcloud run deploy in GitHub Actions
      image = "${var.region}-docker.pkg.dev/${var.project_id}/yorimichi-map/backend:initial"

      ports {
        container_port = 8000
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }

      env {
        name  = "DJANGO_DEBUG"
        value = "False"
      }

      env {
        name  = "DJANGO_ALLOWED_HOSTS"
        value = ".run.app,localhost,127.0.0.1"
      }

      env {
        name = "DJANGO_SECRET_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.django_secret_key.secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "MAPS_API_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.maps_api_key.secret_id
            version = "latest"
          }
        }
      }

      env {
        name  = "GOOGLE_CLOUD_PROJECT"
        value = var.project_id
      }

      env {
        name  = "CORS_ALLOWED_ORIGINS"
        value = google_cloud_run_v2_service.frontend.uri
      }

      startup_probe {
        http_get {
          path = "/api/health/"
          port = 8000
        }
        initial_delay_seconds = 0
        period_seconds        = 10
        timeout_seconds       = 5
        failure_threshold     = 6
      }
    }

    scaling {
      min_instance_count = 0
      max_instance_count = 10
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }

  depends_on = [google_project_service.run]

  lifecycle {
    ignore_changes = [
      template[0].containers[0].image,
      template[0].revision,
    ]
  }
}

# Public access for frontend
resource "google_cloud_run_v2_service_iam_member" "frontend_public" {
  name     = google_cloud_run_v2_service.frontend.name
  location = google_cloud_run_v2_service.frontend.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Public access for backend
resource "google_cloud_run_v2_service_iam_member" "backend_public" {
  name     = google_cloud_run_v2_service.backend.name
  location = google_cloud_run_v2_service.backend.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}
