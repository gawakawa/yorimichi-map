# Cloud Functions API
resource "google_project_service" "cloudfunctions" {
  service            = "cloudfunctions.googleapis.com"
  disable_on_destroy = false
}

# Cloud Build API (required for Cloud Functions deployment)
resource "google_project_service" "cloudbuild" {
  service            = "cloudbuild.googleapis.com"
  disable_on_destroy = false
}

# Pub/Sub API
resource "google_project_service" "pubsub" {
  service            = "pubsub.googleapis.com"
  disable_on_destroy = false
}

# Cloud Billing API
resource "google_project_service" "cloudbilling" {
  service            = "cloudbilling.googleapis.com"
  disable_on_destroy = false
}

# Eventarc API (required for Cloud Functions 2nd Gen event triggers)
resource "google_project_service" "eventarc" {
  service            = "eventarc.googleapis.com"
  disable_on_destroy = false
}

# Pub/Sub topic for budget alerts
resource "google_pubsub_topic" "budget_alerts" {
  name = "billing-budget-alerts"

  depends_on = [google_project_service.pubsub]
}

# Service account for billing automation
resource "google_service_account" "billing_automation" {
  account_id   = "billing-automation"
  display_name = "Billing Automation Service Account"
}

# Grant logging.logWriter role to billing automation service account
resource "google_project_iam_member" "billing_automation_logging" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.billing_automation.email}"
}

# Grant eventarc.eventReceiver role to billing automation service account
resource "google_project_iam_member" "billing_automation_eventarc" {
  project = var.project_id
  role    = "roles/eventarc.eventReceiver"
  member  = "serviceAccount:${google_service_account.billing_automation.email}"
}

# Grant billing.admin role to billing automation service account
# This permission is required to unlink billing accounts from projects
resource "google_billing_account_iam_member" "billing_automation_admin" {
  billing_account_id = data.google_project.project.billing_account
  role               = "roles/billing.admin"
  member             = "serviceAccount:${google_service_account.billing_automation.email}"
}

# Grant Eventarc service agent permission to act as billing_automation service account
resource "google_service_account_iam_member" "eventarc_act_as_billing_automation" {
  service_account_id = google_service_account.billing_automation.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:service-${data.google_project.project.number}@gcp-sa-eventarc.iam.gserviceaccount.com"
}

# Cloud Storage bucket for Cloud Functions source code
resource "google_storage_bucket" "functions_source" {
  name     = "${var.project_id}-functions-source"
  location = var.region

  uniform_bucket_level_access = true

  lifecycle_rule {
    condition {
      age = 30
    }
    action {
      type = "Delete"
    }
  }
}

# Archive the Cloud Function source code
data "archive_file" "disable_billing" {
  type        = "zip"
  source_dir  = "${path.module}/functions/disable-billing"
  output_path = "${path.module}/functions/disable-billing.zip"
}

# Upload the Cloud Function source code to GCS
resource "google_storage_bucket_object" "disable_billing_source" {
  name   = "disable-billing-${data.archive_file.disable_billing.output_md5}.zip"
  bucket = google_storage_bucket.functions_source.name
  source = data.archive_file.disable_billing.output_path
}

# Cloud Functions 2nd Gen for disabling billing
resource "google_cloudfunctions2_function" "disable_billing" {
  name     = "disable-billing"
  location = var.region

  build_config {
    runtime     = "python312"
    entry_point = "disable_billing"

    source {
      storage_source {
        bucket = google_storage_bucket.functions_source.name
        object = google_storage_bucket_object.disable_billing_source.name
      }
    }
  }

  service_config {
    min_instance_count = 0
    max_instance_count = 1
    available_memory   = "256M"
    timeout_seconds    = 60

    environment_variables = {
      GCP_PROJECT_ID = var.project_id
    }

    service_account_email = google_service_account.billing_automation.email
  }

  event_trigger {
    trigger_region        = var.region
    event_type            = "google.cloud.pubsub.topic.v1.messagePublished"
    pubsub_topic          = google_pubsub_topic.budget_alerts.id
    retry_policy          = "RETRY_POLICY_DO_NOT_RETRY"
    service_account_email = google_service_account.billing_automation.email
  }

  depends_on = [
    google_project_service.cloudfunctions,
    google_project_service.cloudbuild,
    google_project_service.eventarc,
    google_project_service.pubsub,
    google_project_service.cloudbilling,
  ]
}
