output "artifact_registry_url" {
  description = "Artifact Registry repository URL"
  value       = google_artifact_registry_repository.docker.registry_uri
}

output "workload_identity_provider" {
  description = "Workload Identity Provider resource name for GitHub Actions"
  value       = google_iam_workload_identity_pool_provider.github.name
}

output "github_actions_service_account" {
  description = "Service account email for GitHub Actions"
  value       = google_service_account.github_actions.email
}

output "frontend_url" {
  description = "Frontend Cloud Run service URL"
  value       = google_cloud_run_v2_service.frontend.uri
}

output "backend_url" {
  description = "Backend Cloud Run service URL"
  value       = google_cloud_run_v2_service.backend.uri
}

output "frontend_custom_domain" {
  description = "Frontend custom domain URL"
  value       = "https://${var.subdomain}.${var.domain_name}"
}

output "backend_custom_domain" {
  description = "Backend API custom domain URL"
  value       = "https://api.${var.subdomain}.${var.domain_name}"
}
