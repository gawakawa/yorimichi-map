resource "google_project_service" "secretmanager" {
  project = var.project_id
  service = "secretmanager.googleapis.com"

  disable_on_destroy = false
}

resource "google_secret_manager_secret" "django_secret_key" {
  secret_id = "django-secret-key"

  replication {
    auto {}
  }

  depends_on = [google_project_service.secretmanager]
}

resource "google_secret_manager_secret_iam_member" "cloudrun_secret_access" {
  secret_id = google_secret_manager_secret.django_secret_key.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloudrun.email}"
}

# Google Maps API Key secret
resource "google_secret_manager_secret" "maps_api_key" {
  secret_id = "maps-api-key"

  replication {
    auto {}
  }

  depends_on = [google_project_service.secretmanager]
}

resource "google_secret_manager_secret_iam_member" "cloudrun_maps_api_key_access" {
  secret_id = google_secret_manager_secret.maps_api_key.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloudrun.email}"
}
